<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { getToken, clearToken } from '$lib/api/auth';
	import ImagePreviewer from '$lib/components/ImagePreviewer.svelte';
	import FileList from '$lib/components/FileList.svelte';
	import UploadModal from '$lib/components/UploadModal.svelte';
	import UserProfileModal from '$lib/components/UserProfileModal.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import AlertModal from '$lib/components/AlertModal.svelte';
	import {
		fetchFiles,
		searchFiles,
		type FileMeta,
		openFile,
		closePreview,
		deleteFile
	} from '$lib/api/files';
	import { UnauthorizedError } from '$lib/api/http';
	import { buildThumbnails } from '$lib/utils/thumbnails';

	let token = '';
	let files: FileMeta[] = [];
	let currentPage = 1;
	let hasNextPage = false;
	let previewImage: string | null = null;
	let thumbnails: Record<string, string> = {};
	let statusMessage = '';
	let showUploadModal = false;
	let showProfileModal = false;
	let fileToDelete: FileMeta | null = null;
	let searchQuery = '';
	let searchActive = false;
	let searching = false;
	let showOwnerError = false;
	let statusNotFoundError = false;

	async function loadFiles(page: number = currentPage) {
		try {
			const { files: newFiles, has_next } = await fetchFiles(token, page);
			currentPage = page;
			hasNextPage = has_next;
			for (const url of Object.values(thumbnails)) {
				URL.revokeObjectURL(url);
			}
			thumbnails = {};
			files = newFiles;
			thumbnails = await buildThumbnails(files, token);
		} catch (err: unknown) {
			if (err instanceof UnauthorizedError) {
				statusMessage = 'Session expired. Redirecting to login...';
				clearToken();
				setTimeout(() => goto('/login'), 1000);
			} else {
				console.error(err);
			}
		}
	}

	onMount(async () => {
		const raw = getToken();
		if (!raw) return;
		token = raw;
		await loadFiles();
	});

	async function handleOpen(file: FileMeta) {
		try {
			if (previewImage) {
				closePreview(previewImage);
			}
			const url = await openFile(file, token);
			if (url) {
				previewImage = url;
			}
		} catch (err: unknown) {
			console.error(err);
			if (err instanceof UnauthorizedError) {
				statusMessage = 'Session expired. Redirecting to login...';
				clearToken();
				setTimeout(() => goto('/login'), 1000);
			} else {
				const message = (err as Error).message || '';
				if (message.includes('403')) {
					showOwnerError = true;
				} else if (message.includes('404')) {
					statusNotFoundError = true;
				}
			}
		}
	}

	function handleClosePreview() {
		if (previewImage) {
			closePreview(previewImage);
			previewImage = null;
		}
	}

	async function performSearch() {
		if (!searchQuery.trim()) return;
		searching = true;
		try {
			const results = await searchFiles(searchQuery, token);
			searchActive = true;
			statusMessage = '';
			hasNextPage = false;
			currentPage = 1;
			for (const url of Object.values(thumbnails)) {
				URL.revokeObjectURL(url);
			}
			thumbnails = {};
			files = results;
			thumbnails = await buildThumbnails(files, token);
		} catch (err: unknown) {
			if (err instanceof UnauthorizedError) {
				statusMessage = 'Session expired. Redirecting to login...';
				clearToken();
				setTimeout(() => goto('/login'), 1000);
			} else {
				statusMessage = 'Error searching files';
				searchActive = true;
				hasNextPage = false;
				currentPage = 1;
				for (const url of Object.values(thumbnails)) {
					URL.revokeObjectURL(url);
				}
				thumbnails = {};
				files = [];
				console.error(err);
			}
		} finally {
			searching = false;
		}
	}

	async function clearSearch() {
		searchQuery = '';
		searchActive = false;
		statusMessage = '';
		await loadFiles(1);
	}

	function handleSearchInput() {
		if (!searchQuery.trim() && searchActive && !searching) {
			clearSearch();
		}
	}

	onDestroy(() => {
		if (previewImage) {
			closePreview(previewImage);
		}
		for (const url of Object.values(thumbnails)) {
			URL.revokeObjectURL(url);
		}
	});
</script>

<main class="min-h-screen bg-[#1E1F23] px-6 py-6 font-sans text-[#F3F4F6]">
	<!-- Top Header -->
	<div class="mb-10 flex items-center justify-between border-b border-[#2E2F35] pb-5">
		<h1 class="flex items-center gap-3 text-3xl font-bold tracking-tight text-amber-300">
			<svg class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
				<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2z" />
			</svg>
			<span>TMA Cloud</span>
		</h1>
		<div class="flex flex-wrap items-center gap-3">
			<input
				type="search"
				placeholder="Search files"
				bind:value={searchQuery}
				class="rounded border border-[#444] bg-[#27282E] px-3 py-1 text-sm text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				on:keydown={(e) => e.key === 'Enter' && performSearch()}
				on:input={handleSearchInput}
			/>
			<button
				type="button"
				on:click={performSearch}
				class="rounded-md border border-[#444] bg-[#27282E] px-3 py-1 text-sm text-gray-300 transition hover:bg-[#333] disabled:opacity-50"
				disabled={searching}
			>
				Search
			</button>
			{#if searchActive}
				<button
					type="button"
					on:click={clearSearch}
					class="rounded-md border border-[#444] bg-[#27282E] px-3 py-1 text-sm text-gray-300 transition hover:bg-[#333]"
				>
					Clear
				</button>
			{/if}
			<button
				on:click={() => (showUploadModal = true)}
				class="inline-flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-600"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V4m0 0L8 8m4-4l4 4"
					/>
				</svg>
				<span>Upload</span>
			</button>
			<button
				on:click={() => (showProfileModal = true)}
				class="inline-flex items-center gap-2 rounded-md border border-[#444] bg-[#27282E] px-4 py-2 text-sm text-gray-300 transition hover:bg-[#333]"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M5.121 17.804A9 9 0 1119.78 4.222a9 9 0 01-14.657 13.582z"
					/>
				</svg>
				<span>Profile</span>
			</button>
		</div>
	</div>

	<!-- Error or Status -->
	{#if statusMessage}
		<p
			class="mb-6 rounded border border-red-500/30 bg-red-500/10 px-4 py-2 text-center text-red-300 shadow-sm"
		>
			{statusMessage}
		</p>
	{/if}

	{#if searchActive && searchQuery}
		<p class="mb-4 text-sm text-gray-400">Results for "{searchQuery}"</p>
	{/if}

	<!-- File List -->
	{#if files.length === 0}
		<div class="mt-20 text-center text-gray-500">
			<p class="text-xl font-semibold">{searchActive ? 'No matching files' : 'No files yet'}</p>
			<p class="mt-1 text-sm text-gray-400">
				{searchActive ? 'Try another search' : 'Click "Upload" to get started'}
			</p>
		</div>
	{:else}
		<FileList
			{files}
			{thumbnails}
			{token}
			on:open={(e) => handleOpen(e.detail)}
			on:delete={(e) => (fileToDelete = e.detail)}
		/>
		{#if !searchActive}
			<div class="mt-4 flex items-center justify-center gap-2">
				<button
					type="button"
					class="rounded border border-[#444] bg-[#27282E] px-3 py-1 text-sm transition hover:bg-[#333] disabled:opacity-50"
					on:click={() => loadFiles(currentPage - 1)}
					disabled={currentPage === 1}
				>
					Prev
				</button>
				<span class="text-sm">Page {currentPage}</span>
				<button
					type="button"
					class="rounded border border-[#444] bg-[#27282E] px-3 py-1 text-sm transition hover:bg-[#333] disabled:opacity-50"
					on:click={() => loadFiles(currentPage + 1)}
					disabled={!hasNextPage}
				>
					Next
				</button>
			</div>
		{/if}
	{/if}

	<!-- Modals -->
	{#if showUploadModal}
		<UploadModal onClose={() => (showUploadModal = false)} onUploaded={loadFiles} />
	{/if}

	{#if previewImage}
		<ImagePreviewer src={previewImage} onClose={handleClosePreview} />
	{/if}

	{#if fileToDelete}
		<ConfirmModal
			message={`Are you sure you want to delete ${fileToDelete.filename}?`}
			onConfirm={async () => {
				if (!fileToDelete) return;
				try {
					await deleteFile(fileToDelete.id, token);
					await loadFiles();
					fileToDelete = null;
				} catch (err) {
					console.error(err);
					if (err instanceof UnauthorizedError) {
						statusMessage = 'Session expired. Redirecting to login...';
						clearToken();
						setTimeout(() => goto('/login'), 1000);
					} else {
						const message = (err as Error).message || '';
						if (message.includes('403')) {
							showOwnerError = true;
						} else if (message.includes('404')) {
							statusNotFoundError = true;
						}
					}
				} finally {
					fileToDelete = null;
				}
			}}
			onCancel={() => (fileToDelete = null)}
		/>
	{/if}

	{#if showProfileModal}
		<UserProfileModal {token} onClose={() => (showProfileModal = false)} />
	{/if}

	{#if showOwnerError}
		<AlertModal
			message="You are not the owner of this file."
			onClose={() => (showOwnerError = false)}
		/>
	{/if}

	{#if statusNotFoundError}
		<AlertModal
			message="The requested file was not found."
			onClose={() => (statusNotFoundError = false)}
		/>
	{/if}
</main>
