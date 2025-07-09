import { Note, WritingSession, ProductivityMetrics, HeatmapData, TextInsights, Achievement, DashboardData } from '@/types/note';
import { calculateTextStats } from '@/lib/text-stats';

export class AnalyticsService {
  private static instance: AnalyticsService;
  private dailyGoal: number = 500; // Meta padrão de 500 palavras por dia

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  setDailyGoal(goal: number): void {
    this.dailyGoal = goal;
  }

  getDailyGoal(): number {
    return this.dailyGoal;
  }

  // Gerar sessões de escrita por dia
  generateWritingSessions(notes: Note[]): WritingSession[] {
    const sessionMap = new Map<string, WritingSession>();

    notes.forEach(note => {
      if (note.isDeleted) return;

      // Processar criação da nota
      const createdDate = this.formatDate(note.createdAt);
      if (!sessionMap.has(createdDate)) {
        sessionMap.set(createdDate, {
          date: createdDate,
          wordCount: 0,
          notesCreated: 0,
          notesUpdated: 0,
        });
      }

      const createdSession = sessionMap.get(createdDate)!;
      createdSession.notesCreated++;
      createdSession.wordCount += calculateTextStats(note.content).words;

      // Processar atualização da nota (se diferente da criação)
      const updatedDate = this.formatDate(note.updatedAt);
      if (updatedDate !== createdDate) {
        if (!sessionMap.has(updatedDate)) {
          sessionMap.set(updatedDate, {
            date: updatedDate,
            wordCount: 0,
            notesCreated: 0,
            notesUpdated: 0,
          });
        }
        
        const updatedSession = sessionMap.get(updatedDate)!;
        updatedSession.notesUpdated++;
        // Adicionar palavras apenas se for uma atualização significativa
        if (note.updatedAt.getTime() - note.createdAt.getTime() > 60000) { // 1 minuto
          updatedSession.wordCount += calculateTextStats(note.content).words;
        }
      }
    });

    return Array.from(sessionMap.values()).sort((a, b) => b.date.localeCompare(a.date));
  }

  // Calcular métricas de produtividade
  calculateProductivityMetrics(notes: Note[]): ProductivityMetrics {
    const sessions = this.generateWritingSessions(notes);
    const activeNotes = notes.filter(note => !note.isDeleted);
    
    const totalWords = activeNotes.reduce((sum, note) => sum + calculateTextStats(note.content).words, 0);
    const totalNotes = activeNotes.length;
    const activeDays = sessions.length;
    
    // Calcular streaks
    const { currentStreak, longestStreak } = this.calculateStreaks(sessions);
    
    // Calcular médias
    const averageWordsPerDay = activeDays > 0 ? totalWords / activeDays : 0;
    
    // Encontrar melhor dia
    const bestDay = sessions.reduce((best, session) => 
      session.wordCount > best.wordCount ? session : best, 
      { date: '', wordCount: 0 }
    );

    // Calcular progresso da meta diária (hoje)
    const today = this.formatDate(new Date());
    const todaySession = sessions.find(s => s.date === today);
    const dailyGoalProgress = todaySession ? (todaySession.wordCount / this.dailyGoal) * 100 : 0;

    // Calcular mudanças semanais e mensais
    const { thisWeekWords, lastWeekWords, weeklyChange } = this.calculateWeeklyChange(sessions);
    const { thisMonthWords, lastMonthWords, monthlyChange } = this.calculateMonthlyChange(sessions);

    return {
      totalWords,
      totalNotes,
      activeDays,
      currentStreak,
      longestStreak,
      averageWordsPerDay,
      dailyGoal: this.dailyGoal,
      dailyGoalProgress,
      bestDay,
      thisWeekWords,
      lastWeekWords,
      weeklyChange,
      thisMonthWords,
      lastMonthWords,
      monthlyChange,
    };
  }

  // Calcular streaks de escrita
  private calculateStreaks(sessions: WritingSession[]): { currentStreak: number; longestStreak: number } {
    if (sessions.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Ordenar por data
    const sortedSessions = sessions.sort((a, b) => a.date.localeCompare(b.date));
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = this.formatDate(new Date());
    const yesterday = this.formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
    
    // Verificar se escreveu hoje ou ontem para manter streak
    let streakActive = false;
    
    for (let i = 0; i < sortedSessions.length; i++) {
      const session = sortedSessions[i];
      
      if (session.date === today || session.date === yesterday) {
        streakActive = true;
      }
      
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedSessions[i - 1].date);
        const currentDate = new Date(session.date);
        const diffInDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    // Calcular streak atual
    if (streakActive) {
      currentStreak = tempStreak;
    }
    
    return { currentStreak, longestStreak };
  }

  // Calcular mudanças semanais
  private calculateWeeklyChange(sessions: WritingSession[]): { thisWeekWords: number; lastWeekWords: number; weeklyChange: number } {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const thisWeekWords = sessions
      .filter(s => new Date(s.date) >= oneWeekAgo)
      .reduce((sum, s) => sum + s.wordCount, 0);
    
    const lastWeekWords = sessions
      .filter(s => new Date(s.date) >= twoWeeksAgo && new Date(s.date) < oneWeekAgo)
      .reduce((sum, s) => sum + s.wordCount, 0);
    
    const weeklyChange = lastWeekWords > 0 ? ((thisWeekWords - lastWeekWords) / lastWeekWords) * 100 : 0;
    
    return { thisWeekWords, lastWeekWords, weeklyChange };
  }

  // Calcular mudanças mensais
  private calculateMonthlyChange(sessions: WritingSession[]): { thisMonthWords: number; lastMonthWords: number; monthlyChange: number } {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
    
    const thisMonthWords = sessions
      .filter(s => new Date(s.date) >= oneMonthAgo)
      .reduce((sum, s) => sum + s.wordCount, 0);
    
    const lastMonthWords = sessions
      .filter(s => new Date(s.date) >= twoMonthsAgo && new Date(s.date) < oneMonthAgo)
      .reduce((sum, s) => sum + s.wordCount, 0);
    
    const monthlyChange = lastMonthWords > 0 ? ((thisMonthWords - lastMonthWords) / lastMonthWords) * 100 : 0;
    
    return { thisMonthWords, lastMonthWords, monthlyChange };
  }

  // Gerar dados para heatmap
  generateHeatmapData(sessions: WritingSession[], days: number = 365): HeatmapData[] {
    const heatmapData: HeatmapData[] = [];
    const sessionMap = new Map(sessions.map(s => [s.date, s]));
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = this.formatDate(date);
      
      const session = sessionMap.get(dateStr);
      const wordCount = session ? session.wordCount : 0;
      
      // Determinar nível de atividade (0-4)
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (wordCount > 0) {
        if (wordCount >= 1000) level = 4;
        else if (wordCount >= 500) level = 3;
        else if (wordCount >= 250) level = 2;
        else level = 1;
      }
      
      heatmapData.push({
        date: dateStr,
        count: wordCount,
        level,
      });
    }
    
    return heatmapData;
  }

  // Calcular insights de texto
  calculateTextInsights(notes: Note[]): TextInsights {
    const activeNotes = notes.filter(note => !note.isDeleted);
    const allText = activeNotes.map(note => note.content).join(' ');
    
    // Palavras mais usadas
    const words = allText.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3) // Ignorar palavras muito curtas
      .filter(word => !this.isStopWord(word));
    
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });
    
    const mostUsedWords = Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
    
    // Calcular estatísticas de texto
    const stats = calculateTextStats(allText);
    const avgWordsPerParagraph = stats.paragraphs > 0 ? stats.words / stats.paragraphs : 0;
    const avgSentenceLength = this.calculateAverageSentenceLength(allText);
    
    return {
      mostUsedWords,
      avgWordsPerParagraph,
      avgSentenceLength,
      readingLevel: this.determineReadingLevel(avgSentenceLength),
      predominantStyle: this.determinePredominantStyle(allText),
    };
  }

  // Gerar conquistas
  generateAchievements(notes: Note[], metrics: ProductivityMetrics): Achievement[] {
    const achievements: Achievement[] = [
      {
        id: 'first-note',
        title: 'Primeira Nota',
        description: 'Criou sua primeira nota',
        icon: '📝',
        progress: metrics.totalNotes > 0 ? 1 : 0,
        maxProgress: 1,
        category: 'milestones',
      },
      {
        id: 'streak-3',
        title: 'Começando Bem',
        description: 'Escreveu por 3 dias consecutivos',
        icon: '🌱',
        progress: Math.min(metrics.currentStreak, 3),
        maxProgress: 3,
        category: 'consistency',
      },
      {
        id: 'streak-7',
        title: 'Uma Semana Forte',
        description: 'Escreveu por 7 dias consecutivos',
        icon: '🔥',
        progress: Math.min(metrics.currentStreak, 7),
        maxProgress: 7,
        category: 'consistency',
      },
      {
        id: 'streak-30',
        title: 'Mestre da Disciplina',
        description: 'Escreveu por 30 dias consecutivos',
        icon: '👑',
        progress: Math.min(metrics.currentStreak, 30),
        maxProgress: 30,
        category: 'consistency',
      },
      {
        id: 'words-500',
        title: 'Primeiras Palavras',
        description: 'Escreveu 500 palavras em total',
        icon: '✍️',
        progress: Math.min(metrics.totalWords, 500),
        maxProgress: 500,
        category: 'productivity',
      },
      {
        id: 'words-1000',
        title: 'Mil Palavras',
        description: 'Escreveu 1000 palavras em total',
        icon: '📚',
        progress: Math.min(metrics.totalWords, 1000),
        maxProgress: 1000,
        category: 'productivity',
      },
      {
        id: 'words-5000',
        title: 'Escritor Produtivo',
        description: 'Escreveu 5000 palavras em total',
        icon: '🚀',
        progress: Math.min(metrics.totalWords, 5000),
        maxProgress: 5000,
        category: 'productivity',
      },
      {
        id: 'words-10000',
        title: 'Autor Experiente',
        description: 'Escreveu 10000 palavras em total',
        icon: '🏆',
        progress: Math.min(metrics.totalWords, 10000),
        maxProgress: 10000,
        category: 'productivity',
      },
      {
        id: 'daily-goal',
        title: 'Meta Diária',
        description: 'Atingiu sua meta diária de escrita',
        icon: '🎯',
        progress: metrics.dailyGoalProgress >= 100 ? 1 : 0,
        maxProgress: 1,
        category: 'productivity',
      },
      {
        id: 'daily-goal-week',
        title: 'Semana Consistente',
        description: 'Atingiu a meta diária por 7 dias consecutivos',
        icon: '💪',
        progress: this.calculateConsecutiveGoalDays(notes),
        maxProgress: 7,
        category: 'consistency',
      },
      {
        id: 'notes-5',
        title: 'Iniciante',
        description: 'Criou 5 notas',
        icon: '📄',
        progress: Math.min(metrics.totalNotes, 5),
        maxProgress: 5,
        category: 'milestones',
      },
      {
        id: 'notes-10',
        title: 'Colecionador',
        description: 'Criou 10 notas',
        icon: '📖',
        progress: Math.min(metrics.totalNotes, 10),
        maxProgress: 10,
        category: 'milestones',
      },
      {
        id: 'notes-25',
        title: 'Biblioteca Pessoal',
        description: 'Criou 25 notas',
        icon: '📚',
        progress: Math.min(metrics.totalNotes, 25),
        maxProgress: 25,
        category: 'milestones',
      },
      {
        id: 'notes-50',
        title: 'Enciclopédia',
        description: 'Criou 50 notas',
        icon: '📋',
        progress: Math.min(metrics.totalNotes, 50),
        maxProgress: 50,
        category: 'milestones',
      },
      {
        id: 'best-day-1000',
        title: 'Dia Produtivo',
        description: 'Escreveu 1000 palavras em um único dia',
        icon: '⚡',
        progress: metrics.bestDay.wordCount >= 1000 ? 1 : 0,
        maxProgress: 1,
        category: 'quality',
      },
      {
        id: 'active-writer',
        title: 'Escritor Ativo',
        description: 'Escreveu em 30 dias diferentes',
        icon: '📅',
        progress: Math.min(metrics.activeDays, 30),
        maxProgress: 30,
        category: 'consistency',
      },
    ];

    // Marcar conquistas desbloqueadas
    achievements.forEach(achievement => {
      if (achievement.progress >= achievement.maxProgress && !achievement.unlockedAt) {
        achievement.unlockedAt = new Date();
      }
    });

    return achievements;
  }

  // Calcular dias consecutivos atingindo a meta
  private calculateConsecutiveGoalDays(notes: Note[]): number {
    const sessions = this.generateWritingSessions(notes);
    let consecutiveDays = 0;
    let currentStreak = 0;
    
    // Ordenar sessões por data (mais recente primeiro)
    const sortedSessions = sessions.sort((a, b) => b.date.localeCompare(a.date));
    
    for (const session of sortedSessions) {
      if (session.wordCount >= this.dailyGoal) {
        currentStreak++;
        consecutiveDays = Math.max(consecutiveDays, currentStreak);
      } else {
        break; // Quebrou o streak
      }
    }
    
    return Math.min(consecutiveDays, 7);
  }

  // Gerar todos os dados do dashboard
  generateDashboardData(notes: Note[]): DashboardData {
    const sessions = this.generateWritingSessions(notes);
    const metrics = this.calculateProductivityMetrics(notes);
    const heatmapData = this.generateHeatmapData(sessions);
    const insights = this.calculateTextInsights(notes);
    const achievements = this.generateAchievements(notes, metrics);
    const recentActivity = sessions.slice(0, 7); // Últimos 7 dias

    return {
      metrics,
      heatmapData,
      insights,
      achievements,
      recentActivity,
    };
  }

  // Funções auxiliares
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private isStopWord(word: string): boolean {
    const stopWords = ['que', 'não', 'uma', 'para', 'com', 'como', 'mais', 'seu', 'sua', 'são', 'por', 'dos', 'das', 'foi', 'tem', 'ter', 'ser', 'ele', 'ela', 'está', 'este', 'esta', 'isso', 'isso', 'muito', 'bem', 'então', 'quando', 'onde', 'porque', 'sobre', 'depois', 'antes', 'ainda', 'também', 'já', 'só', 'mas', 'ou', 'se', 'de', 'do', 'da', 'em', 'no', 'na', 'um', 'uns', 'umas', 'os', 'as', 'ao', 'à', 'aos', 'às'];
    return stopWords.includes(word.toLowerCase());
  }

  private calculateAverageSentenceLength(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 0;
    
    const totalWords = sentences.reduce((sum, sentence) => {
      const words = sentence.trim().split(/\s+/).filter(w => w.length > 0);
      return sum + words.length;
    }, 0);
    
    return totalWords / sentences.length;
  }

  private determineReadingLevel(avgSentenceLength: number): 'fácil' | 'médio' | 'difícil' {
    if (avgSentenceLength < 15) return 'fácil';
    if (avgSentenceLength < 25) return 'médio';
    return 'difícil';
  }

  private determinePredominantStyle(text: string): 'descritivo' | 'narrativo' | 'argumentativo' {
    const descriptiveWords = ['belo', 'grande', 'pequeno', 'cor', 'forma', 'aparência', 'visual'];
    const narrativeWords = ['então', 'depois', 'antes', 'quando', 'aconteceu', 'história', 'evento'];
    const argumentativeWords = ['porque', 'portanto', 'contudo', 'entretanto', 'assim', 'logo', 'conclusão'];
    
    const lowerText = text.toLowerCase();
    
    const descriptiveCount = descriptiveWords.reduce((count, word) => 
      count + (lowerText.match(new RegExp(word, 'g')) || []).length, 0);
    const narrativeCount = narrativeWords.reduce((count, word) => 
      count + (lowerText.match(new RegExp(word, 'g')) || []).length, 0);
    const argumentativeCount = argumentativeWords.reduce((count, word) => 
      count + (lowerText.match(new RegExp(word, 'g')) || []).length, 0);
    
    if (descriptiveCount > narrativeCount && descriptiveCount > argumentativeCount) {
      return 'descritivo';
    } else if (narrativeCount > argumentativeCount) {
      return 'narrativo';
    } else {
      return 'argumentativo';
    }
  }
}

export const analyticsService = AnalyticsService.getInstance(); 