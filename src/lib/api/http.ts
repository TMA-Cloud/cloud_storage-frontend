import { API_BASE } from './config';

export class UnauthorizedError extends Error {}

export async function apiFetch(
	path: string,
	options: RequestInit = {},
	allowedStatus: number[] = []
): Promise<Response> {
	const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
	const res = await fetch(url, options);

	if (allowedStatus.includes(res.status)) {
		return res;
	}

	if (res.status === 401) {
		throw new UnauthorizedError(`HTTP ${res.status}`);
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

	return res;
}
