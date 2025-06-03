import {
	FileText,
	FileSpreadsheet,
	FileArchive,
	FileAudio,
	FileVideo,
	FileCode2,
	FileImage,
	FileJson,
	File,
} from 'lucide-svelte';

export function getIconComponent(ext: string): typeof File {
	ext = ext.toLowerCase();

	const iconMap: Record<string, typeof File> = {
		// Docs
		pdf: FileText,
		doc: FileText,
		docx: FileText,

		// Presentations
		ppt: FileText,
		pptx: FileText,

		// Spreadsheets
		xls: FileSpreadsheet,
		xlsx: FileSpreadsheet,
		csv: FileSpreadsheet,

		// Code
		js: FileCode2,
		ts: FileCode2,
		py: FileCode2,
		java: FileCode2,
		go: FileCode2,
		cpp: FileCode2,
		cs: FileCode2,
		html: FileCode2,
		css: FileCode2,
		sql: FileCode2,

		// JSON
		json: FileJson,

		// Archives
		zip: FileArchive,
		rar: FileArchive,
		'7z': FileArchive,
		tar: FileArchive,

		// Audio
		mp3: FileAudio,
		wav: FileAudio,
		flac: FileAudio,

		// Video
		mp4: FileVideo,
		avi: FileVideo,
		mkv: FileVideo,
		mov: FileVideo,

		// Images
		jpg: FileImage,
		jpeg: FileImage,
		png: FileImage,
		gif: FileImage,
		bmp: FileImage,
		svg: FileImage,
	};

	return iconMap[ext] || File;
}
