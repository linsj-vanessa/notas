export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  isDeleted?: boolean;
  deletedAt?: Date;
}

export interface NotePreview {
  id: string;
  title: string;
  preview: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  isDeleted?: boolean;
  deletedAt?: Date;
}

export interface CreateNoteData {
  title: string;
  content: string;
  tags?: string[];
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  tags?: string[];
} 