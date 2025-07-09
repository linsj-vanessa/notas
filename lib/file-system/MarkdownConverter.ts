import { Note, CreateNoteData, UpdateNoteData } from '@/types/note';
import { FileSystemError, FileSystemErrorCode } from './types';

export interface MarkdownNote {
  frontmatter: NoteFrontmatter;
  content: string;
}

export interface NoteFrontmatter {
  id: string;
  title: string;
  tags: string[];
  created: string;
  updated: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export class MarkdownConverter {
  private static instance: MarkdownConverter;

  static getInstance(): MarkdownConverter {
    if (!MarkdownConverter.instance) {
      MarkdownConverter.instance = new MarkdownConverter();
    }
    return MarkdownConverter.instance;
  }

  /**
   * Converte uma nota JSON para formato Markdown com frontmatter
   */
  toMarkdown(note: Note): string {
    const frontmatter: NoteFrontmatter = {
      id: note.id,
      title: note.title,
      tags: note.tags || [],
      created: note.createdAt.toISOString(),
      updated: note.updatedAt.toISOString(),
    };

    // Adicionar campos da lixeira se necessário
    if (note.isDeleted) {
      frontmatter.isDeleted = true;
      if (note.deletedAt) {
        frontmatter.deletedAt = note.deletedAt.toISOString();
      }
    }

    const yamlFrontmatter = this.objectToYaml(frontmatter);
    
    // Garantir que o conteúdo comece com título se não tiver
    let content = note.content || '';
    if (content && note.title && !content.startsWith(`# ${note.title}`)) {
      content = `# ${note.title}\n\n${content}`;
    } else if (!content && note.title) {
      content = `# ${note.title}\n\n`;
    }

    return `---\n${yamlFrontmatter}---\n\n${content}`;
  }

  /**
   * Converte um arquivo Markdown para formato JSON da nota
   */
  fromMarkdown(markdownContent: string): Note {
    try {
      const parsed = this.parseMarkdown(markdownContent);
      
      return {
        id: parsed.frontmatter.id,
        title: parsed.frontmatter.title,
        content: parsed.content,
        tags: parsed.frontmatter.tags || [],
        createdAt: new Date(parsed.frontmatter.created),
        updatedAt: new Date(parsed.frontmatter.updated),
        isDeleted: parsed.frontmatter.isDeleted || false,
        deletedAt: parsed.frontmatter.deletedAt ? new Date(parsed.frontmatter.deletedAt) : undefined,
      };
    } catch (error) {
      throw this.createError(
        FileSystemErrorCode.READ_FAILED,
        'Erro ao converter Markdown para JSON',
        error as Error
      );
    }
  }

  /**
   * Converte dados de criação para formato Markdown
   */
  createNoteToMarkdown(data: CreateNoteData): { note: Note; markdown: string } {
    const now = new Date();
    const note: Note = {
      id: crypto.randomUUID(),
      title: data.title || 'Nova Nota',
      content: data.content || '',
      tags: data.tags || [],
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };

    const markdown = this.toMarkdown(note);
    return { note, markdown };
  }

  /**
   * Aplica atualizações a uma nota existente
   */
  updateNoteToMarkdown(existingNote: Note, updates: UpdateNoteData): { note: Note; markdown: string } {
    const updatedNote: Note = {
      ...existingNote,
      ...updates,
      updatedAt: new Date(),
    };

    const markdown = this.toMarkdown(updatedNote);
    return { note: updatedNote, markdown };
  }

  /**
   * Gera nome de arquivo baseado no título da nota
   */
  generateFileName(title: string): string {
    if (!title || title.trim() === '') {
      return `nota-${Date.now()}.md`;
    }

    // Limpar caracteres especiais e espaços
    const cleanTitle = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens consecutivos
      .replace(/^-|-$/g, ''); // Remove hífens no início e fim

    // Limitar tamanho do nome
    const maxLength = 100;
    const truncatedTitle = cleanTitle.length > maxLength 
      ? cleanTitle.substring(0, maxLength) 
      : cleanTitle;

    return `${truncatedTitle || 'nota'}.md`;
  }

  /**
   * Extrai título do conteúdo Markdown
   */
  extractTitleFromContent(content: string): string {
    const lines = content.split('\n');
    
    // Procurar por título H1
    for (const line of lines) {
      const h1Match = line.match(/^# (.+)$/);
      if (h1Match) {
        return h1Match[1].trim();
      }
    }

    // Se não encontrar H1, usar primeira linha não vazia
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        return trimmed.length > 50 ? trimmed.substring(0, 50) + '...' : trimmed;
      }
    }

    return 'Sem título';
  }

  /**
   * Valida se o conteúdo Markdown é válido
   */
  validateMarkdown(content: string): { isValid: boolean; error?: string } {
    try {
      const parsed = this.parseMarkdown(content);
      
      // Validar campos obrigatórios
      if (!parsed.frontmatter.id) {
        return { isValid: false, error: 'ID é obrigatório no frontmatter' };
      }
      
      if (!parsed.frontmatter.title) {
        return { isValid: false, error: 'Título é obrigatório no frontmatter' };
      }
      
      if (!parsed.frontmatter.created) {
        return { isValid: false, error: 'Data de criação é obrigatória no frontmatter' };
      }
      
      if (!parsed.frontmatter.updated) {
        return { isValid: false, error: 'Data de atualização é obrigatória no frontmatter' };
      }

      // Validar formato de datas
      if (isNaN(Date.parse(parsed.frontmatter.created))) {
        return { isValid: false, error: 'Data de criação inválida' };
      }
      
      if (isNaN(Date.parse(parsed.frontmatter.updated))) {
        return { isValid: false, error: 'Data de atualização inválida' };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: (error as Error).message };
    }
  }

  /**
   * Faz parse do conteúdo Markdown
   */
  private parseMarkdown(content: string): MarkdownNote {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n\n?([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      throw new Error('Formato de frontmatter inválido');
    }

    const [, frontmatterText, bodyContent] = match;
    const frontmatter = this.yamlToObject(frontmatterText) as NoteFrontmatter;
    
    // Remover título H1 do conteúdo se existir e for igual ao título do frontmatter
    let processedContent = bodyContent;
    if (frontmatter.title) {
      const titleRegex = new RegExp(`^# ${this.escapeRegex(frontmatter.title)}\\n\\n?`, 'i');
      processedContent = processedContent.replace(titleRegex, '');
    }

    return {
      frontmatter,
      content: processedContent,
    };
  }

  /**
   * Converte objeto para YAML simples
   */
  private objectToYaml(obj: Record<string, any>): string {
    const lines: string[] = [];
    
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) continue;
      
      if (Array.isArray(value)) {
        if (value.length === 0) {
          lines.push(`${key}: []`);
        } else {
          lines.push(`${key}:`);
          value.forEach(item => {
            lines.push(`  - ${this.escapeYamlValue(item)}`);
          });
        }
      } else {
        lines.push(`${key}: ${this.escapeYamlValue(value)}`);
      }
    }
    
    return lines.join('\n') + '\n';
  }

  /**
   * Converte YAML simples para objeto
   */
  private yamlToObject(yamlText: string): Record<string, any> {
    const obj: Record<string, any> = {};
    const lines = yamlText.split('\n');
    let currentArray: string | null = null;
    let currentArrayItems: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Processar arrays
      if (trimmed.startsWith('- ')) {
        if (currentArray) {
          currentArrayItems.push(this.unescapeYamlValue(trimmed.substring(2)));
        }
        continue;
      }

      // Finalizar array anterior se existir
      if (currentArray) {
        obj[currentArray] = currentArrayItems;
        currentArray = null;
        currentArrayItems = [];
      }

      // Processar chave: valor
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) continue;

      const key = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();

      if (value === '' || value === '[]') {
        // Início de array ou array vazio
        if (value === '[]') {
          obj[key] = [];
        } else {
          currentArray = key;
          currentArrayItems = [];
        }
      } else {
        obj[key] = this.unescapeYamlValue(value);
      }
    }

    // Finalizar array pendente
    if (currentArray) {
      obj[currentArray] = currentArrayItems;
    }

    return obj;
  }

  /**
   * Escapa valores para YAML
   */
  private escapeYamlValue(value: any): string {
    if (typeof value === 'string') {
      // Escapar aspas e caracteres especiais
      if (value.includes('"') || value.includes("'") || value.includes('\n') || value.includes(':')) {
        return `"${value.replace(/"/g, '\\"')}"`;
      }
      return value;
    }
    return String(value);
  }

  /**
   * Remove escape de valores YAML
   */
  private unescapeYamlValue(value: string): any {
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1).replace(/\\"/g, '"');
    }
    if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1).replace(/''/g, "'");
    }
    
    // Tentar converter para número ou booleano
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (/^\d+$/.test(value)) return parseInt(value, 10);
    if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
    
    return value;
  }

  /**
   * Escapa string para regex
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Cria erro padronizado
   */
  private createError(code: FileSystemErrorCode, message: string, originalError?: Error): FileSystemError {
    return {
      code,
      message,
      originalError
    };
  }
}

// Singleton instance
export const markdownConverter = MarkdownConverter.getInstance(); 