<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { fetchUserProfile, type UserProfile } from '$lib/api/user';
	import { logout, clearToken, getToken } from '$lib/api/auth';
	import { LogOut, UserCircle } from 'lucide-svelte';

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
		if (event.key === 'Escape') onClose();
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

<!-- Modal Overlay -->
<div
	tabindex="0"
	role="dialog"
	aria-modal="true"
	aria-label="User profile"
	on:keydown={handleKey}
	class="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm"
>
	<!-- Dismiss Layer -->
	<button
		type="button"
		aria-label="Dismiss profile"
		class="absolute inset-0 cursor-default"
		on:click={onClose}
	></button>

	<!-- Side Panel -->
	<div
		class="animate-slide-in relative z-10 w-full max-w-sm bg-[#27282E] p-6 text-white shadow-xl sm:rounded-l-2xl"
	>
		<!-- Header -->
		<div class="mb-6 flex items-center gap-3 border-b border-gray-700 pb-4">
			<UserCircle class="h-10 w-10 text-blue-400" />
			<h2 class="text-2xl font-bold text-white">Your Profile</h2>
		</div>

		{#if loading}
			<p class="text-gray-400">Fetching profile info...</p>
		{:else if error}
			<p class="text-red-400">{error}</p>
		{:else if profile}
			<div class="space-y-5">
				<div>
					<p class="text-xs tracking-wide text-gray-500 uppercase">User ID</p>
					<p class="font-medium text-gray-100">{profile.id}</p>
				</div>
				<div>
					<p class="text-xs tracking-wide text-gray-500 uppercase">Username</p>
					<p class="font-medium text-gray-100">@{profile.username}</p>
				</div>
				<div>
					<p class="text-xs tracking-wide text-gray-500 uppercase">Full Name</p>
					<p class="font-medium text-gray-100">{profile.name}</p>
				</div>
			</div>
		{/if}

		<!-- Logout Button -->
		<div class="mt-8">
			<button
				on:click={handleLogout}
				class="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white shadow transition hover:bg-red-700"
			>
				<LogOut class="h-5 w-5" />
				Logout
			</button>
		</div>
	</div>
</div>

<style>
	@keyframes slide-in {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
	.animate-slide-in {
		animation: slide-in 0.3s ease-out forwards;
	}
</style>
