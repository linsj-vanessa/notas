interface NotificationSettings {
  enabled: boolean;
  time: string; // formato HH:MM
  frequency: 'daily' | 'custom'; // daily ou custom
  customDays: number[]; // 0 = domingo, 1 = segunda, etc.
  message: string;
  reminderInterval: number; // em horas
}

interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
}

export class NotificationService {
  private static instance: NotificationService;
  private settings: NotificationSettings;
  private timeoutIds: Set<number> = new Set();

  private constructor() {
    this.settings = this.loadSettings();
    this.initializeNotifications();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Carregar configurações do localStorage
  private loadSettings(): NotificationSettings {
    if (typeof window === 'undefined') {
      return this.getDefaultSettings();
    }

    const stored = localStorage.getItem('notificationSettings');
    if (stored) {
      return { ...this.getDefaultSettings(), ...JSON.parse(stored) };
    }
    return this.getDefaultSettings();
  }

  // Configurações padrão
  private getDefaultSettings(): NotificationSettings {
    return {
      enabled: false,
      time: '18:00',
      frequency: 'daily',
      customDays: [1, 2, 3, 4, 5], // Segunda a sexta
      message: 'Que tal escrever algumas palavras hoje? ✍️',
      reminderInterval: 2, // 2 horas
    };
  }

  // Salvar configurações
  private saveSettings(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
    }
  }

  // Inicializar sistema de notificações
  private async initializeNotifications(): Promise<void> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Notificações não são suportadas neste navegador');
      return;
    }

    if (this.settings.enabled) {
      await this.requestPermission();
      this.scheduleNotifications();
    }
  }

  // Solicitar permissão para notificações
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // Verificar se as notificações estão ativadas
  isNotificationSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  // Verificar permissão
  hasPermission(): boolean {
    return this.isNotificationSupported() && Notification.permission === 'granted';
  }

  // Agendar notificações
  private scheduleNotifications(): void {
    this.clearScheduledNotifications();

    if (!this.settings.enabled || !this.hasPermission()) {
      return;
    }

    const now = new Date();
    const today = now.getDay();

    // Verificar se deve notificar hoje
    const shouldNotifyToday = this.settings.frequency === 'daily' || 
      this.settings.customDays.includes(today);

    if (shouldNotifyToday) {
      this.scheduleNextNotification();
    }

    // Agendar para os próximos dias
    this.scheduleWeeklyNotifications();
  }

  // Agendar próxima notificação para hoje
  private scheduleNextNotification(): void {
    const now = new Date();
    const [hours, minutes] = this.settings.time.split(':').map(Number);
    
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);

    // Se já passou da hora hoje, agendar para amanhã
    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const delay = targetTime.getTime() - now.getTime();
    
    const timeoutId = window.setTimeout(() => {
      this.showWritingReminder();
      this.scheduleReminderInterval();
    }, delay);

    this.timeoutIds.add(timeoutId);
  }

  // Agendar lembretes com intervalo
  private scheduleReminderInterval(): void {
    const intervalMs = this.settings.reminderInterval * 60 * 60 * 1000; // Converter horas para ms
    
    const timeoutId = window.setTimeout(() => {
      // Verificar se ainda não escreveu hoje
      if (this.shouldSendReminder()) {
        this.showWritingReminder(true);
        this.scheduleReminderInterval(); // Reagendar
      }
    }, intervalMs);

    this.timeoutIds.add(timeoutId);
  }

  // Agendar notificações semanais
  private scheduleWeeklyNotifications(): void {
    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      const futureDay = futureDate.getDay();

      const shouldNotify = this.settings.frequency === 'daily' || 
        this.settings.customDays.includes(futureDay);

      if (shouldNotify) {
        const [hours, minutes] = this.settings.time.split(':').map(Number);
        futureDate.setHours(hours, minutes, 0, 0);

        const delay = futureDate.getTime() - Date.now();
        
        const timeoutId = window.setTimeout(() => {
          this.showWritingReminder();
        }, delay);

        this.timeoutIds.add(timeoutId);
      }
    }
  }

  // Limpar notificações agendadas
  private clearScheduledNotifications(): void {
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds.clear();
  }

  // Verificar se deve enviar lembrete
  private shouldSendReminder(): boolean {
    if (typeof window === 'undefined') return false;

    const today = new Date().toDateString();
    const lastActivity = localStorage.getItem('lastWritingActivity');
    
    // Se não há registro de última atividade ou foi em outro dia
    return !lastActivity || new Date(lastActivity).toDateString() !== today;
  }

  // Registrar atividade de escrita
  registerWritingActivity(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastWritingActivity', new Date().toISOString());
    }
  }

  // Mostrar lembrete de escrita
  private showWritingReminder(isReminder: boolean = false): void {
    if (!this.hasPermission()) return;

    const messages = [
      'Que tal escrever algumas palavras hoje? ✍️',
      'Sua criatividade está esperando por você! 🌟',
      'Um pequeno passo na escrita é um grande passo no progresso! 📝',
      'Suas ideias merecem ser registradas! 💡',
      'Que história você vai contar hoje? 📚',
    ];

    const reminderMessages = [
      'Ainda não escreveu hoje? Que tal começar agora? ⏰',
      'Lembrete amigável: suas palavras estão esperando! 🔔',
      'Alguns minutos de escrita podem fazer a diferença! ⏱️',
    ];

    const messageList = isReminder ? reminderMessages : messages;
    const message = messageList[Math.floor(Math.random() * messageList.length)];

    const notification = new Notification('📝 Lembrete de Escrita', {
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'writing-reminder',
      requireInteraction: false,
      data: {
        timestamp: Date.now(),
        type: isReminder ? 'reminder' : 'scheduled'
      }
    });

    // Auto-fechar após 10 segundos
    setTimeout(() => {
      notification.close();
    }, 10000);

    // Click handler
    notification.onclick = () => {
      window.focus();
      window.location.href = '/'; // Redirecionar para a página de notas
      notification.close();
    };
  }

  // Mostrar notificação personalizada
  showNotification(data: NotificationData): void {
    if (!this.hasPermission()) return;

    const notification = new Notification(data.title, {
      body: data.body,
      icon: data.icon || '/favicon.ico',
      badge: data.badge || '/favicon.ico',
      tag: 'custom-notification',
      data: data.data
    });

    setTimeout(() => {
      notification.close();
    }, 8000);
  }

  // Atualizar configurações
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    
    // Reagendar notificações
    if (this.settings.enabled) {
      this.scheduleNotifications();
    } else {
      this.clearScheduledNotifications();
    }
  }

  // Obter configurações atuais
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Ativar notificações
  async enableNotifications(): Promise<boolean> {
    const hasPermission = await this.requestPermission();
    if (hasPermission) {
      this.updateSettings({ enabled: true });
      return true;
    }
    return false;
  }

  // Desativar notificações
  disableNotifications(): void {
    this.updateSettings({ enabled: false });
  }

  // Testar notificação
  testNotification(): void {
    this.showNotification({
      title: '🧪 Teste de Notificação',
      body: 'Se você está vendo isso, as notificações estão funcionando!'
    });
  }

  // Notificação de conquista desbloqueada
  showAchievementNotification(achievement: { title: string; description: string; icon: string }): void {
    this.showNotification({
      title: `🏆 Conquista Desbloqueada: ${achievement.title}`,
      body: achievement.description,
      data: { type: 'achievement', achievement }
    });
  }

  // Notificação de meta atingida
  showGoalAchievedNotification(wordsWritten: number, goal: number): void {
    this.showNotification({
      title: '🎯 Meta Diária Atingida!',
      body: `Parabéns! Você escreveu ${wordsWritten} palavras hoje. Meta: ${goal} palavras.`,
      data: { type: 'goal-achieved', wordsWritten, goal }
    });
  }

  // Notificação de streak
  showStreakNotification(streak: number): void {
    const messages = {
      3: 'Ótimo início! 3 dias consecutivos! 🔥',
      7: 'Uma semana inteira! Você está no fogo! 🔥🔥',
      30: 'Um mês incrível! Você é imparável! 🔥🔥🔥',
      100: 'CEM DIAS! Você é uma lenda da escrita! 🔥🔥🔥🔥'
    };

    const message = messages[streak as keyof typeof messages] || 
      `${streak} dias consecutivos de escrita! Continue assim! 🔥`;

    this.showNotification({
      title: '🔥 Streak de Escrita!',
      body: message,
      data: { type: 'streak', streak }
    });
  }

  // Cleanup na destruição
  destroy(): void {
    this.clearScheduledNotifications();
  }
}

export const notificationService = NotificationService.getInstance();

// Hook para React
export function useNotifications() {
  const service = notificationService;

  return {
    requestPermission: () => service.requestPermission(),
    isSupported: () => service.isNotificationSupported(),
    hasPermission: () => service.hasPermission(),
    getSettings: () => service.getSettings(),
    updateSettings: (settings: Partial<NotificationSettings>) => service.updateSettings(settings),
    enableNotifications: () => service.enableNotifications(),
    disableNotifications: () => service.disableNotifications(),
    testNotification: () => service.testNotification(),
    registerActivity: () => service.registerWritingActivity(),
    showAchievement: (achievement: { title: string; description: string; icon: string }) => 
      service.showAchievementNotification(achievement),
    showGoalAchieved: (wordsWritten: number, goal: number) => 
      service.showGoalAchievedNotification(wordsWritten, goal),
    showStreak: (streak: number) => service.showStreakNotification(streak)
  };
} 