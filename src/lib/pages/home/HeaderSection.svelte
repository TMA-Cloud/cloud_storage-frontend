<script lang="ts">
	import { Trash2 } from 'lucide-svelte';
	import {
		headerHeight,
		searchQuery,
		searchActive,
		searching,
		showUploadModal,
		showProfileModal,
		selectedIds,
		bulkDeleteIds,
		confirmBulk,
		versionMessages,
		performSearch,
		clearSearch,
		handleSearchInput
	} from '$lib/stores/home';
</script>

<div
	class="relative sticky top-0 z-10 mb-10 flex items-center justify-between border-b border-[#2E2F35] bg-[#1E1F23] py-3"
	bind:clientHeight={$headerHeight}
>
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
			bind:value={$searchQuery}
			class="rounded border border-[#444] bg-[#27282E] px-3 py-1 text-sm text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
			on:keydown={(e) => e.key === 'Enter' && performSearch()}
			on:input={handleSearchInput}
		/>
		<button
			type="button"
			on:click={performSearch}
			class="rounded-md border border-[#444] bg-[#27282E] px-3 py-1 text-sm text-gray-300 transition hover:bg-[#333] disabled:opacity-50"
			disabled={$searching}
		>
			Search
		</button>
		{#if $searchActive}
			<button
				type="button"
				on:click={clearSearch}
				class="rounded-md border border-[#444] bg-[#27282E] px-3 py-1 text-sm text-gray-300 transition hover:bg-[#333]"
			>
				Clear
			</button>
		{/if}
		<button
			on:click={() => ($showUploadModal = true)}
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
			on:click={() => ($showProfileModal = true)}
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
		{#if $selectedIds.length > 0}
			<button
				on:click={() => {
					$bulkDeleteIds = [...$selectedIds];
					$confirmBulk = true;
				}}
				class="inline-flex items-center gap-2 rounded-md border border-red-500 bg-red-600/20 px-4 py-2 text-sm text-red-200 transition hover:bg-red-600 hover:text-white"
			>
				<Trash2 class="h-4 w-4" />
				<span>Delete Selected</span>
			</button>
		{/if}
	</div>
	{#if $versionMessages.length > 0}
		<div
			class="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded bg-yellow-700 px-4 py-2 text-sm text-yellow-100 shadow"
		>
			{#each $versionMessages as msg (msg)}
				<div>{msg}</div>
			{/each}
		</div>
	{/if}
</div>
