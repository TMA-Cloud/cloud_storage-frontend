<script lang="ts">
	import Modal from './Modal.svelte';
	export let src: string;
	export let onClose: () => void;
</script>

<!-- Modal wrapper with keyboard focus -->
<Modal
	{onClose}
	ariaLabel="Image preview modal"
	backdropClass="cursor-default bg-black/80 backdrop-blur-sm"
>
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
</Modal>
