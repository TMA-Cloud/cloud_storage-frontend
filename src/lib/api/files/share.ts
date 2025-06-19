import { API_BASE } from '../config';
import { apiFetch } from '../http';

export async function createShareLink(id: string, slug: string, token: string): Promise<string> {
	const res = await apiFetch(`${API_BASE}/api/files/${id}/share`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ slug })
	});
	const data = (await res.json()) as { url: string };
	return data.url;
}

export async function listShareLinks(id: string, token: string): Promise<string[]> {
	const res = await apiFetch(`${API_BASE}/api/files/${id}/share`, {
		headers: { Authorization: `Bearer ${token}` }
	});
	const data = (await res.json()) as { links: string[] | string };
	if (Array.isArray(data.links)) return data.links;
	return [];
}

export async function revokeShareLinks(id: string, token: string): Promise<void> {
	await apiFetch(`${API_BASE}/api/files/${id}/share`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${token}` }
	});
}
