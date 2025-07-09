import { db } from '@/lib/db';
import { Note } from '@/types/note';
import { getFileSystemService } from '@/lib/file-system/FileSystemService';
import { markdownConverter } from '@/lib/file-system/MarkdownConverter';
import { FileSystemError, FileSystemErrorCode } from '@/lib/file-system/types';
import { BackupManager } from './BackupManager';
import { DataValidator } from './DataValidator';

export interface MigrationProgress {
  stage: 'preparing' | 'backing-up' | 'migrating' | 'validating' | 'completed' | 'error';
  processed: number;
  total: number;
  currentItem?: string;
  error?: string;
}

export interface MigrationResult {
  success: boolean;
  migratedNotes: number;
  migratedTrash: number;
  errors: string[];
  backupPath?: string;
}

export interface MigrationOptions {
  includeTrash: boolean;
  createBackup: boolean;
  overwriteExisting: boolean;
  directoryHandle: FileSystemDirectoryHandle;
}

export class IndexedDBMigrator {
  private fileSystemService = getFileSystemService();
  private backupManager = new BackupManager();
  private dataValidator = new DataValidator();
  private progressCallback?: (progress: MigrationProgress) => void;

  constructor(progressCallback?: (progress: MigrationProgress) => void) {
    this.progressCallback = progressCallback;
  }

  /**
   * Migra todos os dados do IndexedDB para o sistema de arquivos
   */
  async migrate(options: MigrationOptions): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migratedNotes: 0,
      migratedTrash: 0,
      errors: []
    };

    try {
      // Fase 1: Preparação
      this.reportProgress('preparing', 0, 1, 'Carregando dados do IndexedDB...');
      
      const allNotes = await this.loadNotesFromIndexedDB();
      const activeNotes = allNotes.filter(note => !note.isDeleted);
      const trashedNotes = allNotes.filter(note => note.isDeleted);
      
      const totalItems = activeNotes.length + (options.includeTrash ? trashedNotes.length : 0);
      
      this.reportProgress('preparing', 1, 1, `Encontradas ${totalItems} notas para migrar`);

      // Fase 2: Backup (se solicitado)
      if (options.createBackup) {
        this.reportProgress('backing-up', 0, 1, 'Criando backup dos dados...');
        
        const backupPath = await this.backupManager.createMigrationBackup(allNotes);
        result.backupPath = backupPath;
        
        this.reportProgress('backing-up', 1, 1, 'Backup criado com sucesso');
      }

      // Fase 3: Inicializar estrutura de diretórios
      this.reportProgress('migrating', 0, totalItems, 'Inicializando estrutura de diretórios...');
      
      const directories = await this.fileSystemService.initializeDirectoryStructure(options.directoryHandle);

      // Fase 4: Migrar notas ativas
      let processed = 0;
      
      for (const note of activeNotes) {
        this.reportProgress('migrating', processed, totalItems, `Migrando: ${note.title}`);
        
        try {
          await this.migrateNote(note, directories.notesDir, options.overwriteExisting);
          result.migratedNotes++;
        } catch (error) {
          const errorMsg = `Erro ao migrar nota "${note.title}": ${(error as Error).message}`;
          result.errors.push(errorMsg);
          console.error(errorMsg, error);
        }
        
        processed++;
      }

      // Fase 5: Migrar lixeira (se solicitado)
      if (options.includeTrash) {
        for (const note of trashedNotes) {
          this.reportProgress('migrating', processed, totalItems, `Migrando para lixeira: ${note.title}`);
          
          try {
            await this.migrateNote(note, directories.trashDir, options.overwriteExisting);
            result.migratedTrash++;
          } catch (error) {
            const errorMsg = `Erro ao migrar nota da lixeira "${note.title}": ${(error as Error).message}`;
            result.errors.push(errorMsg);
            console.error(errorMsg, error);
          }
          
          processed++;
        }
      }

      // Fase 6: Validação
      this.reportProgress('validating', 0, 1, 'Validando dados migrados...');
      
      const validationResult = await this.dataValidator.validateMigratedData(
        directories.notesDir,
        directories.trashDir,
        allNotes
      );

      if (!validationResult.isValid) {
        result.errors.push(...validationResult.errors);
      }

      this.reportProgress('validating', 1, 1, 'Validação concluída');

      // Fase 7: Conclusão
      result.success = result.errors.length === 0;
      this.reportProgress('completed', totalItems, totalItems, 'Migração concluída');

      return result;

    } catch (error) {
      const errorMsg = `Erro crítico durante a migração: ${(error as Error).message}`;
      result.errors.push(errorMsg);
      this.reportProgress('error', 0, 0, errorMsg);
      return result;
    }
  }

  /**
   * Migra uma nota individual
   */
  private async migrateNote(
    note: Note, 
    targetDirectory: FileSystemDirectoryHandle, 
    overwriteExisting: boolean
  ): Promise<void> {
    try {
      // Converter nota para markdown
      const markdown = markdownConverter.toMarkdown(note);
      const fileName = markdownConverter.generateFileName(note.title);

      // Verificar se arquivo já existe
      const fileExists = await this.fileSystemService.fileExists(targetDirectory, fileName);
      
      if (fileExists && !overwriteExisting) {
        throw new Error(`Arquivo já existe: ${fileName}`);
      }

      // Criar/atualizar arquivo
      const fileHandle = await this.fileSystemService.getFileHandle(targetDirectory, fileName, true);
      await this.fileSystemService.writeFile(fileHandle, markdown);

    } catch (error) {
      throw this.createError(
        FileSystemErrorCode.WRITE_FAILED,
        `Erro ao migrar nota "${note.title}"`,
        error as Error
      );
    }
  }

  /**
   * Carrega todas as notas do IndexedDB
   */
  private async loadNotesFromIndexedDB(): Promise<Note[]> {
    try {
      return await db.notes.orderBy('updatedAt').reverse().toArray();
    } catch (error) {
      throw this.createError(
        FileSystemErrorCode.READ_FAILED,
        'Erro ao carregar notas do IndexedDB',
        error as Error
      );
    }
  }

  /**
   * Verifica se há dados para migrar
   */
  async hasDataToMigrate(): Promise<{
    hasData: boolean;
    activeNotes: number;
    trashedNotes: number;
  }> {
    try {
      const allNotes = await this.loadNotesFromIndexedDB();
      const activeNotes = allNotes.filter(note => !note.isDeleted);
      const trashedNotes = allNotes.filter(note => note.isDeleted);

      return {
        hasData: allNotes.length > 0,
        activeNotes: activeNotes.length,
        trashedNotes: trashedNotes.length
      };
    } catch (error) {
      console.error('Erro ao verificar dados para migração:', error);
      return {
        hasData: false,
        activeNotes: 0,
        trashedNotes: 0
      };
    }
  }

  /**
   * Estima o tempo de migração
   */
  estimateMigrationTime(totalNotes: number): {
    estimatedMinutes: number;
    estimatedSeconds: number;
  } {
    // Estimativa baseada em ~100ms por nota
    const estimatedMs = totalNotes * 100;
    const estimatedSeconds = Math.ceil(estimatedMs / 1000);
    const estimatedMinutes = Math.floor(estimatedSeconds / 60);

    return {
      estimatedMinutes,
      estimatedSeconds: estimatedSeconds % 60
    };
  }

  /**
   * Cria um teste de migração (apenas algumas notas)
   */
  async testMigration(
    directoryHandle: FileSystemDirectoryHandle,
    maxNotes: number = 3
  ): Promise<MigrationResult> {
    const allNotes = await this.loadNotesFromIndexedDB();
    const testNotes = allNotes.slice(0, maxNotes);

    // Criar um diretório de teste
    const testDir = await this.fileSystemService.createDirectory(directoryHandle, 'teste-migracao');
    
    const result: MigrationResult = {
      success: false,
      migratedNotes: 0,
      migratedTrash: 0,
      errors: []
    };

    try {
      for (const note of testNotes) {
        await this.migrateNote(note, testDir, true);
        result.migratedNotes++;
      }

      result.success = true;
      return result;

    } catch (error) {
      result.errors.push(`Erro no teste de migração: ${(error as Error).message}`);
      return result;
    }
  }

  /**
   * Reporta progresso da migração
   */
  private reportProgress(
    stage: MigrationProgress['stage'],
    processed: number,
    total: number,
    currentItem?: string
  ): void {
    if (this.progressCallback) {
      this.progressCallback({
        stage,
        processed,
        total,
        currentItem
      });
    }
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

export { IndexedDBMigrator as default }; 