// Interface do usuário - modais, formulários, componentes
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

export interface ConfirmationModalProps extends ModalProps {
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export interface SearchResult {
  id: string;
  title: string;
  preview: string;
  score: number;
  matchedFields: string[];
}

export interface SearchFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  sortBy?: 'relevance' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface EditorRef {
  focus: () => void;
  blur: () => void;
  getContent: () => string;
  setContent: (content: string) => void;
}

export interface StatusBarProps {
  content: string;
  lastSaved: Date | null;
  hasChanges: boolean;
}

export interface ThemeConfig {
  id: string;
  name: string;
  colors: Record<string, string>;
  isDark: boolean;
}

export interface NotificationConfig {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ViewMode {
  id: 'list' | 'grid' | 'focus';
  name: string;
  icon: string;
} 