import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { themes, getTheme, type Theme } from './themes';

interface ThemeState {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  applyTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: themes[0],
      
      setTheme: (themeId: string) => {
        const theme = getTheme(themeId);
        set({ currentTheme: theme });
        get().applyTheme(theme);
      },
      
      applyTheme: (theme: Theme) => {
        const root = document.documentElement;
        
        // Aplicar todas as variáveis CSS do tema
        Object.entries(theme.colors).forEach(([key, value]) => {
          const cssVariableName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
          root.style.setProperty(cssVariableName, value);
        });
        
        // Aplicar classes para modo escuro se necessário
        if (theme.id === 'red-theme' || theme.id === 'purple-theme' || theme.id === 'yellow-theme') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ currentTheme: state.currentTheme }),
    }
  )
); 