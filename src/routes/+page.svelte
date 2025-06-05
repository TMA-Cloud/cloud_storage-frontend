<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import ImagePreviewer from '$lib/components/ImagePreviewer.svelte';
	import {
		fetchFiles,
		type FileMeta,
		isImage,
		fetchFileBlob,
		openFile,
		closePreview
	} from '$lib/api/files';
	import { getIconComponent } from '$lib/utils/fileIcons';

	let token = '';
	let files: any[] = [];
	let previewImage: string | null = null;
	let thumbnails: Record<string, string> = {};
	let statusMessage = '';

	onMount(async () => {
		const raw = localStorage.getItem('token');
		if (!raw) return;
		token = raw;
		try {
			files = await fetchFiles(token);
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
		} catch (err: any) {
			if (err.message.includes('401') || err.message.includes('403')) {
				statusMessage = 'Session expired. Redirecting to login...';
				localStorage.removeItem('token');
				setTimeout(() => goto('/login'), 1000);
			} else {
				console.error(err);
			}
		}
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
		} catch (err: any) {
			console.error(err);
			if (err.message && (err.message.includes('401') || err.message.includes('403'))) {
				statusMessage = 'Session expired. Redirecting to login...';
				localStorage.removeItem('token');
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
		<a
			href="/upload"
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
		</a>
	</div>

	{#if files.length === 0}
		<p class="text-gray-400">No files found.</p>
	{:else}
		<div class="space-y-4">
			{#each files as file}
				<button
					type="button"
					on:click={() => handleOpen(file)}
					class="group flex w-full cursor-pointer items-center justify-between rounded-lg bg-gray-800 px-5 py-4 text-left shadow-md transition hover:bg-gray-700 hover:shadow-lg focus:outline-none"
					aria-label={`Open ${file.filename}`}
				>
					<div class="flex items-center gap-4">
						{#if isImage(file.filename)}
							{#if thumbnails[file.id]}
								<img
									src={thumbnails[file.id]}
									alt={file.filename}
									class="h-14 w-14 rounded border object-cover shadow"
								/>
							{:else}
								<div class="h-14 w-14 rounded border bg-gray-700"></div>
							{/if}
						{:else}
							{@const Icon = getIconComponent(file.filename.split('.').pop() || '')}
							<Icon class="h-14 w-14 rounded border bg-gray-700 p-2 text-white shadow" />
						{/if}
						<div>
							<p class="text-lg font-semibold group-hover:underline">{file.filename}</p>
							<p class="text-sm text-gray-400">
								Uploaded: {new Date(file.uploaded_at).toLocaleString()}
							</p>
						</div>
					</div>
					<div>
						<svg
							class="h-5 w-5 text-blue-400 opacity-0 transition group-hover:opacity-100"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M14 3v2h3.59L8 14.59 9.41 16 19 6.41V10h2V3h-7z" />
							<path d="M5 5h4V3H3v6h2V5z" />
						</svg>
					</div>
				</button>
			{/each}
		</div>
	{/if}

	{#if previewImage}
		<ImagePreviewer src={previewImage} onClose={handleClosePreview} />
	{/if}
</main>
