<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount, tick } from 'svelte';
	import { getToken, clearToken } from '$lib/api/auth';
	import { API_BASE, ONLYOFFICE_JS_URL } from '$lib/api/config';

	onMount(async () => {
		if (!ONLYOFFICE_JS_URL) {
			document.getElementById('status')!.textContent = 'OnlyOffice URL is not configured.';
			return;
		}

		// Dynamically load the OnlyOffice API script
		const script = document.createElement('script');
		script.src = ONLYOFFICE_JS_URL;
		script.referrerPolicy = 'no-referrer';

		script.onload = async () => {
			const id = $page.params.id;
			const token = getToken();

			const res = await fetch(`${API_BASE}/api/files/${id}/onlyoffice`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (res.status === 401 || res.status === 403) {
				clearToken();
				document.getElementById('status')!.textContent = 'Session expired. Redirecting to login...';
				setTimeout(() => goto('/login'), 1000);
				return;
			}

			if (!res.ok) {
				let msg = 'Failed to load the document.';
				if (res.status === 404) {
					msg = 'This file is either deleted or private.';
				} else if (res.status === 500) {
					msg = 'Server error while fetching the document.';
				} else {
					const err = await res.text();
					try {
						const parsed = JSON.parse(err);
						msg = parsed.message || msg;
					} catch {
						msg = err || msg;
					}
				}
				document.getElementById('status')!.textContent = msg;
				return;
			}

			const config = await res.json();
			await tick();
			startEditor(config);
		};

		script.onerror = () => {
			console.error('Failed to load OnlyOffice API script.');
			document.getElementById('status')!.textContent = 'Failed to load OnlyOffice editor.';
		};

		document.head.appendChild(script);
	});

	function startEditor(config: unknown) {
		document.getElementById('status')!.style.display = 'none';
		const DocsAPI = (
			window as typeof window & {
				DocsAPI: { DocEditor: new (...args: unknown[]) => unknown };
			}
		).DocsAPI;
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
