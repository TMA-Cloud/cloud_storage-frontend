const API_BASE = import.meta.env.VITE_API_BASE_URL;
export interface FileMeta {
	id: string;
	filename: string;
	uploaded_at: string;
}

export interface UploadResponse {
	id: string;
	filename: string;
	uploaded_at: string;
}

// Fetch list of files with proper return type
export async function fetchFiles(token: string): Promise<FileMeta[]> {
	const res = await fetch(`${API_BASE}/api/files`, {
		headers: { Authorization: `Bearer ${token}` }
	});
	return await res.json();
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

	const data = await res.json();
	if (!res.ok) {
		throw new Error(data.error || `HTTP ${res.status}`);
	}
	return data;
}
