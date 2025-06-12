import { writable, get } from 'svelte/store';
import { goto } from '$app/navigation';
import { getToken, clearToken } from '$lib/api/auth';
import {
	fetchFiles,
	searchFiles,
	type FileMeta,
	openFile,
	closePreview,
	deleteFile,
	fetchSupportedTypes
} from '$lib/api/files';
import { UnauthorizedError, HttpError } from '$lib/api/http';
import { buildThumbnails } from '$lib/utils/thumbnails';
import { connectEvents, type BackendEvent } from '$lib/api/events';

export const token = writable('');
export const files = writable<FileMeta[]>([]);
export const currentPage = writable(1);
export const hasNextPage = writable(false);
export const previewImage = writable<string | null>(null);
export const thumbnails = writable<Record<string, string>>({});
export const statusMessage = writable('');
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

let socket: WebSocket | null = null;

export async function loadFiles(page: number = get(currentPage)) {
	try {
		const { files: newFiles, has_next } = await fetchFiles(get(token), page);
		currentPage.set(page);
		hasNextPage.set(has_next);
		for (const url of Object.values(get(thumbnails))) {
			URL.revokeObjectURL(url);
		}
		thumbnails.set({});
		files.set(Array.isArray(newFiles) ? newFiles : []);
		thumbnails.set(await buildThumbnails(get(files)));
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
		statusMessage.set('');
		hasNextPage.set(false);
		currentPage.set(1);
		for (const url of Object.values(get(thumbnails))) {
			URL.revokeObjectURL(url);
		}
		thumbnails.set({});
		files.set(Array.isArray(results) ? results : []);
		thumbnails.set(await buildThumbnails(get(files)));
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
	statusMessage.set('');
	await loadFiles(1);
}

export function handleSearchInput() {
	if (!get(searchQuery).trim() && get(searchActive) && !get(searching)) {
		clearSearch();
	}
}
