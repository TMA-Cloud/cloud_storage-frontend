<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { fetchUserProfile, type UserProfile } from '$lib/api/user';
	import { logout, clearToken, getToken } from '$lib/api/auth';
	import { LogOut } from 'lucide-svelte';

	export let token = '';
	export let onClose: () => void;

	let profile: UserProfile | null = null;
	let loading = true;
	let error = '';

	onMount(async () => {
		try {
			profile = await fetchUserProfile(token);
		} catch (err: unknown) {
			error = (err as Error).message || 'Failed to load profile';
		} finally {
			loading = false;
		}
	});

	function handleKey(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
	}

	async function handleLogout() {
		const current = getToken();
		if (!current) {
			goto('/login');
			return;
		}

		try {
			await logout(current);
		} catch (err) {
			console.error(err);
		} finally {
			clearToken();
			goto('/login');
		}
	}
</script>

<!-- Modal wrapper -->
<div
	tabindex="0"
	role="dialog"
	aria-modal="true"
	aria-label="User profile"
	on:keydown={handleKey}
	class="fixed inset-0 z-50 flex justify-end"
>
	<!-- Backdrop -->
	<button
		type="button"
		aria-label="Dismiss profile"
		class="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
		on:click={onClose}
	></button>

	<!-- Panel -->
	<div
		class="relative z-10 w-full max-w-sm transform bg-gray-800 p-6 text-white shadow-2xl transition sm:rounded-l-lg"
	>
		<h2 class="mb-4 text-xl font-semibold">User Profile</h2>
		{#if loading}
			<p class="text-gray-300">Loading...</p>
		{:else if error}
			<p class="text-red-400">{error}</p>
		{:else if profile}
			<dl class="space-y-2">
				<div>
					<dt class="text-sm font-medium text-gray-400">User ID</dt>
					<dd class="text-sm text-gray-200">{profile.id}</dd>
				</div>
				<div>
					<dt class="text-sm font-medium text-gray-400">Username</dt>
					<dd class="text-sm text-gray-200">{profile.username}</dd>
				</div>
				<div>
					<dt class="text-sm font-medium text-gray-400">Full Name</dt>
					<dd class="text-sm text-gray-200">{profile.name}</dd>
				</div>
			</dl>
		{/if}
		<div class="mt-6 flex justify-end">
			<button
				type="button"
				on:click={handleLogout}
				class="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white shadow transition hover:bg-red-700"
			>
				<LogOut class="h-5 w-5" />
				<span>Logout</span>
			</button>
		</div>
	</div>
</div>
