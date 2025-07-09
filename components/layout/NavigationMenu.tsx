'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText, Trash2 } from 'lucide-react';
import { useUIStore } from '@/lib/stores';

interface NavigationMenuProps {
  showTrash: boolean;
  trashCount: number;
  onNavigateToTrash: () => void;
  onNavigateToNotes: () => void;
}

export default function NavigationMenu({ 
  showTrash, 
  trashCount, 
  onNavigateToTrash,
  onNavigateToNotes 
}: NavigationMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { getFilteredNotes } = useUIStore();
  
  const filteredNotes = getFilteredNotes();

  return (
    <div className="space-y-2">
      <Button
        variant={pathname === '/dashboard' ? "default" : "ghost"}
        size="sm"
        className="w-full justify-start"
        onClick={() => {
          router.push('/dashboard');
          onNavigateToNotes();
        }}
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        Dashboard
      </Button>
      
      <Button
        variant={pathname === '/' && !showTrash ? "default" : "ghost"}
        size="sm"
        className="w-full justify-start relative"
        onClick={() => {
          if (pathname !== '/') {
            router.push('/');
          }
          onNavigateToNotes();
        }}
      >
        <FileText className="h-4 w-4 mr-2" />
        Notas
        {filteredNotes.length > 0 && (
          <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
            {filteredNotes.length}
          </span>
        )}
      </Button>
      
      <Button
        variant={showTrash ? "default" : "ghost"}
        size="sm"
        className="w-full justify-start relative"
        onClick={onNavigateToTrash}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Lixeira
        {trashCount > 0 && (
          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
            {trashCount}
          </span>
        )}
      </Button>
    </div>
  );
} 