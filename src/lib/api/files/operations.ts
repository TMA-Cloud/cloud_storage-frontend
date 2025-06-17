import { API_BASE } from '../config';
import { apiFetch } from '../http';
import type { FileMeta } from './types';
import { isImage } from './helpers';

// Fetch a file as a Blob
export async function fetchFileBlob(id: string, token: string): Promise<Blob> {
	const res = await apiFetch(`${API_BASE}/api/files/${id}/download`, {
		headers: { Authorization: `Bearer ${token}` }
	});

	return res.blob();
}

// Fetch a thumbnail as a Blob. Returns null if the thumbnail does not exist
export async function fetchThumbnailBlob(id: string): Promise<Blob | null> {
	const res = await apiFetch(`${API_BASE}/api/files/${id}/thumbnail`, {}, [404]);

	if (res.status === 404) {
		return null;
	}

	return res.blob();
}

// Open a file in a new tab or preview it if it's an image
export async function openFile(file: FileMeta, token: string): Promise<string | null> {
	if (isImage(file.filename)) {
		const blob = await fetchFileBlob(file.id, token);
		return URL.createObjectURL(blob);
	}
	window.open(`/file/${file.id}`, '_blank', 'noopener');
	return null;
}

// Close the preview by revoking the object URL
export function closePreview(url: string | null): void {
	if (url) {
		URL.revokeObjectURL(url);
	}
}

// Download a file to the user's computer
export async function downloadFile(file: FileMeta, token: string): Promise<void> {
	const blob = await fetchFileBlob(file.id, token);
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = file.filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
