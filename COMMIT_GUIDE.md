# 📝 Guia de Commits

Este projeto segue as convenções de [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/) para manter um histórico de mudanças claro e organizado.

## 🎯 Formato

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

## 📋 Tipos de Commit

### Principais
- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Mudanças na documentação
- **style**: Mudanças que não afetam a lógica (espaços, formatação, etc.)
- **refactor**: Mudanças de código que não adicionam funcionalidade nem corrigem bugs
- **test**: Adição ou correção de testes
- **chore**: Mudanças no processo de build ou ferramentas auxiliares

### Secundários
- **perf**: Melhorias de performance
- **ci**: Mudanças nos arquivos de CI
- **build**: Mudanças no sistema de build
- **revert**: Reverter um commit anterior

## 🏷️ Escopos Sugeridos

- **editor**: Editor de markdown
- **storage**: Armazenamento local (IndexedDB)
- **search**: Funcionalidade de busca
- **ui**: Interface do usuário
- **notes**: Lógica relacionada às notas
- **config**: Configurações do projeto
- **deps**: Dependências

## ✅ Exemplos de Bons Commits

```bash
# Nova funcionalidade
feat(editor): adiciona preview de markdown em tempo real

# Correção de bug
fix(storage): corrige erro ao salvar notas com caracteres especiais

# Documentação
docs: atualiza README com instruções de instalação

# Estilo/formatação
style(ui): ajusta espaçamento do header

# Refatoração
refactor(notes): extrai lógica de criação de notas para hook separado

# Testes
test(storage): adiciona testes para operações CRUD das notas

# Configuração
chore(deps): atualiza dependências do projeto

# Performance
perf(search): melhora performance da busca com debounce
```

## ❌ Exemplos de Commits Ruins

```bash
# Muito vago
fix: correção

# Sem tipo
adiciona nova funcionalidade

# Muito longo
feat: adiciona nova funcionalidade muito complexa que permite aos usuários criar notas

# Em inglês (projeto em português)
feat: add new feature
```

## 📏 Boas Práticas

1. **Use português** para descrições
2. **Mantenha a primeira linha com até 50 caracteres**
3. **Use o imperativo** ("adiciona" ao invés de "adicionado")
4. **Seja específico** sobre o que mudou
5. **Referencie issues** quando relevante (#123)
6. **Quebre em commits pequenos** e focados
7. **Use o corpo do commit** para explicações mais detalhadas

## 🔄 Workflow Recomendado

```bash
# 1. Crie uma branch para a funcionalidade
git checkout -b feat/nova-funcionalidade

# 2. Faça commits pequenos e focados
git add .
git commit -m "feat(editor): adiciona botão de preview"

# 3. Faça push da branch
git push origin feat/nova-funcionalidade

# 4. Crie um Pull Request
```

## 📚 Recursos

- [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/)
- [Semantic Versioning](https://semver.org/lang/pt-BR/)
- [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) 