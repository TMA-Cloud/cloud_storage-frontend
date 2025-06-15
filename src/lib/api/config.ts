export interface RuntimeEnv {
	API_BASE_URL?: string;
	ONLYOFFICE_JS_URL?: string;
	SUPPORTED_TYPES_VERSION?: string;
}

declare global {
	interface Window {
		__env?: RuntimeEnv;
	}
}

const env: RuntimeEnv =
	typeof window === 'undefined'
		? {
				API_BASE_URL: (globalThis as { process?: { env?: Record<string, string> } }).process?.env
					?.API_BASE_URL,
				ONLYOFFICE_JS_URL: (globalThis as { process?: { env?: Record<string, string> } }).process
					?.env?.ONLYOFFICE_JS_URL,
				SUPPORTED_TYPES_VERSION: (globalThis as { process?: { env?: Record<string, string> } })
					.process?.env?.SUPPORTED_TYPES_VERSION
			}
		: window.__env || {};

export const API_BASE = env.API_BASE_URL ?? '';
export const ONLYOFFICE_JS_URL = env.ONLYOFFICE_JS_URL ?? '';
export const SUPPORTED_TYPES_VERSION = env.SUPPORTED_TYPES_VERSION ?? '';
