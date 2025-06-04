<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount, tick } from 'svelte';

	const API_BASE = import.meta.env.VITE_API_BASE_URL;
	const ONLYOFFICE_JS_URL = import.meta.env.VITE_ONLYOFFICE_JS_URL;

	let config: any = null;

	onMount(async () => {
		if (!ONLYOFFICE_JS_URL) {
			document.getElementById('status')!.textContent = 'OnlyOffice URL is not configured.';
			return;
		}

		// Dynamically load the OnlyOffice API script
		const script = document.createElement('script');
		script.src = ONLYOFFICE_JS_URL;

		script.onload = async () => {
			const id = $page.params.id;
			const token = localStorage.getItem('token');

			const res = await fetch(`${API_BASE}/api/files/${id}/onlyoffice`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (res.status === 401 || res.status === 403) {
				localStorage.removeItem('token');
				document.getElementById('status')!.textContent = 'Session expired. Redirecting to login...';
				setTimeout(() => goto('/login'), 1000);
				return;
			}

			if (!res.ok) {
				const err = await res.text();
				document.getElementById('status')!.textContent = err;
				return;
			}

			config = await res.json();
			await tick();
			startEditor(config);
		};

		script.onerror = () => {
			console.error('Failed to load OnlyOffice API script.');
			document.getElementById('status')!.textContent = 'Failed to load OnlyOffice editor.';
		};

		document.head.appendChild(script);
	});

	function startEditor(config: any) {
		document.getElementById('status')!.style.display = 'none';
		const DocsAPI = (window as typeof window & { DocsAPI: any }).DocsAPI;
		new DocsAPI.DocEditor('editor', config);
	}
</script>

<svelte:head>
	<title>OnlyOffice Editor</title>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<style>
		html,
		body {
			margin: 0;
			padding: 0;
			height: 100%;
			width: 100%;
			background-color: #23272b;
		}

		#editor {
			width: 100vw;
			height: 100vh;
			min-height: 600px;
			background-color: #23272b;
		}

		#status {
			color: #eee;
			text-align: center;
			font-size: 1.4em;
			padding: 1em;
		}
	</style>
</svelte:head>

<div id="status">Loading document...</div>
<div id="editor"></div>
