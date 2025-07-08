# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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