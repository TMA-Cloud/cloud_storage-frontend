import { writable } from 'svelte/store';
import type { FileMeta } from '$lib/api/files';

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
