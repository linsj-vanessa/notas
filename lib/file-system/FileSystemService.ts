import { 
  FileSystemService as IFileSystemService, 
  FileSystemConfig, 
  FileSystemError, 
  FileSystemErrorCode,
  FileSystemBrowserSupport,
  FileMetadata
} from './types';

// Extensão de tipos para File System Access API
declare global {
  interface FileSystemDirectoryHandle {
    entries(): AsyncIterable<[string, FileSystemHandle]>;
  }
}

// Configuração padrão
const DEFAULT_CONFIG: FileSystemConfig = {
  allowedFileTypes: ['.md', '.txt'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  rootDirectoryName: 'Notas',
  metadataDirectoryName: '.notas-app',
  trashDirectoryName: 'Lixeira'
};

export class FileSystemService implements IFileSystemService {
  private config: FileSystemConfig;
  private browserSupport: FileSystemBrowserSupport;

  constructor(config: Partial<FileSystemConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.browserSupport = this.detectBrowserSupport();
  }

  /**
   * Verifica se o File System Access API é suportado
   */
  isSupported(): boolean {
    return this.browserSupport.hasFileSystemAccess && this.browserSupport.hasDirectoryPicker;
  }

  /**
   * Detecta o suporte do navegador
   */
  private detectBrowserSupport(): FileSystemBrowserSupport {
    const userAgent = navigator.userAgent;
    let browserName = 'unknown';
    let browserVersion = 'unknown';

    // Detectar navegador
    if (userAgent.includes('Chrome')) {
      browserName = 'chrome';
      browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'unknown';
    } else if (userAgent.includes('Firefox')) {
      browserName = 'firefox';
      browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'unknown';
    } else if (userAgent.includes('Safari')) {
      browserName = 'safari';
      browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || 'unknown';
    } else if (userAgent.includes('Edge')) {
      browserName = 'edge';
      browserVersion = userAgent.match(/Edge\/(\d+)/)?.[1] || 'unknown';
    }

    // Verificar APIs disponíveis
    const hasFileSystemAccess = 'showDirectoryPicker' in window;
    const hasDirectoryPicker = 'showDirectoryPicker' in window;
    const hasFilePicker = 'showOpenFilePicker' in window;

    // Determinar modo de fallback
    let fallbackMode: 'download' | 'local-storage' | 'none' = 'none';
    if (!hasFileSystemAccess) {
      if (browserName === 'firefox' || browserName === 'safari') {
        fallbackMode = 'download';
      } else {
        fallbackMode = 'local-storage';
      }
    }

    return {
      hasFileSystemAccess,
      hasDirectoryPicker,
      hasFilePicker,
      browserName,
      browserVersion,
      fallbackMode
    };
  }

  /**
   * Seleciona um diretório para trabalhar
   */
  async selectDirectory(): Promise<FileSystemDirectoryHandle> {
    try {
      if (!this.isSupported()) {
        throw this.createError(
          FileSystemErrorCode.NOT_SUPPORTED,
          'File System Access API não é suportado neste navegador'
        );
      }

      const dirHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      });

      return dirHandle;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw this.createError(
          FileSystemErrorCode.PERMISSION_DENIED,
          'Usuário cancelou a seleção de diretório'
        );
      }
      
      throw this.createError(
        FileSystemErrorCode.UNKNOWN_ERROR,
        'Erro ao selecionar diretório',
        error as Error
      );
    }
  }

  /**
   * Escreve conteúdo em um arquivo
   */
  async writeFile(handle: FileSystemFileHandle, content: string): Promise<void> {
    try {
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
    } catch (error) {
      throw this.createError(
        FileSystemErrorCode.WRITE_FAILED,
        `Erro ao escrever arquivo: ${handle.name}`,
        error as Error
      );
    }
  }

  /**
   * Lê conteúdo de um arquivo
   */
  async readFile(handle: FileSystemFileHandle): Promise<string> {
    try {
      const file = await handle.getFile();
      return await file.text();
    } catch (error) {
      throw this.createError(
        FileSystemErrorCode.READ_FAILED,
        `Erro ao ler arquivo: ${handle.name}`,
        error as Error
      );
    }
  }

  /**
   * Deleta um arquivo
   */
  async deleteFile(handle: FileSystemFileHandle): Promise<void> {
    try {
      // Note: File System Access API não tem método delete direto
      // Vamos implementar movendo para lixeira
      throw new Error('Método deleteFile deve ser implementado via moveToTrash');
    } catch (error) {
      throw this.createError(
        FileSystemErrorCode.UNKNOWN_ERROR,
        `Erro ao deletar arquivo: ${handle.name}`,
        error as Error
      );
    }
  }

  /**
   * Cria um diretório
   */
  async createDirectory(parent: FileSystemDirectoryHandle, name: string): Promise<FileSystemDirectoryHandle> {
    try {
      return await parent.getDirectoryHandle(name, { create: true });
    } catch (error) {
      throw this.createError(
        FileSystemErrorCode.UNKNOWN_ERROR,
        `Erro ao criar diretório: ${name}`,
        error as Error
      );
    }
  }

  /**
   * Lista arquivos em um diretório
   */
  async listFiles(directory: FileSystemDirectoryHandle): Promise<FileSystemFileHandle[]> {
    try {
      const files: FileSystemFileHandle[] = [];
      
      for await (const [name, handle] of directory.entries()) {
        if (handle.kind === 'file') {
          files.push(handle as FileSystemFileHandle);
        }
      }
      
      return files;
    } catch (error) {
      throw this.createError(
        FileSystemErrorCode.READ_FAILED,
        'Erro ao listar arquivos do diretório',
        error as Error
      );
    }
  }

  /**
   * Verifica se um arquivo existe
   */
  async fileExists(directory: FileSystemDirectoryHandle, filename: string): Promise<boolean> {
    try {
      await directory.getFileHandle(filename);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica se um diretório existe
   */
  async directoryExists(parent: FileSystemDirectoryHandle, dirName: string): Promise<boolean> {
    try {
      await parent.getDirectoryHandle(dirName);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtém metadata de um arquivo
   */
  async getFileMetadata(handle: FileSystemFileHandle): Promise<FileMetadata> {
    try {
      const file = await handle.getFile();
      return {
        name: file.name,
        size: file.size,
        lastModified: new Date(file.lastModified),
        kind: 'file'
      };
    } catch (error) {
      throw this.createError(
        FileSystemErrorCode.READ_FAILED,
        `Erro ao obter metadata do arquivo: ${handle.name}`,
        error as Error
      );
    }
  }

  /**
   * Obtém informações de suporte do navegador
   */
  getBrowserSupport(): FileSystemBrowserSupport {
    return this.browserSupport;
  }

  /**
   * Cria um erro padronizado
   */
  private createError(code: FileSystemErrorCode, message: string, originalError?: Error): FileSystemError {
    return {
      code,
      message,
      originalError
    };
  }

  /**
   * Obtém um handle de arquivo por nome
   */
  async getFileHandle(directory: FileSystemDirectoryHandle, filename: string, create: boolean = false): Promise<FileSystemFileHandle> {
    try {
      return await directory.getFileHandle(filename, { create });
    } catch (error) {
      if (create) {
        throw this.createError(
          FileSystemErrorCode.WRITE_FAILED,
          `Erro ao criar arquivo: ${filename}`,
          error as Error
        );
      } else {
        throw this.createError(
          FileSystemErrorCode.FILE_NOT_FOUND,
          `Arquivo não encontrado: ${filename}`,
          error as Error
        );
      }
    }
  }

  /**
   * Inicializa estrutura de diretórios necessária
   */
  async initializeDirectoryStructure(rootDir: FileSystemDirectoryHandle): Promise<{
    notesDir: FileSystemDirectoryHandle;
    metadataDir: FileSystemDirectoryHandle;
    trashDir: FileSystemDirectoryHandle;
  }> {
    try {
      // Criar diretório de notas (pode ser o próprio root)
      const notesDir = rootDir;
      
      // Criar diretório de metadata
      const metadataDir = await this.createDirectory(rootDir, this.config.metadataDirectoryName);
      
      // Criar diretório de lixeira
      const trashDir = await this.createDirectory(rootDir, this.config.trashDirectoryName);
      
      return {
        notesDir,
        metadataDir,
        trashDir
      };
    } catch (error) {
      throw this.createError(
        FileSystemErrorCode.UNKNOWN_ERROR,
        'Erro ao inicializar estrutura de diretórios',
        error as Error
      );
    }
  }
}

// Singleton instance
let fileSystemService: FileSystemService;

export function getFileSystemService(): FileSystemService {
  if (!fileSystemService) {
    fileSystemService = new FileSystemService();
  }
  return fileSystemService;
}

export { FileSystemService as default }; 