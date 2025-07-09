import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StorageType = 'indexeddb' | 'filesystem';

export interface SetupConfiguration {
  storageType: StorageType;
  selectedTheme: string;
  isConfigured: boolean;
  configuredAt: Date;
}

interface SetupState {
  // Estado da configuração
  configuration: SetupConfiguration | null;
  isFirstTime: boolean;
  isSetupModalOpen: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Configuração temporária (enquanto o usuário está configurando)
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
      
      // Finalizar configuração
      completeSetup: async () => {
        const { tempStorageType, tempTheme } = get();
        
        if (!tempStorageType || !tempTheme) {
          set({ error: 'Por favor, selecione o tipo de armazenamento e tema' });
          return;
        }
        
        try {
          set({ isLoading: true, error: null });
          
          const configuration: SetupConfiguration = {
            storageType: tempStorageType,
            selectedTheme: tempTheme,
            isConfigured: true,
            configuredAt: new Date(),
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
        const { configuration } = get();
        
        if (!configuration || !configuration.isConfigured) {
          set({ 
            isFirstTime: true,
            isSetupModalOpen: true 
          });
        } else {
          set({ 
            isFirstTime: false,
            isSetupModalOpen: false 
          });
          
          // Aplicar configurações salvas
          window.dispatchEvent(new CustomEvent('setup-completed', {
            detail: configuration
          }));
        }
      },
      
      // Limpar erro
      clearError: () => {
        set({ error: null });
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