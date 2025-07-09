// Analytics e Produtividade
export interface WritingSession {
  date: string; // YYYY-MM-DD
  wordCount: number;
  notesCreated: number;
  notesUpdated: number;
  totalTime?: number; // em minutos
}

export interface ProductivityMetrics {
  totalWords: number;
  totalNotes: number;
  activeDays: number;
  currentStreak: number;
  longestStreak: number;
  averageWordsPerDay: number;
  dailyGoal: number;
  dailyGoalProgress: number;
  bestDay: {
    date: string;
    wordCount: number;
  };
  thisWeekWords: number;
  lastWeekWords: number;
  weeklyChange: number;
  thisMonthWords: number;
  lastMonthWords: number;
  monthlyChange: number;
}

export interface HeatmapData {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // 0 = sem atividade, 4 = muito ativa
}

export interface TextInsights {
  mostUsedWords: Array<{ word: string; count: number }>;
  avgWordsPerParagraph: number;
  avgSentenceLength: number;
  readingLevel: 'fácil' | 'médio' | 'difícil';
  predominantStyle: 'descritivo' | 'narrativo' | 'argumentativo';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  category: 'productivity' | 'consistency' | 'milestones' | 'quality';
}

export interface DashboardData {
  metrics: ProductivityMetrics;
  heatmapData: HeatmapData[];
  insights: TextInsights;
  achievements: Achievement[];
  recentActivity: WritingSession[];
} 