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
		class="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-default"
		on:click={onClose}
	></button>

	<!-- Modal content -->
	<div
		role="document"
		class="relative z-10 bg-gray-900/90 p-4 rounded shadow-xl border border-gray-700"
	>
		<img src={src} alt="Preview" class="max-w-[90vw] max-h-[80vh] rounded" />
		<button
			type="button"
			aria-label="Close image preview"
			on:click={onClose}
			class="absolute top-2 right-2 text-white bg-red-600 hover:bg-red-700 rounded-full w-8 h-8 flex items-center justify-center shadow"
		>
			&times;
		</button>
	</div>
</div>
