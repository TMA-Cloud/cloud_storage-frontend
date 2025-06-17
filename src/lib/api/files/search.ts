import { API_BASE } from '../config';
import { apiFetch } from '../http';
import type { SearchFileMeta } from './types';

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
