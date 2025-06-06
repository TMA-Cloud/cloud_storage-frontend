<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { getToken, clearToken } from '$lib/api/auth';
	import ImagePreviewer from '$lib/components/ImagePreviewer.svelte';
	import FileList from '$lib/components/FileList.svelte';
	import UploadModal from '$lib/components/UploadModal.svelte';
	import {
		fetchFiles,
		type FileMeta,
		isImage,
		fetchFileBlob,
		openFile,
		closePreview
	} from '$lib/api/files';

	let token = '';
	let files: FileMeta[] = [];
	let previewImage: string | null = null;
	let thumbnails: Record<string, string> = {};
	let statusMessage = '';
	let showUploadModal = false;

	async function loadFiles() {
		try {
			const newFiles = await fetchFiles(token);
			for (const url of Object.values(thumbnails)) {
				URL.revokeObjectURL(url);
			}
			thumbnails = {};
			files = newFiles;
			for (const f of files) {
				if (isImage(f.filename)) {
					try {
						const blob = await fetchFileBlob(f.id, token);
						thumbnails[f.id] = URL.createObjectURL(blob);
					} catch (e) {
						console.error(e);
					}
				}
			}
		} catch (err: unknown) {
			const message = (err as Error).message || '';
			if (message.includes('401') || message.includes('403')) {
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
			const message = (err as Error).message || '';
			if (message.includes('401') || message.includes('403')) {
				statusMessage = 'Session expired. Redirecting to login...';
				clearToken();
				setTimeout(() => goto('/login'), 1000);
			}
		}
	}

	function handleClosePreview() {
		if (previewImage) {
			closePreview(previewImage);
			previewImage = null;
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

<main class="min-h-screen bg-gray-900 p-6 text-white">
	<h1 class="mb-8 flex items-center gap-3 text-4xl font-bold">
		<svg class="h-8 w-8 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
			<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2z" />
		</svg>
		<span>Your Cloud Files</span>
	</h1>

	{#if statusMessage}
		<p class="mb-4 text-center text-red-400">{statusMessage}</p>
	{/if}

	<!-- Upload button -->
	<div class="mb-6 flex justify-end">
		<button
			type="button"
			on:click={() => (showUploadModal = true)}
			class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow transition hover:bg-blue-700"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V4m0 0L8 8m4-4l4 4"
				/>
			</svg>
			<span>Upload</span>
		</button>
	</div>

	{#if showUploadModal}
		<UploadModal onClose={() => (showUploadModal = false)} onUploaded={loadFiles} />
	{/if}

	{#if files.length === 0}
		<p class="text-gray-400">No files found.</p>
	{:else}
		<FileList {files} {thumbnails} {token} on:open={(e) => handleOpen(e.detail)} />
	{/if}

	{#if previewImage}
		<ImagePreviewer src={previewImage} onClose={handleClosePreview} />
	{/if}
</main>
