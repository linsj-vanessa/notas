'use client';

import { useEffect } from 'react';
import { useSetupStore, type SetupConfiguration } from '@/lib/stores/setupStore';
import { useThemeStore } from '@/lib/theme-store';
import { useAppStoreManager } from '@/lib/stores/appStoreManager';
import { SetupModal } from '@/components/ui/setup-modal';

interface AppSetupProps {
  children: React.ReactNode;
}

export const AppSetup = ({ children }: AppSetupProps) => {
  const { isSetupModalOpen, initializeSetup } = useSetupStore();
  const { setTheme } = useThemeStore();
  const { setStorageType, loadNotes } = useAppStoreManager();
  
  // Aplicar configurações quando o setup for completado
  useEffect(() => {
    const handleSetupCompleted = async (event: Event) => {
      const customEvent = event as CustomEvent<SetupConfiguration>;
      const config = customEvent.detail;
      
      try {
        // Aplicar tema selecionado
        setTheme(config.selectedTheme);
        
        // Configurar o armazenamento baseado na escolha (agora é assíncrono)
        console.log('🔧 Configurando tipo de armazenamento:', config.storageType);
        await setStorageType(config.storageType);
        
        // Carregar notas após configurar o tipo de armazenamento
        console.log('📁 Carregando notas...');
        await loadNotes();
        
        console.log('✅ Configuração aplicada com sucesso:', config);
      } catch (error) {
        console.error('❌ Erro ao aplicar configuração:', error);
        
        // Se for erro de sistema de arquivos, mostrar mensagem mais amigável
        if (error instanceof Error && error.message.includes('diretório')) {
          console.error('Para usar o sistema de arquivos, você precisa selecionar uma pasta no modal de configuração.');
        }
      }
    };

    // Escutar evento de setup completado
    window.addEventListener('setup-completed', handleSetupCompleted);
    
    return () => {
      window.removeEventListener('setup-completed', handleSetupCompleted);
    };
  }, [setTheme, setStorageType, loadNotes]);

  // Inicializar setup ao montar o componente
  useEffect(() => {
    // Pequeno delay para garantir que todos os stores estejam hidratados
    const timer = setTimeout(async () => {
      try {
        initializeSetup();
        
        // Inicializar o AppStoreManager após o setup
        const { initialize } = useAppStoreManager.getState();
        await initialize();
      } catch (error) {
        console.error('Erro na inicialização:', error);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [initializeSetup]);

  return (
    <>
      {children}
      <SetupModal isOpen={isSetupModalOpen} />
    </>
  );
}; 