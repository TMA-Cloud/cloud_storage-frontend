// Check if a filename has an image extension
export function isImage(filename: string): boolean {
	const ext = filename.split('.').pop()?.toLowerCase() || '';
	return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tif', 'tiff', 'webp', 'ico'].includes(ext);
}
