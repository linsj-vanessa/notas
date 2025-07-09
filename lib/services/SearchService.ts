import { Note } from '@/types/note';
import { SearchOptions, ServiceSearchResult } from '@/types/service.types';

export class SearchService {
  private static instance: SearchService;

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  /**
   * Busca avançada em notas
   */
  async search(notes: Note[], options: SearchOptions): Promise<ServiceSearchResult[]> {
    const { query, fields = ['title', 'content', 'tags'], fuzzy = false, maxResults = 50, minScore = 0.1 } = options;
    
    if (!query.trim()) {
      return [];
    }

    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    const results: ServiceSearchResult[] = [];

    for (const note of notes) {
      if (note.isDeleted) continue;

      const result = this.scoreNote(note, searchTerms, fields, fuzzy);
      
      if (result.score >= minScore) {
        results.push(result);
      }
    }

    // Ordenar por relevância
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, maxResults);
  }

  /**
   * Busca simples e rápida
   */
  quickSearch(notes: Note[], query: string): Note[] {
    if (!query.trim()) {
      return notes;
    }

    const lowerQuery = query.toLowerCase();
    
    return notes.filter(note => {
      if (note.isDeleted) return false;
      
      return (
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery) ||
        note.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    });
  }

  /**
   * Busca por tags
   */
  searchByTags(notes: Note[], tags: string[]): Note[] {
    if (tags.length === 0) {
      return notes;
    }

    const lowerTags = tags.map(tag => tag.toLowerCase());
    
    return notes.filter(note => {
      if (note.isDeleted) return false;
      
      return note.tags?.some(tag => 
        lowerTags.includes(tag.toLowerCase())
      );
    });
  }

  /**
   * Busca por intervalo de datas
   */
  searchByDateRange(notes: Note[], startDate: Date, endDate: Date): Note[] {
    return notes.filter(note => {
      if (note.isDeleted) return false;
      
      const noteDate = new Date(note.updatedAt);
      return noteDate >= startDate && noteDate <= endDate;
    });
  }

  /**
   * Obter sugestões de busca
   */
  getSuggestions(notes: Note[], query: string): string[] {
    if (!query.trim()) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    const suggestions = new Set<string>();

    // Buscar em títulos
    for (const note of notes) {
      if (note.isDeleted) continue;
      
      const words = note.title.toLowerCase().split(' ');
      for (const word of words) {
        if (word.includes(lowerQuery) && word !== lowerQuery) {
          suggestions.add(word);
        }
      }
    }

    // Buscar em tags
    for (const note of notes) {
      if (note.isDeleted) continue;
      
      note.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(lowerQuery)) {
          suggestions.add(tag);
        }
      });
    }

    return Array.from(suggestions).slice(0, 10);
  }

  /**
   * Destacar texto encontrado
   */
  highlightText(text: string, query: string): string {
    if (!query.trim()) {
      return text;
    }

    const searchTerms = query.split(' ').filter(term => term.length > 0);
    let highlightedText = text;

    for (const term of searchTerms) {
      const regex = new RegExp(`(${this.escapeRegExp(term)})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    }

    return highlightedText;
  }

  private scoreNote(note: Note, searchTerms: string[], fields: string[], fuzzy: boolean): ServiceSearchResult {
    let score = 0;
    const matchedFields: string[] = [];
    const highlights: { [field: string]: string } = {};

    // Buscar no título (peso maior)
    if (fields.includes('title')) {
      const titleScore = this.calculateFieldScore(note.title, searchTerms, fuzzy);
      if (titleScore > 0) {
        score += titleScore * 2; // Peso dobrado para título
        matchedFields.push('title');
        highlights.title = this.highlightText(note.title, searchTerms.join(' '));
      }
    }

    // Buscar no conteúdo
    if (fields.includes('content')) {
      const contentScore = this.calculateFieldScore(note.content, searchTerms, fuzzy);
      if (contentScore > 0) {
        score += contentScore;
        matchedFields.push('content');
        highlights.content = this.getContentPreview(note.content, searchTerms);
      }
    }

    // Buscar nas tags (peso maior)
    if (fields.includes('tags') && note.tags) {
      const tagsText = note.tags.join(' ');
      const tagsScore = this.calculateFieldScore(tagsText, searchTerms, fuzzy);
      if (tagsScore > 0) {
        score += tagsScore * 1.5; // Peso aumentado para tags
        matchedFields.push('tags');
        highlights.tags = this.highlightText(tagsText, searchTerms.join(' '));
      }
    }

    // Normalizar score
    score = Math.min(score, 1);

    return {
      id: note.id,
      title: note.title,
      preview: this.getContentPreview(note.content, searchTerms),
      score,
      matchedFields,
      highlights
    };
  }

  private calculateFieldScore(text: string, searchTerms: string[], fuzzy: boolean): number {
    if (!text) return 0;

    const lowerText = text.toLowerCase();
    let score = 0;

    for (const term of searchTerms) {
      const lowerTerm = term.toLowerCase();
      
      if (fuzzy) {
        // Busca fuzzy simples
        if (lowerText.includes(lowerTerm)) {
          score += 0.8;
        } else if (this.fuzzyMatch(lowerText, lowerTerm)) {
          score += 0.4;
        }
      } else {
        // Busca exata
        if (lowerText.includes(lowerTerm)) {
          score += 1;
        }
      }
    }

    return score / searchTerms.length;
  }

  private fuzzyMatch(text: string, term: string): boolean {
    // Implementação simples de fuzzy matching
    const threshold = 0.8;
    const distance = this.levenshteinDistance(text, term);
    const similarity = 1 - (distance / Math.max(text.length, term.length));
    
    return similarity >= threshold;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private getContentPreview(content: string, searchTerms: string[]): string {
    if (!content) return '';

    const plainText = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const words = plainText.split(' ');
    
    // Encontrar a primeira ocorrência de um termo de busca
    let startIndex = 0;
    for (let i = 0; i < words.length; i++) {
      const word = words[i].toLowerCase();
      if (searchTerms.some(term => word.includes(term.toLowerCase()))) {
        startIndex = Math.max(0, i - 10); // 10 palavras antes
        break;
      }
    }

    // Criar preview de até 50 palavras
    const preview = words.slice(startIndex, startIndex + 50).join(' ');
    
    return preview.length < plainText.length ? preview + '...' : preview;
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

export const searchService = SearchService.getInstance(); 