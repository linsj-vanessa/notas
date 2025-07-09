'use client';

import { usePathname } from 'next/navigation';
import NavigationMenu from './NavigationMenu';
import NotesList from './NotesList';
import { Note } from '@/types/note';

interface AppSidebarProps {
  showTrash: boolean;
  trashCount: number;
  onNavigateToTrash: () => void;
  onNavigateToNotes: () => void;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (noteId: string, noteTitle: string, e: React.MouseEvent) => void;
  getTextFromHtml: (html: string) => string;
}

export default function AppSidebar({
  showTrash,
  trashCount,
  onNavigateToTrash,
  onNavigateToNotes,
  onSelectNote,
  onDeleteNote,
  getTextFromHtml
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-80 border-r border-border bg-background overflow-y-auto notion-scrollbar">
      <div className="p-4">
        <div className="space-y-4">
          <NavigationMenu 
            showTrash={showTrash}
            trashCount={trashCount}
            onNavigateToTrash={onNavigateToTrash}
            onNavigateToNotes={onNavigateToNotes}
          />
          
          <NotesList
            showTrash={showTrash}
            pathname={pathname}
            onSelectNote={onSelectNote}
            onDeleteNote={onDeleteNote}
            getTextFromHtml={getTextFromHtml}
          />
        </div>
      </div>
    </aside>
  );
} 