import { API_BASE } from '../config';
import { apiFetch } from '../http';

export interface UserProfile {
	id: string;
	username: string;
	name: string;
}

export async function fetchUserProfile(token: string): Promise<UserProfile> {
	const res = await apiFetch(`${API_BASE}/api/userprofile`, {
		headers: { Authorization: `Bearer ${token}` }
	});

	let data: { id: string; username: string; name: string };
	try {
		data = await res.json();
	} catch {
		throw new Error('Failed to parse profile');
	}

	return {
		id: data['id'],
		username: data['username'],
		name: data['name']
	};
}
