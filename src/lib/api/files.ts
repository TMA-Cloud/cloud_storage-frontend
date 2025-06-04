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
