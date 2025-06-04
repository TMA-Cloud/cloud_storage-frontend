const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Login function returns a token
export async function login(username: string, password: string): Promise<string> {
	const res = await fetch(`${API_BASE}/api/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ username, password })
	});

	const data = await res.json();
	if (!res.ok || !data.token) {
		throw new Error(data.error || 'Login failed');
	}

	localStorage.setItem('token', data.token);
	return data.token;
}
