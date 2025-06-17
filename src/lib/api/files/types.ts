export interface FileMeta {
	id: string;
	filename: string;
	uploaded_at: string;
	size: number;
	owner: string;
	modified_by: string;
	modified_at: string;
	is_private: boolean;
	read_only: boolean;
	delete_protected: boolean;
}

export interface SearchFileMeta extends FileMeta {
	url: string;
}

export interface UploadedFile {
	id: string;
	filename: string;
	size: number;
	owner: string;
	modified_by: string;
	modified_at: string;
	is_private: boolean;
	read_only: boolean;
	delete_protected: boolean;
}

export interface UploadResponse {
	message: string;
	files: UploadedFile[];
}

export interface FilesPage {
	files: FileMeta[];
	has_next: boolean;
}

export interface DeleteBatchResult {
	deleted: string[];
	errors: { id: string; status: number; message: string }[];
}
