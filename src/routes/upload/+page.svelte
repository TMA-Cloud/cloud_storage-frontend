<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { uploadFile } from '$lib/api/files';

	let file: File | null = null;
	let token = '';
	let uploadStatus = '';

	onMount(() => {
		const saved = localStorage.getItem('token');
		if (!saved) {
			uploadStatus = 'No token found. Please login first.';
		} else {
			token = saved;
		}
	});

	async function handleUpload() {
		if (!file || !token) {
			uploadStatus = 'Missing file or token';
			return;
		}

		try {
			const data = await uploadFile(file, token);
			uploadStatus = `Uploaded: ${data.filename}`;
			setTimeout(() => goto('/'), 1500);
		} catch (err: unknown) {
			console.error(err);
			const message = (err as Error).message || '';
			uploadStatus = `Upload failed: ${message || 'Unknown error'}`;
		}
	}
</script>

<main class="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-6 text-white">
	<h1 class="mb-6 text-3xl font-bold">📤 Upload a File</h1>

	<div class="w-full max-w-md space-y-4 rounded-xl bg-gray-800 p-6 shadow-md">
		<input
			type="file"
			on:change={(e) => (file = (e.target as HTMLInputElement).files?.[0] || null)}
			class="block w-full text-sm text-gray-300 file:mr-4 file:rounded file:border-0 file:bg-blue-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-600"
		/>

		<button
			on:click={handleUpload}
			class="w-full rounded bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700"
		>
			🚀 Upload File
		</button>

		{#if uploadStatus}
			<p class="mt-4 text-center text-sm text-gray-300">{uploadStatus}</p>
		{/if}
	</div>
</main>
