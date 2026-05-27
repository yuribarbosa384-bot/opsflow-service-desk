# Decisões Técnicas

## 1. Monorepo

O projeto usa `apps/web`, `apps/api` e `packages/domain`. Essa estrutura separa interface, servidor e regras compartilhadas sem espalhar o produto em vários repositórios.

## 2. Dominio compartilhado

Schemas, tipos, filtros, SLA e estatísticas ficam em `@opsflow/domain`. Assim, a API e a interface compartilham as mesmas regras.

## 3. Persistência local

O projeto usa persistência local em JSON para ser simples de executar em qualquer ambiente. A estrutura do repositório permite evoluir para SQLite ou Postgres sem alterar a interface.

## 4. API REST

Express foi escolhido por permitir rotas claras, validação, tratamento de erro e testes HTTP sem complexidade desnecessária.

## 5. UI operacional

A interface foi pensada para rotina de trabalho: dashboard compacto, filtros claros, tabela escaneável e detalhe lateral. O foco é produtividade, não uma landing page.

## 6. Testes

O projeto cobre três camadas:

- regras de domínio com Vitest
- endpoints da API com Supertest
- formulario React com Testing Library
