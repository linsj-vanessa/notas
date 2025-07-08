import { marked } from 'marked';

// Configurar marked para sanitização básica
marked.setOptions({
  breaks: true,
  gfm: true,
});

/**
 * Detecta se o conteúdo é HTML ou Markdown
 */
export function isContentHTML(content: string): boolean {
  if (!content.trim()) return false;
  
  // Se contém tags HTML básicas, provavelmente é HTML
  const htmlTagPattern = /<\/?[a-z][\s\S]*>/i;
  return htmlTagPattern.test(content);
}

/**
 * Detecta se o conteúdo é markdown simples
 */
export function isContentMarkdown(content: string): boolean {
  if (!content.trim()) return false;
  
  // Padrões comuns de markdown
  const markdownPatterns = [
    /^#{1,6}\s/m,        // Títulos
    /^\*\s/m,            // Lista com asterisco
    /^-\s/m,             // Lista com hífen
    /^\d+\.\s/m,         // Lista numerada
    /\*\*.*?\*\*/,       // Negrito
    /\*.*?\*/,           // Itálico
    /`.*?`/,             // Código inline
    /```[\s\S]*?```/,    // Blocos de código
    /^\>/m,              // Citações
    /\[.*?\]\(.*?\)/,    // Links
  ];
  
  return markdownPatterns.some(pattern => pattern.test(content));
}

/**
 * Converte markdown para HTML usando marked
 */
export function markdownToHTML(markdown: string): string {
  if (!markdown.trim()) return '';
  
  try {
    return marked(markdown) as string;
  } catch (error) {
    console.error('Erro ao converter markdown para HTML:', error);
    // Em caso de erro, retorna o conteúdo em parágrafos simples
    return `<p>${markdown.replace(/\n/g, '</p><p>')}</p>`;
  }
}

/**
 * Converte automaticamente o conteúdo para HTML se necessário
 */
export function ensureHTMLContent(content: string): string {
  if (!content.trim()) return '';
  
  // Se já é HTML, retorna como está
  if (isContentHTML(content)) {
    return content;
  }
  
  // Se é markdown ou texto simples, converte para HTML
  if (isContentMarkdown(content)) {
    return markdownToHTML(content);
  }
  
  // Se é texto simples sem markdown, envolve em parágrafo
  return `<p>${content.replace(/\n/g, '</p><p>')}</p>`;
} 