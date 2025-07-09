'use client';

import { Search, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ThemeSelector from '@/components/ui/theme-selector';
import { useNotesStore } from '@/lib/store';

interface AppHeaderProps {
  onCreateNote: () => void;
}

export default function AppHeader({ onCreateNote }: AppHeaderProps) {
  const { searchTerm, setSearchTerm } = useNotesStore();

  return (
    <header className="border-b border-border bg-background px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="font-semibold text-lg">Notas App</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
        <ThemeSelector />
        <Button size="sm" onClick={onCreateNote}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nova Nota
        </Button>
      </div>
    </header>
  );
} 