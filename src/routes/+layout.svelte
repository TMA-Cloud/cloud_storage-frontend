<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		const token = localStorage.getItem('token');
		const current = window.location.pathname;
		if (!token && current !== '/login') {
			goto('/login');
		}
	});
</script>

<slot />
