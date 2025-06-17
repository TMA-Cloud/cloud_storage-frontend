import { API_BASE, SUPPORTED_TYPES_VERSION } from '../config';
import { apiFetch } from '../http';

export async function fetchSupportedTypes(): Promise<Record<string, string>> {
	const url = new URL(`${API_BASE}/api/files/supported`);
	if (SUPPORTED_TYPES_VERSION) {
		url.searchParams.set('v', SUPPORTED_TYPES_VERSION);
	}
	const res = await apiFetch(url.toString());
	const data = (await res.json()) as { types: Record<string, string> };
	return data.types || {};
}
