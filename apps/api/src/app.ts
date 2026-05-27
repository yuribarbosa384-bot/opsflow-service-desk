import { randomUUID } from "node:crypto";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import {
  createTicketSchema,
  filterTickets,
  getDueDateForPriority,
  getTicketStats,
  ticketFilterSchema,
  updateStatusSchema,
  type Ticket,
  type TicketFilters
} from "@opsflow/domain";
import type { TicketRepository } from "./repository";

function asyncRoute(handler: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}

function normalizeFilters(query: Request["query"]): TicketFilters {
  const normalized = Object.fromEntries(
    Object.entries(query)
      .filter(([, value]) => typeof value === "string" && value.length > 0)
      .map(([key, value]) => [key, value])
  );

  return ticketFilterSchema.parse(normalized);
}

export function createApp(repository: TicketRepository) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "opsflow-api" });
  });

  app.get("/api/analytics", asyncRoute(async (_req, res) => {
    const tickets = await repository.findAll();
    res.json({ data: getTicketStats(tickets) });
  }));

  app.get("/api/tickets", asyncRoute(async (req, res) => {
    const filters = normalizeFilters(req.query);
    const tickets = await repository.findAll();
    const filtered = filterTickets(tickets, filters)
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

    res.json({
      data: filtered,
      meta: {
        total: filtered.length,
        filters
      }
    });
  }));

  app.get("/api/tickets/:id", asyncRoute(async (req, res) => {
    const tickets = await repository.findAll();
    const ticket = tickets.find((item) => item.id === req.params.id);

    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    res.json({ data: ticket });
  }));

  app.post("/api/tickets", asyncRoute(async (req, res) => {
    const input = createTicketSchema.parse(req.body);
    const tickets = await repository.findAll();
    const now = new Date();

    const ticket: Ticket = {
      id: `tk-${randomUUID().slice(0, 8)}`,
      ...input,
      status: "triage",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      dueAt: getDueDateForPriority(input.priority, now)
    };

    await repository.replaceAll([ticket, ...tickets]);
    res.status(201).json({ data: ticket });
  }));

  app.patch("/api/tickets/:id/status", asyncRoute(async (req, res) => {
    const input = updateStatusSchema.parse(req.body);
    const tickets = await repository.findAll();
    const index = tickets.findIndex((ticket) => ticket.id === req.params.id);

    if (index === -1) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    const current = tickets[index];
    if (!current) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    const updated: Ticket = {
      ...current,
      status: input.status,
      resolution: input.resolution ?? current.resolution,
      updatedAt: new Date().toISOString()
    };

    tickets[index] = updated;
    await repository.replaceAll(tickets);
    res.json({ data: updated });
  }));

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error && typeof error === "object" && "issues" in error) {
      res.status(400).json({ error: "Validation failed", details: error });
      return;
    }

    res.status(500).json({ error: "Unexpected server error" });
  });

  return app;
}
