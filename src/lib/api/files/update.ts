import { API_BASE } from '../config';
import { apiFetch } from '../http';

export async function updateFilePrivacy(
	id: string,
	isPrivate: boolean,
	token: string
): Promise<void> {
	await apiFetch(`${API_BASE}/api/files/${id}/privacy`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ private: isPrivate })
	});
}

export async function updateFileProtection(
	id: string,
	isProtected: boolean,
	token: string
): Promise<void> {
	await apiFetch(`${API_BASE}/api/files/${id}/protect`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ protected: isProtected })
	});
}

export async function updateFileReadOnly(
	id: string,
	readOnly: boolean,
	token: string
): Promise<void> {
	await apiFetch(`${API_BASE}/api/files/${id}/readonly`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ readonly: readOnly })
	});
}
