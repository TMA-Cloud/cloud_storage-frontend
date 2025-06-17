import { API_BASE } from '../config';
import { apiFetch } from '../http';
import { APP_VERSION } from '$lib/version';
import { compareVersions } from '$lib/utils/version';

export interface BackendVersion {
	current: string;
	latest?: string;
	outdated?: boolean;
	error?: string;
}

export async function fetchBackendVersion(): Promise<BackendVersion> {
	const res = await apiFetch(`${API_BASE}/api/version`);
	return (await res.json()) as BackendVersion;
}

export interface FrontendVersionResult {
	current: string;
	latest: string;
	outdated: boolean;
}

export async function checkFrontendVersion(): Promise<FrontendVersionResult> {
	const res = await fetch('https://tma-cloud.github.io/updates/versions.json', {
		cache: 'no-cache'
	});
	const data = (await res.json()) as { frontend: string };
	const latest = data.frontend;
	const outdated = compareVersions(APP_VERSION, latest) < 0;
	return { current: APP_VERSION, latest, outdated };
}
