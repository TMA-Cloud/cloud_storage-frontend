<script lang="ts">
	import FileList from '$lib/components/file/FileList.svelte';
	import {
		files,
		thumbnails,
		token,
		currentPage,
		hasNextPage,
		headerHeight,
		statusMessage,
		searchQuery,
		searchActive,
		loadFiles,
		handleOpen,
		fileToDelete,
		fileToRename,
		selectedIds
	} from '$lib/stores/home';
</script>

{#if $statusMessage}
	<p
		class="mb-6 rounded border border-red-500/30 bg-red-500/10 px-4 py-2 text-center text-red-300 shadow-sm"
	>
		{$statusMessage}
	</p>
{/if}

{#if $searchActive && $searchQuery}
	<p class="mb-4 text-sm text-gray-400">Results for "{$searchQuery}"</p>
{/if}

{#if !$files || $files.length === 0}
	<div class="mt-20 text-center text-gray-500">
		<p class="text-xl font-semibold">{$searchActive ? 'No matching files' : 'No files yet'}</p>
		<p class="mt-1 text-sm text-gray-400">
			{$searchActive ? 'Try another search' : 'Click "Upload" to get started'}
		</p>
	</div>
{:else}
	<FileList
		files={$files}
		thumbnails={$thumbnails}
		token={$token}
		headerOffset={$headerHeight}
		on:open={(e) => handleOpen(e.detail)}
		on:delete={(e) => ($fileToDelete = e.detail)}
		on:rename={(e) => ($fileToRename = e.detail)}
		on:selection={(e) => ($selectedIds = e.detail)}
	/>
	{#if !$searchActive}
		<div class="mt-4 flex items-center justify-center gap-2">
			<button
				type="button"
				class="rounded border border-[#444] bg-[#27282E] px-3 py-1 text-sm transition hover:bg-[#333] disabled:opacity-50"
				on:click={() => loadFiles($currentPage - 1)}
				disabled={$currentPage === 1}
			>
				Prev
			</button>
			<span class="text-sm">Page {$currentPage}</span>
			<button
				type="button"
				class="rounded border border-[#444] bg-[#27282E] px-3 py-1 text-sm transition hover:bg-[#333] disabled:opacity-50"
				on:click={() => loadFiles($currentPage + 1)}
				disabled={!$hasNextPage}
			>
				Next
			</button>
		</div>
	{/if}
{/if}
