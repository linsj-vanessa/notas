'use client';

import { useMemo } from 'react';
import { Type, Hash, BarChart3, BookOpen, Clock } from 'lucide-react';
import { calculateTextStats, formatReadingTime, formatNumber } from '@/lib/text-stats';

interface StatusBarProps {
  content: string;
  lastSaved?: Date | null;
  hasChanges?: boolean;
}

export default function StatusBar({ content, lastSaved, hasChanges = false }: StatusBarProps) {
  const stats = useMemo(() => calculateTextStats(content), [content]);

  const formatLastSaved = (date: Date | null) => {
    if (!date || isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div className="border-t border-border bg-background">
      <div className="flex items-center justify-between px-6 py-2 text-xs text-muted-foreground">
        {/* Lado esquerdo - Estatísticas principais */}
        <div className="flex items-center gap-6">
          {/* Palavras */}
          <div className="flex items-center gap-1.5" title="Palavras">
            <Type className="h-3.5 w-3.5" />
            <span className="font-medium">{formatNumber(stats.words)}</span>
            <span className="text-muted-foreground/70">palavras</span>
          </div>
          
          {/* Caracteres */}
          <div className="flex items-center gap-1.5" title="Caracteres">
            <Hash className="h-3.5 w-3.5" />
            <span className="font-medium">{formatNumber(stats.characters)}</span>
            <span className="text-muted-foreground/70">caracteres</span>
          </div>
          
          {/* Linhas */}
          <div className="flex items-center gap-1.5" title="Linhas">
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="font-medium">{formatNumber(stats.lines)}</span>
            <span className="text-muted-foreground/70">linhas</span>
          </div>
          
          {/* Tempo de leitura */}
          <div className="flex items-center gap-1.5" title="Tempo estimado de leitura">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="font-medium">{formatReadingTime(stats.readingTime)}</span>
            <span className="text-muted-foreground/70">leitura</span>
          </div>
        </div>

        {/* Lado direito - Status de salvamento */}
        <div className="flex items-center gap-4">
          {hasChanges && (
            <div className="flex items-center gap-1.5 text-amber-500">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Não salvo</span>
            </div>
          )}
          
          {lastSaved && !hasChanges && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>Salvo às {formatLastSaved(lastSaved)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Versão compacta para mobile (se necessário)
export function CompactStatusBar({ content, hasChanges = false }: { content: string; hasChanges?: boolean }) {
  const stats = useMemo(() => calculateTextStats(content), [content]);

  return (
    <div className="border-t border-border bg-background sm:hidden">
      <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
        {/* Estatísticas compactas */}
        <div className="flex items-center gap-3">
          <span className="font-medium">{formatNumber(stats.words)} palavras</span>
          <span>{formatNumber(stats.characters)} chars</span>
          <span>{formatReadingTime(stats.readingTime)}</span>
        </div>

        {/* Status */}
        {hasChanges && (
          <div className="flex items-center gap-1.5 text-amber-500">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Não salvo</span>
          </div>
        )}
      </div>
    </div>
  );
} 