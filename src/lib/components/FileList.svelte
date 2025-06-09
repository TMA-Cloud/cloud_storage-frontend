<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { isImage, type FileMeta, downloadFile, updateFilePrivacy } from '$lib/api/files';
	import { formatFileSize } from '$lib/utils/format';
	import { getIconComponent } from '$lib/utils/fileIcons';
	import ThumbnailPlaceholder from './ThumbnailPlaceholder.svelte';
	import { Download, Trash2, Lock, Unlock } from 'lucide-svelte';
	import AlertModal from './AlertModal.svelte';
	import Toast from './Toast.svelte';

	export let files: FileMeta[] = [];
	export let thumbnails: Record<string, string> = {};
	export let token: string;

	const dispatch = createEventDispatcher<{ open: FileMeta; delete: FileMeta }>();

	function open(file: FileMeta) {
		dispatch('open', file);
	}

	function handleKey(event: KeyboardEvent, file: FileMeta) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			open(file);
		}
	}

	function handleDownload(file: FileMeta) {
		downloadFile(file, token);
	}

	function requestDelete(file: FileMeta) {
		dispatch('delete', file);
	}

	let showOwnerError = false;
	let toastMessage = '';
	let toastTimer: ReturnType<typeof setTimeout>;

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
			}
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
			<th class="px-4 py-2 text-right">Actions</th>
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
				<td class="px-4 py-3 text-sm text-gray-300"
					>{new Date(file.uploaded_at).toLocaleString()}</td
				>
				<td class="px-4 py-3 text-sm text-gray-300">{formatFileSize(file.size)}</td>
				<td class="px-4 py-3 text-sm text-gray-300">
					{new Date(file.modified_at).toLocaleString()} by {file.modified_by}
				</td>
				<td class="flex justify-end gap-2 px-4 py-3 text-right">
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
						on:click|stopPropagation={() => togglePrivacy(file)}
						class="rounded p-2 hover:bg-gray-600 focus:bg-gray-600"
						aria-label={file.is_private
							? `Make ${file.filename} public`
							: `Make ${file.filename} private`}
					>
						{#if file.is_private}
							<Lock class="h-5 w-5" />
						{:else}
							<Unlock class="h-5 w-5" />
						{/if}
					</button>
					<button
						type="button"
						on:click|stopPropagation={() => requestDelete(file)}
						class="rounded p-2 hover:bg-red-600 focus:bg-red-600"
						aria-label="Delete {file.filename}"
					>
						<Trash2 class="h-5 w-5" />
					</button>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
{#if showOwnerError}
	<AlertModal
		message="You are not the owner of this file."
		onClose={() => (showOwnerError = false)}
	/>
{/if}
{#if toastMessage}
	<Toast message={toastMessage} />
{/if}
