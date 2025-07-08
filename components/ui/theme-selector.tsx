'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Palette, Check } from 'lucide-react';
import { useThemeStore } from '@/lib/theme-store';
import { themes } from '@/lib/themes';

export default function ThemeSelector() {
  const { currentTheme, setTheme, applyTheme } = useThemeStore();

  // Aplicar o tema atual na inicialização
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme, applyTheme]);

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        title="Alterar tema"
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">Tema</span>
      </Button>
      
      {/* Dropdown menu - aparece no hover */}
      <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-1">
          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
            Escolher Tema
          </div>
          <div className="border-t border-border my-1"></div>
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-muted/50 transition-colors ${
                currentTheme.id === theme.id ? 'bg-muted' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ 
                    backgroundColor: theme.id === 'red-theme' 
                      ? `hsl(${theme.colors.primary})` 
                      : `hsl(${theme.colors.primary})` 
                  }}
                />
                <span>{theme.name}</span>
              </div>
              {currentTheme.id === theme.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 