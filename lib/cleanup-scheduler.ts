import { useNotesStore } from '@/lib/store';

// Scheduler para limpeza automática
class CleanupScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  // Executar limpeza a cada 24 horas
  private readonly CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 horas em ms

  start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    
    // Executar limpeza imediatamente
    this.runCleanup();
    
    // Agendar limpeza periódica
    this.intervalId = setInterval(() => {
      this.runCleanup();
    }, this.CLEANUP_INTERVAL);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  private async runCleanup() {
    try {
      const { cleanupOldTrash } = useNotesStore.getState();
      await cleanupOldTrash();
      console.log('Limpeza automática da lixeira executada com sucesso');
    } catch (error) {
      console.error('Erro na limpeza automática da lixeira:', error);
    }
  }

  // Executar limpeza manual
  async runManualCleanup() {
    await this.runCleanup();
  }
}

export const cleanupScheduler = new CleanupScheduler();

// Hook para usar o scheduler
export const useCleanupScheduler = () => {
  const startCleanup = () => cleanupScheduler.start();
  const stopCleanup = () => cleanupScheduler.stop();
  const runManualCleanup = () => cleanupScheduler.runManualCleanup();

  return {
    startCleanup,
    stopCleanup,
    runManualCleanup,
  };
}; 