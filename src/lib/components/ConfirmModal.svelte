<script lang="ts">
	export let message: string;
	export let onConfirm: () => void;
	export let onCancel: () => void;

	function handleKey(event: KeyboardEvent) {
		if (event.key === 'Escape') onCancel();
	}
</script>

<div
	tabindex="0"
	role="dialog"
	aria-modal="true"
	aria-label="Confirmation dialog"
	on:keydown={handleKey}
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
>
	<button
		type="button"
		aria-label="Dismiss confirmation"
		class="absolute inset-0"
		on:click={onCancel}
	></button>
	<div
		role="document"
		class="relative z-10 w-full max-w-md rounded-2xl bg-[#27282E] p-6 text-white shadow-2xl transition-all duration-300"
	>
		<p class="mb-6 text-center text-lg">{message}</p>
		<div class="flex justify-end gap-2">
			<button
				type="button"
				on:click={onCancel}
				class="rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-700"
			>
				Cancel
			</button>
			<button
				type="button"
				on:click={onConfirm}
				class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
			>
				Confirm
			</button>
		</div>
	</div>
</div>
