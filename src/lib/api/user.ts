const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface UserProfile {
	id: string;
	username: string;
	name: string;
}

export async function fetchUserProfile(token: string): Promise<UserProfile> {
	const res = await fetch(`${API_BASE}/api/userprofile`, {
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

	let data: { 'User ID': string; 'User Name': string; 'Full Name': string };
	try {
		data = await res.json();
	} catch {
		throw new Error('Failed to parse profile');
	}

	return {
		id: data['User ID'],
		username: data['User Name'],
		name: data['Full Name']
	};
}
