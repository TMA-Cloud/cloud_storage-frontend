<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { isImage, type FileMeta } from '$lib/api/files';
	import { getIconComponent } from '$lib/utils/fileIcons';

	export let files: FileMeta[] = [];
	export let thumbnails: Record<string, string> = {};

	const dispatch = createEventDispatcher<{ open: FileMeta }>();

	function open(file: FileMeta) {
		dispatch('open', file);
	}

	function handleKey(event: KeyboardEvent, file: FileMeta) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			open(file);
		}
	}
</script>

<table class="min-w-full divide-y divide-gray-700">
	<thead class="bg-gray-800 text-left text-sm text-gray-400 uppercase">
		<tr>
			<th class="px-4 py-2">File</th>
			<th class="px-4 py-2">Uploaded</th>
			<th class="px-4 py-2">Size</th>
			<th class="px-4 py-2">Modified</th>
		</tr>
	</thead>
	<tbody class="divide-y divide-gray-700">
		{#each files as file (file.id)}
			<tr
				tabindex="0"
				on:click={() => open(file)}
				on:keydown={(e) => handleKey(e, file)}
				class="cursor-pointer hover:bg-gray-700 focus:bg-gray-700"
			>
				<td class="px-4 py-3">
					<div class="flex items-center gap-4">
						{#if isImage(file.filename)}
							{#if thumbnails[file.id]}
								<img
									src={thumbnails[file.id]}
									alt={file.filename}
									class="h-12 w-12 rounded border object-cover"
								/>
							{:else}
								<div class="h-12 w-12 rounded border bg-gray-700"></div>
							{/if}
						{:else}
							{@const Icon = getIconComponent(file.filename.split('.').pop() || '')}
							<Icon class="h-12 w-12 rounded border bg-gray-700 p-2 text-white" />
						{/if}
						<span class="font-semibold hover:underline">{file.filename}</span>
					</div>
				</td>
				<td class="px-4 py-3 text-sm text-gray-300"
					>{new Date(file.uploaded_at).toLocaleString()}</td
				>
				<td class="px-4 py-3 text-sm text-gray-300">{(file.size / 1024).toFixed(1)} KB</td>
				<td class="px-4 py-3 text-sm text-gray-300">
					{new Date(file.modified_at).toLocaleString()} by {file.modified_by}
				</td>
			</tr>
		{/each}
	</tbody>
</table>
