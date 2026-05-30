# Release notes

## 0.4.0 - Audit timeline

- Added ticket event history for creation, updates, status changes, comments and deletion.
- Added SQLite persistence for the `ticket_events` audit table.
- Added API routes for global audit events, ticket timeline and internal comments.
- Added the timeline and comment composer to the operational side panel.
- Added API Dockerfile and deployment notes for persistent-volume hosting.

## 0.3.0 - Portfolio readiness

- Added shareable filter URLs for the operational queue.
- Added CSV export for filtered tickets.
- Added Playwright E2E coverage for create, filter, edit and delete.
- Added deployment guide with GitHub Pages, local API and ngrok notes.

## 0.2.0 - Command Center

- Repositioned the product around administrative bottleneck management.
- Added risk scoring to prioritize the operational queue.
- Added sidebar navigation, Kanban view, reports and task detail panel.
- Added filter chips and clearer empty states.
- Added GitHub Pages deployment with static demo data.
- Added documentation for roadmap, decisions and architecture.

## 0.1.0 - Service desk foundation

- Added full stack task management with React, Express and SQLite.
- Added Zod validation, shared domain package, tests and CI.
