export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  lines: number;
  paragraphs: number;
  readingTime: number; // em minutos
}

export function calculateTextStats(text: string): TextStats {
  // Limpar texto para contagem
  const cleanText = text.trim();
  
  // Contar caracteres
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  
  // Contar palavras - usar regex para palavras reais
  const words = cleanText === '' ? 0 : cleanText
    .split(/\s+/)
    .filter(word => word.length > 0 && /\w/.test(word))
    .length;
  
  // Contar linhas
  const lines = cleanText === '' ? 0 : cleanText.split('\n').length;
  
  // Contar parágrafos - linhas não vazias separadas por linhas vazias
  const paragraphs = cleanText === '' ? 0 : cleanText
    .split(/\n\s*\n/)
    .filter(paragraph => paragraph.trim().length > 0)
    .length;
  
  // Calcular tempo de leitura (média de 200 palavras por minuto)
  const readingTime = Math.ceil(words / 200);
  
  return {
    words,
    characters,
    charactersNoSpaces,
    lines,
    paragraphs,
    readingTime: readingTime || 1, // Mínimo 1 minuto
  };
}

export function formatReadingTime(minutes: number): string {
  if (minutes < 1) return '< 1 min';
  if (minutes === 1) return '1 min';
  return `${minutes} min`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('pt-BR').format(num);
} 