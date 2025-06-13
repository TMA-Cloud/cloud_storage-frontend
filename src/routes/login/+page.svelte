<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { login } from '$lib/api/auth';
	import { clearStatusMessage } from '$lib/stores/home';

	let username = '';
	let password = '';
	let error = '';

	onMount(clearStatusMessage);

	async function handleLogin() {
		error = '';
		try {
			await login(username, password);
			clearStatusMessage();
			goto('/');
		} catch (err: unknown) {
			const message = (err as Error).message || '';
			error = message || 'Login failed';
		}
	}
</script>

<main class="flex min-h-screen items-center justify-center bg-[#1E1F23] px-4 text-white">
	<form
		on:submit|preventDefault={handleLogin}
		class="w-full max-w-sm space-y-6 rounded-2xl bg-[#27282E] p-8 shadow-xl"
	>
		<h2 class="text-center text-2xl font-bold text-white">🔐 Sign In</h2>

		<div class="space-y-3">
			<input
				bind:value={username}
				class="w-full rounded-lg border border-gray-600 bg-[#1E1F23] px-4 py-2 text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				placeholder="Username"
				autocomplete="username"
				required
			/>

			<input
				type="password"
				bind:value={password}
				class="w-full rounded-lg border border-gray-600 bg-[#1E1F23] px-4 py-2 text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				placeholder="Password"
				autocomplete="current-password"
				required
			/>
		</div>

		{#if error}
			<p class="text-center text-sm text-red-400">{error}</p>
		{/if}

		<button
			type="submit"
			class="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
		>
			Login
		</button>
	</form>
</main>
