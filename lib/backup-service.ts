import { Note } from '@/types/note';
import { db } from '@/lib/db';

export interface BackupData {
  version: string;
  timestamp: string;
  notes: Note[];
  metadata: {
    totalNotes: number;
    activeNotes: number;
    deletedNotes: number;
    exportedBy: string;
  };
}

interface BackupSettings {
  autoBackupEnabled: boolean;
  backupInterval: number; // em dias
  maxBackups: number; // máximo de backups automáticos a manter
  lastBackup?: string;
}

export class BackupService {
  private static instance: BackupService;
  private settings: BackupSettings;

  private constructor() {
    this.settings = this.loadSettings();
    this.initializeAutoBackup();
  }

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  // Carregar configurações do localStorage
  private loadSettings(): BackupSettings {
    if (typeof window === 'undefined') {
      return this.getDefaultSettings();
    }

    const stored = localStorage.getItem('backupSettings');
    if (stored) {
      return { ...this.getDefaultSettings(), ...JSON.parse(stored) };
    }
    return this.getDefaultSettings();
  }

  // Configurações padrão
  private getDefaultSettings(): BackupSettings {
    return {
      autoBackupEnabled: true,
      backupInterval: 7, // 7 dias
      maxBackups: 5,
    };
  }

  // Salvar configurações
  private saveSettings(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('backupSettings', JSON.stringify(this.settings));
    }
  }

  // Inicializar backup automático
  private initializeAutoBackup(): void {
    if (typeof window === 'undefined') return;

    if (this.settings.autoBackupEnabled) {
      this.scheduleNextBackup();
    }
  }

  // Agendar próximo backup
  private scheduleNextBackup(): void {
    if (typeof window === 'undefined') return;

    const shouldBackup = this.shouldCreateBackup();
    if (shouldBackup) {
      // Fazer backup imediatamente
      setTimeout(() => {
        this.createAutoBackup();
      }, 5000); // Aguardar 5 segundos após carregar
    }

    // Agendar verificação diária
    const checkInterval = 24 * 60 * 60 * 1000; // 24 horas
    setInterval(() => {
      if (this.shouldCreateBackup()) {
        this.createAutoBackup();
      }
    }, checkInterval);
  }

  // Verificar se deve criar backup
  private shouldCreateBackup(): boolean {
    if (!this.settings.lastBackup) return true;

    const lastBackupDate = new Date(this.settings.lastBackup);
    const daysSinceLastBackup = Math.floor(
      (Date.now() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceLastBackup >= this.settings.backupInterval;
  }

  // Criar backup manual
  async createBackup(filename?: string): Promise<BackupData> {
    try {
      const allNotes = await db.notes.toArray();
      const activeNotes = allNotes.filter(note => !note.isDeleted);
      const deletedNotes = allNotes.filter(note => note.isDeleted);

      const backupData: BackupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        notes: allNotes,
        metadata: {
          totalNotes: allNotes.length,
          activeNotes: activeNotes.length,
          deletedNotes: deletedNotes.length,
          exportedBy: 'Notas App',
        },
      };

      // Download do arquivo
      if (filename !== undefined) {
        this.downloadBackup(backupData, filename);
      }

      return backupData;
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      throw new Error('Falha ao criar backup das notas');
    }
  }

  // Criar backup automático (salvar no localStorage)
  private async createAutoBackup(): Promise<void> {
    try {
      const backupData = await this.createBackup();
      
      // Salvar no localStorage
      const backups = this.getStoredBackups();
      const newBackup = {
        id: crypto.randomUUID(),
        data: backupData,
        createdAt: new Date().toISOString(),
        type: 'auto' as const,
      };

      backups.push(newBackup);

      // Manter apenas os últimos N backups
      if (backups.length > this.settings.maxBackups) {
        backups.splice(0, backups.length - this.settings.maxBackups);
      }

      localStorage.setItem('autoBackups', JSON.stringify(backups));
      
      // Atualizar data do último backup
      this.settings.lastBackup = new Date().toISOString();
      this.saveSettings();

      console.log('Backup automático criado com sucesso');
    } catch (error) {
      console.error('Erro ao criar backup automático:', error);
    }
  }

  // Obter backups armazenados
  private getStoredBackups(): Array<{
    id: string;
    data: BackupData;
    createdAt: string;
    type: 'auto';
  }> {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem('autoBackups');
    return stored ? JSON.parse(stored) : [];
  }

  // Download do backup
  private downloadBackup(backupData: BackupData, filename: string): void {
    const jsonContent = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  }

  // Restaurar backup
  async restoreBackup(backupData: BackupData, options: {
    replaceAll?: boolean;
    includeDeleted?: boolean;
  } = {}): Promise<void> {
    try {
      const { replaceAll = false, includeDeleted = true } = options;

      if (replaceAll) {
        // Limpar todas as notas existentes
        await db.notes.clear();
      }

      // Filtrar notas se necessário
      let notesToRestore = backupData.notes;
      if (!includeDeleted) {
        notesToRestore = notesToRestore.filter(note => !note.isDeleted);
      }

      // Restaurar notas
      for (const note of notesToRestore) {
        const existingNote = await db.notes.get(note.id);
        
        if (!existingNote || replaceAll) {
          // Converter datas de string para Date se necessário
          const noteToAdd: Note = {
            ...note,
            createdAt: typeof note.createdAt === 'string' ? new Date(note.createdAt) : note.createdAt,
            updatedAt: typeof note.updatedAt === 'string' ? new Date(note.updatedAt) : note.updatedAt,
            deletedAt: note.deletedAt 
              ? (typeof note.deletedAt === 'string' ? new Date(note.deletedAt) : note.deletedAt)
              : undefined,
          };
          
          await db.notes.put(noteToAdd);
        }
      }

      console.log(`Backup restaurado: ${notesToRestore.length} notas`);
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      throw new Error('Falha ao restaurar backup');
    }
  }

  // Validar formato do backup
  validateBackup(data: any): data is BackupData {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.version === 'string' &&
      typeof data.timestamp === 'string' &&
      Array.isArray(data.notes) &&
      data.metadata &&
      typeof data.metadata.totalNotes === 'number'
    );
  }

  // Obter configurações
  getSettings(): BackupSettings {
    return { ...this.settings };
  }

  // Atualizar configurações
  updateSettings(newSettings: Partial<BackupSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();

    // Reinicializar se necessário
    if ('autoBackupEnabled' in newSettings) {
      if (newSettings.autoBackupEnabled) {
        this.initializeAutoBackup();
      }
    }
  }

  // Obter lista de backups automáticos
  getAutoBackups(): Array<{
    id: string;
    createdAt: string;
    size: number;
    notesCount: number;
  }> {
    const backups = this.getStoredBackups();
    return backups.map(backup => ({
      id: backup.id,
      createdAt: backup.createdAt,
      size: JSON.stringify(backup.data).length,
      notesCount: backup.data.metadata.totalNotes,
    }));
  }

  // Restaurar backup automático específico
  async restoreAutoBackup(backupId: string): Promise<void> {
    const backups = this.getStoredBackups();
    const backup = backups.find(b => b.id === backupId);
    
    if (!backup) {
      throw new Error('Backup não encontrado');
    }

    await this.restoreBackup(backup.data, { replaceAll: true });
  }

  // Deletar backup automático
  deleteAutoBackup(backupId: string): void {
    const backups = this.getStoredBackups();
    const filtered = backups.filter(b => b.id !== backupId);
    localStorage.setItem('autoBackups', JSON.stringify(filtered));
  }

  // Limpar todos os backups automáticos
  clearAutoBackups(): void {
    localStorage.removeItem('autoBackups');
  }

  // Obter estatísticas de backup
  getBackupStats(): {
    lastBackup?: string;
    autoBackupsCount: number;
    totalSize: number;
    nextBackup?: string;
  } {
    const backups = this.getStoredBackups();
    const totalSize = backups.reduce((sum, backup) => 
      sum + JSON.stringify(backup.data).length, 0
    );

    let nextBackup: string | undefined;
    if (this.settings.autoBackupEnabled && this.settings.lastBackup) {
      const lastBackupDate = new Date(this.settings.lastBackup);
      const nextBackupDate = new Date(lastBackupDate);
      nextBackupDate.setDate(nextBackupDate.getDate() + this.settings.backupInterval);
      nextBackup = nextBackupDate.toISOString();
    }

    return {
      lastBackup: this.settings.lastBackup,
      autoBackupsCount: backups.length,
      totalSize,
      nextBackup,
    };
  }

  // Criar backup com nome personalizado
  async createNamedBackup(name: string): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${name}-${timestamp}`;
    await this.createBackup(filename);
  }

  // Verificar se há backups disponíveis
  hasBackups(): boolean {
    return this.getStoredBackups().length > 0;
  }
}

export const backupService = BackupService.getInstance();

// Hook para React
export function useBackup() {
  const service = backupService;

  return {
    createBackup: (filename?: string) => service.createBackup(filename),
    restoreBackup: (data: BackupData, options?: any) => service.restoreBackup(data, options),
    validateBackup: (data: any) => service.validateBackup(data),
    getSettings: () => service.getSettings(),
    updateSettings: (settings: Partial<BackupSettings>) => service.updateSettings(settings),
    getAutoBackups: () => service.getAutoBackups(),
    restoreAutoBackup: (id: string) => service.restoreAutoBackup(id),
    deleteAutoBackup: (id: string) => service.deleteAutoBackup(id),
    clearAutoBackups: () => service.clearAutoBackups(),
    getStats: () => service.getBackupStats(),
    createNamedBackup: (name: string) => service.createNamedBackup(name),
    hasBackups: () => service.hasBackups(),
  };
} 