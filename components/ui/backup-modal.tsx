'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Upload, HardDrive, Clock, Trash2, RotateCcw, Shield, AlertTriangle } from 'lucide-react';
import { useBackup, BackupData } from '@/lib/backup-service';
import { useNotesStore } from '@/lib/store';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BackupSettings {
  autoBackupEnabled: boolean;
  backupInterval: number;
  maxBackups: number;
  lastBackup?: string;
}

export default function BackupModal({ isOpen, onClose }: BackupModalProps) {
  const backup = useBackup();
  const { loadNotes } = useNotesStore();
  const [activeTab, setActiveTab] = useState<'manual' | 'auto' | 'restore'>('manual');
  const [settings, setSettings] = useState<BackupSettings>({
    autoBackupEnabled: true,
    backupInterval: 7,
    maxBackups: 5,
  });
  const [autoBackups, setAutoBackups] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    const currentSettings = backup.getSettings();
    const currentAutoBackups = backup.getAutoBackups();
    const currentStats = backup.getStats();
    
    setSettings(currentSettings);
    setAutoBackups(currentAutoBackups);
    setStats(currentStats);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCreateBackup = async () => {
    setIsLoading(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      await backup.createBackup(`backup-manual-${timestamp}`);
      showMessage('success', 'Backup criado e baixado com sucesso!');
    } catch (error) {
      showMessage('error', 'Erro ao criar backup: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNamedBackup = async () => {
    const name = prompt('Nome do backup:', 'meu-backup');
    if (name) {
      setIsLoading(true);
      try {
        await backup.createNamedBackup(name);
        showMessage('success', `Backup "${name}" criado e baixado com sucesso!`);
      } catch (error) {
        showMessage('error', 'Erro ao criar backup: ' + (error as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!backup.validateBackup(data)) {
        throw new Error('Arquivo de backup inválido');
      }

      const replaceAll = confirm(
        'Deseja substituir todas as notas existentes?\n\n' +
        '• Sim: Todas as notas atuais serão removidas e substituídas\n' +
        '• Não: As notas do backup serão mescladas com as existentes'
      );

      const includeDeleted = confirm('Incluir notas deletadas do backup?');

      await backup.restoreBackup(data, { replaceAll, includeDeleted });
      await loadNotes();
      loadData();
      
      showMessage('success', 'Backup restaurado com sucesso!');
    } catch (error) {
      showMessage('error', 'Erro ao restaurar backup: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
      // Limpar input
      event.target.value = '';
    }
  };

  const handleRestoreAutoBackup = async (backupId: string) => {
    if (confirm('Deseja restaurar este backup? Todas as notas atuais serão substituídas.')) {
      setIsLoading(true);
      try {
        await backup.restoreAutoBackup(backupId);
        await loadNotes();
        loadData();
        showMessage('success', 'Backup automático restaurado com sucesso!');
      } catch (error) {
        showMessage('error', 'Erro ao restaurar backup: ' + (error as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteAutoBackup = (backupId: string) => {
    if (confirm('Deseja deletar este backup automático?')) {
      backup.deleteAutoBackup(backupId);
      loadData();
      showMessage('success', 'Backup deletado com sucesso!');
    }
  };

  const handleSettingsUpdate = () => {
    backup.updateSettings(settings);
    loadData();
    showMessage('success', 'Configurações salvas com sucesso!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatSize = (bytes: number) => {
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Gerenciar Backups
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Mensagem de feedback */}
        {message && (
          <div className={`mx-6 mt-4 p-3 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'manual', name: 'Backup Manual', icon: Download },
              { id: 'auto', name: 'Backup Automático', icon: Clock },
              { id: 'restore', name: 'Restaurar', icon: RotateCcw },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab: Backup Manual */}
          {activeTab === 'manual' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Criar Backup Manual
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Faça download de todas as suas notas em um arquivo seguro
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleCreateBackup}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors disabled:opacity-50"
                  >
                    <Download className="h-5 w-5" />
                    <span>Backup Rápido</span>
                  </button>
                  
                  <button
                    onClick={handleCreateNamedBackup}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors disabled:opacity-50"
                  >
                    <HardDrive className="h-5 w-5" />
                    <span>Backup Nomeado</span>
                  </button>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Estatísticas</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Último Backup:</span>
                    <div className="font-medium">
                      {stats.lastBackup ? formatDate(stats.lastBackup) : 'Nunca'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Próximo Backup:</span>
                    <div className="font-medium">
                      {stats.nextBackup ? formatDate(stats.nextBackup) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Backups Automáticos:</span>
                    <div className="font-medium">{stats.autoBackupsCount || 0}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Espaço Total:</span>
                    <div className="font-medium">{formatSize(stats.totalSize || 0)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Backup Automático */}
          {activeTab === 'auto' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Configurações Automáticas
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Configure backups automáticos para proteção contínua
                </p>
              </div>

              {/* Toggle de ativação */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Backup Automático
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Criar backups automaticamente em intervalos regulares
                  </p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, autoBackupEnabled: !prev.autoBackupEnabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    settings.autoBackupEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      settings.autoBackupEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {settings.autoBackupEnabled && (
                <>
                  {/* Intervalo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Intervalo de Backup
                    </label>
                    <select
                      value={settings.backupInterval}
                      onChange={(e) => setSettings(prev => ({ ...prev, backupInterval: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value={1}>Diário</option>
                      <option value={3}>A cada 3 dias</option>
                      <option value={7}>Semanal</option>
                      <option value={14}>Quinzenal</option>
                      <option value={30}>Mensal</option>
                    </select>
                  </div>

                  {/* Máximo de backups */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Máximo de Backups Automáticos
                    </label>
                    <select
                      value={settings.maxBackups}
                      onChange={(e) => setSettings(prev => ({ ...prev, maxBackups: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value={3}>3 backups</option>
                      <option value={5}>5 backups</option>
                      <option value={10}>10 backups</option>
                      <option value={20}>20 backups</option>
                    </select>
                  </div>
                </>
              )}

              <button
                onClick={handleSettingsUpdate}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Salvar Configurações
              </button>

              {/* Lista de backups automáticos */}
              {autoBackups.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Backups Automáticos ({autoBackups.length})
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {autoBackups.map((autoBackup) => (
                      <div
                        key={autoBackup.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDate(autoBackup.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {autoBackup.notesCount} notas • {formatSize(autoBackup.size)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRestoreAutoBackup(autoBackup.id)}
                            disabled={isLoading}
                            className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors disabled:opacity-50"
                            title="Restaurar backup"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAutoBackup(autoBackup.id)}
                            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Deletar backup"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Restaurar */}
          {activeTab === 'restore' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Restaurar Backup
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Carregue um arquivo de backup para restaurar suas notas
                </p>
              </div>

              {/* Upload de arquivo */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Selecione um arquivo de backup (.json)
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  className="hidden"
                  id="backup-file"
                />
                <label
                  htmlFor="backup-file"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Escolher Arquivo
                </label>
              </div>

              {/* Aviso */}
              <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Importante
                  </div>
                  <div className="text-yellow-700 dark:text-yellow-300">
                    Ao restaurar um backup, você pode escolher:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Substituir todas as notas existentes</li>
                      <li>Mesclar com as notas atuais</li>
                      <li>Incluir ou excluir notas deletadas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Processando...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 