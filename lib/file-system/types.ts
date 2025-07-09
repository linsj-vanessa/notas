// Tipos para o sistema de arquivos
export interface FileSystemService {
  // Verificação de compatibilidade
  isSupported(): boolean;
  
  // Seleção de diretório
  selectDirectory(): Promise<FileSystemDirectoryHandle>;
  
  // Operações de arquivo
  writeFile(handle: FileSystemFileHandle, content: string): Promise<void>;
  readFile(handle: FileSystemFileHandle): Promise<string>;
  deleteFile(handle: FileSystemFileHandle): Promise<void>;
  
  // Operações de diretório
  createDirectory(parent: FileSystemDirectoryHandle, name: string): Promise<FileSystemDirectoryHandle>;
  listFiles(directory: FileSystemDirectoryHandle): Promise<FileSystemFileHandle[]>;
  
  // Verificação de existência
  fileExists(directory: FileSystemDirectoryHandle, filename: string): Promise<boolean>;
  directoryExists(parent: FileSystemDirectoryHandle, dirName: string): Promise<boolean>;
  
  // Metadata
  getFileMetadata(handle: FileSystemFileHandle): Promise<FileMetadata>;
}

export interface FileMetadata {
  name: string;
  size: number;
  lastModified: Date;
  kind: 'file' | 'directory';
}

export interface FileSystemConfig {
  allowedFileTypes: string[];
  maxFileSize: number;
  rootDirectoryName: string;
  metadataDirectoryName: string;
  trashDirectoryName: string;
}

export interface FileSystemError {
  code: FileSystemErrorCode;
  message: string;
  originalError?: Error;
}

export enum FileSystemErrorCode {
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  DIRECTORY_NOT_FOUND = 'DIRECTORY_NOT_FOUND',
  WRITE_FAILED = 'WRITE_FAILED',
  READ_FAILED = 'READ_FAILED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface FileSystemBrowserSupport {
  hasFileSystemAccess: boolean;
  hasDirectoryPicker: boolean;
  hasFilePicker: boolean;
  browserName: string;
  browserVersion: string;
  fallbackMode: 'download' | 'local-storage' | 'none';
}

export interface FileConflict {
  noteId: string;
  fileName: string;
  localContent: string;
  fileContent: string;
  localLastModified: Date;
  fileLastModified: Date;
  resolution?: 'keep-local' | 'keep-file' | 'merge';
}

export interface FileSystemStats {
  totalFiles: number;
  totalSize: number;
  lastSync: Date;
  conflicts: number;
  errors: number;
} 