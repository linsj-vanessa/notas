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
  private debugMode = false;

  static getInstance(): MarkdownConverter {
    if (!MarkdownConverter.instance) {
      MarkdownConverter.instance = new MarkdownConverter();
    }
    return MarkdownConverter.instance;
  }

  /**
   * Ativa/desativa modo de depuração
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * Log de depuração
   */
  private debugLog(step: string, data: any): void {
    if (this.debugMode) {
      console.log(`[MarkdownConverter] ${step}:`, data);
    }
  }

  /**
   * Converte uma nota JSON para formato Markdown com frontmatter
   */
  toMarkdown(note: Note): string {
    // Validar entrada e garantir tipos corretos
    const safeNote = {
      id: typeof note.id === 'string' ? note.id : crypto.randomUUID(),
      title: typeof note.title === 'string' ? note.title : 'Sem título',
      tags: Array.isArray(note.tags) ? note.tags.filter(tag => typeof tag === 'string') : [],
      content: typeof note.content === 'string' ? note.content : '',
      createdAt: note.createdAt instanceof Date ? note.createdAt : new Date(),
      updatedAt: note.updatedAt instanceof Date ? note.updatedAt : new Date(),
      isDeleted: Boolean(note.isDeleted),
      deletedAt: note.deletedAt instanceof Date ? note.deletedAt : undefined,
    };

    const frontmatter: NoteFrontmatter = {
      id: safeNote.id,
      title: safeNote.title, // Preservar título exatamente como está
      tags: safeNote.tags,
      created: safeNote.createdAt.toISOString(),
      updated: safeNote.updatedAt.toISOString(),
    };

    this.debugLog('Frontmatter criado', frontmatter);

    // Adicionar campos da lixeira se necessário
    if (safeNote.isDeleted) {
      frontmatter.isDeleted = true;
      if (safeNote.deletedAt) {
        frontmatter.deletedAt = safeNote.deletedAt.toISOString();
      }
    }

    const yamlFrontmatter = this.objectToYaml(frontmatter);
    
    // Garantir que o conteúdo comece com título se não tiver
    let content = safeNote.content || '';
    if (content && safeNote.title && !content.startsWith(`# ${safeNote.title}`)) {
      content = `# ${safeNote.title}\n\n${content}`;
    } else if (!content && safeNote.title) {
      content = `# ${safeNote.title}\n\n`;
    }

    return `---\n${yamlFrontmatter}---\n\n${content}`;
  }

  /**
   * Converte um arquivo Markdown para formato JSON da nota
   */
  fromMarkdown(markdownContent: string): Note {
    try {
      const parsed = this.parseMarkdown(markdownContent);
      const { frontmatter, content } = parsed;

      this.debugLog('Frontmatter extraído', frontmatter);

      // Validar e converter campos obrigatórios com verificação de tipos
      const id = typeof frontmatter.id === 'string' ? frontmatter.id : crypto.randomUUID();
      
      // CRÍTICO: Preservar título exatamente como está no frontmatter
      let title = frontmatter.title;
      if (typeof title !== 'string') {
        title = 'Sem título';
      }
      // Não fazer trim() ou outras modificações que possam alterar o título
      
      this.debugLog('Título após validação', { original: frontmatter.title, processed: title });
      const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags.filter(tag => typeof tag === 'string') : [];
      
      // Converter datas com verificação robusta
      let createdAt: Date;
      let updatedAt: Date;
      let deletedAt: Date | undefined;

      try {
        const createdDate = new Date(frontmatter.created);
        createdAt = isNaN(createdDate.getTime()) ? new Date() : createdDate;
      } catch {
        createdAt = new Date();
      }

      try {
        const updatedDate = new Date(frontmatter.updated);
        updatedAt = isNaN(updatedDate.getTime()) ? new Date() : updatedDate;
      } catch {
        updatedAt = new Date();
      }

      if (frontmatter.deletedAt) {
        try {
          const deletedDate = new Date(frontmatter.deletedAt);
          deletedAt = isNaN(deletedDate.getTime()) ? undefined : deletedDate;
        } catch {
          deletedAt = undefined;
        }
      }

      const note: Note = {
        id,
        title,
        content: typeof content === 'string' ? content.trim() : '',
        tags,
        createdAt,
        updatedAt,
        isDeleted: Boolean(frontmatter.isDeleted),
        deletedAt,
      };

      return note;
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
  generateFileName(title: string | undefined | null): string {
    // Garantir que temos uma string
    const safeTitle = typeof title === 'string' ? title : '';
    
    if (!safeTitle || safeTitle.trim() === '') {
      return `nota-${Date.now()}.md`;
    }

    // Limpar caracteres especiais e espaços
    const cleanTitle = safeTitle
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
    
    // Remover título H1 do conteúdo se existir e for exatamente igual ao título do frontmatter
    let processedContent = bodyContent;
    if (frontmatter.title && typeof frontmatter.title === 'string' && bodyContent) {
      this.debugLog('Processando remoção H1', { 
        frontmatterTitle: frontmatter.title, 
        bodyContentStart: bodyContent.substring(0, 100) 
      });
      
      // Criar regex mais específica para evitar falsas correspondências
      const escapedTitle = this.escapeRegex(frontmatter.title);
      const titleRegex = new RegExp(`^# ${escapedTitle}(\\n\\n?|$)`, 'm');
      
      // Verificar se há uma correspondência exata
      const match = bodyContent.match(titleRegex);
      if (match && match.index === 0) {
        this.debugLog('H1 encontrado e removido', { match: match[0] });
        // Apenas remover se for exatamente no início e corresponder exatamente
        processedContent = bodyContent.replace(titleRegex, '').trim();
      } else {
        this.debugLog('H1 não encontrado ou não corresponde', { match, index: match?.index });
      }
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
    
    // Verificar se o input é válido
    if (typeof yamlText !== 'string') {
      console.error('yamlToObject: entrada inválida:', typeof yamlText);
      return obj;
    }

    this.debugLog('Parsing YAML', { yamlText });

    const lines = yamlText.split('\n');
    let currentArray: string | null = null;
    let currentArrayItems: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Processar arrays
      if (trimmed.startsWith('- ')) {
        if (currentArray) {
          const arrayValue = trimmed.substring(2);
          currentArrayItems.push(this.unescapeYamlValue(arrayValue));
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

      // Verificar se key é válido
      if (!key) continue;

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

    this.debugLog('YAML parsing resultado', obj);
    return obj;
  }

  /**
   * Escapa valores para YAML
   */
  private escapeYamlValue(value: any): string {
    if (typeof value === 'string') {
      // Lista de caracteres que precisam de escape ou aspas
      const needsQuotes = /[\n\r\t"':#@`|>{}[\]\\]|^\s|\s$|^[!&*]|^[\-?:,[\]{}#&*!|>'"%@`]|:\s|,\s|\s#/.test(value);
      
      if (needsQuotes || value.includes('"') || value.includes("'")) {
        // Usar aspas duplas e escapar aspas internas
        return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
      }
      return value;
    }
    return String(value);
  }

  /**
   * Remove escape de valores YAML
   */
  private unescapeYamlValue(value: string): any {
    // Verificar se o valor é uma string válida
    if (typeof value !== 'string') {
      console.error('unescapeYamlValue: valor inválido:', typeof value, value);
      return String(value || '');
    }

    const trimmedValue = value.trim();
    
    // Processar strings com aspas duplas
    if (trimmedValue.startsWith('"') && trimmedValue.endsWith('"') && trimmedValue.length >= 2) {
      return trimmedValue.slice(1, -1)
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
    }
    
    // Processar strings com aspas simples
    if (trimmedValue.startsWith("'") && trimmedValue.endsWith("'") && trimmedValue.length >= 2) {
      return trimmedValue.slice(1, -1).replace(/''/g, "'");
    }
    
    // Tentar converter para número ou booleano
    if (trimmedValue === 'true') return true;
    if (trimmedValue === 'false') return false;
    if (trimmedValue === 'null') return null;
    if (trimmedValue === 'undefined') return undefined;
    
    // Tentar converter para número (apenas se for claramente um número)
    if (/^-?\d+$/.test(trimmedValue)) {
      const num = parseInt(trimmedValue, 10);
      return isNaN(num) ? trimmedValue : num;
    }
    
    if (/^-?\d+\.\d+$/.test(trimmedValue)) {
      const num = parseFloat(trimmedValue);
      return isNaN(num) ? trimmedValue : num;
    }
    
    return trimmedValue;
  }

  /**
   * Escapa string para regex
   */
  private escapeRegex(str: string | undefined | null): string {
    const safeStr = typeof str === 'string' ? str : '';
    return safeStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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