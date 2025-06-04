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
		} catch (err: any) {
			error = err.message || 'Login failed';
		}
	}
</script>

<main class="min-h-screen bg-gray-900 flex items-center justify-center text-white">
	<form on:submit|preventDefault={handleLogin} class="bg-gray-800 p-6 rounded-lg shadow-md space-y-4 w-full max-w-sm">
		<h2 class="text-xl font-bold text-center">Login</h2>

		<input
			bind:value={username}
			class="w-full p-2 rounded bg-gray-700 border border-gray-600"
			placeholder="Username"
			required
		/>

		<input
			type="password"
			bind:value={password}
			class="w-full p-2 rounded bg-gray-700 border border-gray-600"
			placeholder="Password"
			required
		/>

		{#if error}
			<p class="text-red-400 text-sm text-center">{error}</p>
		{/if}

		<button class="bg-blue-600 hover:bg-blue-700 w-full py-2 rounded font-semibold">Login</button>
	</form>
</main>
