# Decisões Técnicas

## 1. Monorepo

O projeto usa `apps/web`, `apps/api` e `packages/domain`. Essa estrutura separa interface, servidor e regras compartilhadas sem espalhar o produto em vários repositórios.

## 2. Domínio compartilhado

Schemas, tipos, filtros, SLA, estatísticas e insights ficam em `@opsflow/domain`. Assim, a API e a interface compartilham as mesmas regras de negócio.

## 3. Persistência com SQLite

O projeto usa SQLite local por meio de `node:sqlite`. Essa escolha mantém a execução simples para avaliação técnica e ainda demonstra banco real, tabela, índices, seed e persistência.

## 4. API REST

Express foi escolhido por permitir rotas claras, validação, tratamento de erro e testes HTTP sem complexidade desnecessária. A API cobre listagem, filtros, criação, edição, atualização de status, exclusão, métricas e insights.

## 5. UI operacional

A interface foi pensada para rotina de trabalho: dashboard compacto, filtros por prazo e responsável, tabela escaneável, detalhe lateral e ações diretas. O foco é produtividade, não uma landing page.

## 6. Testes

O projeto cobre três camadas:

- regras de domínio com Vitest
- endpoints da API com Supertest
- formulário React com Testing Library
