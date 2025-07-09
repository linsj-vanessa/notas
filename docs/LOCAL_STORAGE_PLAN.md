# Plano de Implementação: Salvamento Local tipo Obsidian

## Visão Geral

Este plano detalha a implementação de um sistema de salvamento local tipo Obsidian, onde as notas são salvas como arquivos `.md` no sistema de arquivos do usuário, mantendo a flexibilidade para migração futura para um sistema online.

## Objetivo Principal

Transformar o sistema atual de IndexedDB para um sistema de arquivos local, permitindo:
- Salvamento direto no sistema de arquivos do usuário
- Compatibilidade com editores externos (Obsidian, VS Code, etc.)
- Backup automático em arquivos reais
- Preparação para sincronização online futura

## Estado Atual

### Sistema Existente
- **Armazenamento**: IndexedDB via Dexie
- **Estado**: Zustand com persist 
- **Backup**: JSON no localStorage
- **Export**: CSV/PDF
- **Estrutura**: Notas em formato de objetos JSON

### Limitações Atuais
- Dados presos no navegador
- Sem compatibilidade com editores externos
- Backup limitado ao localStorage
- Não funciona offline verdadeiro

## Arquitetura Proposta

### 1. File System Access API
```typescript
// Novo serviço para manipulação de arquivos
interface FileSystemService {
  // Seleção de diretório
  selectDirectory(): Promise<FileSystemDirectoryHandle>;
  
  // Operações de arquivo
  writeFile(handle: FileSystemFileHandle, content: string): Promise<void>;
  readFile(handle: FileSystemFileHandle): Promise<string>;
  deleteFile(handle: FileSystemFileHandle): Promise<void>;
  
  // Operações de diretório
  createDirectory(parent: FileSystemDirectoryHandle, name: string): Promise<FileSystemDirectoryHandle>;
  listFiles(directory: FileSystemDirectoryHandle): Promise<FileSystemFileHandle[]>;
}
```

### 2. Estrutura de Arquivos
```
📁 Notas/
├── 📄 nota-1.md
├── 📄 nota-2.md
├── 📄 nota-com-titulo-personalizado.md
├── 📁 .notas-app/
│   ├── 📄 metadata.json     # Metadados das notas
│   ├── 📄 settings.json     # Configurações
│   ├── 📄 tags.json         # Índice de tags
│   └── 📁 backups/
│       ├── 📄 backup-2024-01-15.json
│       └── 📄 backup-2024-01-10.json
└── 📁 Lixeira/
    ├── 📄 nota-deletada-1.md
    └── 📄 nota-deletada-2.md
```

### 3. Formato de Arquivo Markdown
```markdown
---
id: uuid-da-nota
title: Título da Nota
tags: [tag1, tag2, tag3]
created: 2024-01-15T10:30:00Z
updated: 2024-01-15T12:45:00Z
---

# Título da Nota

Conteúdo da nota em **markdown**...
```

## Fases de Implementação

### Fase 1: Infraestrutura Base (1-2 semanas)

#### 1.1 Serviço de Sistema de Arquivos
- [ ] Criar `FileSystemService` com File System Access API
- [ ] Implementar detecção de compatibilidade do navegador
- [ ] Criar fallback para navegadores sem suporte
- [ ] Testes unitários para operações de arquivo

#### 1.2 Conversor de Formato
- [ ] Implementar `MarkdownConverter` para conversão JSON ↔ Markdown
- [ ] Suporte a frontmatter YAML
- [ ] Preservar metadados das notas
- [ ] Validação de formato

#### 1.3 Migração de Dados
- [ ] Ferramenta de migração de IndexedDB para arquivos
- [ ] Backup automático antes da migração
- [ ] Verificação de integridade dos dados
- [ ] Rollback em caso de falha

### Fase 2: Armazenamento Local (2-3 semanas)

#### 2.1 Novo Store de Arquivos
```typescript
interface FileNotesStore {
  // Configuração
  directoryHandle: FileSystemDirectoryHandle | null;
  isFileSystemEnabled: boolean;
  
  // Operações
  initializeFileSystem(): Promise<void>;
  loadNotesFromFiles(): Promise<Note[]>;
  saveNoteToFile(note: Note): Promise<void>;
  deleteNoteFile(noteId: string): Promise<void>;
  
  // Sincronização
  syncWithFileSystem(): Promise<void>;
  resolveConflicts(conflicts: FileConflict[]): Promise<void>;
}
```

#### 2.2 Detecção de Mudanças
- [ ] Implementar watcher para mudanças externas
- [ ] Resolver conflitos de edição simultânea
- [ ] Notificar usuário sobre mudanças externas
- [ ] Merge automático quando possível

#### 2.3 Sistema Híbrido
- [ ] Manter IndexedDB como cache/fallback
- [ ] Sincronização bidirecional arquivos ↔ IndexedDB
- [ ] Modo offline completo
- [ ] Recuperação automática

### Fase 3: Interface de Usuário (1-2 semanas)

#### 3.1 Seletor de Diretório
- [ ] Modal para seleção de diretório
- [ ] Validação de permissões
- [ ] Configuração inicial
- [ ] Mudança de diretório

#### 3.2 Indicadores de Estado
- [ ] Status de sincronização
- [ ] Indicador de arquivos modificados externamente
- [ ] Progresso de operações
- [ ] Avisos de compatibilidade

#### 3.3 Configurações
- [ ] Opções de formato de arquivo
- [ ] Estrutura de diretórios
- [ ] Comportamento de backup
- [ ] Configurações de sincronização

### Fase 4: Recursos Avançados (2-3 semanas)

#### 4.1 Backup Aprimorado
- [ ] Backup em arquivo ZIP
- [ ] Backup incremental
- [ ] Versionamento de notas
- [ ] Backup automático programado

#### 4.2 Import/Export
- [ ] Import de Obsidian
- [ ] Import de Notion
- [ ] Export para múltiplos formatos
- [ ] Preservação de estrutura

#### 4.3 Integração Externa
- [ ] Compatibilidade com Obsidian
- [ ] Suporte a plugins de markdown
- [ ] Integração com Git
- [ ] Sincronização com cloud

### Fase 5: Preparação para Online (1-2 semanas)

#### 5.1 Abstração de Armazenamento
```typescript
interface StorageAdapter {
  type: 'local' | 'cloud' | 'hybrid';
  
  // Operações básicas
  create(note: CreateNoteData): Promise<Note>;
  read(id: string): Promise<Note>;
  update(id: string, data: UpdateNoteData): Promise<Note>;
  delete(id: string): Promise<void>;
  list(): Promise<Note[]>;
  
  // Sincronização
  sync(): Promise<SyncResult>;
  resolveConflicts(conflicts: Conflict[]): Promise<void>;
}
```

#### 5.2 Sistema de Conflitos
- [ ] Detecção de conflitos
- [ ] Interface de resolução
- [ ] Merge automático
- [ ] Histórico de mudanças

#### 5.3 Preparação para API
- [ ] Camada de abstração para requisições
- [ ] Sistema de autenticação
- [ ] Sincronização incremental
- [ ] Offline-first approach

## Considerações Técnicas

### Compatibilidade
- **Chrome/Edge**: File System Access API nativa
- **Firefox**: Polyfill com limitações
- **Safari**: Fallback para download/upload
- **Mobile**: Compartilhamento de arquivos

### Segurança
- Validação de tipos de arquivo
- Sanitização de nomes de arquivo
- Verificação de permissões
- Backup de segurança

### Performance
- Lazy loading de arquivos
- Cache inteligente
- Operações em background
- Debounce para salvamento

### Experiência do Usuário
- Feedback visual de operações
- Transições suaves
- Tratamento de erros
- Documentação clara

## Estrutura de Código

### Novos Arquivos
```
lib/
├── file-system/
│   ├── FileSystemService.ts
│   ├── MarkdownConverter.ts
│   ├── FileWatcher.ts
│   └── types.ts
├── storage/
│   ├── LocalStorageAdapter.ts
│   ├── CloudStorageAdapter.ts
│   ├── HybridStorageAdapter.ts
│   └── types.ts
├── migration/
│   ├── IndexedDBMigrator.ts
│   ├── DataValidator.ts
│   └── BackupManager.ts
└── sync/
    ├── SyncEngine.ts
    ├── ConflictResolver.ts
    └── types.ts
```

### Componentes UI
```
components/
├── file-system/
│   ├── DirectorySelector.tsx
│   ├── FileSystemStatus.tsx
│   ├── ConflictResolver.tsx
│   └── MigrationWizard.tsx
└── settings/
    ├── StorageSettings.tsx
    ├── BackupSettings.tsx
    └── SyncSettings.tsx
```

## Testes

### Testes Unitários
- [ ] Operações de arquivo
- [ ] Conversão de formato
- [ ] Sincronização
- [ ] Resolução de conflitos

### Testes de Integração
- [ ] Fluxo completo de migração
- [ ] Compatibilidade entre navegadores
- [ ] Recuperação de erro
- [ ] Performance

### Testes de Usabilidade
- [ ] Fluxo de primeira configuração
- [ ] Resolução de conflitos
- [ ] Recuperação de backup
- [ ] Integração com editores externos

## Critérios de Sucesso

### Funcionais
- [ ] Salvamento direto no sistema de arquivos
- [ ] Compatibilidade com editores externos
- [ ] Backup automático eficiente
- [ ] Migração sem perda de dados

### Não-funcionais
- [ ] Performance igual ou melhor que atual
- [ ] Experiência de usuário fluida
- [ ] Compatibilidade com navegadores principais
- [ ] Código bem documentado e testado

## Próximos Passos

1. **Validação com usuário**: Confirmar requisitos e expectativas
2. **Prototipagem**: Implementar versão mínima para testes
3. **Fase 1**: Começar com infraestrutura base
4. **Feedback contínuo**: Validar cada fase antes de prosseguir

## Riscos e Mitigações

### Riscos Técnicos
- **Compatibilidade limitada**: Implementar fallbacks progressivos
- **Performance**: Otimizar operações de arquivo
- **Conflitos de dados**: Sistema robusto de resolução

### Riscos de Experiência
- **Complexidade**: Interface intuitiva e documentação
- **Migração**: Assistente passo-a-passo
- **Aprendizado**: Tutoriais e exemplos

---

*Documento criado em: Janeiro 2024*
*Versão: 1.0*
*Status: Proposta inicial* 