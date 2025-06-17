import { API_BASE } from '../config';
import { apiFetch } from '../http';
import type { FilesPage } from './types';

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
