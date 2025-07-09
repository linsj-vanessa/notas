// Core types
export type * from './note';

// Analytics types
export type * from './analytics';

// UI types
export type {
  ModalProps,
  ConfirmationModalProps,
  SearchFilters,
  EditorRef,
  StatusBarProps,
  ThemeConfig,
  NotificationConfig,
  ViewMode,
  SearchResult as UISearchResult
} from './ui.types';

// Store types
export type * from './store.types';

// Service types
export type {
  BackupData,
  BackupOptions,
  RestoreOptions,
  AnalyticsData,
  AnalyticsOptions,
  ExportOptions,
  ExportResult,
  NotificationOptions,
  NotificationAction,
  SearchOptions,
  CleanupOptions,
  CleanupResult,
  TextStats,
  ServiceResponse,
  ServiceError,
  SearchResult as ServiceSearchResult
} from './service.types'; 