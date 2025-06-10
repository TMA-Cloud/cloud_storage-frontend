import { fetchFileBlob, isImage, type FileMeta } from '$lib/api/files';

export async function buildThumbnails(
	files: FileMeta[],
	token: string
): Promise<Record<string, string>> {
	const map: Record<string, string> = {};
	for (const f of files) {
		if (isImage(f.filename)) {
			try {
				const blob = await fetchFileBlob(f.id, token);
				map[f.id] = URL.createObjectURL(blob);
			} catch (e) {
				console.error(e);
			}
		}
	}
	return map;
}
