<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { isImage, type FileMeta, downloadFile, updateFilePrivacy } from '$lib/api/files';
	import { formatFileSize } from '$lib/utils/format';
	import { getIconComponent } from '$lib/utils/fileIcons';
	import ThumbnailPlaceholder from './ThumbnailPlaceholder.svelte';
	import { Download, Trash2, Lock, Unlock, MoreVertical } from 'lucide-svelte';
	import AlertModal from './AlertModal.svelte';
	import Toast from './Toast.svelte';

	export let files: FileMeta[] = [];
	export let thumbnails: Record<string, string> = {};
	export let token: string;
	export let headerOffset: number = 0;

	const dispatch = createEventDispatcher<{
		open: FileMeta;
		delete: FileMeta;
		selection: string[];
	}>();

	function open(file: FileMeta) {
		dispatch('open', file);
	}

	function handleKey(event: KeyboardEvent, file: FileMeta) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			open(file);
		}
	}

	function rowClick(event: MouseEvent, file: FileMeta) {
		if (selecting) return;
		openMenu = null;
		if (event.ctrlKey || event.metaKey) {
			toggleSelect(file);
			return;
		}
		// ignore second click of a double-click sequence
		if (event.detail && event.detail > 1) return;
		open(file);
	}

	async function handleDownload(file: FileMeta) {
		try {
			await downloadFile(file, token);
		} catch (err) {
			console.error(err);
			const message = (err as Error).message || '';
			if (message.includes('403')) {
				showOwnerError = true;
			} else if (message.includes('404')) {
				statusNotFoundError = true;
			}
		}
	}

	function requestDelete(file: FileMeta) {
		dispatch('delete', file);
	}

	let showOwnerError = false;
	let statusNotFoundError = false;
	let toastMessage = '';
	let toastTimer: ReturnType<typeof setTimeout>;
	let openMenu: string | null = null;

	let selected = new Set<string>();
	let container: HTMLDivElement;
	let rowRefs: Record<string, HTMLTableRowElement> = {};
	let selecting = false;
	let suppressClickClear = false;
	let box = { left: 0, top: 0, width: 0, height: 0 };
	let startX = 0;
	let startY = 0;
	let scrollX = 0;
	let scrollY = 0;

	function toggleMenu(id: string) {
		openMenu = openMenu === id ? null : id;
	}

	function dispatchSelection() {
		dispatch('selection', Array.from(selected));
	}

	function toggleSelect(file: FileMeta) {
		if (selected.has(file.id)) {
			selected.delete(file.id);
		} else {
			selected.add(file.id);
		}
		selected = new Set(selected);
		dispatchSelection();
	}

	function clearSelection() {
		if (selected.size === 0) return;
		selected = new Set();
		dispatchSelection();
	}

	function showToast(message: string) {
		toastMessage = message;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => (toastMessage = ''), 4000);
	}

	async function togglePrivacy(file: FileMeta) {
		try {
			await updateFilePrivacy(file.id, !file.is_private, token);
			files = files.map((f) => (f.id === file.id ? { ...f, is_private: !file.is_private } : f));
			showToast(!file.is_private ? 'File is now private' : 'File is now public');
		} catch (err) {
			console.error(err);
			const message = (err as Error).message || '';
			if (message.includes('403')) {
				showOwnerError = true;
			} else if (message.includes('404')) {
				statusNotFoundError = true;
			}
		}
	}

	function onMouseDown(event: MouseEvent) {
		if (event.button !== 0) return;
		// ignore if clicking on action buttons
		const target = event.target as HTMLElement;
		if (target.closest('button')) return;
		// don't initiate drag when ctrl/meta key held for multi-select
		if (event.ctrlKey || event.metaKey) return;
		openMenu = null;
		selecting = true;
		startX = event.pageX;
		startY = event.pageY;
		scrollX = window.scrollX;
		scrollY = window.scrollY;
		box = { left: startX, top: startY, width: 0, height: 0 };
		clearSelection();
	}

	function onMouseMove(event: MouseEvent) {
		if (!selecting) return;
		const currentX = event.pageX;
		const currentY = event.pageY;
		scrollX = window.scrollX;
		scrollY = window.scrollY;
		box = {
			left: Math.min(startX, currentX),
			top: Math.min(startY, currentY),
			width: Math.abs(currentX - startX),
			height: Math.abs(currentY - startY)
		};
		const next = new Set<string>();
		for (const file of files) {
			const el = rowRefs[file.id];
			if (!el) continue;
			const rect = el.getBoundingClientRect();
			const rectLeft = rect.left + window.scrollX;
			const rectRight = rect.right + window.scrollX;
			const rectTop = rect.top + window.scrollY;
			const rectBottom = rect.bottom + window.scrollY;
			if (
				box.left < rectRight &&
				box.left + box.width > rectLeft &&
				box.top < rectBottom &&
				box.top + box.height > rectTop
			) {
				next.add(file.id);
			}
		}
		selected = next;
		dispatchSelection();
	}

	function onMouseUp() {
		if (!selecting) return;
		selecting = false;
		suppressClickClear = true;
		selected = new Set(selected);
		dispatchSelection();
	}

	function handleWindowClick(event: MouseEvent) {
		if (!container.contains(event.target as Node)) {
			openMenu = null;
			if (suppressClickClear) {
				suppressClickClear = false;
				return;
			}
			if (selected.size > 0) clearSelection();
		}
	}

	function handleContainerClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (suppressClickClear) {
			suppressClickClear = false;
			return;
		}
		if (!target.closest('tr')) {
			if (selected.size > 0) clearSelection();
		}
	}

	// New: handle keyboard activation on the container
	function handleContainerKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleContainerClick(event as unknown as MouseEvent);
		}
	}
</script>

<svelte:window
	on:click={handleWindowClick}
	on:mousemove={onMouseMove}
	on:mouseup={onMouseUp}
	on:scroll={() => {
		if (selecting) {
			scrollX = window.scrollX;
			scrollY = window.scrollY;
		}
	}}
/>

<div
	class="relative"
	bind:this={container}
	role="button"
	aria-label="Click or press Enter/Space to clear selection"
	tabindex="0"
	on:mousedown={onMouseDown}
	on:click={handleContainerClick}
	on:keydown={handleContainerKeyDown}
>
	{#if selecting}
		<div
			class="pointer-events-none fixed z-20 border-2 border-blue-500 bg-blue-500/20"
			style="left: {box.left - scrollX}px; top: {box.top -
				scrollY}px; width: {box.width}px; height: {box.height}px;"
		></div>
	{/if}
	<table class="min-w-full divide-y divide-gray-700">
		<thead
			class="sticky z-10 bg-gray-800 text-left text-sm text-gray-400 uppercase"
			style="top: {headerOffset}px"
		>
			<tr>
				<th class="px-4 py-2">File</th>
				<th class="px-4 py-2">Owner</th>
				<th class="px-4 py-2">Size</th>
				<th class="px-4 py-2">Uploaded</th>
				<th class="px-4 py-2">Modified</th>
				<th class="px-4 py-2 text-right">Actions</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-700">
			{#each files as file (file.id)}
				<tr
					bind:this={rowRefs[file.id]}
					tabindex="0"
					on:click={(e) => rowClick(e, file)}
					on:keydown={(e) => handleKey(e, file)}
					class="cursor-pointer {selected.has(file.id)
						? 'bg-blue-600 text-white hover:bg-blue-600 focus:bg-blue-600'
						: 'hover:bg-gray-700 focus:bg-gray-700'}"
				>
					<td class="px-4 py-3">
						<div class="flex items-center gap-4">
							{#if isImage(file.filename)}
								{#if thumbnails[file.id]}
									<img
										src={thumbnails[file.id]}
										alt={file.filename}
										class="h-14 w-14 rounded border object-cover"
									/>
								{:else}
									<ThumbnailPlaceholder />
								{/if}
							{:else}
								{@const Icon = getIconComponent(file.filename.split('.').pop() || '')}
								<Icon class="h-12 w-12 rounded border bg-gray-700 p-2 text-white" />
							{/if}
							<span class="flex items-center gap-1 font-semibold hover:underline">
								{file.filename}
								{#if file.is_private}
									<Lock class="h-4 w-4 text-gray-400" />
								{/if}
							</span>
						</div>
					</td>
					<td class="px-4 py-3 text-sm {selected.has(file.id) ? '' : 'text-gray-300'}">
						{file.owner}
					</td>
					<td class="px-4 py-3 text-sm {selected.has(file.id) ? '' : 'text-gray-300'}">
						{formatFileSize(file.size)}
					</td>
					<td class="px-4 py-3 text-sm {selected.has(file.id) ? '' : 'text-gray-300'}">
						{new Date(file.uploaded_at).toLocaleString()}
					</td>
					<td class="px-4 py-3 text-sm {selected.has(file.id) ? '' : 'text-gray-300'}">
						{new Date(file.modified_at).toLocaleString()} by {file.modified_by}
					</td>
					<td class="relative flex justify-end gap-2 px-4 py-3 text-right">
						<button
							type="button"
							on:click|stopPropagation={() => handleDownload(file)}
							class="rounded p-2 hover:bg-gray-600 focus:bg-gray-600"
							aria-label="Download {file.filename}"
						>
							<Download class="h-5 w-5" />
						</button>
						<button
							type="button"
							on:click|stopPropagation={() => toggleMenu(file.id)}
							class="rounded p-2 hover:bg-gray-600 focus:bg-gray-600"
							aria-label="More actions"
						>
							<MoreVertical class="h-5 w-5" />
						</button>
						{#if openMenu === file.id}
							<div class="absolute right-0 z-20 mt-2 w-40 rounded-md bg-[#27282E] shadow-lg">
								<button
									type="button"
									on:click|stopPropagation={() => {
										togglePrivacy(file);
										openMenu = null;
									}}
									class="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
									aria-label={file.is_private
										? `Make ${file.filename} public`
										: `Make ${file.filename} private`}
								>
									{#if file.is_private}
										<Unlock class="h-4 w-4" />
										<span>Make Public</span>
									{:else}
										<Lock class="h-4 w-4" />
										<span>Make Private</span>
									{/if}
								</button>
								<button
									type="button"
									on:click|stopPropagation={() => {
										requestDelete(file);
										openMenu = null;
									}}
									class="flex w-full items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-600 hover:text-white"
									aria-label="Delete {file.filename}"
								>
									<Trash2 class="h-4 w-4" />
									<span>Delete</span>
								</button>
							</div>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if showOwnerError}
	<AlertModal
		message="You are not the owner of this file."
		onClose={() => (showOwnerError = false)}
	/>
{/if}

{#if statusNotFoundError}
	<AlertModal
		message="The requested file was not found."
		onClose={() => (statusNotFoundError = false)}
	/>
{/if}

{#if toastMessage}
	<Toast message={toastMessage} />
{/if}
