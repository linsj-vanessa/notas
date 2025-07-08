# Notas App - Editor de Notas Local

![Notas App](https://img.shields.io/badge/Next.js-15.3.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.16-38B2AC?style=for-the-badge&logo=tailwind-css)

Editor de notas em Markdown com armazenamento local usando IndexedDB. Todas as suas notas ficam salvas no seu navegador de forma segura e privada.

## 🚀 **Destaque: Editor Rico TipTap - WYSIWYG Moderno**

**A principal funcionalidade do Notas App é o editor rico TipTap!** Editor WYSIWYG moderno que mostra formatação em tempo real:

- 📝 **Editor WYSIWYG** - Vê a formatação conforme digita (sem preview separado)
- ⚡ **Formatação Rica** - **Negrito**, *itálico*, # títulos, listas, links
- 🎯 **Atalhos de Teclado** - Ctrl+B, Ctrl+I e outros atalhos padrão
- 🔄 **Zero Fricção** - Edição visual direta, sem alternar modos

Similar aos melhores editores modernos como **Notion**, **Obsidian** e **Typora**!

## ✨ Funcionalidades

### 📝 **Gestão de Notas**
- ✅ Criar notas com título e conteúdo
- ✅ **Foco Automático**: Cursor vai AUTOMATICAMENTE para o campo de texto ao criar nova nota - zero cliques extras!
- ✅ Editar notas em tempo real
- ✅ Salvar automático (2 segundos de inatividade)
- ✅ **Sistema de Lixeira**: Notas deletadas vão para lixeira ao invés de exclusão permanente
- ✅ **Recuperação de Notas**: Restaurar notas da lixeira facilmente
- ✅ **Limpeza Automática**: Lixeira limpa automaticamente após 30 dias
- ✅ Buscar notas por título ou conteúdo (exclui automaticamente notas da lixeira)
- ✅ Visualizar lista de notas na sidebar

### 📊 **Barra de Status e Estatísticas**
- ✅ **Barra de Status Inferior**: Informações sempre visíveis no canto inferior
- ✅ **Contagem de Palavras**: Acompanhe o progresso da escrita
- ✅ **Contagem de Caracteres**: Total de caracteres incluindo espaços
- ✅ **Contagem de Linhas**: Número total de linhas do documento
- ✅ **Tempo de Leitura**: Estimativa baseada em 200 palavras/min
- ✅ **Status de Salvamento**: Indicador visual de mudanças não salvas
- ✅ **Horário da Última Salvamento**: Timestamp preciso da última alteração
- ✅ **Atualização em Tempo Real**: Contadores se atualizam conforme você digita
- ✅ **Design Profissional**: Similar aos editores como VSCode e Sublime

### 🎨 **Sistema de Temas**
- ✅ **Tema Padrão**: Interface limpa e clara
- ✅ **Tema 1 - Vermelho**: Paleta escura com acentos vermelhos
- ✅ **Tema 2 - Púrpura**: Paleta escura com acentos púrpura
- ✅ **Tema 3 - Amarelo ⭐**: Paleta escura com acentos amarelos vibrantes
- ✅ Alternância fácil entre temas
- ✅ Persistência da escolha do tema
- ✅ Aplicação dinâmica das cores

### 📱 **Interface e Experiência**
- ✅ **Editor Rico TipTap**: WYSIWYG moderno com formatação visual em tempo real
- ✅ **Atalhos de Teclado**: Ctrl+B para negrito, Ctrl+I para itálico, etc.
- ✅ **Formatação Rica**: Títulos, listas, links, código, citações e tabelas
- ✅ **Modo Foco Aprimorado**: Editor fullscreen para máxima concentração
- ✅ Interface responsiva e moderna
- ✅ Renderização visual completa sem necessidade de preview
- ✅ Placeholder dinâmico e responsivo
- ✅ Modais de confirmação elegantes (sem alerts nativos)

### 🗑️ **Sistema de Lixeira**
- ✅ **Exclusão Segura**: Notas deletadas vão para lixeira ao invés de exclusão permanente
- ✅ **Visualização Dedicada**: Interface especializada para gerenciar notas da lixeira
- ✅ **Recuperação Fácil**: Restaurar notas da lixeira com um clique
- ✅ **Exclusão Permanente**: Opção de deletar permanentemente apenas na lixeira
- ✅ **Limpeza Automática**: Notas antigas (30+ dias) são removidas automaticamente
- ✅ **Indicador Visual**: Badge vermelho mostra quantidade de notas na lixeira
- ✅ **Navegação Simples**: Alternância fácil entre notas ativas e lixeira
- ✅ **Operações em Lote**: Opção de esvaziar lixeira completamente

### 💾 **Armazenamento**
- ✅ Armazenamento local no navegador (IndexedDB)
- ✅ Sem necessidade de servidor
- ✅ Dados privados e seguros
- ✅ Sincronização automática

## 🚀 Como Usar

### 1. **Criar uma Nova Nota**
- Clique no botão "Nova Nota" no cabeçalho
- A nota será criada automaticamente e aberta para edição
- **Foco Automático**: O cursor vai direto para o campo de texto - você pode começar a digitar imediatamente
- Funciona tanto no modo normal quanto no modo foco

### 2. **Editar Notas**
- Clique em qualquer nota na sidebar para abri-la
- Edite o título e conteúdo diretamente
- O salvamento é automático após 2 segundos

### 3. **Acompanhar Estatísticas**
- **Barra de Status**: Veja todas as estatísticas na parte inferior da tela
- **Informações Disponíveis**: Palavras, caracteres, linhas, tempo de leitura
- **Status de Salvamento**: Indicador visual de mudanças não salvas
- **Última Salvamento**: Horário preciso da última alteração

### 4. **Editor Rico com TipTap**
- **Formatação Visual**: Veja negrito, itálico, títulos conforme digita
- **Atalhos de Teclado**: Use Ctrl+B, Ctrl+I e outros atalhos padrão
- **Listas Inteligentes**: Digite `- ` ou `1. ` para criar listas automaticamente
- **Links e Código**: Suporte completo a links e blocos de código inline

### 5. **Sistema de Lixeira**
- **Deletar Notas**: Passe o mouse sobre a nota e clique no ícone 🗑️ ou use o botão "Apagar" no cabeçalho
- **Lixeira Inteligente**: Notas deletadas vão para lixeira ao invés de exclusão permanente
- **Acessar Lixeira**: Clique no botão "Lixeira" na sidebar (com badge vermelho se houver notas)
- **Restaurar Notas**: Na lixeira, clique no botão "Restaurar" para recuperar uma nota
- **Exclusão Permanente**: Na lixeira, clique no botão "Deletar" para excluir permanentemente
- **Esvaziar Lixeira**: Use o botão "Esvaziar Lixeira" para remover todas as notas da lixeira
- **Limpeza Automática**: Notas ficam na lixeira por 30 dias antes de serem removidas automaticamente

### 6. **Trocar Tema**
- Clique no botão "Tema" no cabeçalho
- Escolha entre os 4 temas disponíveis:
  - **Tema Padrão**: Cores claras e profissionais
  - **Tema 1 - Vermelho**: Escuro com acentos vermelhos
  - **Tema 2 - Púrpura**: Escuro com acentos púrpura
  - **Tema 3 - Amarelo ⭐**: Escuro com acentos amarelos vibrantes
- O tema será aplicado imediatamente e salvo

### 7. **Buscar Notas**
- Use o campo de busca no cabeçalho
- Digite título ou conteúdo para filtrar as notas
- A busca é instantânea e exclui automaticamente notas da lixeira

### 8. **Interface Centralizada e Estética**
- **Caixinha do Editor**: O editor agora aparece em uma caixa elegante e centralizada
- **Background Discreto**: Fundo suave que destaca o conteúdo da nota
- **Melhor Foco**: A centralização ajuda a manter o foco na escrita
- **Design Profissional**: Interface moderna inspirada nos melhores editores
- **Modo Foco Aprimorado**: No modo foco, a caixa fica ainda maior para máxima concentração

## 🛠️ Tecnologias Utilizadas

- **Next.js 15.3.5**: Framework React moderno
- **TypeScript**: Tipagem estática
- **Tailwind CSS 3.4.16**: Estilização utilitária
- **TipTap**: Editor rico WYSIWYG moderno
- **Dexie.js**: Wrapper para IndexedDB
- **Zustand**: Gerenciamento de estado
- **date-fns**: Manipulação de datas
- **Lucide React**: Ícones modernos

## 📦 Instalação e Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Construir para produção
npm run build

# Executar versão de produção
npm start
```

## 📊 Barra de Status (Canto Inferior)

### Lado Esquerdo - Estatísticas do Texto
- **📝 Palavras**: Contagem total de palavras reais
- **#️⃣ Caracteres**: Total incluindo espaços
- **📊 Linhas**: Número de linhas no documento
- **📖 Tempo de Leitura**: Estimativa para leitura completa (200 palavras/min)

### Lado Direito - Status de Salvamento
- **🟡 Não Salvo**: Indicador pulsante para mudanças não salvas
- **🕒 Salvo às**: Horário exato da última salvamento (formato HH:MM:SS)

### Características da Barra de Status
- **Sempre Visível**: Fixada na parte inferior da tela
- **Atualização em Tempo Real**: Mudanças refletem instantaneamente
- **Design Discreto**: Não interfere na experiência de escrita
- **Formatação Localizada**: Números em formato brasileiro

## 🎨 Temas Disponíveis

### Tema Padrão
- Interface limpa e clara
- Cores neutras e profissionais
- Ideal para uso diário

### Tema 1 - Vermelho
- Paleta escura com acentos vermelhos
- Baseado em cores profissionais de design
- Ideal para ambiente noturno

### Tema 2 - Púrpura
- Paleta escura com acentos púrpura elegantes
- Design moderno e sofisticado
- Ideal para trabalho criativo

### Tema 3 - Amarelo ⭐ (Favorito)
- Paleta escura com acentos amarelos vibrantes
- Alto contraste e energia visual
- Ideal para produtividade e foco

## 🔒 Privacidade e Segurança

- **100% Local**: Todas as notas ficam no seu navegador
- **Sem Servidor**: Não há coleta de dados
- **Sem Internet**: Funciona completamente offline
- **Seus Dados**: Você tem controle total sobre suas informações

## 📄 Licença

Este projeto está sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.

## 👥 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir melhorias
- Enviar pull requests

## 🔄 Changelog

Consulte o arquivo `CHANGELOG.md` para ver as últimas atualizações e melhorias.

---

**Desenvolvido com ❤️ usando Next.js e TypeScript**
