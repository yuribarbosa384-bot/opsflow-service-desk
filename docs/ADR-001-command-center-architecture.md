# ADR-001: Command Center architecture

## Context

OpsFlow is a portfolio product for administrative operations. It needs to show more than CRUD: the system should explain priorities, expose operational bottlenecks and keep the domain rules testable.

## Decision

The project uses a small monorepo with three layers:

- `@opsflow/domain`: shared types, validation schemas and risk scoring rules.
- `@opsflow/api`: Express API, SQLite persistence, filters, analytics and insights.
- `@opsflow/web`: React interface with dashboard, operational queue, Kanban, reports and static demo mode.

The public GitHub Pages demo runs without a backend and loads curated demo data. The local version uses the API and SQLite to demonstrate persistence and server-side validation.

## Consequences

- Domain rules can be tested without rendering UI or starting the API.
- Frontend and backend share the same contracts through the domain package.
- Recruiters can test the interface instantly through the public demo.
- API and database behavior still remain demonstrable when the project runs locally.

## Trade-offs

- The public demo does not persist data because GitHub Pages is static.
- SQLite keeps the setup simple, but production deployment would need a managed database.
- Authentication and audit logs are intentionally left for the next product iteration.
