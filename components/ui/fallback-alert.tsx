'use client';

import { useState, useEffect } from 'react';
import { useAppStoreManager } from '@/lib/stores/appStoreManager';
import { useSetupStore } from '@/lib/stores/setupStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, Settings, RefreshCw } from 'lucide-react';

export function FallbackAlert() {
  const { currentStorageType, effectiveStorageType, lastError, clearError } = useAppStoreManager();
  const { setSetupModalOpen, clearError: clearSetupError } = useSetupStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Mostrar alerta quando há divergência entre configurado e efetivo
    const shouldShow = (
      !isDismissed &&
      currentStorageType === 'filesystem' && 
      effectiveStorageType === 'indexeddb'
    );
    
    setIsVisible(shouldShow);
  }, [currentStorageType, effectiveStorageType, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    clearError();
    clearSetupError();
  };

  const handleReconfigure = () => {
    setSetupModalOpen(true);
    handleDismiss();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-96">
      <Card className="bg-yellow-50 border-yellow-200 shadow-lg">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Sistema de Arquivos Indisponível
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  O sistema de arquivos está configurado, mas nenhuma pasta foi selecionada. 
                  Estamos usando o IndexedDB temporariamente.
                </p>
                {lastError && (
                  <p className="mt-1 text-xs text-yellow-600">
                    Erro: {lastError}
                  </p>
                )}
              </div>
              <div className="mt-4 flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReconfigure}
                  className="bg-white hover:bg-yellow-50 border-yellow-300 text-yellow-800"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Configurar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefresh}
                  className="bg-white hover:bg-yellow-50 border-yellow-300 text-yellow-800"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Recarregar
                </Button>
              </div>
            </div>
            <div className="ml-3 flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 