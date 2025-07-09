# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.1.0] - 2025-01-15

### 🚀 **Otimizações de Performance - Lazy Loading**
- **feat: Lazy loading do Dashboard**: Implementado carregamento sob demanda do componente Dashboard usando React.lazy()
- **feat: DashboardSkeleton com shimmer effects**: Criado skeleton component elegante com animações shimmer adaptadas aos temas
- **feat: Lazy loading de modais pesados**: ExportModal, NotificationSettingsModal e BackupModal agora carregam sob demanda
- **feat: Lazy loading do AdvancedSearchModal**: Modal de busca avançada otimizado com carregamento dinâmico
- **feat: NotesListSkeleton**: Skeleton component para lista de notas com feedback visual aprimorado
- **feat: Suspense boundaries**: Implementados fallbacks elegantes para todos os componentes lazy-loaded
- **feat: Animação shimmer**: Adicionada ao Tailwind config com gradientes suaves para melhor UX

### 🎯 **Melhorias na Experiência do Usuário**
- **Navegação mais rápida**: Componentes pesados carregam apenas quando necessário
- **Loading states visuais**: Skeletons realistas que simulam o layout final
- **Performance otimizada**: Redução no bundle inicial da aplicação
- **Fallbacks consistentes**: Loading states padronizados em toda aplicação

### 🛠️ **Implementação Técnica**
- **React.lazy()**: Usado para carregamento dinâmico de componentes
- **Suspense boundaries**: Wrapping de componentes com fallbacks elegantes
- **Shimmer animations**: Efeitos visuais para melhor percepção de performance
- **Code splitting**: Separação automática de chunks para componentes pesados

## [4.0.1] - 2025-01-15

### 🔧 **Correções Críticas**
- **fix: Redirecionamento automático ao criar nova nota**: Implementado redirecionamento para a página do editor quando uma nova nota é criada a partir do dashboard
- **fix: Inicialização de diretórios no sistema de arquivos**: Corrigido erro "Diretórios não inicializados" que ocorria ao escolher sistema de arquivos no setup inicial
- **Navegação melhorada**: Seleção de notas também redireciona automaticamente para o editor quando necessário
- **UX aprimorada**: Usuário agora é direcionado diretamente para escrever após criar uma nova nota

### 🚀 **Melhorias no Sistema de Arquivos**
- **Seleção de pasta no setup**: Adicionada etapa obrigatória de seleção de pasta quando o usuário escolhe sistema de arquivos
- **Inicialização automática**: Diretórios são automaticamente inicializados quando o tipo de armazenamento é configurado
- **Validação de navegador**: Verificação se o navegador suporta File System Access API
- **Tratamento de erros**: Melhor tratamento de erros durante a configuração inicial
- **Interface aprimorada**: Modal de setup agora inclui progresso dinâmico baseado no tipo de armazenamento escolhido

### 🛠️ **Correções Técnicas**
- **AppStoreManager**: Função `setStorageType` agora é assíncrona e inicializa automaticamente o sistema de arquivos
- **AppSetup**: Aguarda corretamente a configuração assíncrona de armazenamento
- **SetupModal**: Nova etapa de seleção de diretório com interface intuitiva
- **Validação**: Melhor validação de tipos TypeScript para File System Access API

## [4.0.0] - 2025-01-15

### 🚀 Sistema de Salvamento Local tipo Obsidian (MEGA UPDATE)

#### 📁 **Infraestrutura de Arquivos Locais**
- **File System Access API**: Acesso nativo e direto ao sistema de arquivos
- **Estrutura Organizada**: Notas/, Lixeira/, .notas-app/ com metadados
- **Formato Markdown**: Conversão automática JSON ↔ Markdown com frontmatter YAML
- **Compatibilidade Externa**: Funciona perfeitamente com Obsidian, VS Code, etc.
- **Detecção Automática**: Verifica suporte do navegador e oferece fallbacks

#### 🔄 **Migração Completa e Segura**
- **Assistente de Migração**: Interface passo-a-passo para migrar do IndexedDB
- **Backup Automático**: Cria backup completo antes de qualquer migração
- **Validação de Integridade**: Verifica dados migrados para garantir 100% de precisão
- **Progresso Visual**: Barra de progresso com etapas detalhadas
- **Teste de Migração**: Opção de testar com poucas notas antes da migração completa

#### 🎯 **Novo Store de Arquivos**
- **Operações CRUD**: Criar, ler, atualizar, deletar notas diretamente em arquivos
- **Sincronização Bidirecional**: Arquivos locais ↔ estado da aplicação
- **Sistema de Lixeira**: Gerenciamento completo da lixeira com arquivos
- **Busca Otimizada**: Filtros por título, conteúdo, tags com performance
- **Cache Inteligente**: Minimiza operações de arquivo desnecessárias

#### 🛠️ **Formato de Arquivo Markdown**
```markdown
---
id: "uuid-da-nota"
title: "Título da Nota"
tags: ["tag1", "tag2"]
created: "2024-01-15T10:30:00.000Z"
updated: "2024-01-15T12:45:00.000Z"
---

# Título da Nota

Conteúdo da nota em **markdown**...
```

#### 🔧 **Componentes de Desenvolvimento**
- **Teste de Sistema**: `/filesystem-test` - Teste completo do File System Access API
- **Assistente de Migração**: `/migration` - Interface completa para migração
- **Teste de Store**: `/file-store-test` - Validação do novo store de arquivos
- **Documentação Completa**: Relatórios de progresso e guias técnicos

#### 📊 **Tecnologias Implementadas**
- **File System Access API**: Acesso direto aos arquivos (Chrome/Edge nativo)
- **Zustand**: Gerenciamento de estado especializado para arquivos
- **TypeScript**: Tipagem completa para todas as operações
- **Markdown + YAML**: Formato padrão da indústria para notas
- **Backup Manager**: Sistema robusto de backup e restauração

#### 🌟 **Compatibilidade**
- **Chrome/Edge**: Suporte completo nativo
- **Firefox**: Funciona com adaptações
- **Safari**: Fallback para download/upload
- **Obsidian**: Compatibilidade 100% com arquivos .md
- **VS Code**: Abertura direta dos arquivos no editor

### 🔄 **Preparação para Futuro Online**
- **Arquitetura Modular**: Preparada para adicionar sincronização online
- **Abstração de Storage**: Base sólida para múltiplos tipos de armazenamento
- **Sistema de Conflitos**: Estrutura pronta para resolução de conflitos
- **API Ready**: Arquitetura preparada para integração com APIs

### 📈 **Métricas de Sucesso**
- **Salvamento Direto**: ✅ Notas salvas diretamente no sistema de arquivos
- **Compatibilidade Externa**: ✅ Funciona com Obsidian e outros editores
- **Migração Segura**: ✅ Zero perda de dados durante migração
- **Interface Intuitiva**: ✅ Assistente passo-a-passo para usuários

## [3.1.0] - 2025-01-13

### 🔧 Plano de Refatoração Estruturado

#### 📋 **Documentação Técnica**
- **Plano Completo**: Análise detalhada da arquitetura atual e proposta de refatoração
- **Cronograma**: 6 fases estruturadas em 12 semanas para modernização do código
- **Análise de Problemas**: Identificação de componentes monolíticos e serviços pesados
- **Solução Modular**: Proposta de arquitetura com componentes focados e stores especializados
- **Métricas de Sucesso**: Objetivos mensuráveis (50% redução arquivos grandes, 30% melhoria performance)

#### 🎯 **Objetivos de Refatoração**
- **Manutenibilidade**: Componentes < 150 linhas, código mais organizado
- **Performance**: Lazy loading, memoização, otimizações de re-render
- **Escalabilidade**: Estrutura modular preparada para crescimento
- **Qualidade**: 80% cobertura de testes, error boundaries, documentação

#### 📊 **Estrutura Proposta**
- **Componentes Modulares**: Divisão do AppLayout em Header, Sidebar, Navigation
- **Stores Especializados**: notesStore, uiStore, settingsStore, searchStore
- **Hooks Customizados**: useNoteOperations, useTrashOperations, useSearch
- **Serviços Organizados**: Analytics, Export, Search, Backup especializados
- **Tipos Centralizados**: Organização por domínio (note, ui, store, service)

#### 🛠️ **Arquivos Criados**
- `docs/REFACTOR_PLAN.md` - Plano detalhado de refatoração
- `docs/REFACTOR_SUMMARY.md` - Resumo executivo
- `README.md` - Seção de desenvolvimento e refatoração

### 🔄 Preparação para Modernização
- **Baseline Estabelecida**: Estado atual documentado para comparação
- **Cronograma Definido**: 6 fases com entregas específicas
- **Métricas Definidas**: KPIs para medir sucesso da refatoração
- **Próximos Passos**: Phase 1 pronta para execução (refatoração AppLayout)

## [3.0.0] - 2025-01-13

### 🚀 Suite Completa de Produtividade (MEGA UPDATE)

#### 📊 **Dashboard de Produtividade**
- **Métricas Avançadas**: Total de palavras, dias ativos, notas criadas, streak atual/melhor
- **Meta Diária Configurável**: Defina e acompanhe metas personalizadas de palavras
- **Heatmap Interativo**: Visualização estilo GitHub com 5 níveis de atividade
- **Gráfico de Tendências**: Evolução das palavras nos últimos 30 dias com SVG customizado
- **16 Conquistas Desbloqueáveis**: Sistema gamificado em 4 categorias (produtividade, consistência, marcos, qualidade)
- **Análise de Insights**: Palavras mais usadas, estilo de escrita, nível de leitura
- **Filtros Temporais**: Visualização por semana, mês ou ano
- **Navegação Prioritária**: Dashboard como primeira opção na navegação

#### 📤 **Sistema de Exportação de Relatórios**
- **Múltiplos Formatos**: PDF (formatado para impressão), CSV (planilhas), JSON (dados brutos)
- **Filtros por Período**: Exporte dados de períodos específicos ou personalizados
- **Relatórios Detalhados**: Incluem métricas, conquistas, insights e atividade recente
- **Nomes Personalizados**: Defina nomes customizados para seus arquivos
- **Modal Elegante**: Interface organizada com preview das opções de exportação

#### 🔔 **Sistema de Notificações Inteligentes**
- **Lembretes Personalizáveis**: Configure horário, frequência e dias da semana
- **Notificações de Conquistas**: Seja avisado ao desbloquear novas conquistas
- **Permissões Automáticas**: Solicita e gerencia permissões do navegador
- **Controle Inteligente**: Para automaticamente quando você escreve no dia
- **Teste de Funcionamento**: Botão para verificar se as notificações estão ativas
- **Modal de Configuração**: Interface completa para todas as configurações

#### 🛡️ **Sistema de Backup Automático**
- **Backup Programado**: Backups automáticos configuráveis (diário, semanal, mensal)
- **Backup Manual**: Criação instantânea com nomes personalizados
- **Gestão Completa**: Visualize, restaure e delete backups existentes
- **Restauração Flexível**: Opções para substituir tudo ou mesclar dados
- **Validação de Integridade**: Verificação automática da validade dos backups
- **Formato Estruturado**: Backups em JSON com metadados completos

#### 🔍 **Busca Avançada e Inteligente**
- **Busca Instantânea**: Resultados em tempo real com dropdown interativo
- **Filtros Avançados**: Por data, tags, tipo de conteúdo e critérios de ordenação
- **Navegação por Teclado**: Suporte completo a setas e Enter para seleção
- **Destaque de Termos**: Palavras encontradas destacadas nos resultados
- **Modal de Filtros**: Interface completa para buscas complexas
- **Busca em Deletadas**: Opção de incluir notas da lixeira
- **Barra Melhorada**: Nova barra de busca com sugestões e funcionalidades avançadas

### 🔧 **Integração e Experiência**
- **Persistência Avançada**: Todas as configurações salvas no localStorage
- **Analytics em Tempo Real**: Cálculos instantâneos de métricas de produtividade
- **Interface Cohesiva**: Todos os modais seguem o mesmo design system
- **Performance Otimizada**: Cálculos eficientes mesmo com grandes volumes de dados
- **Feedback Visual**: Mensagens de sucesso/erro em todas as operações

### 🎯 **Gamificação Completa**
- **Conquistas Progressivas**: De "Primeiro Passo" até "Escritor Prolífico" (10.000 palavras)
- **Streaks de Consistência**: Marcos de 3, 7, 30 e 100 dias consecutivos
- **Metas de Qualidade**: Conquistas por sessões longas e produtivas
- **Sistema Visual**: Ícones, cores e descrições para cada conquista
- **Progresso Transparente**: Visualização clara do que falta para próximas conquistas

### 📈 **Analytics Avançados**
- **Sessões de Escrita**: Detecção automática de sessões baseada em timestamps
- **Cálculo de Streaks**: Algoritmo inteligente para dias consecutivos
- **Dados de Heatmap**: 5 níveis de atividade com cores graduais
- **Tendências**: Análise de crescimento semanal e mensal
- **Insights de Texto**: Análise de vocabulário e complexidade

### 🔄 **Arquitetura Robusta**
- **Novos Serviços**: AnalyticsService, ExportService, NotificationService, BackupService
- **Tipos TypeScript**: Interfaces completas para todas as funcionalidades
- **Hooks Customizados**: Facilitam integração em qualquer componente
- **Padrão Singleton**: Garantia de instância única dos serviços
- **Error Handling**: Tratamento robusto de erros em todas as operações

## [2.0.0] - 2025-01-08

### ✨ Sistema de Lixeira Completo (MAJOR UPDATE)
- **Lixeira Inteligente**: Notas deletadas são movidas para lixeira ao invés de exclusão permanente
- **Recuperação Fácil**: Funcionalidade completa de restaurar notas da lixeira
- **Exclusão Segura**: Opção de exclusão permanente apenas na lixeira
- **Limpeza Automática**: Notas antigas na lixeira são removidas automaticamente após 30 dias
- **Interface Dedicada**: Visualização especializada da lixeira com interface intuitiva
- **Navegação Simples**: Alternância fácil entre notas ativas e lixeira

### 🎯 Indicadores Visuais da Lixeira
- **Badge com Contador**: Indicador visual mostrando quantidade de notas na lixeira
- **Atualização Automática**: Contador atualizado automaticamente a cada 30 segundos
- **Código de Cores**: Badge vermelho para destacar presença de notas na lixeira
- **Feedback Instantâneo**: Contador atualizado imediatamente após ações de delete/restore

### 🔧 Melhorias na Experiência do Usuário
- **Prevenção de Perda**: Eliminado risco de perda acidental de notas importantes
- **Confirmação Dupla**: Modais de confirmação para ações destrutivas
- **Busca Inteligente**: Resultados de busca excluem automaticamente notas da lixeira
- **Informações Contextuais**: Datas de criação e exclusão visíveis na lixeira
- **Operações em Lote**: Opção de esvaziar lixeira completamente

### 🛠️ Arquitetura Técnica
- **Banco de Dados**: Esquema atualizado para versão 2 com campos `isDeleted` e `deletedAt`
- **Soft Delete**: Implementação de exclusão lógica ao invés de física
- **Scheduler Automático**: Sistema de limpeza periódica com intervalo configurável
- **Componente TrashView**: Interface especializada para gestão da lixeira
- **Funções do Store**: `moveToTrash`, `restoreFromTrash`, `permanentDelete`, `emptyTrash`

### 🔄 Migração e Compatibilidade
- **Migração Transparente**: Notas existentes migradas automaticamente
- **Compatibilidade**: Funciona com todas as notas criadas anteriormente
- **Performance**: Otimizado para grandes quantidades de notas
- **Manutenção**: Limpeza automática mantém banco de dados limpo

## [1.9.0] - 2025-01-08

### ✨ Editor Rico com TipTap (MAJOR UPDATE)
- **Editor WYSIWYG**: Substituído textarea simples por editor rico TipTap
- **Formatação Rica**: Suporte nativo a **negrito**, *itálico*, títulos H1-H6
- **Listas Inteligentes**: Listas numeradas e com marcadores com auto-indentação
- **Links e Código**: Suporte completo a links e blocos de código
- **Citações**: Blockquotes com formatação visual elegante
- **Tabelas**: Criação e edição de tabelas markdown diretamente no editor

### 🎯 Experiência de Edição Moderna
- **Visual Instantâneo**: Vê a formatação conforme digita (sem necessidade de preview)
- **Atalhos de Teclado**: Ctrl+B, Ctrl+I e outros atalhos padrão funcionam
- **Placeholder Dinâmico**: Placeholder personalizado e responsivo
- **Foco Automático**: Cursor automático em novas notas mantido
- **Performance**: Editor otimizado para grandes documentos

### 🔧 Integração Perfeita
- **Sistema Existente**: Integrado completamente com save automático
- **Modo Foco**: TipTap funciona perfeitamente no modo foco
- **Temas**: Suporte completo aos temas claro/escuro existentes
- **Scrollbar Notion**: Mantida experiência de scroll customizada
- **StatusBar**: Contagem de caracteres e estatísticas mantidas

### 📦 Técnico - TipTap
- **Dependências**: @tiptap/react, @tiptap/starter-kit, extensões Typography, Placeholder
- **Componente Customizado**: `TipTapEditor` com ref forwarding e props flexíveis
- **Conversão HTML**: Função auxiliar para conversão HTML → Markdown
- **Estilos Integrados**: CSS customizado alinhado com design system existente
- **StarterKit**: Configuração completa com headings, listas, formatação

### 🔄 Migração Técnica
- **Remoção Preview**: Sistema de preview automático removido (não mais necessário)
- **Refs Atualizadas**: Migradas de TextareaRef para TipTapEditorRef
- **Lógica Simplificada**: Código mais limpo sem sistema dual preview/edit
- **ReactMarkdown**: Removido react-markdown e remark-gfm das dependências

## [1.8.0] - 2025-01-08

### ✨ Preview Automático Inline - Estilo Obsidian/Notion (MAJOR UPDATE)
- **Preview No Mesmo Local**: Markdown renderizado automaticamente na mesma área onde você digita
- **Timer Inteligente**: 3 segundos após parar de digitar → automaticamente vira preview
- **Clique para Editar**: Clique no preview para voltar instantaneamente ao modo edição
- **Experiência Fluida**: Similar ao Obsidian, Notion e outros editores WYSIWYG modernos
- **Foco Automático**: Cursor automaticamente no textarea ao voltar para edição

### 🎯 Indicadores Visuais Intuitivos
- **Badge de Preview**: Indicador "📖 Preview - Clique para editar" no canto superior direito
- **Hover Effect**: Fundo sutil aparece ao passar mouse sobre o preview
- **Cursor de Texto**: Indicação visual clara de que é clicável para editar
- **Transições Suaves**: Animações de 200ms para mudanças de estado

### 🔧 Melhorado
- **UX Obsidian-Style**: Experiência de edição similar aos melhores editores markdown
- **Fluxo Zero-Friction**: Sem botões para apertar, tudo automático e intuitivo
- **Detecção Inteligente**: Sistema detecta quando você está editando vs. lendo
- **Modo Foco Consistente**: Mesma experiência automática no modo foco
- **Performance**: Timer otimizado que não interfere na digitação

### 🔄 Comportamento Automático
- **Timer de 3s**: Preview automático após 3 segundos de inatividade
- **Volta Instantânea**: Qualquer digitação volta imediatamente para edição
- **Notas Novas**: Sempre começam em modo edição com foco no textarea
- **Preserva Estado**: Lembra se você estava editando ou visualizando

### 📦 Técnico
- Timer `useEffect` com cleanup para preview automático
- Estado `isPreviewMode` reintroduzido para controle automático
- Função `handlePreviewClick` com foco automático no textarea
- Indicadores visuais com Tailwind CSS e transições
- Layout responsivo mantido com preview inline

## [1.7.7] - 2025-01-08

### ✨ Modal de Confirmação Personalizado
- **Interface Elegante**: Substituído alert nativo por modal customizado para exclusão de notas
- **Design Consistente**: Modal segue o design system do app com bordas, sombras e animações
- **Ícone de Alerta**: Ícone de triangulo de alerta para melhor comunicação visual
- **Botão de Fechar**: X no canto superior direito para fechar o modal
- **Backdrop Clicável**: Clicar fora do modal fecha a confirmação
- **Animação Suave**: Transição fade-in e zoom-in com duração de 200ms

### 🔧 Melhorado
- **UX Profissional**: Experiência mais polida comparado aos alerts nativos do navegador
- **Consistência Visual**: Modal integrado com os temas existentes do app
- **Acessibilidade**: Botões bem definidos com cores e tamanhos adequados
- **Funcionalidade Completa**: Modal disponível tanto na sidebar quanto no modo foco
- **Responsividade**: Modal se adapta a diferentes tamanhos de tela

### 🐛 Corrigido
- **Botão Apagar Modo Foco**: Adicionado botão de apagar no cabeçalho do modo foco
- **Alerts Nativos**: Removidos todos os alerts nativos de confirmação
- **Consistência de Interface**: Todas as confirmações agora usam o mesmo modal

### 📦 Técnico
- Novo componente `ConfirmationModal` em `components/ui/`
- Estado de modal adicionado em `AppLayout` e `page.tsx`
- Props configuráveis: título, mensagem, textos dos botões, variante
- Suporte a backdrop click e tecla ESC (via botão X)
- Z-index 50 para garantir sobreposição correta

## [1.7.6] - 2025-01-08

### ✨ Foco Automático em Novas Notas - CORRIGIDO
- **Captura Instantânea**: Ao criar uma nova nota, o cursor vai automaticamente para o textarea
- **Zero Cliques Extra**: Elimina completamente a necessidade de clicar no campo de texto
- **Notas Realmente Vazias**: Notas criadas sem título padrão para funcionamento correto
- **ForwardRef Corrigido**: Componente Textarea agora suporta refs corretamente
- **Título Automático**: Título padrão aplicado apenas no momento do salvamento

### 🔧 Melhorado
- **Timeout Aumentado**: Delay de 200ms para garantir renderização completa
- **Detecção Precisa**: Notas vazias detectadas corretamente sem título padrão
- **Salvamento Inteligente**: Títulos padrão aplicados apenas quando necessário
- **UX Perfeita**: Fluxo direto de criação para escrita sem interrupções

### 🐛 Corrigido
- **ForwardRef**: Componente `Textarea` agora usa `React.forwardRef` corretamente
- **Refs Funcionais**: Referencias para textareas funcionando em todos os modos
- **Criação Limpa**: Notas criadas com `title: ''` em vez de título padrão automático

### 📦 Técnico
- Componente `Textarea` refatorado com `forwardRef` e `displayName`
- Store alterado para criar notas realmente vazias
- Lógica de título padrão movida para `handleSave`
- Timeout aumentado para 200ms para maior compatibilidade

## [1.7.5] - 2025-01-08

### ✨ Melhoria de UX - Auto-Edição
- **Novas Notas em Edição**: Ao clicar em "Nova Nota", ela abre automaticamente no modo de edição
- **Detecção Inteligente**: Sistema detecta notas vazias (sem título e conteúdo) e força modo de edição
- **UX Otimizada**: Usuário pode começar a escrever imediatamente sem clicar em "Editar"
- **Comportamento Consistente**: Funciona tanto no modo normal quanto no modo foco

### 🔧 Melhorado
- **Scroll no Textarea**: Corrigido scroll que havia desaparecido no modo de edição
- **Fluxo de Criação**: Criação de notas mais fluida e intuitiva
- **Produtividade**: Menos cliques para começar a escrever uma nova nota

### 📦 Técnico
- Lógica adicionada no `useEffect` para detectar notas novas
- Aplicação automática do `setIsPreviewMode(false)` para notas vazias
- Scrollbar estilo Notion aplicado no Textarea

## [1.7.4] - 2025-01-08

### 🎨 Scrollbar Estilo Notion
- **Sempre Visível**: Scrollbar agora fica sempre visível, não desaparece
- **Ultra Fino**: Reduzido para 3px, ainda mais discreto que antes
- **Inspirado no Notion**: Design baseado na interface do Notion
- **Consistência Global**: Aplicado em toda a aplicação (editor, preview, sidebar)
- **Sem Hover**: Remove dependência de hover para mostrar o scroll

### 🔧 Melhorado
- **Nova Classe CSS**: `.notion-scrollbar` substitui classes anteriores
- **Visibilidade Constante**: Scroll sempre presente para melhor UX
- **Design Minimalista**: Cor sutil que não interfere no conteúdo
- **Responsividade**: Funciona em todos os modos e componentes

### 📦 Técnico
- Nova classe `.notion-scrollbar` no `globals.css`
- Aplicada em `page.tsx` e `AppLayout.tsx`
- Scrollbar de 3px com transparência otimizada
- Removida lógica de hover para simplificar

## [1.7.3] - 2025-01-08

### 🎨 Reposicionamento de Scroll
- **Scroll no Canto Esquerdo**: Scrollbar agora fica o mais próximo possível da borda esquerda
- **Espaçamento Lateral Mantido**: Conteúdo das notas mantém espaçamento apenas nas laterais
- **Nova Classe CSS**: Criada `left-edge-scrollbar` com scrollbar de 4px para melhor posicionamento
- **Estrutura Reorganizada**: Container de scroll ocupa toda largura, padding aplicado apenas no conteúdo
- **Ambos os Modos**: Implementação consistente no modo normal e modo foco

### 🔧 Melhorado
- **Scrollbar Mais Fino**: Reduzido de 6px para 4px para ser menos intrusivo
- **Posicionamento Preciso**: Scroll posicionado no extremo esquerdo da área de conteúdo
- **Transições Suaves**: Mantidas animações de 0.3s para hover
- **Responsividade**: Ajustes aplicados tanto no modo normal quanto foco

### 📦 Técnico
- Nova classe `.left-edge-scrollbar` no `globals.css`
- Reestruturação de containers em `page.tsx`
- Padding lateral movido para elementos internos
- Scrollbar otimizado para webkit browsers

## [1.7.2] - 2025-01-08

### 🎨 Ajustes Estéticos
- **Interface Limpa**: Removida caixinha visual (bordas, sombras, background)
- **Centralização Simples**: Mantida centralização apenas com espaçamento elegante
- **Background Neutro**: Removido fundo colorido para interface mais clean
- **Foco no Conteúdo**: Editor agora é completamente integrado ao layout
- **Scrollbar Sutil**: Scrollbar customizado que aparece apenas no hover
- **Consistência**: Ajustes aplicados em todos os modos (normal, foco, preview)

### 🔧 Melhorado
- **Experiência Visual**: Interface mais minimalista e moderna
- **Scrollbar Customizado**: Scrollbar de 6px que aparece só no hover
- **Posicionamento**: Scrollbar posicionado no canto superior direito
- **Transparência**: Scrollbar quase invisível até fazer hover
- **Suavidade**: Transições suaves de 0.3s para aparecer/desaparecer
- **Padding Otimizado**: Espaçamento interno mantido para boa legibilidade
- **Responsividade**: Mantida largura máxima inteligente
- **Performance**: Layout mais leve sem elementos decorativos

## [1.7.1] - 2025-01-08

### 🐛 Corrigido
- **Erro de Data Inválida**: Corrigido "Invalid time value" no StatusBar
- **Validação de Data**: Adicionada verificação robusta para `currentNote.updatedAt`
- **Formatação Segura**: StatusBar agora verifica se a data é válida antes de formatar
- **Estabilidade**: Prevenção de crashes por datas inválidas do IndexedDB

### 🔧 Reorganização do Projeto
- **Centralização**: Movido tudo para `notas-app/` como projeto principal
- **Limpeza**: Removidos arquivos desnecessários da raiz (`package.json`, `README.md`)
- **Docs Removidos**: Pasta `docs/` removida para upload limpo no GitHub
- **GitHub Ready**: Projeto pronto para push com estrutura otimizada

### 📦 Técnico
- Validação de data em `useEffect` do componente principal
- Conversão automática de strings de data para objetos `Date`
- Fallback para data atual em caso de valores inválidos
- Verificação `isNaN(date.getTime())` no StatusBar

## [1.7.0] - 2025-01-08

### ✨ Adicionado
- **Editor Centralizado**: Caixinha elegante e centralizada para escrita
- **Background Estético**: Fundo suave (`bg-muted/20`) que destaca o conteúdo
- **Interface Profissional**: Design inspirado nos melhores editores modernos
- **Modo Foco Aprimorado**: Caixa maior (`max-w-5xl`) para máxima concentração
- **Tela de Boas-vindas**: Card centralizado com design consistente

### 🔧 Melhorado
- **Experiência Visual**: Maior foco no conteúdo com layout centralizado
- **Responsividade**: Largura máxima inteligente (`max-w-4xl` normal, `max-w-5xl` foco)
- **Consistência**: Todos os modos (normal, foco, preview) seguem o mesmo padrão
- **Padding Otimizado**: Espaçamento interno (`p-8`) para melhor legibilidade

### 📦 Técnico
- Reestruturação do layout principal em `page.tsx`
- Container centralizado com `flex items-start justify-center`
- Cards com `border`, `shadow-sm` e `rounded-lg`
- Background uniforme em todos os modos de visualização

## [1.6.0] - 2025-01-08

### ✨ Adicionado
- **Modo Foco**: Botão para esconder sidebar e usar tela cheia
- **Interface limpa**: Editor em tela cheia para escrita concentrada
- **Alternância rápida**: Botão no cabeçalho com ícones intuitivos
- **Persistência**: Estado do modo foco salvo entre sessões
- **Auto-exit**: Sai automaticamente do modo foco ao deletar nota

### 🔧 Melhorado
- **Store Zustand**: Adicionado gerenciamento de estado para modo foco
- **Layout responsivo**: Melhor adaptação para modo foco
- **UX otimizada**: Transições suaves entre modos

### 📦 Técnico
- Novo estado `isFocusMode` no store principal
- Componente condicional para renderização de layout
- Persistência via localStorage com Zustand persist

## [1.5.0] - 2025-01-08

### ✨ Adicionado
- **Barra de Status**: Estatísticas no canto inferior esquerdo
- **Design profissional**: Estilo similar ao VSCode/Sublime Text
- **Estatísticas completas**: Palavras, caracteres, linhas, tempo de leitura
- **Status de salvamento**: Indicador visual de mudanças não salvas
- **Timestamp preciso**: Horário exato da última salvamento

### 🔧 Melhorado
- **Interface limpa**: Removidas estatísticas do cabeçalho
- **Responsividade**: Barra adaptável para diferentes telas
- **Performance**: Cálculos otimizados em tempo real

### 📦 Técnico
- Componente `StatusBar` dedicado
- Integração com todos os temas existentes
- Formatação localizada para português brasileiro

## [1.4.0] - 2025-01-08

### ✨ Adicionado
- **Sistema de Estatísticas**: Contagem em tempo real
- **Componente TextStats**: Exibição de palavras, caracteres, linhas
- **Tempo de leitura**: Estimativa baseada em 200 WPM
- **Formatação brasileira**: Números localizados (1.234 palavras)
- **Biblioteca text-stats**: Cálculos otimizados e reutilizáveis

### 🔧 Melhorado
- **Performance**: Cálculos memoizados com useMemo
- **Responsividade**: Versões desktop e mobile das estatísticas
- **Precisão**: Contagem de parágrafos e linhas melhorada

### 📦 Técnico
- Nova biblioteca `lib/text-stats.ts`
- Componente `TextStats` reutilizável
- Integração com store Zustand para reatividade

## [1.3.0] - 2025-01-08

### ✨ Adicionado
- **Tema Amarelo ⭐**: Novo tema favorito com acentos amarelos vibrantes
- **Paleta profissional**: Cores #192230, #3d474c, #ffed00, #2c2f38
- **Marcação especial**: Emoji ⭐ indicando tema favorito
- **Integração completa**: Suporte a todos os componentes

### 🔧 Melhorado
- **Seletor de temas**: Atualizado com 4 opções completas
- **Consistência visual**: Todos os temas seguem padrão profissional
- **Acessibilidade**: Contraste otimizado em todos os temas

### 📦 Técnico
- Definição do tema amarelo em `lib/themes.ts`
- Variáveis CSS para cores do tema amarelo
- Testes de compatibilidade com todos os componentes

## [1.2.0] - 2025-01-08

### ✨ Adicionado
- **Tema Púrpura**: Segundo tema personalizado
- **Paleta elegante**: Cores #1e202c, #60519b, #31323c, #bfc0d1
- **Design sofisticado**: Acentos púrpura profissionais
- **Modo escuro**: Integração automática com tema escuro

### 🔧 Melhorado
- **Sistema de temas**: Expandido para suportar múltiplos temas
- **Seletor visual**: Interface melhorada para escolha de temas
- **Persistência**: Temas salvos entre sessões

### 📦 Técnico
- Estrutura extensível para novos temas
- Componente `ThemeSelector` otimizado
- Store dedicado para gerenciamento de temas

## [1.1.0] - 2025-01-08

### ✨ Adicionado
- **Sistema de Temas**: Primeiro tema personalizado (Vermelho)
- **Paleta vermelha**: Cores #19171b, #75020f, #51080d, #2b0307
- **Componente ThemeSelector**: Seletor de temas no cabeçalho
- **Store de temas**: Gerenciamento com Zustand
- **Persistência**: Tema escolhido salvo localmente

### 🔧 Melhorado
- **Funcionalidade de deletar**: Botão de lixeira na sidebar + confirmação
- **UX melhorada**: Navegação inteligente após deletar nota ativa
- **Interface polida**: Botões com hover states e feedback visual

### 🐛 Corrigido
- **CSS não aplicado**: Downgrade Tailwind v4.x → v3.4.16 (estável)
- **Conflitos de configuração**: postcss.config.js corrigido
- **Estabilidade**: Remoção de dependências beta instáveis

### 📦 Técnico
- Tailwind CSS 3.4.16 (versão estável)
- Configuração postcss padrão
- Nova arquitetura de temas com CSS variables

## [1.0.0] - 2025-01-08

### 🎉 Lançamento Inicial
- **Editor de Notas**: Interface completa para criar e editar notas
- **Suporte a Markdown**: Renderização completa de Markdown com syntax highlighting
- **Armazenamento Local**: Persistência usando IndexedDB
- **Visualização e Edição**: Alternância entre modos de visualização e edição
- **Salvar Automático**: Salvamento automático após 2 segundos de inatividade
- **Sidebar Inteligente**: Lista de notas com preview e informações de data
- **Interface Moderna**: Design limpo e profissional com Tailwind CSS

### 🛠️ Tecnologias
- Next.js 15.3.5
- TypeScript
- Tailwind CSS 3.4.16
- Dexie.js para IndexedDB
- Zustand para gerenciamento de estado
- React Markdown para renderização
- date-fns para formatação de datas

### 📦 Configuração
- Configuração completa do projeto
- Scripts de desenvolvimento e produção
- Linting e formatação automática
- Documentação inicial

---

## Próximas Versões Planejadas

### [1.1.0] - Funcionalidades Básicas
- 🗑️ Funcionalidade de deletar notas
- 🏷️ Sistema de tags/categorias
- ⌨️ Atalhos de teclado
- 📤 Exportar notas como arquivos .md

### [1.2.0] - Melhorias de UX
- 🌙 Modo escuro manual
- 🔍 Busca avançada com Fuse.js
- 📱 Melhorias de responsividade
- ⚡ Otimizações de performance

### [2.0.0] - Recursos Avançados
- ☁️ Sincronização com Google Drive
- 📲 PWA (Progressive Web App)
- 🔄 Sincronização em tempo real
- 📊 Estatísticas de uso 