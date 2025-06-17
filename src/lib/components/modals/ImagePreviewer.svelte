<script lang="ts">
	import Modal from './Modal.svelte';
	import { ZoomIn, ZoomOut } from 'lucide-svelte';

	export let src: string;
	export let onClose: () => void;

	let scale = 1;
	let container: HTMLDivElement;
	let isDragging = false;
	let startX = 0;
	let startY = 0;
	let scrollLeft = 0;
	let scrollTop = 0;

	function zoomIn() {
		scale = Math.min(scale + 0.25, 3);
	}

	function zoomOut() {
		scale = Math.max(scale - 0.25, 0.25);
	}

	function handleWheel(event: WheelEvent) {
		event.preventDefault();
		if (event.deltaY < 0) zoomIn();
		else zoomOut();
	}

	function handlePointerDown(event: PointerEvent) {
		isDragging = true;
		container.classList.add('cursor-grabbing');
		startX = event.clientX;
		startY = event.clientY;
		scrollLeft = container.scrollLeft;
		scrollTop = container.scrollTop;
	}

	function handlePointerMove(event: PointerEvent) {
		if (!isDragging) return;
		const dx = event.clientX - startX;
		const dy = event.clientY - startY;
		container.scrollLeft = scrollLeft - dx;
		container.scrollTop = scrollTop - dy;
	}

	function stopDrag() {
		isDragging = false;
		container.classList.remove('cursor-grabbing');
	}
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
		<div
			bind:this={container}
			class="relative mx-auto max-h-[80vh] max-w-[90vw] cursor-grab overflow-auto [scrollbar-color:#4B5563_#1F2937] [scrollbar-width:thin] dark:[scrollbar-color:#6B7280_#111827]"
			on:wheel|preventDefault={handleWheel}
			on:pointerdown={handlePointerDown}
			on:pointermove={handlePointerMove}
			on:pointerup={stopDrag}
			on:pointerleave={stopDrag}
		>
			<img
				{src}
				alt="Preview"
				class="pointer-events-none rounded select-none"
				style="max-width:100%; height:auto; transform:scale({scale}); transform-origin:top left;"
			/>
		</div>
		<div class="mt-3 flex justify-center gap-2">
			<button
				type="button"
				aria-label="Zoom in"
				on:click={zoomIn}
				class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-white shadow hover:bg-gray-600"
			>
				<ZoomIn class="h-4 w-4" />
			</button>
			<button
				type="button"
				aria-label="Zoom out"
				on:click={zoomOut}
				class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-white shadow hover:bg-gray-600"
			>
				<ZoomOut class="h-4 w-4" />
			</button>
		</div>
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
