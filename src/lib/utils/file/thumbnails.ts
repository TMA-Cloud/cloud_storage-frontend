import { fetchThumbnailBlob, isImage, type FileMeta } from '$lib/api/files';

async function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build a map of file IDs to object URLs for their thumbnails.
 *
 * Some thumbnails may not be immediately available if the server is still
 * generating them. To improve the user experience, this function will retry a
 * few times for any missing thumbnails before giving up.
 */
export async function buildThumbnails(
	files: FileMeta[] | null | undefined,
	retries = 3,
	retryDelay = 1000
): Promise<Record<string, string>> {
	const fileList = Array.isArray(files) ? files : [];
	const map: Record<string, string> = {};
	const missing: FileMeta[] = [];

	for (const f of fileList) {
		if (!isImage(f.filename)) continue;
		try {
			const blob = await fetchThumbnailBlob(f.id);
			if (blob) {
				map[f.id] = URL.createObjectURL(blob);
			} else if (retries > 0) {
				missing.push(f);
			} else {
				console.debug(`Thumbnail missing for ${f.id}`);
			}
		} catch (e) {
			console.error(e);
		}
	}

	if (missing.length && retries > 0) {
		await delay(retryDelay);
		const retryMap = await buildThumbnails(missing, retries - 1, retryDelay);
		Object.assign(map, retryMap);
	}

	return map;
}
