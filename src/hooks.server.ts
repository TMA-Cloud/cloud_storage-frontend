import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('token');
	if (!token && event.url.pathname !== '/login') {
		throw redirect(307, '/login');
	}
	return resolve(event);
};
