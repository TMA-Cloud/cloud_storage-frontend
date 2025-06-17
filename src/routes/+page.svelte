<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import HeaderSection from '$lib/pages/home/HeaderSection.svelte';
	import FileListSection from '$lib/pages/home/FileListSection.svelte';
	import ModalsSection from '$lib/pages/home/ModalsSection.svelte';
	import { initHome, destroyHome } from '$lib/stores/home';

	onMount(initHome);
	onDestroy(destroyHome);
</script>

<main class="min-h-screen bg-[#1E1F23] px-6 py-6 font-sans text-[#F3F4F6] select-none">
	<HeaderSection />
	<FileListSection />
	<ModalsSection />
</main>
