import { Note } from './note';
import { WritingSession, ProductivityMetrics, HeatmapData, TextInsights, Achievement } from './analytics';

// Backup Service
export interface BackupData {
  notes: Note[];
  createdAt: Date;
  version: string;
  meta: {
    totalNotes: number;
    totalWords: number;
    appVersion: string;
  };
}

export interface BackupOptions {
  includeDeleted?: boolean;
  includeMedia?: boolean;
  format?: 'json' | 'markdown' | 'html';
}

export interface RestoreOptions {
  overwrite?: boolean;
  mergeStrategy?: 'replace' | 'merge' | 'skip';
}

// Analytics Service
export interface AnalyticsData {
  sessions: WritingSession[];
  metrics: ProductivityMetrics;
  heatmapData: HeatmapData[];
  insights: TextInsights;
  achievements: Achievement[];
}

export interface AnalyticsOptions {
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeDeleted?: boolean;
}

// Export Service
export interface ExportOptions {
  format: 'json' | 'markdown' | 'html' | 'pdf';
  includeDeleted?: boolean;
  includeMetadata?: boolean;
  template?: string;
}

export interface ExportResult {
  data: string | Blob;
  filename: string;
  mimeType: string;
}

// Notification Service
export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// Search Service
export interface SearchOptions {
  query: string;
  fields?: string[];
  fuzzy?: boolean;
  maxResults?: number;
  minScore?: number;
  filters?: {
    dateRange?: { start: Date; end: Date };
    tags?: string[];
  };
}

export interface SearchResult {
  id: string;
  title: string;
  preview: string;
  score: number;
  matchedFields: string[];
  highlights?: { [field: string]: string };
}

// Cleanup Service
export interface CleanupOptions {
  daysToKeep?: number;
  dryRun?: boolean;
}

export interface CleanupResult {
  deletedCount: number;
  freedSpace: number;
  errors?: string[];
}

// Text Stats Service
export interface TextStats {
  wordCount: number;
  characterCount: number;
  paragraphCount: number;
  sentenceCount: number;
  readingTime: number; // em minutos
  complexity: 'low' | 'medium' | 'high';
}

// API Response types
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ServiceError {
  code: string;
  message: string;
  details?: any;
} 