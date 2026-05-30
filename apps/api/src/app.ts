import { randomUUID } from "node:crypto";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import {
  createCommentSchema,
  createTicketSchema,
  filterTickets,
  getDueDateForPriority,
  getTicketInsights,
  getTicketStats,
  ticketFilterSchema,
  updateTicketSchema,
  updateStatusSchema,
  type Ticket,
  type TicketEvent,
  type TicketFilters
} from "@opsflow/domain";
import type { TicketRepository } from "./repository";

const actorName = "Yuri Barbosa";

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

function getTicketId(req: Request): string {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] ?? "" : id ?? "";
}

function createTicketEvent(input: Omit<TicketEvent, "id" | "createdAt" | "actor"> & { actor?: string }): TicketEvent {
  const { actor, ...eventInput } = input;
  return {
    id: `evt-${randomUUID().slice(0, 12)}`,
    actor: actor ?? actorName,
    createdAt: new Date().toISOString(),
    ...eventInput
  };
}

function describeTicketChanges(before: Ticket, after: Ticket): string[] {
  const labels: Partial<Record<keyof Ticket, string>> = {
    title: "Título",
    requester: "Solicitante",
    department: "Área",
    category: "Categoria",
    priority: "Prioridade",
    status: "Status",
    assignee: "Responsável",
    description: "Descrição",
    tags: "Tags",
    dueAt: "Prazo",
    resolution: "Resolução"
  };

  return (Object.entries(labels) as Array<[keyof Ticket, string]>)
    .filter(([key]) => JSON.stringify(before[key]) !== JSON.stringify(after[key]))
    .map(([, label]) => `${label} alterado`);
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

  app.get("/api/insights", asyncRoute(async (_req, res) => {
    const tickets = await repository.findAll();
    res.json({ data: getTicketInsights(tickets) });
  }));

  app.get("/api/events", asyncRoute(async (_req, res) => {
    const events = await repository.findEvents();
    res.json({ data: events });
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
    const ticketId = getTicketId(req);
    const tickets = await repository.findAll();
    const ticket = tickets.find((item) => item.id === ticketId);

    if (!ticket) {
      res.status(404).json({ error: "Tarefa não encontrada" });
      return;
    }

    res.json({ data: ticket });
  }));

  app.get("/api/tickets/:id/events", asyncRoute(async (req, res) => {
    const ticketId = getTicketId(req);
    const tickets = await repository.findAll();
    const ticket = tickets.find((item) => item.id === ticketId);

    if (!ticket) {
      res.status(404).json({ error: "Tarefa não encontrada" });
      return;
    }

    const events = await repository.findEvents(ticketId);
    res.json({ data: events });
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
      dueAt: input.dueAt ?? getDueDateForPriority(input.priority, now)
    };

    await repository.replaceAll([ticket, ...tickets]);
    await repository.appendEvent(createTicketEvent({
      ticketId: ticket.id,
      type: "created",
      message: "Tarefa criada",
      changes: [
        `Responsável inicial: ${ticket.assignee}`,
        `Prioridade inicial: ${ticket.priority}`,
        `Prazo inicial: ${ticket.dueAt}`
      ]
    }));
    res.status(201).json({ data: ticket });
  }));

  app.patch("/api/tickets/:id/status", asyncRoute(async (req, res) => {
    const ticketId = getTicketId(req);
    const input = updateStatusSchema.parse(req.body);
    const tickets = await repository.findAll();
    const index = tickets.findIndex((ticket) => ticket.id === ticketId);

    if (index === -1) {
      res.status(404).json({ error: "Tarefa não encontrada" });
      return;
    }

    const current = tickets[index];
    if (!current) {
      res.status(404).json({ error: "Tarefa não encontrada" });
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
    await repository.appendEvent(createTicketEvent({
      ticketId: updated.id,
      type: "status_changed",
      message: `Status alterado de ${current.status} para ${updated.status}`,
      changes: input.resolution ? [`Resolução: ${input.resolution}`] : []
    }));
    res.json({ data: updated });
  }));

  app.put("/api/tickets/:id", asyncRoute(async (req, res) => {
    const ticketId = getTicketId(req);
    const input = updateTicketSchema.parse(req.body);
    const tickets = await repository.findAll();
    const index = tickets.findIndex((ticket) => ticket.id === ticketId);

    if (index === -1) {
      res.status(404).json({ error: "Tarefa não encontrada" });
      return;
    }

    const current = tickets[index];
    if (!current) {
      res.status(404).json({ error: "Tarefa não encontrada" });
      return;
    }

    const updated: Ticket = {
      ...current,
      ...input,
      tags: input.tags ?? current.tags,
      resolution: input.resolution ?? current.resolution,
      updatedAt: new Date().toISOString()
    };

    tickets[index] = updated;
    await repository.replaceAll(tickets);
    const changes = describeTicketChanges(current, updated);
    if (changes.length > 0) {
      await repository.appendEvent(createTicketEvent({
        ticketId: updated.id,
        type: "updated",
        message: "Campos da tarefa atualizados",
        changes
      }));
    }
    res.json({ data: updated });
  }));

  app.post("/api/tickets/:id/comments", asyncRoute(async (req, res) => {
    const ticketId = getTicketId(req);
    const input = createCommentSchema.parse(req.body);
    const tickets = await repository.findAll();
    const index = tickets.findIndex((ticket) => ticket.id === ticketId);

    if (index === -1) {
      res.status(404).json({ error: "Tarefa não encontrada" });
      return;
    }

    const current = tickets[index];
    if (!current) {
      res.status(404).json({ error: "Tarefa não encontrada" });
      return;
    }

    const updated: Ticket = {
      ...current,
      updatedAt: new Date().toISOString()
    };
    tickets[index] = updated;
    await repository.replaceAll(tickets);

    const event = createTicketEvent({
      ticketId: current.id,
      type: "comment_added",
      actor: input.actor,
      message: input.message,
      changes: []
    });
    await repository.appendEvent(event);
    res.status(201).json({ data: event });
  }));

  app.delete("/api/tickets/:id", asyncRoute(async (req, res) => {
    const ticketId = getTicketId(req);
    const tickets = await repository.findAll();
    const ticket = tickets.find((item) => item.id === ticketId);
    const nextTickets = tickets.filter((ticket) => ticket.id !== ticketId);

    if (nextTickets.length === tickets.length) {
      res.status(404).json({ error: "Tarefa não encontrada" });
      return;
    }

    await repository.replaceAll(nextTickets);
    if (ticket) {
      await repository.appendEvent(createTicketEvent({
        ticketId: ticket.id,
        type: "deleted",
        message: `Tarefa excluída: ${ticket.title}`,
        changes: [`Último responsável: ${ticket.assignee}`]
      }));
    }
    res.status(204).send();
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
