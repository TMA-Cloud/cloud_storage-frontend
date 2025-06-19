<script lang="ts">
	import { onMount } from 'svelte';
	import Modal from './Modal.svelte';
	import type { FileMeta } from '$lib/api/files';
	import { createShareLink, listShareLinks, revokeShareLinks } from '$lib/api/files';
	import { UnauthorizedError, HttpError } from '$lib/api/http';
	import { clearToken } from '$lib/api/auth';
	import { goto } from '$app/navigation';
	import {
		statusMessage,
		showOwnerError as globalOwnerError,
		statusNotFoundError as globalNotFoundError
	} from '$lib/stores/home';

	export let file: FileMeta;
	export let token: string;
	export let onClose: () => void;

	let slug = '';
	let links: string[] = [];
	let loading = true;
	let error = '';
	let message = '';
	let msgTimer: ReturnType<typeof setTimeout>;
	let errTimer: ReturnType<typeof setTimeout>;

	onMount(loadLinks);

	async function loadLinks() {
		loading = true;
		error = '';
		try {
			links = await listShareLinks(file.id, token);
		} catch (err) {
			handleError(err);
		} finally {
			loading = false;
		}
	}

	function showMessage(text: string) {
		message = text;
		clearTimeout(msgTimer);
		msgTimer = setTimeout(() => (message = ''), 3500);
	}

	function showError(text: string) {
		error = text;
		clearTimeout(errTimer);
		errTimer = setTimeout(() => (error = ''), 3500);
	}

	function handleError(err: unknown) {
		console.error(err);
		if (err instanceof UnauthorizedError) {
			statusMessage.set('Session expired. Redirecting to login...');
			clearToken();
			setTimeout(() => goto('/login'), 1000);
		} else if (err instanceof HttpError && err.status === 403) {
			globalOwnerError.set(true);
			onClose();
		} else if (err instanceof HttpError && err.status === 404) {
			globalNotFoundError.set(true);
			onClose();
		} else if (err instanceof Error) {
			showError(err.message);
		}
	}

	async function createLink() {
		const s = slug.trim();
		if (!s) return;
		try {
			const url = await createShareLink(file.id, s, token);
			links = [...links, url];
			slug = '';
			showMessage('✔️ Link created successfully');
		} catch (err) {
			if (err instanceof HttpError) {
				if (err.status === 400) {
					showError(err.message);
				} else if (err.status === 409) {
					showError('⚠️ Slug is already taken!');
				} else {
					handleError(err);
				}
			} else {
				handleError(err);
			}
		}
	}

	async function revoke() {
		try {
			await revokeShareLinks(file.id, token);
			links = [];
			showMessage('🗑️ All share links revoked');
		} catch (err) {
			handleError(err);
		}
	}
</script>

<Modal {onClose} ariaLabel="Share File Modal">
	<div class="relative w-full max-w-lg rounded-2xl bg-[#1E1F24] p-6 text-white shadow-2xl">
		<h2 class="mb-4 text-xl leading-snug font-semibold">
			🔗 Share
			<span
				title={file.filename}
				class="ml-1 inline-block max-w-xs truncate align-middle text-blue-400"
			>
				{file.filename}
			</span>
		</h2>

		<div class="mb-5 flex gap-3">
			<input
				class="flex-1 rounded-md border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				bind:value={slug}
				placeholder="Custom slug (e.g., my-file)"
				on:keydown={(e) => e.key === 'Enter' && createLink()}
			/>
			<button
				on:click={createLink}
				class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
			>
				Create
			</button>
		</div>

		{#if loading}
			<p class="mb-4 text-sm text-gray-400">Loading share links...</p>
		{:else if links.length > 0}
			<div
				class="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 mb-4 max-h-40 space-y-2 overflow-y-auto pr-1 text-sm"
			>
				{#each links as link (link)}
					<div class="flex items-center justify-between gap-2 rounded-md bg-gray-800 px-3 py-2">
						<a
							href={link}
							target="_blank"
							class="max-w-[80%] truncate text-blue-400 hover:underline"
						>
							{link}
						</a>
						<button
							title="Copy to clipboard"
							on:click={() => navigator.clipboard.writeText(link)}
							class="text-xs text-gray-300 hover:text-white"
						>
							Copy
						</button>
					</div>
				{/each}
			</div>
		{:else}
			<p class="mb-4 text-sm text-gray-500">No active share links found.</p>
		{/if}

		<div class="mt-4 flex justify-end gap-3 border-t border-gray-700 pt-4">
			<button
				on:click={revoke}
				disabled={links.length === 0}
				class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
			>
				Revoke All
			</button>
			<button
				on:click={onClose}
				class="rounded-md border border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700"
			>
				Close
			</button>
		</div>

		{#if error}
			<p class="mt-4 text-sm text-red-400">{error}</p>
		{/if}
		{#if message}
			<p class="mt-4 text-sm text-green-400">{message}</p>
		{/if}
	</div>
</Modal>
