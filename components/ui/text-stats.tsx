'use client';

import { useMemo } from 'react';
import { BookOpen, Type, Hash, BarChart3 } from 'lucide-react';
import { calculateTextStats, formatReadingTime, formatNumber } from '@/lib/text-stats';

interface TextStatsProps {
  content: string;
  className?: string;
}

export default function TextStats({ content, className = '' }: TextStatsProps) {
  const stats = useMemo(() => calculateTextStats(content), [content]);

  return (
    <div className={`flex items-center gap-4 text-xs text-muted-foreground ${className}`}>
      {/* Palavras */}
      <div className="flex items-center gap-1" title="Palavras">
        <Type className="h-3 w-3" />
        <span>{formatNumber(stats.words)}</span>
      </div>
      
      {/* Caracteres */}
      <div className="flex items-center gap-1" title="Caracteres">
        <Hash className="h-3 w-3" />
        <span>{formatNumber(stats.characters)}</span>
      </div>
      
      {/* Linhas */}
      <div className="flex items-center gap-1" title="Linhas">
        <BarChart3 className="h-3 w-3" />
        <span>{formatNumber(stats.lines)}</span>
      </div>
      
      {/* Tempo de leitura */}
      <div className="flex items-center gap-1" title="Tempo estimado de leitura">
        <BookOpen className="h-3 w-3" />
        <span>{formatReadingTime(stats.readingTime)}</span>
      </div>
    </div>
  );
}

// Componente para estatísticas expandidas (modal ou sidebar)
export function DetailedTextStats({ content }: { content: string }) {
  const stats = useMemo(() => calculateTextStats(content), [content]);

  const statItems = [
    {
      label: 'Palavras',
      value: formatNumber(stats.words),
      icon: Type,
      description: 'Total de palavras no texto',
    },
    {
      label: 'Caracteres',
      value: formatNumber(stats.characters),
      icon: Hash,
      description: 'Total de caracteres incluindo espaços',
    },
    {
      label: 'Caracteres (sem espaços)',
      value: formatNumber(stats.charactersNoSpaces),
      icon: Hash,
      description: 'Total de caracteres excluindo espaços',
    },
    {
      label: 'Linhas',
      value: formatNumber(stats.lines),
      icon: BarChart3,
      description: 'Número de linhas no texto',
    },
    {
      label: 'Parágrafos',
      value: formatNumber(stats.paragraphs),
      icon: BarChart3,
      description: 'Número de parágrafos no texto',
    },
    {
      label: 'Tempo de Leitura',
      value: formatReadingTime(stats.readingTime),
      icon: BookOpen,
      description: 'Tempo estimado de leitura (200 palavras/min)',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">Estatísticas do Texto</h3>
      <div className="grid grid-cols-1 gap-3">
        {statItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between p-2 rounded bg-muted/30">
            <div className="flex items-center gap-2">
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium text-sm">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
            </div>
            <div className="font-semibold text-primary">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 