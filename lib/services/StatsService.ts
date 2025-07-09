import { Note } from '@/types/note';
import { ProductivityMetrics, WritingSession, HeatmapData, TextInsights } from '@/types/analytics';
import { TextStats } from '@/types/service.types';

export class StatsService {
  private static instance: StatsService;

  static getInstance(): StatsService {
    if (!StatsService.instance) {
      StatsService.instance = new StatsService();
    }
    return StatsService.instance;
  }

  /**
   * Calcular estatísticas de texto
   */
  calculateTextStats(content: string): TextStats {
    if (!content) {
      return {
        wordCount: 0,
        characterCount: 0,
        paragraphCount: 0,
        sentenceCount: 0,
        readingTime: 0,
        complexity: 'low'
      };
    }

    const plainText = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const words = plainText.split(/\s+/).filter(word => word.length > 0);
    const sentences = plainText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const paragraphs = content.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0);

    const wordCount = words.length;
    const characterCount = plainText.length;
    const paragraphCount = paragraphs.length;
    const sentenceCount = sentences.length;
    const readingTime = Math.ceil(wordCount / 200); // 200 palavras por minuto

    // Calcular complexidade baseada no comprimento médio das sentenças
    const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    let complexity: 'low' | 'medium' | 'high' = 'low';
    
    if (avgSentenceLength > 20) {
      complexity = 'high';
    } else if (avgSentenceLength > 15) {
      complexity = 'medium';
    }

    return {
      wordCount,
      characterCount,
      paragraphCount,
      sentenceCount,
      readingTime,
      complexity
    };
  }

  /**
   * Calcular métricas de produtividade
   */
  calculateProductivityMetrics(notes: Note[]): ProductivityMetrics {
    const activeNotes = notes.filter(note => !note.isDeleted);
    
    if (activeNotes.length === 0) {
      return this.getEmptyMetrics();
    }

    const totalWords = activeNotes.reduce((sum, note) => {
      return sum + this.calculateTextStats(note.content).wordCount;
    }, 0);

    const sessions = this.generateWritingSessions(activeNotes);
    const activeDays = sessions.length;
    const streaks = this.calculateStreaks(sessions);
    const dailyGoal = 500; // Default goal
    
    // Calcular métricas de tempo
    const now = new Date();
    const thisWeek = this.getWeekBoundaries(now);
    const lastWeek = this.getWeekBoundaries(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
    const thisMonth = this.getMonthBoundaries(now);
    const lastMonth = this.getMonthBoundaries(new Date(now.getFullYear(), now.getMonth() - 1, 1));

    const thisWeekWords = this.getWordsInPeriod(activeNotes, thisWeek.start, thisWeek.end);
    const lastWeekWords = this.getWordsInPeriod(activeNotes, lastWeek.start, lastWeek.end);
    const thisMonthWords = this.getWordsInPeriod(activeNotes, thisMonth.start, thisMonth.end);
    const lastMonthWords = this.getWordsInPeriod(activeNotes, lastMonth.start, lastMonth.end);

    const weeklyChange = lastWeekWords > 0 ? ((thisWeekWords - lastWeekWords) / lastWeekWords) * 100 : 0;
    const monthlyChange = lastMonthWords > 0 ? ((thisMonthWords - lastMonthWords) / lastMonthWords) * 100 : 0;

    // Encontrar o melhor dia
    const bestDay = sessions.reduce((best, session) => {
      return session.wordCount > best.wordCount ? session : best;
    }, sessions[0] || { date: new Date().toISOString().split('T')[0], wordCount: 0 });

    return {
      totalWords,
      totalNotes: activeNotes.length,
      activeDays,
      currentStreak: streaks.current,
      longestStreak: streaks.longest,
      averageWordsPerDay: activeDays > 0 ? totalWords / activeDays : 0,
      dailyGoal,
      dailyGoalProgress: (thisWeekWords / 7) / dailyGoal * 100,
      bestDay,
      thisWeekWords,
      lastWeekWords,
      weeklyChange,
      thisMonthWords,
      lastMonthWords,
      monthlyChange
    };
  }

  /**
   * Gerar dados para o heatmap
   */
  generateHeatmapData(notes: Note[]): HeatmapData[] {
    const activeNotes = notes.filter(note => !note.isDeleted);
    const sessions = this.generateWritingSessions(activeNotes);
    const heatmapData: HeatmapData[] = [];

    // Gerar dados dos últimos 365 dias
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const session = sessions.find(s => s.date === dateStr);
      const wordCount = session?.wordCount || 0;
      
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (wordCount > 0) {
        if (wordCount >= 1000) level = 4;
        else if (wordCount >= 500) level = 3;
        else if (wordCount >= 200) level = 2;
        else level = 1;
      }

      heatmapData.unshift({
        date: dateStr,
        count: wordCount,
        level
      });
    }

    return heatmapData;
  }

  /**
   * Gerar insights de texto
   */
  generateTextInsights(notes: Note[]): TextInsights {
    const activeNotes = notes.filter(note => !note.isDeleted);
    
    if (activeNotes.length === 0) {
      return {
        mostUsedWords: [],
        avgWordsPerParagraph: 0,
        avgSentenceLength: 0,
        readingLevel: 'fácil',
        predominantStyle: 'descritivo'
      };
    }

    const wordFrequency = new Map<string, number>();
    let totalWords = 0;
    let totalParagraphs = 0;
    let totalSentences = 0;

    // Analisar cada nota
    for (const note of activeNotes) {
      const stats = this.calculateTextStats(note.content);
      const plainText = note.content.replace(/<[^>]*>/g, '').toLowerCase();
      const words = plainText.split(/\s+/).filter(word => word.length > 2);

      // Contar frequência de palavras
      for (const word of words) {
        const cleanWord = word.replace(/[^\w]/g, '');
        if (cleanWord.length > 2 && !this.isStopWord(cleanWord)) {
          wordFrequency.set(cleanWord, (wordFrequency.get(cleanWord) || 0) + 1);
        }
      }

      totalWords += stats.wordCount;
      totalParagraphs += stats.paragraphCount;
      totalSentences += stats.sentenceCount;
    }

    // Palavras mais usadas
    const mostUsedWords = Array.from(wordFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    // Calcular métricas médias
    const avgWordsPerParagraph = totalParagraphs > 0 ? totalWords / totalParagraphs : 0;
    const avgSentenceLength = totalSentences > 0 ? totalWords / totalSentences : 0;

    // Determinar nível de leitura
    let readingLevel: 'fácil' | 'médio' | 'difícil' = 'fácil';
    if (avgSentenceLength > 20) {
      readingLevel = 'difícil';
    } else if (avgSentenceLength > 15) {
      readingLevel = 'médio';
    }

    // Determinar estilo predominante (simplificado)
    const predominantStyle = this.detectWritingStyle(activeNotes);

    return {
      mostUsedWords,
      avgWordsPerParagraph,
      avgSentenceLength,
      readingLevel,
      predominantStyle
    };
  }

  /**
   * Gerar sessões de escrita
   */
  generateWritingSessions(notes: Note[]): WritingSession[] {
    const sessionMap = new Map<string, WritingSession>();

    for (const note of notes) {
      const date = new Date(note.createdAt).toISOString().split('T')[0];
      const wordCount = this.calculateTextStats(note.content).wordCount;

      if (!sessionMap.has(date)) {
        sessionMap.set(date, {
          date,
          wordCount: 0,
          notesCreated: 0,
          notesUpdated: 0
        });
      }

      const session = sessionMap.get(date)!;
      session.wordCount += wordCount;
      session.notesCreated += 1;

      // Verificar se a nota foi atualizada no mesmo dia
      const updateDate = new Date(note.updatedAt).toISOString().split('T')[0];
      if (updateDate === date && note.updatedAt > note.createdAt) {
        session.notesUpdated += 1;
      }
    }

    return Array.from(sessionMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  private getEmptyMetrics(): ProductivityMetrics {
    return {
      totalWords: 0,
      totalNotes: 0,
      activeDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageWordsPerDay: 0,
      dailyGoal: 500,
      dailyGoalProgress: 0,
      bestDay: { date: '', wordCount: 0 },
      thisWeekWords: 0,
      lastWeekWords: 0,
      weeklyChange: 0,
      thisMonthWords: 0,
      lastMonthWords: 0,
      monthlyChange: 0
    };
  }

  private calculateStreaks(sessions: WritingSession[]): { current: number; longest: number } {
    if (sessions.length === 0) {
      return { current: 0, longest: 0 };
    }

    const dates = sessions.map(s => new Date(s.date)).sort((a, b) => b.getTime() - a.getTime());
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calcular streak atual
    for (let i = 0; i < dates.length; i++) {
      const date = new Date(dates[i]);
      date.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));
      
      if (daysDiff === i) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calcular streak mais longo
    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const daysDiff = Math.floor((prevDate.getTime() - currDate.getTime()) / (24 * 60 * 60 * 1000));
        
        if (daysDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);

    return { current: currentStreak, longest: longestStreak };
  }

  private getWeekBoundaries(date: Date): { start: Date; end: Date } {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  private getMonthBoundaries(date: Date): { start: Date; end: Date } {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  private getWordsInPeriod(notes: Note[], start: Date, end: Date): number {
    return notes
      .filter(note => {
        const noteDate = new Date(note.updatedAt);
        return noteDate >= start && noteDate <= end;
      })
      .reduce((sum, note) => sum + this.calculateTextStats(note.content).wordCount, 0);
  }

  private isStopWord(word: string): boolean {
    const stopWords = [
      'a', 'o', 'e', 'de', 'da', 'do', 'das', 'dos', 'para', 'com', 'em', 'na', 'no', 'por',
      'que', 'se', 'uma', 'um', 'sua', 'seu', 'suas', 'seus', 'como', 'mais', 'mas', 'ou',
      'ao', 'aos', 'às', 'pela', 'pelo', 'pelos', 'pelas', 'quando', 'onde', 'ser', 'ter',
      'estar', 'fazer', 'dizer', 'muito', 'bem', 'então', 'também', 'só', 'já', 'ainda'
    ];
    return stopWords.includes(word.toLowerCase());
  }

  private detectWritingStyle(notes: Note[]): 'descritivo' | 'narrativo' | 'argumentativo' {
    // Implementação simplificada baseada em palavras-chave
    const descriptiveWords = ['cor', 'forma', 'tamanho', 'aparência', 'visual', 'bonito', 'feio'];
    const narrativeWords = ['então', 'depois', 'antes', 'quando', 'enquanto', 'história', 'aconteceu'];
    const argumentativeWords = ['porque', 'portanto', 'assim', 'conclusão', 'argumento', 'prova', 'evidência'];

    let descriptiveCount = 0;
    let narrativeCount = 0;
    let argumentativeCount = 0;

    for (const note of notes) {
      const content = note.content.toLowerCase();
      
      descriptiveWords.forEach(word => {
        if (content.includes(word)) descriptiveCount++;
      });
      
      narrativeWords.forEach(word => {
        if (content.includes(word)) narrativeCount++;
      });
      
      argumentativeWords.forEach(word => {
        if (content.includes(word)) argumentativeCount++;
      });
    }

    if (argumentativeCount >= narrativeCount && argumentativeCount >= descriptiveCount) {
      return 'argumentativo';
    } else if (narrativeCount >= descriptiveCount) {
      return 'narrativo';
    } else {
      return 'descritivo';
    }
  }
}

export const statsService = StatsService.getInstance(); 