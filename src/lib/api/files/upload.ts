import { API_BASE } from '../config';
import { apiFetch } from '../http';
import type { UploadResponse } from './types';

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

export async function uploadFile(
	file: File,
	token: string,
	isPrivate = false
): Promise<UploadResponse> {
	return uploadFiles([file], token, isPrivate);
}
