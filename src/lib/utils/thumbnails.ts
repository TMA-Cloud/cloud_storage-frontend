import { fetchThumbnailBlob, isImage, type FileMeta } from '$lib/api/files';

export async function buildThumbnails(files: FileMeta[]): Promise<Record<string, string>> {
	const map: Record<string, string> = {};
	for (const f of files) {
		if (isImage(f.filename)) {
			try {
				const blob = await fetchThumbnailBlob(f.id);
				if (blob) {
					map[f.id] = URL.createObjectURL(blob);
				} else {
					console.debug(`Thumbnail missing for ${f.id}`);
				}
			} catch (e) {
				console.error(e);
			}
		}
	}
	return map;
}
