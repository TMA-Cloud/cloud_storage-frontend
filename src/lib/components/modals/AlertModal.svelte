<script lang="ts">
	import Modal from './Modal.svelte';
	export let message: string;
	export let onClose: () => void;
</script>

<!-- Overlay -->
<Modal {onClose} ariaLabel="Alert dialog">
	<div
		role="document"
		class="animate-fade-in relative z-10 w-full max-w-md rounded-2xl bg-[#27282E] px-6 py-7 text-white shadow-2xl transition-all duration-300"
	>
		<!-- Optional icon -->
		<div class="mb-4 flex justify-center">
			<svg
				class="h-10 w-10 text-amber-400"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M21 12A9 9 0 103 12a9 9 0 0018 0z"
				/>
			</svg>
		</div>

		<!-- Message -->
		<p class="mb-6 text-center text-lg font-medium text-gray-100">{message}</p>

		<!-- OK Button -->
		<div class="flex justify-center">
			<button
				type="button"
				on:click={onClose}
				class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
			>
				OK
			</button>
		</div>
	</div>
</Modal>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: scale(0.97);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.25s ease-out forwards;
	}
</style>
