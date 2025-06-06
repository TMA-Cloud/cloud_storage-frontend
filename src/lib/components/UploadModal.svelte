<script lang="ts">
	import { onMount } from 'svelte';
	import { uploadFile } from '$lib/api/files';
	import { getToken } from '$lib/api/auth';

	export let onClose: () => void;
	export let onUploaded: () => void = () => {};

	let file: File | null = null;
	let token = '';
	let uploadStatus = '';
	let dropActive = false;
	let uploading = false;

	onMount(() => {
		const saved = getToken();
		if (!saved) {
			uploadStatus = 'No token found. Please login first.';
		} else {
			token = saved;
		}
	});

	async function handleUpload() {
		if (uploading) return;
		if (!file || !token) {
			uploadStatus = 'Missing file or token';
			return;
		}

		uploading = true;

		try {
			const data = await uploadFile(file, token);
			uploadStatus = `Uploaded: ${data.filename}`;
			onUploaded();
			setTimeout(() => {
				uploading = false;
				onClose();
			}, 1500);
		} catch (err: unknown) {
			console.error(err);
			const message = (err as Error).message || '';
			uploadStatus = `Upload failed: ${message || 'Unknown error'}`;
			uploading = false;
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		if (event.dataTransfer?.files.length) {
			file = event.dataTransfer.files[0];
		}
		dropActive = false;
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		dropActive = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		dropActive = false;
	}

	function handleKey(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
	}
</script>

<!-- Modal wrapper with keyboard focus -->
<div
	tabindex="0"
	role="dialog"
	aria-modal="true"
	aria-label="Upload file modal"
	on:keydown={handleKey}
	class="fixed inset-0 z-50 flex items-center justify-center"
>
	<!-- Backdrop as actual <button> to dismiss modal -->
	<button
		type="button"
		aria-label="Dismiss upload modal"
		class="absolute inset-0 cursor-default bg-black/80 backdrop-blur-sm"
		on:click={onClose}
	></button>

	<!-- Modal content -->
	<div
		role="document"
		class="relative z-10 w-full max-w-lg overflow-hidden rounded-lg bg-white p-6 text-gray-800 shadow-xl"
	>
		<h2 class="mb-4 text-xl font-semibold">Upload files</h2>
		<div
			role="button"
			tabindex="0"
			aria-label="File dropzone"
			class="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center"
			class:border-blue-500={dropActive}
			on:drop={handleDrop}
			on:dragover={handleDragOver}
			on:dragleave={handleDragLeave}
		>
			<svg
				class="h-12 w-12 text-gray-400"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-6-12v12m0 0l-4-4m4 4l4-4"
				/>
			</svg>
			<p class="text-sm text-gray-600">Drag files here</p>
			<span class="text-sm text-gray-500">or</span>
			<label
				class="cursor-pointer rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
			>
				Select file
				<input
					type="file"
					on:change={(e) => (file = (e.target as HTMLInputElement).files?.[0] || null)}
					disabled={uploading}
					class="hidden"
				/>
			</label>
			{#if file}
				<p class="mt-1 text-sm text-gray-700">{file.name}</p>
			{/if}
		</div>
		<div class="mt-6 flex justify-end gap-3">
			<button
				type="button"
				on:click={onClose}
				class="rounded px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
			>
				Cancel
			</button>
			<button
				type="button"
				on:click={handleUpload}
				disabled={uploading || !file}
				class="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if uploading}
					<svg
						class="h-4 w-4 animate-spin"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						/>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 01-8-8z"
						/>
					</svg>
					Uploading...
				{:else}
					Upload
				{/if}
			</button>
		</div>
		{#if uploadStatus}
			<p class="mt-4 text-center text-sm text-gray-600">{uploadStatus}</p>
		{/if}
	</div>
</div>
