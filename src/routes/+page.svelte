<script lang="ts">
	import { onMount } from 'svelte';
	import { jwtDecode } from 'jwt-decode';
	import ImagePreviewer from '$lib/components/ImagePreviewer.svelte';
	import { fetchFiles } from '$lib/api/files';
	import { getIconComponent } from '$lib/utils/fileIcons';

	const API_BASE = import.meta.env.VITE_API_BASE_URL;

	let token = '';
	let files: any[] = [];
	let username: string = '...';
	let previewImage: string | null = null;

	onMount(async () => {
		const raw = localStorage.getItem('token');
		if (!raw) return;
		token = raw;
		files = await fetchFiles(token);
		decodeUser();
	});

	function decodeUser() {
		try {
			const raw = localStorage.getItem('token');
			if (!raw) return;
			const decoded: any = jwtDecode(raw);
			username = decoded.name || decoded.sub || 'Anonymous';
		} catch (err) {
			console.error('JWT decode error:', err);
			username = 'Unknown';
		}
	}

	function isImage(filename: string): boolean {
		const ext = filename.split('.').pop()?.toLowerCase() || '';
		return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(ext);
	}
</script>

<main class="min-h-screen bg-gray-900 text-white p-6">
	<h1 class="text-4xl font-bold mb-8 flex items-center gap-3">
		<svg class="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
			<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2z" />
		</svg>
		<span>Your Cloud Files</span>
	</h1>

	<!-- Upload button -->
	<div class="mb-6 flex justify-end">
		<a
			href="/upload"
			class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition flex items-center gap-2"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V4m0 0L8 8m4-4l4 4" />
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
					on:click={() => {
						if (isImage(file.filename)) {
							previewImage = `${API_BASE}/api/files/${file.id}/download`;
						} else {
							window.open(`/file/${file.id}`, '_blank');
						}
					}}
					class="flex items-center justify-between bg-gray-800 hover:bg-gray-700 px-5 py-4 rounded-lg cursor-pointer transition shadow-md hover:shadow-lg group w-full text-left focus:outline-none"
					aria-label={`Open ${file.filename}`}
				>
					<div class="flex items-center gap-4">
						{#if isImage(file.filename)}
							<img
								src={`${API_BASE}/api/files/${file.id}/download`}
								alt={file.filename}
								class="w-14 h-14 object-cover rounded shadow border"
							/>
						{:else}
							{@const Icon = getIconComponent(file.filename.split('.').pop() || '')}
							<Icon class="w-14 h-14 text-white bg-gray-700 p-2 rounded shadow border" />
						{/if}
						<div>
							<p class="text-lg font-semibold group-hover:underline">{file.filename}</p>
							<p class="text-sm text-gray-400">
								Uploaded: {new Date(file.uploaded_at).toLocaleString()}
							</p>
						</div>
					</div>
					<div>
					<svg class="w-5 h-5 text-blue-400 opacity-0 group-hover:opacity-100 transition" fill="currentColor" viewBox="0 0 24 24">
							<path d="M14 3v2h3.59L8 14.59 9.41 16 19 6.41V10h2V3h-7z"/>
							<path d="M5 5h4V3H3v6h2V5z"/>
					</svg>
					</div>
				</button>
			{/each}
		</div>
	{/if}

	{#if previewImage}
		<ImagePreviewer src={previewImage} onClose={() => (previewImage = null)} />
	{/if}
</main>
