'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IndexedDBMigrator, MigrationProgress, MigrationResult, MigrationOptions } from '@/lib/migration/IndexedDBMigrator';
import { getFileSystemService } from '@/lib/file-system/FileSystemService';

interface MigrationWizardProps {
  onMigrationComplete?: (result: MigrationResult) => void;
}

interface MigrationData {
  hasData: boolean;
  activeNotes: number;
  trashedNotes: number;
}

export default function MigrationWizard({ onMigrationComplete }: MigrationWizardProps) {
  const [step, setStep] = useState<'check' | 'configure' | 'migrate' | 'complete'>('check');
  const [migrationData, setMigrationData] = useState<MigrationData>({ hasData: false, activeNotes: 0, trashedNotes: 0 });
  const [progress, setProgress] = useState<MigrationProgress | null>(null);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Opções de migração
  const [options, setOptions] = useState<Partial<MigrationOptions>>({
    includeTrash: true,
    createBackup: true,
    overwriteExisting: false
  });

  const fileSystemService = getFileSystemService();
  const migrator = new IndexedDBMigrator(setProgress);

  useEffect(() => {
    checkMigrationData();
  }, []);

  const checkMigrationData = async () => {
    try {
      setIsLoading(true);
      const data = await migrator.hasDataToMigrate();
      setMigrationData(data);
      
      if (data.hasData) {
        setStep('configure');
      } else {
        setError('Nenhum dado encontrado para migração');
      }
    } catch (error) {
      setError(`Erro ao verificar dados: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const selectDirectory = async () => {
    try {
      setIsLoading(true);
      const handle = await fileSystemService.selectDirectory();
      setDirectoryHandle(handle);
    } catch (error) {
      setError(`Erro ao selecionar diretório: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const startMigration = async () => {
    if (!directoryHandle) {
      setError('Selecione um diretório primeiro');
      return;
    }

    try {
      setStep('migrate');
      setError(null);
      
      const migrationOptions: MigrationOptions = {
        ...options,
        directoryHandle
      } as MigrationOptions;

      const migrationResult = await migrator.migrate(migrationOptions);
      setResult(migrationResult);
      setStep('complete');
      
      onMigrationComplete?.(migrationResult);
    } catch (error) {
      setError(`Erro durante migração: ${(error as Error).message}`);
    }
  };

  const testMigration = async () => {
    if (!directoryHandle) {
      setError('Selecione um diretório primeiro');
      return;
    }

    try {
      setIsLoading(true);
      const testResult = await migrator.testMigration(directoryHandle, 3);
      
      if (testResult.success) {
        alert(`Teste de migração bem-sucedido! ${testResult.migratedNotes} notas foram migradas para o diretório de teste.`);
      } else {
        alert(`Teste de migração falhou: ${testResult.errors.join(', ')}`);
      }
    } catch (error) {
      setError(`Erro no teste: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressPercentage = () => {
    if (!progress || progress.total === 0) return 0;
    return Math.round((progress.processed / progress.total) * 100);
  };

  const getStageText = (stage: MigrationProgress['stage']) => {
    switch (stage) {
      case 'preparing': return 'Preparando migração...';
      case 'backing-up': return 'Criando backup...';
      case 'migrating': return 'Migrando dados...';
      case 'validating': return 'Validando dados...';
      case 'completed': return 'Migração concluída!';
      case 'error': return 'Erro na migração';
      default: return 'Processando...';
    }
  };

  const formatTime = (totalNotes: number) => {
    const estimate = migrator.estimateMigrationTime(totalNotes);
    if (estimate.estimatedMinutes > 0) {
      return `${estimate.estimatedMinutes}m ${estimate.estimatedSeconds}s`;
    }
    return `${estimate.estimatedSeconds}s`;
  };

  if (step === 'check') {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Verificando Dados</h2>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Verificando dados do IndexedDB...</span>
          </div>
        ) : error ? (
          <div className="text-red-600 p-4 bg-red-50 rounded">
            <p>{error}</p>
            <Button onClick={checkMigrationData} className="mt-2">
              Tentar Novamente
            </Button>
          </div>
        ) : null}
      </Card>
    );
  }

  if (step === 'configure') {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Configurar Migração</h2>
        
        {/* Informações sobre os dados */}
        <div className="mb-6 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">Dados Encontrados:</h3>
          <ul className="space-y-1">
            <li>• {migrationData.activeNotes} notas ativas</li>
            <li>• {migrationData.trashedNotes} notas na lixeira</li>
            <li>• Tempo estimado: {formatTime(migrationData.activeNotes + migrationData.trashedNotes)}</li>
          </ul>
        </div>

        {/* Seleção de diretório */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Diretório de Destino:</h3>
          <div className="flex items-center gap-2">
            <Button onClick={selectDirectory} disabled={isLoading}>
              {directoryHandle ? 'Alterar Diretório' : 'Selecionar Diretório'}
            </Button>
            {directoryHandle && (
              <span className="text-sm text-gray-600">
                Selecionado: {directoryHandle.name}
              </span>
            )}
          </div>
        </div>

        {/* Opções de migração */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Opções:</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeTrash}
                onChange={(e) => setOptions({ ...options, includeTrash: e.target.checked })}
                className="mr-2"
              />
              Incluir lixeira na migração
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.createBackup}
                onChange={(e) => setOptions({ ...options, createBackup: e.target.checked })}
                className="mr-2"
              />
              Criar backup antes da migração
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.overwriteExisting}
                onChange={(e) => setOptions({ ...options, overwriteExisting: e.target.checked })}
                className="mr-2"
              />
              Sobrescrever arquivos existentes
            </label>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2">
          <Button
            onClick={startMigration}
            disabled={!directoryHandle || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Iniciar Migração
          </Button>
          <Button
            onClick={testMigration}
            disabled={!directoryHandle || isLoading}
            variant="outline"
          >
            Testar Migração
          </Button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded">
            {error}
          </div>
        )}
      </Card>
    );
  }

  if (step === 'migrate') {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Migração em Andamento</h2>
        
        {progress && (
          <div className="space-y-4">
            {/* Barra de progresso */}
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{getStageText(progress.stage)}</span>
                <span>{getProgressPercentage()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>

            {/* Detalhes do progresso */}
            <div className="text-sm text-gray-600">
              <p>Processados: {progress.processed} de {progress.total}</p>
              {progress.currentItem && (
                <p className="truncate">Atual: {progress.currentItem}</p>
              )}
            </div>

            {/* Animação de loading */}
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          </div>
        )}
      </Card>
    );
  }

  if (step === 'complete') {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          {result?.success ? '✅ Migração Concluída!' : '❌ Migração com Erros'}
        </h2>
        
        {result && (
          <div className="space-y-4">
            {/* Resumo dos resultados */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">{result.migratedNotes}</div>
                <div className="text-sm text-gray-600">Notas migradas</div>
              </div>
              <div className="p-3 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600">{result.migratedTrash}</div>
                <div className="text-sm text-gray-600">Lixeira migrada</div>
              </div>
            </div>

            {/* Backup info */}
            {result.backupPath && (
              <div className="p-3 bg-yellow-50 rounded">
                <p className="text-sm">
                  <strong>Backup criado:</strong> {result.backupPath}
                </p>
              </div>
            )}

            {/* Erros */}
            {result.errors.length > 0 && (
              <div className="p-3 bg-red-50 rounded">
                <h4 className="font-semibold text-red-800 mb-2">Erros encontrados:</h4>
                <ul className="text-sm text-red-600 space-y-1">
                  {result.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setStep('check');
                  setProgress(null);
                  setResult(null);
                  setError(null);
                }}
                variant="outline"
              >
                Nova Migração
              </Button>
              
              {result.success && (
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Usar Sistema de Arquivos
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    );
  }

  return null;
} 