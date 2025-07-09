import { Note } from '@/types/note';

export interface CleaningResult {
  originalCount: number;
  cleanedCount: number;
  fixedIssues: string[];
  unfixableIssues: string[];
  cleanedNotes: Note[];
}

export class DataCleaner {
  /**
   * Limpa e normaliza todas as notas
   */
  static cleanNotes(notes: Note[]): CleaningResult {
    const result: CleaningResult = {
      originalCount: notes.length,
      cleanedCount: 0,
      fixedIssues: [],
      unfixableIssues: [],
      cleanedNotes: []
    };

    for (const note of notes) {
      try {
        const cleanedNote = this.cleanNote(note);
        if (cleanedNote) {
          result.cleanedNotes.push(cleanedNote);
          result.cleanedCount++;
        }
      } catch (error) {
        result.unfixableIssues.push(
          `Nota "${note.title || 'sem título'}": ${(error as Error).message}`
        );
      }
    }

    return result;
  }

  /**
   * Limpa uma nota individual
   */
  static cleanNote(note: Note): Note | null {
    if (!note) return null;

    const fixedIssues: string[] = [];

    // Limpar ID
    let id = note.id;
    if (typeof id !== 'string' || !id.trim()) {
      id = crypto.randomUUID();
      fixedIssues.push('ID gerado automaticamente');
    }

    // Limpar título
    let title = note.title;
    if (typeof title !== 'string') {
      title = String(title || '');
      fixedIssues.push('Título convertido para string');
    }
    if (!title.trim()) {
      title = 'Sem título';
      fixedIssues.push('Título vazio substituído');
    }

    // Limpar conteúdo
    let content = note.content;
    if (typeof content !== 'string') {
      content = String(content || '');
      fixedIssues.push('Conteúdo convertido para string');
    }

    // Limpar tags
    let tags = note.tags;
    if (!Array.isArray(tags)) {
      tags = [];
      fixedIssues.push('Tags convertidas para array vazio');
    } else {
      tags = tags.filter(tag => typeof tag === 'string' && tag.trim()).map(tag => tag.trim());
    }

    // Limpar datas
    let createdAt = note.createdAt;
    if (!(createdAt instanceof Date)) {
      try {
        createdAt = new Date(createdAt);
        if (isNaN(createdAt.getTime())) {
          throw new Error('Data inválida');
        }
        fixedIssues.push('Data de criação convertida');
      } catch {
        createdAt = new Date();
        fixedIssues.push('Data de criação substituída pela data atual');
      }
    }

    let updatedAt = note.updatedAt;
    if (!(updatedAt instanceof Date)) {
      try {
        updatedAt = new Date(updatedAt);
        if (isNaN(updatedAt.getTime())) {
          throw new Error('Data inválida');
        }
        fixedIssues.push('Data de atualização convertida');
      } catch {
        updatedAt = new Date();
        fixedIssues.push('Data de atualização substituída pela data atual');
      }
    }

    // Garantir que updatedAt >= createdAt
    if (updatedAt < createdAt) {
      updatedAt = createdAt;
      fixedIssues.push('Data de atualização ajustada para ser >= data de criação');
    }

    // Limpar deletedAt
    let deletedAt = note.deletedAt;
    if (deletedAt && !(deletedAt instanceof Date)) {
      try {
        deletedAt = new Date(deletedAt);
        if (isNaN(deletedAt.getTime())) {
          deletedAt = undefined;
          fixedIssues.push('Data de exclusão inválida removida');
        } else {
          fixedIssues.push('Data de exclusão convertida');
        }
      } catch {
        deletedAt = undefined;
        fixedIssues.push('Data de exclusão inválida removida');
      }
    }

    // Limpar isDeleted
    const isDeleted = Boolean(note.isDeleted);
    if (isDeleted && !deletedAt) {
      deletedAt = updatedAt;
      fixedIssues.push('Data de exclusão gerada automaticamente');
    }

    const cleanedNote: Note = {
      id,
      title,
      content,
      tags,
      createdAt,
      updatedAt,
      isDeleted,
      deletedAt
    };

    return cleanedNote;
  }

  /**
   * Valida se uma nota está bem formada
   */
  static validateNote(note: Note): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!note) {
      errors.push('Nota é null ou undefined');
      return { isValid: false, errors };
    }

    if (typeof note.id !== 'string' || !note.id.trim()) {
      errors.push('ID inválido');
    }

    if (typeof note.title !== 'string') {
      errors.push('Título deve ser string');
    }

    if (typeof note.content !== 'string') {
      errors.push('Conteúdo deve ser string');
    }

    if (!Array.isArray(note.tags)) {
      errors.push('Tags devem ser array');
    }

    if (!(note.createdAt instanceof Date) || isNaN(note.createdAt.getTime())) {
      errors.push('Data de criação inválida');
    }

    if (!(note.updatedAt instanceof Date) || isNaN(note.updatedAt.getTime())) {
      errors.push('Data de atualização inválida');
    }

    if (note.deletedAt && (!(note.deletedAt instanceof Date) || isNaN(note.deletedAt.getTime()))) {
      errors.push('Data de exclusão inválida');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Remove duplicatas baseadas no ID
   */
  static removeDuplicates(notes: Note[]): Note[] {
    const seen = new Set<string>();
    const result: Note[] = [];

    for (const note of notes) {
      if (note.id && !seen.has(note.id)) {
        seen.add(note.id);
        result.push(note);
      }
    }

    return result;
  }

  /**
   * Ordena notas por data de atualização
   */
  static sortNotes(notes: Note[]): Note[] {
    return [...notes].sort((a, b) => {
      const dateA = a.updatedAt instanceof Date ? a.updatedAt.getTime() : 0;
      const dateB = b.updatedAt instanceof Date ? b.updatedAt.getTime() : 0;
      return dateB - dateA;
    });
  }

  /**
   * Gera relatório de limpeza
   */
  static generateCleaningReport(result: CleaningResult): string {
    let report = '# Relatório de Limpeza de Dados\n\n';
    
    report += `## Resumo\n`;
    report += `- **Notas originais**: ${result.originalCount}\n`;
    report += `- **Notas limpas**: ${result.cleanedCount}\n`;
    report += `- **Problemas corrigidos**: ${result.fixedIssues.length}\n`;
    report += `- **Problemas não corrigidos**: ${result.unfixableIssues.length}\n\n`;
    
    if (result.fixedIssues.length > 0) {
      report += `## Problemas Corrigidos\n`;
      result.fixedIssues.forEach(issue => {
        report += `- ${issue}\n`;
      });
      report += '\n';
    }
    
    if (result.unfixableIssues.length > 0) {
      report += `## Problemas Não Corrigidos\n`;
      result.unfixableIssues.forEach(issue => {
        report += `- ${issue}\n`;
      });
      report += '\n';
    }
    
    return report;
  }
} 