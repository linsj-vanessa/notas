# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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