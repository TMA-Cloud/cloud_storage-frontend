<script lang="ts">
	import { goto } from '$app/navigation';
	import { login } from '$lib/api/auth';

	let username = '';
	let password = '';
	let error = '';

	async function handleLogin() {
		error = '';
		try {
			await login(username, password);
			goto('/');
		} catch (err: unknown) {
			const message = (err as Error).message || '';
			error = message || 'Login failed';
		}
	}
</script>

<main class="flex min-h-screen items-center justify-center bg-gray-900 text-white">
	<form
		on:submit|preventDefault={handleLogin}
		class="w-full max-w-sm space-y-4 rounded-lg bg-gray-800 p-6 shadow-md"
	>
		<h2 class="text-center text-xl font-bold">Login</h2>

		<input
			bind:value={username}
			class="w-full rounded border border-gray-600 bg-gray-700 p-2"
			placeholder="Username"
			required
		/>

		<input
			type="password"
			bind:value={password}
			class="w-full rounded border border-gray-600 bg-gray-700 p-2"
			placeholder="Password"
			required
		/>

		{#if error}
			<p class="text-center text-sm text-red-400">{error}</p>
		{/if}

		<button class="w-full rounded bg-blue-600 py-2 font-semibold hover:bg-blue-700">Login</button>
	</form>
</main>
