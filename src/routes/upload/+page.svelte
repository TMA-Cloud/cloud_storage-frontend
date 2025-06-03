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
		} catch (err: any) {
			console.error(err);
			uploadStatus = `Upload failed: ${err.message || 'Unknown error'}`;
		}
	}
</script>

<main class="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center justify-center">
	<h1 class="text-3xl font-bold mb-6">📤 Upload a File</h1>

	<div class="bg-gray-800 p-6 rounded-xl shadow-md w-full max-w-md space-y-4">
		<input
			type="file"
			on:change={(e) => file = (e.target as HTMLInputElement).files?.[0] || null}
			class="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
		/>

		<button
			on:click={handleUpload}
			class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
		>
			🚀 Upload File
		</button>

		{#if uploadStatus}
			<p class="text-center text-sm text-gray-300 mt-4">{uploadStatus}</p>
		{/if}
	</div>
</main>
