import { API_BASE, SUPPORTED_TYPES_VERSION } from './config';
import { apiFetch } from './http';

// File metadata interface
export interface FileMeta {
	id: string;
	filename: string;
	uploaded_at: string;
	size: number;
	owner: string;
	modified_by: string;
	modified_at: string;
	is_private: boolean;
	read_only: boolean;
	delete_protected: boolean;
}

export interface SearchFileMeta extends FileMeta {
	url: string;
}

// Information returned for each uploaded file
export interface UploadedFile {
	id: string;
	filename: string;
	size: number;
	owner: string;
	modified_by: string;
	modified_at: string;
	is_private: boolean;
	read_only: boolean;
	delete_protected: boolean;
}

// Upload response containing metadata about all files
export interface UploadResponse {
	message: string;
	files: UploadedFile[];
}

// Check if a filename has an image extension
export function isImage(filename: string): boolean {
	const ext = filename.split('.').pop()?.toLowerCase() || '';
	return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(ext);
}

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

// Fetch MIME types supported by the backend
export async function fetchSupportedTypes(): Promise<Record<string, string>> {
	const url = new URL(`${API_BASE}/api/files/supported`);
	if (SUPPORTED_TYPES_VERSION) {
		url.searchParams.set('v', SUPPORTED_TYPES_VERSION);
	}
	const res = await apiFetch(url.toString());
	const data = (await res.json()) as { types: Record<string, string> };
	return data.types || {};
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

// Fetch list of files with proper return type
export interface FilesPage {
	files: FileMeta[];
	has_next: boolean;
}

export async function fetchFiles(token: string, page = 1): Promise<FilesPage> {
	const url = new URL(`${API_BASE}/api/files`);
	url.searchParams.set('page', String(page));

	const res = await apiFetch(url.toString(), {
		headers: { Authorization: `Bearer ${token}` }
	});

	let data: FilesPage;
	try {
		data = (await res.json()) as FilesPage;
	} catch {
		throw new Error('Failed to parse files list');
	}

	return data;
}

// Upload multiple files. For a single file, provide an array with one element.
export async function uploadFiles(
	files: File[],
	token: string,
	isPrivate = false
): Promise<UploadResponse> {
	const form = new FormData();
	for (const f of files) {
		form.append('files', f);
	}
	if (files.length === 1) {
		// keep backward compatibility with server
		form.append('file', files[0]);
	}
	form.append('private', isPrivate ? '1' : '0');

	const res = await apiFetch(`${API_BASE}/api/files/upload`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`
		},
		body: form
	});

	let data: UploadResponse;
	try {
		data = (await res.json()) as UploadResponse;
	} catch {
		throw new Error('Failed to parse upload response');
	}
	return data;
}

// Convenience wrapper for uploading a single file
export async function uploadFile(
	file: File,
	token: string,
	isPrivate = false
): Promise<UploadResponse> {
	return uploadFiles([file], token, isPrivate);
}

// Delete a file by ID
export async function deleteFile(id: string, token: string): Promise<void> {
	await apiFetch(`${API_BASE}/api/files/${id}`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${token}` }
	});
}

export async function deleteFiles(ids: string[], token: string): Promise<string[]> {
	if (ids.length === 0) return [];
	const res = await apiFetch(`${API_BASE}/api/files`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ ids })
	});

	try {
		const data = (await res.json()) as { deleted: string[] };
		return data.deleted || [];
	} catch {
		return [];
	}
}

export async function updateFilePrivacy(
	id: string,
	isPrivate: boolean,
	token: string
): Promise<void> {
	await apiFetch(`${API_BASE}/api/files/${id}/privacy`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ private: isPrivate })
	});
}

export async function updateFileProtection(
	id: string,
	isProtected: boolean,
	token: string
): Promise<void> {
	await apiFetch(`${API_BASE}/api/files/${id}/protect`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ protected: isProtected })
	});
}

export async function updateFileReadOnly(
	id: string,
	readOnly: boolean,
	token: string
): Promise<void> {
	await apiFetch(`${API_BASE}/api/files/${id}/readonly`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ readonly: readOnly })
	});
}

export async function searchFiles(query: string, token: string): Promise<SearchFileMeta[]> {
	const url = new URL(`${API_BASE}/api/files/search`);
	url.searchParams.set('q', query);

	const res = await apiFetch(
		url.toString(),
		{ headers: { Authorization: `Bearer ${token}` } },
		[404, 204]
	);

	if (res.status === 404 || res.status === 204) {
		return [];
	}

	// Safe parse check
	const text = await res.text();
	if (!text) {
		return [];
	}

	let data: { files: SearchFileMeta[] };
	try {
		data = JSON.parse(text);
	} catch {
		throw new Error('Failed to parse search results');
	}

	return data.files || [];
}
