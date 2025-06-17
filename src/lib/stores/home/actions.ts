import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import { fetchFiles, searchFiles, type FileMeta, openFile, closePreview } from '$lib/api/files';
import { UnauthorizedError } from '$lib/api/http';
import { buildThumbnails } from '$lib/utils/thumbnails';
import {
	token,
	files,
	currentPage,
	hasNextPage,
	previewImage,
	thumbnails,
	statusMessage,
	searchQuery,
	searchActive,
	searching,
	showOwnerError,
	statusNotFoundError,
	showUnsupportedError,
	supportedExts,
	clearStatusMessage
} from './stores';

export async function loadFiles(page: number = get(currentPage), fetchThumbs = true) {
	try {
		const { files: newFiles, has_next } = await fetchFiles(get(token), page);
		currentPage.set(page);
		hasNextPage.set(has_next);

		const nextFiles = Array.isArray(newFiles) ? newFiles : [];

		if (fetchThumbs) {
			for (const url of Object.values(get(thumbnails))) {
				URL.revokeObjectURL(url);
			}
			thumbnails.set(await buildThumbnails(nextFiles, 0));
		} else {
			const currentThumbs = get(thumbnails);
			const validIds = new Set(nextFiles.map((f) => f.id));
			let changed = false;
			for (const id of Object.keys(currentThumbs)) {
				if (!validIds.has(id)) {
					URL.revokeObjectURL(currentThumbs[id]);
					delete currentThumbs[id];
					changed = true;
				}
			}
			if (changed) {
				thumbnails.set({ ...currentThumbs });
			}
		}

		files.set(nextFiles);
	} catch (err: unknown) {
		if (err instanceof UnauthorizedError) {
			statusMessage.set('Session expired. Redirecting to login...');
			setTimeout(() => goto('/login'), 1000);
		} else {
			console.error(err);
		}
	}
}

export async function handleOpen(file: FileMeta) {
	const ext = '.' + (file.filename.split('.').pop()?.toLowerCase() || '');
	const exts = get(supportedExts);
	if (exts.size && !exts.has(ext)) {
		showUnsupportedError.set(true);
		return;
	}
	try {
		const prev = get(previewImage);
		if (prev) {
			closePreview(prev);
		}
		const url = await openFile(file, get(token));
		if (url) {
			previewImage.set(url);
		}
	} catch (err: unknown) {
		console.error(err);
		if (err instanceof UnauthorizedError) {
			statusMessage.set('Session expired. Redirecting to login...');
			setTimeout(() => goto('/login'), 1000);
		} else {
			const message = (err as Error).message || '';
			if (message.includes('403')) {
				showOwnerError.set(true);
			} else if (message.includes('404')) {
				statusNotFoundError.set(true);
			}
		}
	}
}

export function handleClosePreview() {
	const prev = get(previewImage);
	if (prev) {
		closePreview(prev);
		previewImage.set(null);
	}
}

export async function performSearch() {
	if (!get(searchQuery).trim()) return;
	searching.set(true);
	try {
		const results = await searchFiles(get(searchQuery), get(token));
		searchActive.set(true);
		clearStatusMessage();
		hasNextPage.set(false);
		currentPage.set(1);
		for (const url of Object.values(get(thumbnails))) {
			URL.revokeObjectURL(url);
		}
		thumbnails.set({});
		files.set(Array.isArray(results) ? results : []);
		thumbnails.set(await buildThumbnails(get(files), 0));
	} catch (err: unknown) {
		if (err instanceof UnauthorizedError) {
			statusMessage.set('Session expired. Redirecting to login...');
			setTimeout(() => goto('/login'), 1000);
		} else {
			statusMessage.set('Error searching files');
			searchActive.set(true);
			hasNextPage.set(false);
			currentPage.set(1);
			for (const url of Object.values(get(thumbnails))) {
				URL.revokeObjectURL(url);
			}
			thumbnails.set({});
			files.set([]);
			console.error(err);
		}
	} finally {
		searching.set(false);
	}
}

export async function clearSearch() {
	searchQuery.set('');
	searchActive.set(false);
	clearStatusMessage();
	await loadFiles(1);
}

export function handleSearchInput() {
	if (!get(searchQuery).trim() && get(searchActive) && !get(searching)) {
		clearSearch();
	}
}
