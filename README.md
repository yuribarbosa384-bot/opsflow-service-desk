# OpsFlow Service Desk

Sistema full stack de service desk operacional para controlar chamados, prioridade, SLA e status de atendimento.

O projeto apresenta um fluxo completo de produto: interface, API, validação, regras de negócio, testes automatizados, CI e documentação técnica.

Repositório: https://github.com/yuribarbosa384-bot/opsflow-service-desk

![Visão geral do OpsFlow](docs/screenshots/overview.png)

## Problema

Equipes administrativas e operacionais costumam acompanhar demandas em planilhas, mensagens soltas e controles paralelos. O OpsFlow centraliza a fila de chamados e ajuda a priorizar o que está urgente, vencido ou em risco.

## Stack

- React 19, TypeScript, Vite e Tailwind CSS
- Express 5 com API REST
- Zod para contratos e validação
- Vitest, Testing Library e Supertest
- GitHub Actions para CI
- Persistência local em JSON para facilitar execução e avaliação

## O que este projeto demonstra

- Modelagem de domínio com tipos e validação compartilhados
- API com rotas, filtros, criação e atualização de status
- Interface responsiva com dashboard, filtros, tabela e painel de detalhe
- Testes de regra de negócio, API e formulário
- Documentação de produto, decisões técnicas e roadmap
- Estrutura de monorepo com apps e pacote compartilhado

## Como rodar

```bash
npm install
npm run dev
```

URLs locais:

- Web: http://127.0.0.1:5173
- API: http://127.0.0.1:3333
- Healthcheck: http://127.0.0.1:3333/health

## Scripts

```bash
npm run typecheck
npm run test
npm run build
```

## API

```text
GET    /health
GET    /api/analytics
GET    /api/tickets
GET    /api/tickets/:id
POST   /api/tickets
PATCH  /api/tickets/:id/status
```

Filtros disponíveis em `GET /api/tickets`:

```text
q
status
priority
category
```

## Estudo de caso

### Contexto

O projeto parte de uma dor comum em rotinas administrativas: acompanhar documentos, contratos, acessos e tarefas internas sem perder prazo.

### Decisões principais

- O domínio fica em `packages/domain` para que API e web usem as mesmas regras.
- A API valida entrada com Zod antes de persistir dados.
- A interface prioriza leitura rápida, status e SLA, porque o usuário operacional precisa decidir rápido.
- A persistência local em JSON mantém o projeto simples de executar em uma avaliação técnica.

### Evoluções planejadas

- Autenticação por usuário e perfis de acesso
- Banco SQLite ou Postgres
- Histórico de eventos por chamado
- Deploy da web e API
- Screenshots do produto no README
