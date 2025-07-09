import { Note } from '@/types/note';
import { getFileSystemService } from '@/lib/file-system/FileSystemService';
import { markdownConverter } from '@/lib/file-system/MarkdownConverter';
import { FileSystemError, FileSystemErrorCode } from '@/lib/file-system/types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  statistics: {
    totalNotesOriginal: number;
    totalNotesMigrated: number;
    totalTrashOriginal: number;
    totalTrashMigrated: number;
    validFiles: number;
    invalidFiles: number;
    corruptedFiles: number;
  };
}

export interface FileValidationResult {
  fileName: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  originalNote?: Note;
  migratedNote?: Note;
}

export class DataValidator {
  private fileSystemService = getFileSystemService();

  /**
   * Valida todos os dados migrados
   */
  async validateMigratedData(
    notesDir: FileSystemDirectoryHandle,
    trashDir: FileSystemDirectoryHandle,
    originalNotes: Note[]
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      statistics: {
        totalNotesOriginal: 0,
        totalNotesMigrated: 0,
        totalTrashOriginal: 0,
        totalTrashMigrated: 0,
        validFiles: 0,
        invalidFiles: 0,
        corruptedFiles: 0
      }
    };

    try {
      // Separar notas originais
      const originalActiveNotes = originalNotes.filter(note => !note.isDeleted);
      const originalTrashNotes = originalNotes.filter(note => note.isDeleted);

      result.statistics.totalNotesOriginal = originalActiveNotes.length;
      result.statistics.totalTrashOriginal = originalTrashNotes.length;

      // Validar notas ativas
      const activeValidation = await this.validateDirectoryFiles(notesDir, originalActiveNotes);
      result.statistics.totalNotesMigrated = activeValidation.length;

      // Validar lixeira
      const trashValidation = await this.validateDirectoryFiles(trashDir, originalTrashNotes);
      result.statistics.totalTrashMigrated = trashValidation.length;

      // Processar resultados
      const allValidations = [...activeValidation, ...trashValidation];
      
      for (const validation of allValidations) {
        if (validation.isValid) {
          result.statistics.validFiles++;
        } else {
          result.statistics.invalidFiles++;
          result.errors.push(...validation.errors);
        }
        
        result.warnings.push(...validation.warnings);
      }

      // Verificar integridade geral
      this.validateOverallIntegrity(result);

      result.isValid = result.errors.length === 0;

    } catch (error) {
      result.isValid = false;
      result.errors.push(`Erro durante validação: ${(error as Error).message}`);
    }

    return result;
  }

  /**
   * Valida arquivos em um diretório
   */
  private async validateDirectoryFiles(
    directory: FileSystemDirectoryHandle,
    originalNotes: Note[]
  ): Promise<FileValidationResult[]> {
    const results: FileValidationResult[] = [];

    try {
      const files = await this.fileSystemService.listFiles(directory);
      
      for (const file of files) {
        const validation = await this.validateFile(file, originalNotes);
        results.push(validation);
      }

    } catch (error) {
      console.error('Erro ao validar arquivos do diretório:', error);
    }

    return results;
  }

  /**
   * Valida um arquivo individual
   */
  private async validateFile(
    fileHandle: FileSystemFileHandle,
    originalNotes: Note[]
  ): Promise<FileValidationResult> {
    const result: FileValidationResult = {
      fileName: fileHandle.name,
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      // Ler conteúdo do arquivo
      const fileContent = await this.fileSystemService.readFile(fileHandle);
      
      // Validar formato markdown
      const markdownValidation = markdownConverter.validateMarkdown(fileContent);
      if (!markdownValidation.isValid) {
        result.isValid = false;
        result.errors.push(`Formato inválido: ${markdownValidation.error}`);
        return result;
      }

      // Converter de volta para nota
      try {
        const migratedNote = markdownConverter.fromMarkdown(fileContent);
        result.migratedNote = migratedNote;

        // Encontrar nota original correspondente
        const originalNote = originalNotes.find(note => note.id === migratedNote.id);
        if (originalNote) {
          result.originalNote = originalNote;
          
          // Validar integridade dos dados
          this.validateNoteIntegrity(originalNote, migratedNote, result);
        } else {
          result.warnings.push('Nota original não encontrada para comparação');
        }

      } catch (error) {
        result.isValid = false;
        result.errors.push(`Erro ao converter markdown: ${(error as Error).message}`);
      }

    } catch (error) {
      result.isValid = false;
      result.errors.push(`Erro ao ler arquivo: ${(error as Error).message}`);
    }

    return result;
  }

  /**
   * Valida integridade entre nota original e migrada
   */
  private validateNoteIntegrity(
    original: Note,
    migrated: Note,
    result: FileValidationResult
  ): void {
    // Validar campos obrigatórios com verificação de tipos
    const originalId = typeof original.id === 'string' ? original.id : '';
    const migratedId = typeof migrated.id === 'string' ? migrated.id : '';
    
    if (originalId !== migratedId) {
      result.errors.push('ID da nota não corresponde');
      result.isValid = false;
    }

    const originalTitle = typeof original.title === 'string' ? original.title : '';
    const migratedTitle = typeof migrated.title === 'string' ? migrated.title : '';
    
    if (originalTitle !== migratedTitle) {
      result.errors.push('Título da nota não corresponde');
      result.isValid = false;
    }

    // Validar conteúdo com mais tolerância para formatação
    const originalContent = typeof original.content === 'string' ? original.content.trim() : '';
    const migratedContent = typeof migrated.content === 'string' ? migrated.content.trim() : '';
    
    if (originalContent !== migratedContent) {
      // Verificar se é apenas diferença de formatação
      const normalizedOriginal = originalContent.replace(/\s+/g, ' ').trim();
      const normalizedMigrated = migratedContent.replace(/\s+/g, ' ').trim();
      
      if (normalizedOriginal !== normalizedMigrated) {
        result.warnings.push('Conteúdo da nota foi modificado');
      }
    }

    // Validar datas com verificação de instância
    if (original.createdAt instanceof Date && migrated.createdAt instanceof Date) {
      if (Math.abs(original.createdAt.getTime() - migrated.createdAt.getTime()) > 2000) {
        result.warnings.push('Data de criação difere ligeiramente');
      }
    } else {
      result.errors.push('Datas de criação inválidas');
      result.isValid = false;
    }

    if (original.updatedAt instanceof Date && migrated.updatedAt instanceof Date) {
      if (Math.abs(original.updatedAt.getTime() - migrated.updatedAt.getTime()) > 2000) {
        result.warnings.push('Data de atualização difere ligeiramente');
      }
    } else {
      result.errors.push('Datas de atualização inválidas');
      result.isValid = false;
    }

    // Validar tags com mais robustez
    const originalTags = Array.isArray(original.tags) ? original.tags.filter(tag => typeof tag === 'string') : [];
    const migratedTags = Array.isArray(migrated.tags) ? migrated.tags.filter(tag => typeof tag === 'string') : [];
    
    originalTags.sort();
    migratedTags.sort();
    
    if (JSON.stringify(originalTags) !== JSON.stringify(migratedTags)) {
      result.warnings.push('Tags da nota foram modificadas');
    }

    // Validar status de lixeira
    const originalDeleted = Boolean(original.isDeleted);
    const migratedDeleted = Boolean(migrated.isDeleted);
    
    if (originalDeleted !== migratedDeleted) {
      result.errors.push('Status de lixeira não corresponde');
      result.isValid = false;
    }

    // Validar data de exclusão
    if (original.deletedAt || migrated.deletedAt) {
      if (original.deletedAt instanceof Date && migrated.deletedAt instanceof Date) {
        if (Math.abs(original.deletedAt.getTime() - migrated.deletedAt.getTime()) > 2000) {
          result.warnings.push('Data de exclusão difere ligeiramente');
        }
      } else if (original.deletedAt && !migrated.deletedAt) {
        result.errors.push('Data de exclusão perdida na migração');
        result.isValid = false;
      } else if (!original.deletedAt && migrated.deletedAt) {
        result.warnings.push('Data de exclusão adicionada na migração');
      }
    }
  }

  /**
   * Valida integridade geral da migração
   */
  private validateOverallIntegrity(result: ValidationResult): void {
    const stats = result.statistics;

    // Verificar se todas as notas foram migradas
    if (stats.totalNotesOriginal !== stats.totalNotesMigrated) {
      result.errors.push(
        `Número de notas não corresponde: ${stats.totalNotesOriginal} originais vs ${stats.totalNotesMigrated} migradas`
      );
    }

    if (stats.totalTrashOriginal !== stats.totalTrashMigrated) {
      result.warnings.push(
        `Número de itens na lixeira não corresponde: ${stats.totalTrashOriginal} originais vs ${stats.totalTrashMigrated} migrados`
      );
    }

    // Verificar se há muitos arquivos inválidos
    const totalFiles = stats.validFiles + stats.invalidFiles + stats.corruptedFiles;
    if (totalFiles > 0) {
      const errorRate = (stats.invalidFiles + stats.corruptedFiles) / totalFiles;
      
      if (errorRate > 0.1) { // Mais de 10% de erros
        result.errors.push(
          `Taxa de erro muito alta: ${Math.round(errorRate * 100)}% dos arquivos têm problemas`
        );
      } else if (errorRate > 0.05) { // Mais de 5% de erros
        result.warnings.push(
          `Taxa de erro elevada: ${Math.round(errorRate * 100)}% dos arquivos têm problemas`
        );
      }
    }

    // Verificar se há arquivos órfãos
    const totalExpected = stats.totalNotesOriginal + stats.totalTrashOriginal;
    const totalFound = stats.totalNotesMigrated + stats.totalTrashMigrated;
    
    if (totalFound > totalExpected) {
      result.warnings.push(
        `Encontrados ${totalFound - totalExpected} arquivos a mais que o esperado`
      );
    }
  }

  /**
   * Valida um arquivo específico pelo nome
   */
  async validateSingleFile(
    directory: FileSystemDirectoryHandle,
    fileName: string,
    originalNotes: Note[]
  ): Promise<FileValidationResult> {
    try {
      const fileHandle = await this.fileSystemService.getFileHandle(directory, fileName);
      return await this.validateFile(fileHandle, originalNotes);
    } catch (error) {
      return {
        fileName,
        isValid: false,
        errors: [`Erro ao acessar arquivo: ${(error as Error).message}`],
        warnings: []
      };
    }
  }

  /**
   * Valida apenas o formato de um arquivo markdown
   */
  async validateMarkdownFormat(fileContent: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const validation = markdownConverter.validateMarkdown(fileContent);
    
    const result = {
      isValid: validation.isValid,
      errors: validation.error ? [validation.error] : [],
      warnings: [] as string[]
    };

    // Verificações adicionais
    if (validation.isValid) {
      try {
        const note = markdownConverter.fromMarkdown(fileContent);
        
        // Verificar se o título não está vazio
        if (!note.title || note.title.trim() === '') {
          result.warnings.push('Título da nota está vazio');
        }

        // Verificar se há conteúdo
        if (!note.content || note.content.trim() === '') {
          result.warnings.push('Conteúdo da nota está vazio');
        }

        // Verificar se as datas fazem sentido
        if (note.createdAt > note.updatedAt) {
          result.warnings.push('Data de criação é posterior à data de atualização');
        }

      } catch (error) {
        result.isValid = false;
        result.errors.push(`Erro ao processar markdown: ${(error as Error).message}`);
      }
    }

    return result;
  }

  /**
   * Gera relatório de validação
   */
  generateValidationReport(result: ValidationResult): string {
    const { statistics: stats } = result;
    
    let report = '# Relatório de Validação da Migração\n\n';
    
    report += `## Resumo\n`;
    report += `- **Status**: ${result.isValid ? '✅ Válido' : '❌ Inválido'}\n`;
    report += `- **Erros**: ${result.errors.length}\n`;
    report += `- **Avisos**: ${result.warnings.length}\n\n`;
    
    report += `## Estatísticas\n`;
    report += `- **Notas originais**: ${stats.totalNotesOriginal}\n`;
    report += `- **Notas migradas**: ${stats.totalNotesMigrated}\n`;
    report += `- **Lixeira original**: ${stats.totalTrashOriginal}\n`;
    report += `- **Lixeira migrada**: ${stats.totalTrashMigrated}\n`;
    report += `- **Arquivos válidos**: ${stats.validFiles}\n`;
    report += `- **Arquivos inválidos**: ${stats.invalidFiles}\n`;
    report += `- **Arquivos corrompidos**: ${stats.corruptedFiles}\n\n`;
    
    if (result.errors.length > 0) {
      report += `## Erros\n`;
      result.errors.forEach((error, index) => {
        report += `${index + 1}. ${error}\n`;
      });
      report += '\n';
    }
    
    if (result.warnings.length > 0) {
      report += `## Avisos\n`;
      result.warnings.forEach((warning, index) => {
        report += `${index + 1}. ${warning}\n`;
      });
      report += '\n';
    }
    
    report += `---\n`;
    report += `*Relatório gerado em: ${new Date().toLocaleString()}*\n`;
    
    return report;
  }
}

export { DataValidator as default }; 