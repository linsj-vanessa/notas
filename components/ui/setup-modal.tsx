'use client';

import { useState, useEffect } from 'react';
import { X, Database, HardDrive, Palette, Check, Folder } from 'lucide-react';
import { useSetupStore, type StorageType } from '@/lib/stores/setupStore';
import { useFileNotesStore } from '@/lib/stores/fileNotesStore';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from './button';
import { Card } from './card';

interface SetupModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface StorageOption {
  id: StorageType;
  name: string;
  description: string;
  icon: typeof Database;
  pros: string[];
  cons: string[];
}

const storageOptions: StorageOption[] = [
  {
    id: 'indexeddb',
    name: 'Armazenamento do Navegador',
    description: 'Suas notas ficam armazenadas no navegador',
    icon: Database,
    pros: [
      'Configuração automática',
      'Sincronização instantânea',
      'Não precisa permissões'
    ],
    cons: [
      'Limitado ao navegador',
      'Pode ser perdido ao limpar dados',
      'Não é portável'
    ]
  },
  {
    id: 'filesystem',
    name: 'Sistema de Arquivos Local',
    description: 'Suas notas ficam salvas em arquivos .md no seu computador',
    icon: HardDrive,
    pros: [
      'Controle total dos arquivos',
      'Compatível com outros editores',
      'Backup manual fácil'
    ],
    cons: [
      'Requer permissão do navegador',
      'Apenas navegadores modernos',
      'Configuração manual necessária'
    ]
  }
];

export const SetupModal = ({ isOpen, onClose }: SetupModalProps) => {
  const { 
    tempStorageType, 
    tempTheme, 
    isLoading, 
    error,
    setTempStorageType, 
    setTempTheme, 
    completeSetup,
    clearError 
  } = useSetupStore();
  
  const { setDirectoryHandle } = useFileNotesStore();
  const { availableThemes } = useTheme();
  const [step, setStep] = useState<'storage' | 'directory' | 'theme' | 'confirm'>('storage');
  const [selectedDirectory, setSelectedDirectory] = useState<FileSystemDirectoryHandle | null>(null);
  const [directoryError, setDirectoryError] = useState<string | null>(null);

  // Limpar erro ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      clearError();
      setDirectoryError(null);
    }
  }, [isOpen, clearError]);

  const handleStorageSelect = (type: StorageType) => {
    setTempStorageType(type);
    
    // Se for IndexedDB, pular a seleção de diretório
    if (type === 'indexeddb') {
      setStep('theme');
    } else {
      setStep('directory');
    }
  };

  const handleDirectorySelect = async () => {
    try {
      setDirectoryError(null);
      
      // Verificar se o File System Access API está disponível
      if (!('showDirectoryPicker' in window)) {
        setDirectoryError('Seu navegador não suporta o File System Access API. Tente usar Chrome ou Edge.');
        return;
      }
      
      // Solicitar seleção de diretório
      const directoryHandle = await (window as typeof window & {
        showDirectoryPicker: (options?: { mode?: string }) => Promise<FileSystemDirectoryHandle>
      }).showDirectoryPicker({
        mode: 'readwrite',
      });
      
      setSelectedDirectory(directoryHandle);
      setDirectoryHandle(directoryHandle);
      setStep('theme');
      
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        setDirectoryError('Seleção de pasta cancelada. Por favor, selecione uma pasta para continuar.');
      } else {
        setDirectoryError(`Erro ao acessar o diretório: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }
  };

  const handleThemeSelect = (themeId: string) => {
    setTempTheme(themeId);
    setStep('confirm');
  };

  const handleComplete = async () => {
    await completeSetup();
    if (onClose) {
      onClose();
    }
  };

  const handleBack = () => {
    if (step === 'directory') {
      setStep('storage');
    } else if (step === 'theme') {
      if (tempStorageType === 'filesystem') {
        setStep('directory');
      } else {
        setStep('storage');
      }
    } else if (step === 'confirm') {
      setStep('theme');
    }
  };

  if (!isOpen) return null;

  const getStepNumber = () => {
    switch (step) {
      case 'storage': return 1;
      case 'directory': return 2;
      case 'theme': return tempStorageType === 'filesystem' ? 3 : 2;
      case 'confirm': return tempStorageType === 'filesystem' ? 4 : 3;
      default: return 1;
    }
  };

  const getTotalSteps = () => {
    return tempStorageType === 'filesystem' ? 4 : 3;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Bem-vindo ao Notas App! 🎉
            </h2>
            <p className="text-muted-foreground mt-1">
              Vamos configurar seu editor de notas em alguns passos simples
            </p>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Progress */}
        <div className="px-6 py-4 bg-muted/30">
          <div className="flex items-center space-x-2">
            {/* Step 1: Storage */}
            <div className={`flex items-center space-x-2 ${step === 'storage' ? 'text-primary' : tempStorageType ? 'text-green-600' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                tempStorageType ? 'bg-green-600 text-white' : step === 'storage' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {tempStorageType ? <Check className="w-3 h-3" /> : '1'}
              </div>
              <span className="text-sm font-medium">Armazenamento</span>
            </div>
            
            <div className="flex-1 h-px bg-border"></div>
            
            {/* Step 2: Directory (only for filesystem) */}
            {tempStorageType === 'filesystem' && (
              <>
                <div className={`flex items-center space-x-2 ${step === 'directory' ? 'text-primary' : selectedDirectory ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    selectedDirectory ? 'bg-green-600 text-white' : step === 'directory' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {selectedDirectory ? <Check className="w-3 h-3" /> : '2'}
                  </div>
                  <span className="text-sm font-medium">Pasta</span>
                </div>
                
                <div className="flex-1 h-px bg-border"></div>
              </>
            )}
            
            {/* Step: Theme */}
            <div className={`flex items-center space-x-2 ${step === 'theme' ? 'text-primary' : tempTheme ? 'text-green-600' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                tempTheme ? 'bg-green-600 text-white' : step === 'theme' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {tempTheme ? <Check className="w-3 h-3" /> : getStepNumber() === getTotalSteps() - 1 ? getStepNumber() : tempStorageType === 'filesystem' ? '3' : '2'}
              </div>
              <span className="text-sm font-medium">Tema</span>
            </div>
            
            <div className="flex-1 h-px bg-border"></div>
            
            {/* Step: Confirm */}
            <div className={`flex items-center space-x-2 ${step === 'confirm' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'confirm' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {getTotalSteps()}
              </div>
              <span className="text-sm font-medium">Confirmar</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {(error || directoryError) && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">{error || directoryError}</p>
            </div>
          )}

          {/* Step 1: Storage Selection */}
          {step === 'storage' && (
            <div className="space-y-6">
              <div className="text-center">
                <Database className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Como você quer armazenar suas notas?
                </h3>
                <p className="text-muted-foreground">
                  Escolha o método de armazenamento que melhor se adapta ao seu fluxo de trabalho
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {storageOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Card
                      key={option.id}
                      className={`p-6 cursor-pointer transition-all hover:border-primary/50 ${
                        tempStorageType === option.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => handleStorageSelect(option.id)}
                    >
                      <div className="flex items-start space-x-4">
                        <Icon className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-2">{option.name}</h4>
                          <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
                          
                          <div className="space-y-3">
                            <div>
                              <h5 className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">VANTAGENS</h5>
                              <ul className="text-xs space-y-1">
                                {option.pros.map((pro, index) => (
                                  <li key={index} className="flex items-center text-muted-foreground">
                                    <Check className="w-3 h-3 text-green-600 mr-2 flex-shrink-0" />
                                    {pro}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h5 className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">CONSIDERAÇÕES</h5>
                              <ul className="text-xs space-y-1">
                                {option.cons.map((con, index) => (
                                  <li key={index} className="flex items-center text-muted-foreground">
                                    <div className="w-1 h-1 bg-amber-500 rounded-full mr-2 flex-shrink-0 mt-1.5" />
                                    {con}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Directory Selection (only for filesystem) */}
          {step === 'directory' && (
            <div className="space-y-6">
              <div className="text-center">
                <Folder className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Selecione uma pasta para suas notas
                </h3>
                <p className="text-muted-foreground">
                  Escolha onde suas notas serão salvas no seu computador
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <Card className="p-6 text-center">
                  {selectedDirectory ? (
                    <div className="space-y-4">
                      <Check className="w-12 h-12 text-green-600 mx-auto" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Pasta selecionada</h4>
                        <p className="text-sm text-muted-foreground break-all">
                          {selectedDirectory.name}
                        </p>
                      </div>
                      <Button variant="outline" onClick={handleDirectorySelect}>
                        Alterar pasta
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Folder className="w-12 h-12 text-muted-foreground mx-auto" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Nenhuma pasta selecionada</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Selecione uma pasta onde suas notas serão salvas como arquivos .md
                        </p>
                      </div>
                      <Button onClick={handleDirectorySelect}>
                        <Folder className="w-4 h-4 mr-2" />
                        Selecionar pasta
                      </Button>
                    </div>
                  )}
                </Card>
                
                <div className="mt-4 text-xs text-muted-foreground text-center">
                  💡 A pasta será organizada automaticamente com subpastas para notas ativas e lixeira
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Theme Selection */}
          {step === 'theme' && (
            <div className="space-y-6">
              <div className="text-center">
                <Palette className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Escolha seu tema favorito
                </h3>
                <p className="text-muted-foreground">
                  Selecione o tema que mais combina com seu estilo de trabalho
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {availableThemes.map((theme) => (
                  <Card
                    key={theme.id}
                    className={`p-4 cursor-pointer transition-all hover:border-primary/50 ${
                      tempTheme === theme.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleThemeSelect(theme.id)}
                  >
                    <div className="text-center">
                      <div 
                        className="w-16 h-16 rounded-lg mx-auto mb-3 border-2 border-border"
                        style={{
                          background: `hsl(${theme.colors.background})`,
                          borderColor: `hsl(${theme.colors.border})`,
                        }}
                      >
                        <div 
                          className="w-full h-4 rounded-t-md"
                          style={{ background: `hsl(${theme.colors.primary})` }}
                        />
                        <div className="p-2 space-y-1">
                          <div 
                            className="h-1.5 rounded"
                            style={{ background: `hsl(${theme.colors.foreground})` }}
                          />
                          <div 
                            className="h-1 rounded w-3/4"
                            style={{ background: `hsl(${theme.colors.muted})` }}
                          />
                        </div>
                      </div>
                      <h4 className="font-medium text-sm text-foreground">{theme.name}</h4>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="text-center">
                <Check className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Confirme suas escolhas
                </h3>
                <p className="text-muted-foreground">
                  Revise suas configurações antes de finalizar
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <Card className="p-4">
                  <h4 className="font-semibold text-foreground mb-2">Armazenamento</h4>
                  <p className="text-sm text-muted-foreground">
                    {storageOptions.find(opt => opt.id === tempStorageType)?.name}
                  </p>
                </Card>

                {tempStorageType === 'filesystem' && (
                  <Card className="p-4">
                    <h4 className="font-semibold text-foreground mb-2">Pasta</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedDirectory ? selectedDirectory.name : 'Nenhuma pasta selecionada'}
                    </p>
                  </Card>
                )}

                <Card className="p-4">
                  <h4 className="font-semibold text-foreground mb-2">Tema</h4>
                  <p className="text-sm text-muted-foreground">
                    {availableThemes.find(theme => theme.id === tempTheme)?.name}
                  </p>
                </Card>

                <div className="text-xs text-muted-foreground text-center mt-6">
                  💡 Você pode alterar essas configurações a qualquer momento nas configurações do app
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
          <div>
            {step !== 'storage' && (
              <Button variant="ghost" onClick={handleBack}>
                Voltar
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {step === 'directory' && (
              <Button 
                onClick={() => setStep('theme')}
                disabled={!selectedDirectory}
                className="min-w-[120px]"
              >
                Continuar
              </Button>
            )}
            {step === 'confirm' && (
              <Button 
                onClick={handleComplete}
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? 'Configurando...' : 'Finalizar'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 