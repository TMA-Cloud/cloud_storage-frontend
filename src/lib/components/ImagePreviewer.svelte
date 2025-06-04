<script lang="ts">
	export let src: string;
	export let onClose: () => void;

	function handleKey(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
	}
</script>

<!-- Modal wrapper with keyboard focus -->
<div
	tabindex="0"
	role="dialog"
	aria-modal="true"
	aria-label="Image preview modal"
	on:keydown={handleKey}
	class="fixed inset-0 z-50 flex items-center justify-center"
>
	<!-- Backdrop as actual <button> to dismiss modal -->
	<button
		type="button"
		aria-label="Dismiss image preview"
		class="absolute inset-0 cursor-default bg-black/80 backdrop-blur-sm"
		on:click={onClose}
	></button>

	<!-- Modal content -->
	<div
		role="document"
		class="relative z-10 rounded border border-gray-700 bg-gray-900/90 p-4 shadow-xl"
	>
		<img {src} alt="Preview" class="max-h-[80vh] max-w-[90vw] rounded" />
		<button
			type="button"
			aria-label="Close image preview"
			on:click={onClose}
			class="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
		>
			&times;
		</button>
	</div>
</div>
