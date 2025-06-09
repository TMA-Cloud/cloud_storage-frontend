<script lang="ts">
	import { onMount } from 'svelte';
	import { uploadFiles } from '$lib/api/files';
	import { getToken } from '$lib/api/auth';
	import { X } from 'lucide-svelte';

	export let onClose: () => void;
	export let onUploaded: () => void = () => {};

	let files: File[] = [];
	let token = '';
	let uploadStatus = '';
	let dropActive = false;
	let uploading = false;
	let privateUpload = false;

	onMount(() => {
		const saved = getToken();
		if (!saved) {
			uploadStatus = 'No token found. Please login first.';
		} else {
			token = saved;
		}
	});

	async function handleUpload() {
		if (uploading || files.length === 0 || !token) {
			uploadStatus = 'Missing files or token';
			return;
		}

		uploading = true;

		try {
			const data = await uploadFiles(files, token, privateUpload);
			const count = data.files.length;
			const names = data.files.map((f) => f.filename).join(', ');
			uploadStatus = `✅ Uploaded ${count} file${count === 1 ? '' : 's'}: ${names}`;
			onUploaded();
			setTimeout(() => {
				uploading = false;
				onClose();
			}, 1500);
		} catch (err: unknown) {
			console.error(err);
			const message = (err as Error).message || '';
			uploadStatus = `❌ Upload failed: ${message || 'Unknown error'}`;
			uploading = false;
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		if (event.dataTransfer?.files.length) {
			files = Array.from(event.dataTransfer.files);
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

	function removeFile(index: number) {
		files = files.filter((_, i) => i !== index);
	}

	function handleKey(event: KeyboardEvent) {
		if (event.key === 'Escape') onClose();
	}
</script>

<!-- Modal Overlay -->
<div
	tabindex="0"
	role="dialog"
	aria-modal="true"
	aria-label="Upload files modal"
	on:keydown={handleKey}
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
>
	<!-- Dismiss Background -->
	<button
		type="button"
		aria-label="Dismiss upload modal"
		class="absolute inset-0"
		on:click={onClose}
	></button>

	<!-- Modal Card -->
	<div
		role="document"
		class="relative z-10 w-full max-w-md rounded-2xl bg-[#27282E] p-6 text-white shadow-2xl transition-all duration-300"
	>
		<h2 class="mb-5 text-xl font-bold text-white">📤 Upload Files</h2>

		<!-- Dropzone -->
		<div
			role="button"
			tabindex="0"
			aria-label="File dropzone"
			class={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition ${
				dropActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-blue-400'
			}`}
			on:drop={handleDrop}
			on:dragover={handleDragOver}
			on:dragleave={handleDragLeave}
		>
			<svg
				class="h-12 w-12 text-blue-400"
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
			<p class="text-sm font-medium text-gray-300">Drag & drop your files here</p>
			<span class="text-xs text-gray-500">or</span>
			<label
				class="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
			>
				Browse Files
				<input
					type="file"
					multiple
					on:change={(e) => (files = Array.from((e.target as HTMLInputElement).files || []))}
					disabled={uploading}
					class="hidden"
				/>
			</label>
			{#if files.length}
				<ul class="mt-1 space-y-1 text-sm font-medium text-gray-200">
					{#each files as f, i (i)}
						<li class="flex items-center gap-2">
							<span>📄 {f.name}</span>
							<button
								type="button"
								on:click={() => removeFile(i)}
								disabled={uploading}
								aria-label={`Remove ${f.name}`}
								class="rounded p-1 hover:bg-gray-600 focus:bg-gray-600"
							>
								<X class="h-4 w-4" />
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<div class="mt-4 flex items-center gap-2">
			<input
				id="private-upload"
				type="checkbox"
				bind:checked={privateUpload}
				class="h-4 w-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
			/>
			<label for="private-upload" class="text-sm text-gray-300">Private upload</label>
		</div>

		<!-- Action Buttons -->
		<div class="mt-6 flex justify-end gap-2">
			<button
				type="button"
				on:click={onClose}
				class="rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-700"
			>
				Cancel
			</button>
			<button
				type="button"
				on:click={handleUpload}
				disabled={uploading || files.length === 0}
				class="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if uploading}
					<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
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

		<!-- Upload Status -->
		{#if uploadStatus}
			<p class="mt-4 text-center text-sm text-gray-400">{uploadStatus}</p>
		{/if}
	</div>
</div>
