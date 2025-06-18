<script lang="ts">
	import { onMount } from 'svelte';
	import Modal from './Modal.svelte';
	import type { FileMeta } from '$lib/api/files';

	export let file: FileMeta;
	export let onClose: () => void;
	export let onRename: (name: string) => void;

	let name = file.filename;
	let inputEl: HTMLInputElement;

	onMount(() => {
		inputEl.focus();
		inputEl.select();
	});

	function submit() {
		const trimmed = name.trim();
		if (trimmed) {
			onRename(trimmed);
		}
	}
</script>

<Modal {onClose} ariaLabel="Rename file">
	<div
		role="document"
		class="relative z-10 w-full max-w-md rounded-2xl bg-[#27282E] p-6 text-white shadow-2xl transition-all duration-300"
	>
		<h2 class="mb-4 text-lg font-semibold">Rename File</h2>
		<input
			bind:this={inputEl}
			bind:value={name}
			on:keydown={(e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					submit();
				}
			}}
			class="mb-6 w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:ring-1 focus:ring-blue-500"
		/>
		<div class="flex justify-end gap-2">
			<button
				type="button"
				on:click={onClose}
				class="rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-700"
			>
				Cancel
			</button>
			<button
				type="button"
				on:click={submit}
				class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
			>
				Rename
			</button>
		</div>
	</div>
</Modal>
