import { API_BASE } from '../config';
import { apiFetch, HttpError, UnauthorizedError } from '../http';
import type { DeleteBatchResult } from './types';

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

export async function deleteFilesIndividually(
	ids: string[],
	token: string
): Promise<DeleteBatchResult> {
	const result: DeleteBatchResult = { deleted: [], errors: [] };
	for (const id of ids) {
		try {
			await deleteFile(id, token);
			result.deleted.push(id);
		} catch (err) {
			if (err instanceof UnauthorizedError) {
				throw err;
			}
			if (err instanceof HttpError) {
				result.errors.push({ id, status: err.status, message: err.message });
			} else {
				const msg = err instanceof Error ? err.message : 'unknown error';
				result.errors.push({ id, status: 0, message: msg });
			}
		}
	}
	return result;
}
