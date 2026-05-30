# OpsFlow Administrativo

![CI](https://github.com/yuribarbosa384-bot/opsflow-service-desk/actions/workflows/ci.yml/badge.svg)
![Pages](https://github.com/yuribarbosa384-bot/opsflow-service-desk/actions/workflows/pages.yml/badge.svg)
![CodeQL](https://github.com/yuribarbosa384-bot/opsflow-service-desk/actions/workflows/codeql.yml/badge.svg)

Sistema full stack para priorizar demandas administrativas, detectar gargalos, controlar SLAs e registrar decisões operacionais.

[Demo online](https://yuribarbosa384-bot.github.io/opsflow-service-desk/) · [Repositório](https://github.com/yuribarbosa384-bot/opsflow-service-desk)

![Fluxo do OpsFlow](docs/assets/opsflow-flow.gif)

![Visão geral do OpsFlow](docs/screenshots/overview.png)

## Problema

Equipes administrativas costumam acompanhar documentos, contratos, acessos, aprovações e relatórios em planilhas ou mensagens soltas. Isso dificulta responder perguntas simples:

- O que está vencido?
- Quem está sobrecarregado?
- Qual categoria está travando a operação?
- Qual tarefa precisa ser feita primeiro?

O OpsFlow organiza esse fluxo em uma Central de Operações e SLA com dashboard, score de risco, fila operacional, Kanban, relatórios, auditoria de mudanças e comentários internos.

## Funcionalidades

- Dashboard com tarefas abertas, conclusão, urgentes, vencidas e em risco
- Prioridade automática por score de risco
- Filtros por busca, status, prioridade, categoria, responsável, mês e prazo
- URL compartilhável para filtros ativos
- Chips de filtros ativos e ação para limpar filtros
- Fila operacional com painel lateral de detalhe
- Kanban por etapa do fluxo
- Relatórios simples por status, categoria e responsável
- Exportação CSV da fila filtrada
- CRUD completo de tarefas
- Histórico de eventos por tarefa
- Comentários internos no painel lateral
- Confirmação antes de excluir
- Demo pública com dados demonstrativos
- API local com Express, validação Zod e banco SQLite

## Regra de negócio

O score de risco considera:

- prazo vencido ou vencendo hoje
- prioridade urgente ou alta
- responsável com alta carga
- categoria com gargalo
- tarefas aguardando retorno

Essa regra transforma a aplicação em um painel de decisão, não apenas uma lista de tarefas.

## Stack

- React 19, TypeScript, Vite e Tailwind CSS
- Express 5 com API REST
- SQLite local usando `node:sqlite`
- Zod para contratos e validação
- Vitest, Testing Library e Supertest
- GitHub Actions para CI e deploy no GitHub Pages
- Monorepo com web, API e pacote de domínio compartilhado

## Arquitetura

```mermaid
flowchart LR
  Web["React / Vite"] --> Domain["Pacote de domínio"]
  Api["Express API"] --> Domain
  Api --> Db["SQLite local"]
  Pages["GitHub Pages demo"] --> Demo["Dados demonstrativos"]
```

Decisão técnica documentada: [ADR-001](docs/ADR-001-command-center-architecture.md).

Guia de demo, GitHub Pages, API local e ngrok: [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md).

## Demo online e API local

A demo pública roda no GitHub Pages com dados demonstrativos versionados para que recrutadores consigam abrir, navegar e avaliar o produto sem login, instalação ou dependência de servidor gratuito dormindo.

A API Express com SQLite continua disponível localmente para demonstrar persistência real, contratos REST, validação com Zod e CRUD completo. O próximo passo técnico é publicar esse backend com banco gerenciado em Render, Railway ou Fly.io.

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

Para avaliar API, SQLite e persistência, rode o projeto localmente.

## Scripts

```bash
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

## Qualidade e segurança

- CI com typecheck, testes e build em `main` e pull requests
- Playwright E2E cobrindo criação, filtro, edição e exclusão de tarefa
- Deploy automatizado do frontend estático no GitHub Pages
- CodeQL para análise estática de JavaScript e TypeScript
- Dependabot para npm e GitHub Actions
- Dependency Review para revisar mudanças de dependências em pull requests
- Release notes em [docs/RELEASE_NOTES.md](docs/RELEASE_NOTES.md)

## API

```text
GET     /health
GET     /api/analytics
GET     /api/insights
GET     /api/events
GET     /api/tickets
GET     /api/tickets/:id
GET     /api/tickets/:id/events
POST    /api/tickets
POST    /api/tickets/:id/comments
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

## O que este projeto demonstra

- Modelagem de domínio com tipos e validação compartilhados
- Banco SQLite com seed, índices, persistência local e trilha de auditoria
- API REST com contratos, filtros, métricas, insights e tratamento de erros
- Interface responsiva com dashboard, fila, Kanban, relatórios e painel de detalhe
- Histórico por tarefa com criação, atualização, mudança de status, comentários e exclusão
- Testes de regra de negócio, API e formulário
- CI com typecheck, testes e build
- Deploy estático com GitHub Pages
- Filtros compartilháveis e exportação CSV para aproximar o projeto de uma rotina administrativa real

## Evoluções planejadas

- Autenticação e perfis de acesso
- Notificações por e-mail ou Slack para SLA em risco
- Backend publicado em Render, Railway ou Fly.io
- Mais cenários Playwright para relatórios, Kanban e filtros avançados
- Relatório mensal exportável em PDF
