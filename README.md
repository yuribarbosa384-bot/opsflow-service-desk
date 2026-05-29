# OpsFlow Administrativo

Sistema full stack para gestão de tarefas administrativas com dashboard, banco SQLite, filtros inteligentes, criação, edição, exclusão e leitura de gargalos operacionais.

O projeto foi construído para demonstrar capacidade de transformar uma rotina comum de trabalho em produto: modelagem de dados, API, interface, validação, testes automatizados, documentação técnica e decisões de arquitetura.

Repositório: https://github.com/yuribarbosa384-bot/opsflow-service-desk

![Visão geral do OpsFlow](docs/screenshots/overview.png)

## Problema

Equipes administrativas e operacionais costumam acompanhar demandas em planilhas, mensagens soltas e controles paralelos. Isso dificulta saber quem é responsável por cada tarefa, quais prazos estão vencendo, onde há gargalo e quais demandas deveriam ser priorizadas.

O OpsFlow centraliza esse fluxo em uma aplicação web com banco local, dashboard e filtros por status, categoria, responsável, mês e prazo.

## Stack

- React 19, TypeScript, Vite e Tailwind CSS
- Express 5 com API REST
- SQLite local usando `node:sqlite`
- Zod para contratos e validação
- Vitest, Testing Library e Supertest
- GitHub Actions para CI
- Monorepo com web, API e pacote de domínio compartilhado

## O que este projeto demonstra

- Modelagem de domínio com tipos e validação compartilhados
- Banco SQLite com seed, índices e persistência local
- API REST com listagem, filtros, criação, edição, atualização de status e exclusão
- Busca por título, descrição, responsável, categoria, status, datas e mês
- Dashboard com taxa de conclusão, tarefas vencidas, urgentes e em risco
- Insights operacionais para identificar gargalos por categoria, responsável e prazo
- Interface responsiva com tabela, painel de detalhe, formulário e confirmação de exclusão
- Testes de regra de negócio, API e formulário
- Documentação de produto, decisões técnicas e roadmap

## Como rodar

Requisito: Node.js 24 ou superior.

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
GET     /health
GET     /api/analytics
GET     /api/insights
GET     /api/tickets
GET     /api/tickets/:id
POST    /api/tickets
PUT     /api/tickets/:id
PATCH   /api/tickets/:id/status
DELETE  /api/tickets/:id
```

Filtros disponíveis em `GET /api/tickets`:

```text
q
status
priority
category
assignee
month
due
```

## Estudo de caso

### Contexto

O projeto parte de uma dor real em rotinas administrativas: acompanhar documentos, acessos, contratos, relatórios e tarefas internas sem perder prazo nem depender de planilhas descentralizadas.

### Decisões principais

- O domínio fica em `packages/domain` para que API e web usem as mesmas regras.
- A API valida entrada com Zod antes de persistir dados.
- O SQLite deixa o projeto simples de rodar e, ao mesmo tempo, demonstra modelagem com banco real.
- A interface prioriza leitura rápida, status, responsável e prazo porque o usuário operacional precisa decidir o que fazer primeiro.
- A confirmação de exclusão evita perda acidental de dados.

### Evoluções planejadas

- Histórico de eventos por tarefa
- Comentários internos
- Autenticação e perfis de acesso
- Exportação CSV
- Deploy público da web e API
- Testes end-to-end
