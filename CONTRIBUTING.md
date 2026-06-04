# Contributing

Thanks for taking a look at OpsFlow Administrativo. This is a portfolio project, so contributions should preserve the goal: a credible service desk command center with clear business rules, useful demo data, and reliable full-stack quality checks.

## Local Setup

Requirement: Node.js 24 or later.

```bash
npm install
npm run dev
```

Local URLs:

- Web: `http://127.0.0.1:5173`
- API: `http://127.0.0.1:3333`
- Healthcheck: `http://127.0.0.1:3333/health`

## Quality Checklist

Run the relevant checks before opening a pull request:

```bash
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

For UI changes, include desktop and mobile screenshots in the pull request. For API or domain changes, include tests that cover the business rule or route contract.

## Pull Request Guidelines

- Keep changes focused on one workflow, rule, route, or screen.
- Explain the operational problem the change solves.
- Update ADRs or docs when architecture, persistence, deployment, or API contracts change.
- Do not commit secrets, tokens, real client data, or generated database files.
- Keep shared domain logic in the domain package when both web and API depend on it.

## Commit Style

Use short imperative commit messages, for example:

```text
fix: include overdue tasks in risk score
docs: document local api setup
test: cover assignee workload scoring
```
