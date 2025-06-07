const API_BASE = import.meta.env.VITE_API_BASE_URL;

// File metadata interface
export interface FileMeta {
	id: string;
	filename: string;
	uploaded_at: string;
	size: number;
	modified_by: string;
	modified_at: string;
}

// File upload response interface
export interface UploadResponse {
	id: string;
	filename: string;
	uploaded_at: string;
}

// Check if a filename has an image extension
export function isImage(filename: string): boolean {
	const ext = filename.split('.').pop()?.toLowerCase() || '';
	return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(ext);
}

// Fetch a file as a Blob
export async function fetchFileBlob(id: string, token: string): Promise<Blob> {
	const res = await fetch(`${API_BASE}/api/files/${id}/download`, {
		headers: { Authorization: `Bearer ${token}` }
	});

	if (!res.ok) {
		throw new Error(`HTTP ${res.status}`);
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

// Fetch list of files with proper return type
export async function fetchFiles(token: string): Promise<FileMeta[]> {
	const res = await fetch(`${API_BASE}/api/files`, {
		headers: { Authorization: `Bearer ${token}` }
	});

	if (res.status === 401 || res.status === 403) {
		throw new Error(`HTTP ${res.status}`);
	}

	if (!res.ok) {
		let msg = `HTTP ${res.status}`;
		try {
			const err = await res.json();
			msg = err.error || msg;
		} catch {
			msg += ' (invalid JSON)';
		}
		throw new Error(msg);
	}

	let data: FileMeta[];
	try {
		data = await res.json();
	} catch {
		throw new Error('Failed to parse files list');
	}

	return data;
}

// Upload a file
export async function uploadFile(file: File, token: string): Promise<UploadResponse> {
	const form = new FormData();
	form.append('file', file);

	const res = await fetch(`${API_BASE}/api/files/upload`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`
		},
		body: form
	});

	if (!res.ok) {
		let msg = `HTTP ${res.status}`;
		try {
			const err = await res.json();
			msg = err.error || msg;
		} catch {
			msg += ' (invalid JSON)';
		}
		throw new Error(msg);
	}

	let data: UploadResponse;
	try {
		data = await res.json();
	} catch {
		throw new Error('Failed to parse upload response');
	}
	return data;
}

// Delete a file by ID
export async function deleteFile(id: string, token: string): Promise<void> {
	const res = await fetch(`${API_BASE}/api/files/${id}`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${token}` }
	});

	if (!res.ok) {
		let msg = `HTTP ${res.status}`;
		try {
			const err = await res.json();
			msg = err.error || msg;
		} catch {
			msg += ' (invalid JSON)';
		}
		throw new Error(msg);
	}
}
