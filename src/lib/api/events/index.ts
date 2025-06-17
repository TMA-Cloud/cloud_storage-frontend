export interface BackendEvent {
	type: string;
	file_id?: string;
	data?: unknown;
}

import { API_BASE } from '../config';

function buildWsUrl(): string {
	const url = API_BASE.replace(/^http/, 'ws');
	return `${url}/api/events/ws`;
}

export function connectEvents(onEvent: (evt: BackendEvent) => void): WebSocket {
	const ws = new WebSocket(buildWsUrl());
	ws.onmessage = (e) => {
		try {
			const evt = JSON.parse(e.data) as BackendEvent;
			onEvent(evt);
		} catch {
			// ignore malformed events
		}
	};
	return ws;
}
