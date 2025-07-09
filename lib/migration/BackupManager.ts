import { Note } from '@/types/note';
import { FileSystemError, FileSystemErrorCode } from '@/lib/file-system/types';

export interface BackupData {
  version: string;
  timestamp: string;
  notes: Note[];
  metadata: {
    totalNotes: number;
    activeNotes: number;
    deletedNotes: number;
    backupType: 'migration' | 'manual';
  };
}

export class BackupManager {
  private static instance: BackupManager;

  static getInstance(): BackupManager {
    if (!BackupManager.instance) {
      BackupManager.instance = new BackupManager();
    }
    return BackupManager.instance;
  }

  /**
   * Cria backup específico para migração
   */
  async createMigrationBackup(notes: Note[]): Promise<string> {
    try {
      const activeNotes = notes.filter(note => !note.isDeleted);
      const deletedNotes = notes.filter(note => note.isDeleted);

      const backupData: BackupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        notes: notes,
        metadata: {
          totalNotes: notes.length,
          activeNotes: activeNotes.length,
          deletedNotes: deletedNotes.length,
          backupType: 'migration'
        }
      };

      const filename = `backup-migracao-${new Date().toISOString().split('T')[0]}`;
      return await this.downloadBackup(backupData, filename);

    } catch (error) {
      throw this.createError(
        FileSystemErrorCode.WRITE_FAILED,
        'Erro ao criar backup de migração',
        error as Error
      );
    }
  }

  /**
   * Cria backup manual
   */
  async createManualBackup(notes: Note[], customName?: string): Promise<string> {
    try {
      const activeNotes = notes.filter(note => !note.isDeleted);
      const deletedNotes = notes.filter(note => note.isDeleted);

      const backupData: BackupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        notes: notes,
        metadata: {
          totalNotes: notes.length,
          activeNotes: activeNotes.length,
          deletedNotes: deletedNotes.length,
          backupType: 'manual'
        }
      };

      const filename = customName || `backup-manual-${new Date().toISOString().split('T')[0]}`;
      return await this.downloadBackup(backupData, filename);

    } catch (error) {
      throw this.createError(
        FileSystemErrorCode.WRITE_FAILED,
        'Erro ao criar backup manual',
        error as Error
      );
    }
  }

  /**
   * Valida um arquivo de backup
   */
  validateBackup(data: any): data is BackupData {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.version === 'string' &&
      typeof data.timestamp === 'string' &&
      Array.isArray(data.notes) &&
      typeof data.metadata === 'object' &&
      typeof data.metadata.totalNotes === 'number' &&
      typeof data.metadata.activeNotes === 'number' &&
      typeof data.metadata.deletedNotes === 'number' &&
      ['migration', 'manual'].includes(data.metadata.backupType)
    );
  }

  /**
   * Restaura dados de um backup
   */
  async restoreFromBackup(backupData: BackupData): Promise<Note[]> {
    try {
      if (!this.validateBackup(backupData)) {
        throw new Error('Formato de backup inválido');
      }

      // Validar integridade das notas
      const validNotes = backupData.notes.filter(note => {
        return (
          typeof note.id === 'string' &&
          typeof note.title === 'string' &&
          typeof note.content === 'string' &&
          note.createdAt instanceof Date &&
          note.updatedAt instanceof Date
        );
      });

      if (validNotes.length !== backupData.notes.length) {
        const invalidCount = backupData.notes.length - validNotes.length;
        console.warn(`${invalidCount} notas inválidas foram ignoradas durante a restauração`);
      }

      return validNotes;

    } catch (error) {
      throw this.createError(
        FileSystemErrorCode.READ_FAILED,
        'Erro ao restaurar backup',
        error as Error
      );
    }
  }

  /**
   * Obtém informações sobre um backup
   */
  getBackupInfo(backupData: BackupData): {
    version: string;
    timestamp: Date;
    totalNotes: number;
    activeNotes: number;
    deletedNotes: number;
    backupType: string;
    isValid: boolean;
  } {
    const isValid = this.validateBackup(backupData);
    
    return {
      version: backupData.version || 'desconhecida',
      timestamp: new Date(backupData.timestamp),
      totalNotes: backupData.metadata?.totalNotes || 0,
      activeNotes: backupData.metadata?.activeNotes || 0,
      deletedNotes: backupData.metadata?.deletedNotes || 0,
      backupType: backupData.metadata?.backupType || 'desconhecido',
      isValid
    };
  }

  /**
   * Calcula o tamanho estimado do backup
   */
  estimateBackupSize(notes: Note[]): {
    sizeInBytes: number;
    sizeInKB: number;
    sizeInMB: number;
  } {
    const jsonString = JSON.stringify(notes, null, 2);
    const sizeInBytes = new Blob([jsonString]).size;
    
    return {
      sizeInBytes,
      sizeInKB: Math.round(sizeInBytes / 1024),
      sizeInMB: Math.round(sizeInBytes / (1024 * 1024))
    };
  }

  /**
   * Faz download do backup
   */
  private async downloadBackup(backupData: BackupData, filename: string): Promise<string> {
    try {
      const jsonContent = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      
      // Usar File System Access API se disponível
      if ('showSaveFilePicker' in window) {
        try {
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: `${filename}.json`,
            types: [{
              description: 'Arquivo de backup JSON',
              accept: { 'application/json': ['.json'] }
            }]
          });
          
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          
          return fileHandle.name;
        } catch (error) {
          // Fallback para download tradicional se usuário cancelar
          if ((error as DOMException).name === 'AbortError') {
            return this.fallbackDownload(blob, filename);
          }
          throw error;
        }
      } else {
        // Fallback para navegadores sem suporte
        return this.fallbackDownload(blob, filename);
      }
    } catch (error) {
      throw this.createError(
        FileSystemErrorCode.WRITE_FAILED,
        'Erro ao fazer download do backup',
        error as Error
      );
    }
  }

  /**
   * Fallback para download tradicional
   */
  private fallbackDownload(blob: Blob, filename: string): string {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
    
    return `${filename}.json`;
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

export { BackupManager as default }; 