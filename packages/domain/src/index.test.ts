import { describe, expect, it } from "vitest";
import {
  filterTickets,
  createCommentSchema,
  getDueDateForPriority,
  getTicketRisk,
  getSlaState,
  ticketEventSchema,
  getTicketInsights,
  getTicketStats,
  type Ticket
} from "./index";

const baseTicket: Ticket = {
  id: "ticket-1",
  title: "Automatizar painel de contratos",
  requester: "Marina Alves",
  department: "Operacoes",
  category: "automation",
  priority: "high",
  status: "in_progress",
  assignee: "Yuri Barbosa",
  description: "Criar fluxo para acompanhar tarefas administrativas.",
  tags: ["power-apps", "excel"],
  createdAt: "2026-05-20T12:00:00.000Z",
  updatedAt: "2026-05-20T12:00:00.000Z",
  dueAt: "2026-05-22T12:00:00.000Z"
};

describe("ticket domain rules", () => {
  it("classifies SLA state from dates and status", () => {
    expect(getSlaState(baseTicket, new Date("2026-05-21T08:00:00.000Z"))).toBe("healthy");
    expect(getSlaState(baseTicket, new Date("2026-05-22T03:00:00.000Z"))).toBe("at_risk");
    expect(getSlaState(baseTicket, new Date("2026-05-23T03:00:00.000Z"))).toBe("breached");
    expect(getSlaState({ ...baseTicket, status: "resolved" }, new Date("2026-05-23T03:00:00.000Z"))).toBe("done");
  });

  it("filters tickets by query and categorical fields", () => {
    const tickets: Ticket[] = [
      baseTicket,
      { ...baseTicket, id: "ticket-2", title: "Revisar acesso ao sistema", category: "access", priority: "low" }
    ];

    expect(filterTickets(tickets, { q: "contratos" })).toHaveLength(1);
    expect(filterTickets(tickets, { q: "maio" })).toHaveLength(2);
    expect(filterTickets(tickets, { q: "22/05/2026" })).toHaveLength(2);
    expect(filterTickets(tickets, { assignee: "yuri" })).toHaveLength(2);
    expect(filterTickets(tickets, { month: "2026-05" })).toHaveLength(2);
    expect(filterTickets(tickets, { due: "overdue" })).toHaveLength(2);
    expect(filterTickets(tickets, { category: "access" })).toHaveLength(1);
    expect(filterTickets(tickets, { priority: "urgent" })).toHaveLength(0);
  });

  it("summarizes queue health for the dashboard", () => {
    const tickets: Ticket[] = [
      baseTicket,
      { ...baseTicket, id: "ticket-2", priority: "urgent", status: "triage", dueAt: "2026-05-20T14:00:00.000Z" },
      { ...baseTicket, id: "ticket-3", priority: "medium", status: "resolved" }
    ];

    const stats = getTicketStats(tickets, new Date("2026-05-21T12:00:00.000Z"));

    expect(stats.total).toBe(3);
    expect(stats.open).toBe(2);
    expect(stats.resolved).toBe(1);
    expect(stats.urgent).toBe(1);
    expect(stats.breached).toBe(1);
    expect(stats.completionRate).toBe(33);
    expect(stats.byCategory.automation).toBe(3);
    expect(stats.byAssignee["Yuri Barbosa"]).toBe(2);
  });

  it("generates operational insights from queue data", () => {
    const insights = getTicketInsights([
      baseTicket,
      { ...baseTicket, id: "ticket-2", priority: "urgent", status: "triage", dueAt: "2026-05-20T14:00:00.000Z" },
      { ...baseTicket, id: "ticket-3", priority: "medium", status: "waiting" },
      { ...baseTicket, id: "ticket-4", priority: "low", status: "resolved" }
    ], new Date("2026-05-21T12:00:00.000Z"));

    expect(insights.map((insight) => insight.id)).toContain("overdue");
    expect(insights.map((insight) => insight.id)).toContain("category");
  });

  it("scores operational risk from deadline, priority and bottlenecks", () => {
    const tickets: Ticket[] = [
      baseTicket,
      { ...baseTicket, id: "ticket-2", priority: "urgent", status: "triage", dueAt: "2026-05-20T14:00:00.000Z" },
      { ...baseTicket, id: "ticket-3", priority: "high", status: "waiting" }
    ];

    const risk = getTicketRisk(tickets[1]!, tickets, new Date("2026-05-21T12:00:00.000Z"));

    expect(risk.score).toBeGreaterThanOrEqual(7);
    expect(risk.level).toBe("critical");
    expect(risk.reasons).toContain("Prazo vencido");
  });

  it("sets clear due dates based on priority", () => {
    expect(getDueDateForPriority("urgent", new Date("2026-05-20T12:00:00.000Z"))).toBe("2026-05-21T12:00:00.000Z");
    expect(getDueDateForPriority("low", new Date("2026-05-20T12:00:00.000Z"))).toBe("2026-05-27T12:00:00.000Z");
  });

  it("validates audit events and internal comments", () => {
    const event = ticketEventSchema.parse({
      id: "evt-ticket-1-created",
      ticketId: "ticket-1",
      type: "created",
      actor: "Yuri Barbosa",
      message: "Tarefa criada",
      createdAt: "2026-05-20T12:00:00.000Z"
    });

    const comment = createCommentSchema.parse({
      message: "Conferir pendências com o financeiro antes de alterar o prazo."
    });

    expect(event.changes).toEqual([]);
    expect(comment.actor).toBe("Yuri Barbosa");
  });
});
