<script lang="ts">
	export let onClose: () => void;
	export let overlayClass = 'items-center justify-center';
	export let backdropClass = '';
	export let ariaLabel = 'Modal dialog';

	function handleKey(event: KeyboardEvent) {
		if (event.key === 'Escape') onClose();
	}
</script>

<div
	tabindex="0"
	role="dialog"
	aria-modal="true"
	aria-label={ariaLabel}
	on:keydown={handleKey}
	class={`fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm ${overlayClass}`}
>
	<button
		type="button"
		aria-label="Dismiss modal"
		class={`absolute inset-0 ${backdropClass}`}
		on:click={onClose}
	></button>
	<div role="document" class="relative z-10">
		<slot />
	</div>
</div>
