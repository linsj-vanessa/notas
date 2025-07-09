'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useThemeStore } from '@/lib/theme-store';
import { themes, type Theme } from '@/lib/themes';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { currentTheme, setTheme } = useThemeStore();

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      setTheme,
      availableThemes: themes,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}; 