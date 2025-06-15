// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window {
		DocsAPI: unknown;
		__env?: import('$lib/api/config').RuntimeEnv;
	}

	const __APP_VERSION__: string;
}

export {};
