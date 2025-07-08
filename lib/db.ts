import Dexie, { type EntityTable } from 'dexie';
import { Note } from '@/types/note';

export interface NoteEntity extends Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  isDeleted?: boolean;
  deletedAt?: Date;
}

const db = new Dexie('NotesDatabase') as Dexie & {
  notes: EntityTable<NoteEntity, 'id'>;
};

// Define schemas
db.version(1).stores({
  notes: '++id, title, content, createdAt, updatedAt, tags',
});

// Versão 2: Adicionar campos para lixeira
db.version(2).stores({
  notes: '++id, title, content, createdAt, updatedAt, tags, isDeleted, deletedAt',
});

export { db }; 