# Decisoes Tecnicas

## 1. Monorepo

O projeto usa `apps/web`, `apps/api` e `packages/domain`. Isso mostra separacao de responsabilidades sem criar tres repositorios antes da hora.

## 2. Dominio compartilhado

Schemas, tipos, filtros, SLA e estatisticas ficam em `@opsflow/domain`. Assim, a API e a interface falam a mesma lingua.

## 3. JSON local no primeiro ciclo

Prisma e Docker foram avaliados, mas o primeiro teste de instalacao de Prisma demorou demais. Para reduzir risco, o primeiro projeto usa persistencia local em JSON. Isso permite rodar, testar e revisar rapidamente.

## 4. API REST

Express foi escolhido pela curva de leitura simples e por permitir mostrar rotas, validacao, tratamento de erro e testes HTTP sem complexidade desnecessaria.

## 5. UI operacional

A interface foi pensada para rotina de trabalho: dashboard compacto, filtros claros, tabela escaneavel e detalhe lateral. O foco e produtividade, nao uma landing page.

## 6. Testes

O projeto cobre tres camadas:

- regras de dominio com Vitest
- endpoints da API com Supertest
- formulario React com Testing Library

## 7. Publicacao

O repositorio deve ser publicado depois que o username do GitHub estiver profissional. O historico local ja pode ser criado antes disso.
