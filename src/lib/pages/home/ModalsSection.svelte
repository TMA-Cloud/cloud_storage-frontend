<script lang="ts">
	import UploadModal from '$lib/components/modals/UploadModal.svelte';
	import UserProfileModal from '$lib/components/modals/UserProfileModal.svelte';
	import ImagePreviewer from '$lib/components/modals/ImagePreviewer.svelte';
	import ConfirmModal from '$lib/components/modals/ConfirmModal.svelte';
	import AlertModal from '$lib/components/modals/AlertModal.svelte';
	import RenameModal from '$lib/components/modals/RenameModal.svelte';
	import ShareModal from '$lib/components/modals/ShareModal.svelte';
	import {
		token,
		files,
		previewImage,
		showUploadModal,
		showProfileModal,
		fileToDelete,
		fileToRename,
		fileToShare,
		selectedIds,
		bulkDeleteIds,
		confirmBulk,
		showOwnerError,
		statusNotFoundError,
		showProtectedError,
		showUnsupportedError,
		bulkResultMessage,
		statusMessage,
		loadFiles,
		handleClosePreview
	} from '$lib/stores/home';
	import { deleteFile, renameFile } from '$lib/api/files';
	import { UnauthorizedError, HttpError } from '$lib/api/http';
	import { clearToken } from '$lib/api/auth';
	import { goto } from '$app/navigation';
</script>

{#if $showUploadModal}
	<UploadModal
		onClose={() => ($showUploadModal = false)}
		onUploaded={() => loadFiles(undefined, false)}
	/>
{/if}

{#if $fileToRename}
	<RenameModal
		file={$fileToRename}
		onClose={() => ($fileToRename = null)}
		onRename={async (name) => {
			if (!$fileToRename) return;
			try {
				await renameFile($fileToRename.id, name, $token);
				await loadFiles();
			} catch (err) {
				console.error(err);
				if (err instanceof UnauthorizedError) {
					$statusMessage = 'Session expired. Redirecting to login...';
					clearToken();
					setTimeout(() => goto('/login'), 1000);
				} else if (err instanceof HttpError) {
					if (err.status === 403) {
						$showOwnerError = true;
					} else if (err.status === 404) {
						$statusNotFoundError = true;
					} else {
						console.error(err);
					}
				}
			} finally {
				$fileToRename = null;
			}
		}}
	/>
{/if}

{#if $fileToShare}
	<ShareModal file={$fileToShare} token={$token} onClose={() => ($fileToShare = null)} />
{/if}

{#if $previewImage}
	<ImagePreviewer src={$previewImage} onClose={handleClosePreview} />
{/if}

{#if $fileToDelete}
	<ConfirmModal
		message={`Are you sure you want to delete ${$fileToDelete.filename}?`}
		onConfirm={async () => {
			if (!$fileToDelete) return;
			try {
				await deleteFile($fileToDelete.id, $token);
				await loadFiles();
				$fileToDelete = null;
			} catch (err) {
				console.error(err);
				if (err instanceof UnauthorizedError) {
					$statusMessage = 'Session expired. Redirecting to login...';
					clearToken();
					setTimeout(() => goto('/login'), 1000);
				} else if (err instanceof HttpError) {
					const message = err.message || '';
					if (message.includes('delete protected')) {
						$showProtectedError = true;
					} else if (err.status === 403) {
						$showOwnerError = true;
					} else if (err.status === 404) {
						$statusNotFoundError = true;
					}
				}
			} finally {
				$fileToDelete = null;
			}
		}}
		onCancel={() => ($fileToDelete = null)}
	/>
{/if}

{#if $confirmBulk}
	<ConfirmModal
		message={`Delete ${$bulkDeleteIds.length} selected files?`}
		onConfirm={async () => {
			try {
				const idSet = new Set($bulkDeleteIds);
				const protectedFiles = $files.filter((f) => idSet.has(f.id) && f.delete_protected);
				const deletableIds = $bulkDeleteIds.filter(
					(id) => !protectedFiles.some((f) => f.id === id)
				);

				const idToName = new Map($files.map((f) => [f.id, f.filename]));
				const skippedMessages: string[] = [];
				let deletedCount = 0;

				for (const id of deletableIds) {
					try {
						await deleteFile(id, $token);
						deletedCount++;
					} catch (err) {
						if (err instanceof UnauthorizedError) {
							$statusMessage = 'Session expired. Redirecting to login...';
							clearToken();
							setTimeout(() => goto('/login'), 1000);
							return;
						}
						if (err instanceof HttpError) {
							if (err.status === 403) {
								skippedMessages.push(`${idToName.get(id) ?? id} (not owner)`);
							} else if (err.status === 404) {
								skippedMessages.push(`${idToName.get(id) ?? id} (not found)`);
							} else {
								skippedMessages.push(`${idToName.get(id) ?? id} (${err.message})`);
							}
						} else {
							const msg = err instanceof Error ? err.message : 'unknown error';
							skippedMessages.push(`${idToName.get(id) ?? id} (${msg})`);
						}
					}
				}

				await loadFiles();
				$selectedIds = [];

				const messages: string[] = [];
				if (protectedFiles.length > 0) {
					messages.push(
						`Skipped ${protectedFiles
							.map((f) => f.filename)
							.join(', ')} because they are delete-protected`
					);
				}
				if (skippedMessages.length > 0) {
					messages.push(`Skipped ${skippedMessages.join(', ')}`);
				}
				if (deletedCount > 0) {
					messages.push(`Deleted ${deletedCount} file${deletedCount === 1 ? '' : 's'}`);
				}

				$bulkResultMessage = messages.join('. ') + '.';
			} finally {
				$confirmBulk = false;
				$bulkDeleteIds = [];
			}
		}}
		onCancel={() => {
			$confirmBulk = false;
			$bulkDeleteIds = [];
		}}
	/>
{/if}

{#if $showProfileModal}
	<UserProfileModal token={$token} onClose={() => ($showProfileModal = false)} />
{/if}

{#if $showOwnerError}
	<AlertModal
		message="You are not the owner of this file."
		onClose={() => ($showOwnerError = false)}
	/>
{/if}

{#if $statusNotFoundError}
	<AlertModal
		message="The requested file was not found."
		onClose={() => ($statusNotFoundError = false)}
	/>
{/if}

{#if $showProtectedError}
	<AlertModal
		message="This file is delete-protected."
		onClose={() => ($showProtectedError = false)}
	/>
{/if}

{#if $showUnsupportedError}
	<AlertModal
		message="This file type cannot be opened."
		onClose={() => ($showUnsupportedError = false)}
	/>
{/if}

{#if $bulkResultMessage}
	<AlertModal message={$bulkResultMessage} onClose={() => ($bulkResultMessage = '')} />
{/if}
