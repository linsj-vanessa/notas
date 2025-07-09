import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StorageType = 'indexeddb' | 'filesystem';

// Informações persistidas sobre o diretório selecionado
interface DirectoryInfo {
  name: string; // Nome do diretório
  lastAccessed: Date; // Última vez que foi acessado
  wasAuthorized: boolean; // Se o usuário já autorizou este diretório antes
  needsReauthorization?: boolean; // Se precisa re-autorizar na próxima sessão
}

interface SetupConfiguration {
  storageType: StorageType;
  selectedTheme: string;
  isConfigured: boolean;
  isComplete: boolean; // Nova propriedade para indicar se está realmente funcional
  configuredAt: Date;
  lastValidation?: Date;
  
  // Informações sobre o diretório (para filesystem)
  directoryInfo?: DirectoryInfo;
}

interface SetupState {
  // Configuração salva
  configuration: SetupConfiguration | null;
  
  // Estado do setup
  isFirstTime: boolean;
  isSetupModalOpen: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Configuração temporária (durante o setup)
  tempStorageType: StorageType | null;
  tempTheme: string | null;
  
  // Actions
  setSetupModalOpen: (open: boolean) => void;
  setTempStorageType: (type: StorageType) => void;
  setTempTheme: (theme: string) => void;
  completeSetup: () => Promise<void>;
  resetSetup: () => void;
  initializeSetup: () => void;
  clearError: () => void;
  validateConfiguration: () => boolean;
  markConfigurationIncomplete: () => void;
  forceReconfigure: () => void;
  updateDirectoryInfo: (directoryHandle: FileSystemDirectoryHandle) => void;
  markDirectoryNeedsReauth: () => void;
  hasDirectoryInfo: () => boolean;
  getDirectoryInfo: () => DirectoryInfo | null;
}

export const useSetupStore = create<SetupState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      configuration: null,
      isFirstTime: true,
      isSetupModalOpen: false,
      isLoading: false,
      error: null,
      
      tempStorageType: null,
      tempTheme: null,
      
      // Abrir/fechar modal de configuração
      setSetupModalOpen: (open: boolean) => {
        set({ isSetupModalOpen: open });
      },
      
      // Configuração temporária
      setTempStorageType: (type: StorageType) => {
        set({ tempStorageType: type });
      },
      
      setTempTheme: (theme: string) => {
        set({ tempTheme: theme });
      },
      
      // Validar se configuração está realmente funcional
      validateConfiguration: () => {
        const { configuration } = get();
        
        if (!configuration || !configuration.isConfigured) {
          return false;
        }
        
        // Para filesystem, verificar se há diretório selecionado
        if (configuration.storageType === 'filesystem') {
          // Importar dinamicamente para evitar dependência circular
          const { useFileNotesStore } = require('./fileNotesStore');
          const { directoryHandle } = useFileNotesStore.getState();
          
          if (!directoryHandle) {
            console.warn('⚠️ Configuração incompleta: Filesystem sem diretório');
            return false;
          }
        }
        
        return true;
      },
      
      // Marcar configuração como incompleta
      markConfigurationIncomplete: () => {
        const { configuration } = get();
        if (configuration) {
          set({
            configuration: {
              ...configuration,
              isComplete: false,
              lastValidation: new Date()
            }
          });
        }
      },
      
      // Forçar reconfiguração
      forceReconfigure: () => {
        console.log('🔧 Forçando reconfiguração devido a problemas...');
        set({
          isSetupModalOpen: true,
          tempStorageType: null,
          tempTheme: null,
          error: 'Configuração anterior incompleta. Por favor, configure novamente.'
        });
      },
      
      // Finalizar configuração
      completeSetup: async () => {
        const { tempStorageType, tempTheme } = get();
        
        if (!tempStorageType || !tempTheme) {
          set({ error: 'Por favor, selecione o tipo de armazenamento e tema' });
          return;
        }
        
        try {
          set({ isLoading: true, error: null });
          
          // Validar se filesystem tem diretório (se aplicável)
          let isComplete = true;
          let directoryInfo: DirectoryInfo | undefined;
          
          if (tempStorageType === 'filesystem') {
            const { useFileNotesStore } = require('./fileNotesStore');
            const { directoryHandle } = useFileNotesStore.getState();
            isComplete = !!directoryHandle;
            
            if (directoryHandle) {
              directoryInfo = {
                name: directoryHandle.name,
                lastAccessed: new Date(),
                wasAuthorized: true,
                needsReauthorization: false,
              };
            } else {
              console.warn('⚠️ Setup completado mas filesystem sem diretório selecionado');
            }
          }
          
          const configuration: SetupConfiguration = {
            storageType: tempStorageType,
            selectedTheme: tempTheme,
            isConfigured: true,
            isComplete,
            configuredAt: new Date(),
            lastValidation: new Date(),
            directoryInfo,
          };
          
          set({
            configuration,
            isFirstTime: false,
            isSetupModalOpen: false,
            tempStorageType: null,
            tempTheme: null,
            isLoading: false,
          });
          
          // Aplicar configurações nos stores correspondentes
          window.dispatchEvent(new CustomEvent('setup-completed', {
            detail: configuration
          }));
          
        } catch (error) {
          set({
            error: `Erro ao salvar configuração: ${(error as Error).message}`,
            isLoading: false,
          });
        }
      },
      
      // Resetar configuração (para desenvolvimento/testes)
      resetSetup: () => {
        set({
          configuration: null,
          isFirstTime: true,
          isSetupModalOpen: false,
          tempStorageType: null,
          tempTheme: null,
          error: null,
        });
      },
      
      // Inicializar setup (chamado ao carregar a aplicação)
      initializeSetup: () => {
        const { configuration, validateConfiguration } = get();
        
        if (!configuration || !configuration.isConfigured) {
          set({ 
            isFirstTime: true,
            isSetupModalOpen: true 
          });
          return;
        }
        
        // Validar se a configuração ainda está funcional
        const isValid = validateConfiguration();
        
        if (!isValid) {
          console.warn('⚠️ Configuração existe mas não está funcional');
          
          // Se filesystem está configurado mas sem diretório, mostrar aviso
          if (configuration.storageType === 'filesystem') {
            set({
              isSetupModalOpen: false, // Não forçar modal, usar fallback
              error: 'Sistema de arquivos configurado mas sem pasta selecionada. Usando IndexedDB temporariamente.'
            });
            
            // Marcar configuração como incompleta
            get().markConfigurationIncomplete();
          } else {
            // Para outros problemas, forçar reconfiguração
            get().forceReconfigure();
            return;
          }
        }
        
        set({ 
          isFirstTime: false,
          isSetupModalOpen: false 
        });
        
        // Aplicar configurações salvas
        window.dispatchEvent(new CustomEvent('setup-completed', {
          detail: configuration
        }));
      },
      
      // Limpar erro
      clearError: () => {
        set({ error: null });
      },
      
      // Atualizar informações do diretório quando ele é selecionado/re-autorizado
      updateDirectoryInfo: (directoryHandle: FileSystemDirectoryHandle) => {
        const { configuration } = get();
        if (!configuration) return;
        
        const directoryInfo: DirectoryInfo = {
          name: directoryHandle.name,
          lastAccessed: new Date(),
          wasAuthorized: true,
          needsReauthorization: false,
        };
        
        set({
          configuration: {
            ...configuration,
            directoryInfo,
            isComplete: true,
            lastValidation: new Date(),
          }
        });
        
        console.log('📁 Informações do diretório atualizadas:', directoryInfo);
      },
      
      // Marcar que o diretório precisa de re-autorização
      markDirectoryNeedsReauth: () => {
        const { configuration } = get();
        if (!configuration || !configuration.directoryInfo) return;
        
        set({
          configuration: {
            ...configuration,
            directoryInfo: {
              ...configuration.directoryInfo,
              needsReauthorization: true,
            },
            isComplete: false,
          }
        });
        
        console.log('🔄 Diretório marcado para re-autorização');
      },
      
      // Verificar se tem informações de diretório
      hasDirectoryInfo: () => {
        const { configuration } = get();
        return !!(configuration?.directoryInfo?.wasAuthorized);
      },
      
      // Obter informações do diretório
      getDirectoryInfo: () => {
        const { configuration } = get();
        return configuration?.directoryInfo || null;
      },
    }),
    {
      name: 'setup-storage',
      partialize: (state) => ({
        configuration: state.configuration,
        isFirstTime: state.isFirstTime,
      }),
    }
  )
); 