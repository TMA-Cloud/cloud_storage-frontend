import { get } from 'svelte/store';
import { getToken } from '$lib/api/auth';
import { closePreview, fetchSupportedTypes, fetchThumbnailBlob } from '$lib/api/files';
import { connectEvents, type BackendEvent } from '$lib/api/events';
import { checkFrontendVersion, fetchBackendVersion } from '$lib/api/version';
import {
	token,
	files,
	previewImage,
	thumbnails,
	showProfileModal,
	supportedExts,
	versionMessages
} from './stores';
import { loadFiles } from './actions';

let socket: WebSocket | null = null;

export function handleEvent(evt: BackendEvent) {
	if (!evt.file_id) return;
	const id = evt.file_id;
	if (evt.type === 'delete') {
		files.update((fs) => fs.filter((f) => f.id !== evt.file_id));
		const th = get(thumbnails);
		if (th[evt.file_id]) {
			URL.revokeObjectURL(th[evt.file_id]);
			delete th[evt.file_id];
			thumbnails.set({ ...th });
		}
		return;
	}
	if (evt.type === 'thumbnail_ready') {
		(async () => {
			try {
				const blob = await fetchThumbnailBlob(id);
				if (!blob) return;
				thumbnails.update((th) => {
					if (th[id]) {
						URL.revokeObjectURL(th[id]);
					}
					return { ...th, [id]: URL.createObjectURL(blob) };
				});
			} catch (err) {
				console.error(err);
			}
		})();
		return;
	}
	if (evt.type === 'privacy') {
		const val = (evt.data as Record<string, unknown>)?.private as boolean | undefined;
		if (typeof val === 'boolean') {
			files.update((fs) => fs.map((f) => (f.id === evt.file_id ? { ...f, is_private: val } : f)));
		}
		return;
	}
	if (evt.type === 'protect') {
		const val = (evt.data as Record<string, unknown>)?.protected as boolean | undefined;
		if (typeof val === 'boolean') {
			files.update((fs) =>
				fs.map((f) => (f.id === evt.file_id ? { ...f, delete_protected: val } : f))
			);
		}
		return;
	}
	if (evt.type === 'readonly') {
		const val = (evt.data as Record<string, unknown>)?.readonly as boolean | undefined;
		if (typeof val === 'boolean') {
			files.update((fs) => fs.map((f) => (f.id === evt.file_id ? { ...f, read_only: val } : f)));
		}
	}
}

export async function checkVersions() {
	const msgs: string[] = [];
	try {
		const f = await checkFrontendVersion();
		if (f.outdated) {
			msgs.push(`A new frontend version ${f.latest} is available. You are running ${f.current}.`);
		}
	} catch (err) {
		console.error(err);
	}
	try {
		const b = await fetchBackendVersion();
		if (b.outdated) {
			msgs.push(
				`A new backend version ${b.latest} is available. Your server is running ${b.current}.`
			);
		}
	} catch (err) {
		console.error(err);
	}
	versionMessages.set(msgs);
}

export async function initHome() {
	const raw = getToken();
	if (!raw) return;
	token.set(raw);
	try {
		const types = await fetchSupportedTypes();
		supportedExts.set(new Set(Object.keys(types)));
	} catch (err) {
		console.error(err);
	}
	await loadFiles();
	socket = connectEvents(handleEvent);
	void checkVersions();
}

export function destroyHome() {
	const prev = get(previewImage);
	if (prev) {
		closePreview(prev);
	}
	for (const url of Object.values(get(thumbnails))) {
		URL.revokeObjectURL(url);
	}
	if (socket) {
		socket.close();
		socket = null;
	}
	showProfileModal.set(false);
}
