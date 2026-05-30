# Decisões Técnicas

## 1. Monorepo

O projeto usa `apps/web`, `apps/api` e `packages/domain`. Essa estrutura separa interface, servidor e regras compartilhadas sem espalhar o produto em vários repositórios.

## 2. Domínio compartilhado

Schemas, tipos, filtros, SLA, estatísticas e insights ficam em `@opsflow/domain`. Assim, a API e a interface compartilham as mesmas regras de negócio.

## 3. Persistência com SQLite

O projeto usa SQLite local por meio de `node:sqlite`. Essa escolha mantém a execução simples para avaliação técnica e ainda demonstra banco real, tabelas, índices, seed, persistência e trilha de auditoria.

## 4. API REST

Express foi escolhido por permitir rotas claras, validação, tratamento de erro e testes HTTP sem complexidade desnecessária. A API cobre listagem, filtros, criação, edição, atualização de status, exclusão, métricas, insights, histórico e comentários internos.

## 5. UI operacional

A interface foi pensada como uma Central de Operações e SLA: navegação lateral, prioridade de hoje, score de risco, fila operacional, Kanban, relatórios, detalhe lateral e histórico por tarefa. O foco é ajudar o usuário a decidir o que destrava a operação primeiro e registrar por que a decisão foi tomada.

## 6. Testes

O projeto cobre três camadas:

- regras de domínio com Vitest
- endpoints da API com Supertest
- formulário React com Testing Library

## 7. Deploy

A interface possui deploy estático no GitHub Pages com dados demonstrativos. A API Express e o SQLite continuam disponíveis localmente para demonstrar a arquitetura full stack e a persistência real.
