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
    const handleSetupCompleted = (event: CustomEvent<SetupConfiguration>) => {
      const config = event.detail;
      
      // Aplicar tema selecionado
      setTheme(config.selectedTheme);
      
      // Configurar o armazenamento baseado na escolha
      setStorageType(config.storageType);
      
      // Carregar notas após configurar o tipo de armazenamento
      loadNotes().catch(console.error);
      
      console.log('✅ Configuração aplicada:', config);
    };

    // Escutar evento de setup completado
    window.addEventListener('setup-completed', handleSetupCompleted as EventListener);
    
    return () => {
      window.removeEventListener('setup-completed', handleSetupCompleted as EventListener);
    };
  }, [setTheme]);

  // Inicializar setup ao montar o componente
  useEffect(() => {
    // Pequeno delay para garantir que todos os stores estejam hidratados
    const timer = setTimeout(() => {
      initializeSetup();
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