import { API_BASE } from '../config';
import { apiFetch } from '../http';

interface LoginResponse {
	token?: string;
	error?: string;
}

// Login function returns a token
export async function login(username: string, password: string): Promise<string> {
	const res = await apiFetch(`${API_BASE}/api/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ username, password })
	});

	let data: LoginResponse;
	try {
		data = (await res.json()) as LoginResponse;
	} catch {
		throw new Error('Failed to parse login response');
	}

	if (!data.token) {
		throw new Error(data.error || 'Login failed');
	}

	document.cookie = `token=${data.token}; path=/`;
	return data.token;
}

export function getToken(): string | null {
	const match = document.cookie.match(/(?:^|; )token=([^;]+)/);
	return match ? decodeURIComponent(match[1]) : null;
}

export function clearToken(): void {
	document.cookie = 'token=; Max-Age=0; path=/';
}

// Call backend to invalidate session token
export async function logout(token: string): Promise<void> {
	await apiFetch(`${API_BASE}/api/logout`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
}
