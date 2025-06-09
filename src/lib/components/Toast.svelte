<script lang="ts">
	export let message = '';
</script>

{#if message}
	<div
		class="toast fixed top-6 right-6 z-50 rounded-xl bg-amber-400 px-6 py-4 text-base font-semibold text-gray-900 shadow-xl ring-1 ring-amber-500/40"
	>
		{message}
	</div>
{/if}

<style>
	.toast {
		animation: slide-in-fade 0.3s ease-out forwards;
	}

	@keyframes slide-in-fade {
		from {
			opacity: 0;
			transform: translateY(-10px) translateX(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0) translateX(0);
		}
	}
</style>
