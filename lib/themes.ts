export interface Theme {
  id: string;
  name: string;
  colors: {
    // Cores base
    background: string;
    foreground: string;
    
    // Cores de card/superfície
    card: string;
    cardForeground: string;
    
    // Cores de popover
    popover: string;
    popoverForeground: string;
    
    // Cores primárias
    primary: string;
    primaryForeground: string;
    
    // Cores secundárias
    secondary: string;
    secondaryForeground: string;
    
    // Cores de destaque
    muted: string;
    mutedForeground: string;
    
    // Cores de acento
    accent: string;
    accentForeground: string;
    
    // Cores de destruição
    destructive: string;
    destructiveForeground: string;
    
    // Cores de borda e input
    border: string;
    input: string;
    ring: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'default',
    name: 'Tema Padrão',
    colors: {
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%',
      card: '0 0% 100%',
      cardForeground: '222.2 84% 4.9%',
      popover: '0 0% 100%',
      popoverForeground: '222.2 84% 4.9%',
      primary: '222.2 47.4% 11.2%',
      primaryForeground: '210 40% 98%',
      secondary: '210 40% 96%',
      secondaryForeground: '222.2 47.4% 11.2%',
      muted: '210 40% 96%',
      mutedForeground: '215.4 16.3% 46.9%',
      accent: '210 40% 96%',
      accentForeground: '222.2 47.4% 11.2%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
      border: '214.3 31.8% 91.4%',
      input: '214.3 31.8% 91.4%',
      ring: '222.2 84% 4.9%',
    },
  },
  {
    id: 'red-theme',
    name: 'Tema 1 - Vermelho',
    colors: {
      // Cores base - usando as cores da imagem
      background: '340 15% 8%', // #19171b
      foreground: '0 0% 95%',
      
      // Cores de card/superfície
      card: '340 15% 10%', // Ligeiramente mais clara que background
      cardForeground: '0 0% 95%',
      
      // Cores de popover
      popover: '340 15% 8%',
      popoverForeground: '0 0% 95%',
      
      // Cores primárias - usando vermelho principal
      primary: '352 96% 23%', // #75020f
      primaryForeground: '0 0% 98%',
      
      // Cores secundárias
      secondary: '340 15% 15%', // Tom mais claro do background
      secondaryForeground: '0 0% 95%',
      
      // Cores de destaque
      muted: '340 15% 15%',
      mutedForeground: '0 0% 60%',
      
      // Cores de acento
      accent: '352 85% 18%', // #51080d
      accentForeground: '0 0% 98%',
      
      // Cores de destruição
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 98%',
      
      // Cores de borda e input
      border: '340 15% 20%',
      input: '340 15% 20%',
      ring: '352 96% 23%', // Mesma cor do primary
    },
  },
  {
    id: 'purple-theme',
    name: 'Tema 2 - Púrpura',
    colors: {
      // Cores base - usando as cores da imagem púrpura
      background: '228 20% 12%', // #1e202c
      foreground: '0 0% 95%',
      
      // Cores de card/superfície
      card: '228 20% 15%', // Ligeiramente mais clara que background
      cardForeground: '0 0% 95%',
      
      // Cores de popover
      popover: '228 20% 12%',
      popoverForeground: '0 0% 95%',
      
      // Cores primárias - usando púrpura principal
      primary: '249 38% 48%', // #60519b
      primaryForeground: '0 0% 98%',
      
      // Cores secundárias
      secondary: '228 8% 20%', // #31323c
      secondaryForeground: '0 0% 95%',
      
      // Cores de destaque
      muted: '228 8% 20%',
      mutedForeground: '228 15% 75%', // #bfc0d1
      
      // Cores de acento
      accent: '249 30% 40%', // Púrpura mais escuro
      accentForeground: '0 0% 98%',
      
      // Cores de destruição
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 98%',
      
      // Cores de borda e input
      border: '228 8% 25%',
      input: '228 8% 25%',
      ring: '249 38% 48%', // Mesma cor do primary
    },
  },
  {
    id: 'yellow-theme',
    name: 'Tema 3 - Amarelo ⭐',
    colors: {
      // Cores base - usando as cores da imagem amarela
      background: '210 25% 12%', // #192230
      foreground: '0 0% 95%',
      
      // Cores de card/superfície
      card: '210 18% 18%', // #2c2f38
      cardForeground: '0 0% 95%',
      
      // Cores de popover
      popover: '210 25% 12%',
      popoverForeground: '0 0% 95%',
      
      // Cores primárias - usando amarelo vibrante
      primary: '55 100% 50%', // #ffed00
      primaryForeground: '210 25% 12%', // Texto escuro no amarelo
      
      // Cores secundárias
      secondary: '210 15% 25%', // #3d474c
      secondaryForeground: '0 0% 95%',
      
      // Cores de destaque
      muted: '210 15% 25%',
      mutedForeground: '0 0% 70%',
      
      // Cores de acento
      accent: '55 85% 45%', // Amarelo mais escuro
      accentForeground: '210 25% 12%',
      
      // Cores de destruição
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 98%',
      
      // Cores de borda e input
      border: '210 15% 30%',
      input: '210 15% 30%',
      ring: '55 100% 50%', // Mesma cor do primary
    },
  },
];

export const getTheme = (id: string): Theme => {
  return themes.find(theme => theme.id === id) || themes[0];
};

export const defaultTheme = themes[0]; 