import { writable, get } from 'svelte/store';
import { goto } from '$app/navigation';
import { getToken, clearToken } from '$lib/api/auth';
import {
	fetchFiles,
	searchFiles,
	type FileMeta,
	openFile,
	closePreview,
	fetchSupportedTypes,
	fetchThumbnailBlob
} from '$lib/api/files';
import { UnauthorizedError } from '$lib/api/http';
import { buildThumbnails } from '$lib/utils/thumbnails';
import { connectEvents, type BackendEvent } from '$lib/api/events';
import { checkFrontendVersion, fetchBackendVersion } from '$lib/api/version';

export const token = writable('');
export const files = writable<FileMeta[]>([]);
export const currentPage = writable(1);
export const hasNextPage = writable(false);
export const previewImage = writable<string | null>(null);
export const thumbnails = writable<Record<string, string>>({});
export const statusMessage = writable('');

export function clearStatusMessage() {
	statusMessage.set('');
}
export const showUploadModal = writable(false);
export const showProfileModal = writable(false);
export const fileToDelete = writable<FileMeta | null>(null);
export const selectedIds = writable<string[]>([]);
export const bulkDeleteIds = writable<string[]>([]);
export const confirmBulk = writable(false);
export const searchQuery = writable('');
export const searchActive = writable(false);
export const searching = writable(false);
export const showOwnerError = writable(false);
export const statusNotFoundError = writable(false);
export const showProtectedError = writable(false);
export const showUnsupportedError = writable(false);
export const bulkResultMessage = writable('');
export const supportedExts = writable<Set<string>>(new Set());
export const headerHeight = writable(0);
export const versionMessages = writable<string[]>([]);

let socket: WebSocket | null = null;

export async function loadFiles(page: number = get(currentPage), fetchThumbs = true) {
	try {
		const { files: newFiles, has_next } = await fetchFiles(get(token), page);
		currentPage.set(page);
		hasNextPage.set(has_next);

		const nextFiles = Array.isArray(newFiles) ? newFiles : [];

		if (fetchThumbs) {
			// clear all thumbnails when refetching them
			for (const url of Object.values(get(thumbnails))) {
				URL.revokeObjectURL(url);
			}
			thumbnails.set(await buildThumbnails(nextFiles, 0));
		} else {
			// keep existing thumbnails for files that remain in the list
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
		// thumbnails for new files will arrive via websocket events
	} catch (err: unknown) {
		if (err instanceof UnauthorizedError) {
			statusMessage.set('Session expired. Redirecting to login...');
			clearToken();
			setTimeout(() => goto('/login'), 1000);
		} else {
			console.error(err);
		}
	}
}

export async function checkVersions() {
	const msgs: string[] = [];
	try {
		const f = await checkFrontendVersion();
		if (f.outdated) {
			msgs.push(`A new frontend version ${f.latest} is available. You are running ${f.current}.`);
		}
	} catch (err) {
		console.error(err);
	}
	try {
		const b = await fetchBackendVersion();
		if (b.outdated) {
			msgs.push(
				`A new backend version ${b.latest} is available. Your server is running ${b.current}.`
			);
		}
	} catch (err) {
		console.error(err);
	}
	versionMessages.set(msgs);
}

export async function initHome() {
	const raw = getToken();
	if (!raw) return;
	token.set(raw);
	try {
		const types = await fetchSupportedTypes();
		supportedExts.set(new Set(Object.keys(types)));
	} catch (err) {
		console.error(err);
	}
	await loadFiles();
	socket = connectEvents(handleEvent);
	void checkVersions();
}

export function destroyHome() {
	const prev = get(previewImage);
	if (prev) {
		closePreview(prev);
	}
	for (const url of Object.values(get(thumbnails))) {
		URL.revokeObjectURL(url);
	}
	if (socket) {
		socket.close();
		socket = null;
	}
}

export function handleEvent(evt: BackendEvent) {
	if (!evt.file_id) return;
	const id = evt.file_id;
	if (evt.type === 'delete') {
		files.update((fs) => fs.filter((f) => f.id !== evt.file_id));
		const th = get(thumbnails);
		if (th[evt.file_id]) {
			URL.revokeObjectURL(th[evt.file_id]);
			delete th[evt.file_id];
			thumbnails.set({ ...th });
		}
		return;
	}
	if (evt.type === 'thumbnail_ready') {
		(async () => {
			try {
				const blob = await fetchThumbnailBlob(id);
				if (!blob) return;
				thumbnails.update((th) => {
					if (th[id]) {
						URL.revokeObjectURL(th[id]);
					}
					return { ...th, [id]: URL.createObjectURL(blob) };
				});
			} catch (err) {
				console.error(err);
			}
		})();
		return;
	}
	if (evt.type === 'privacy') {
		const val = (evt.data as Record<string, unknown>)?.private as boolean | undefined;
		if (typeof val === 'boolean') {
			files.update((fs) => fs.map((f) => (f.id === evt.file_id ? { ...f, is_private: val } : f)));
		}
		return;
	}
	if (evt.type === 'protect') {
		const val = (evt.data as Record<string, unknown>)?.protected as boolean | undefined;
		if (typeof val === 'boolean') {
			files.update((fs) =>
				fs.map((f) => (f.id === evt.file_id ? { ...f, delete_protected: val } : f))
			);
		}
		return;
	}
	if (evt.type === 'readonly') {
		const val = (evt.data as Record<string, unknown>)?.readonly as boolean | undefined;
		if (typeof val === 'boolean') {
			files.update((fs) => fs.map((f) => (f.id === evt.file_id ? { ...f, read_only: val } : f)));
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
			clearToken();
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
			clearToken();
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
