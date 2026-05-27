import { z } from "zod";

export const ticketStatuses = ["backlog", "triage", "in_progress", "waiting", "resolved"] as const;
export const ticketPriorities = ["low", "medium", "high", "urgent"] as const;
export const ticketCategories = ["access", "documentation", "automation", "data", "incident"] as const;

export const ticketSchema = z.object({
  id: z.string().min(6),
  title: z.string().min(4),
  requester: z.string().min(2),
  department: z.string().min(2),
  category: z.enum(ticketCategories),
  priority: z.enum(ticketPriorities),
  status: z.enum(ticketStatuses),
  assignee: z.string().min(2),
  description: z.string().min(12),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  dueAt: z.string().datetime(),
  resolution: z.string().optional()
});

export const createTicketSchema = ticketSchema
  .pick({
    title: true,
    requester: true,
    department: true,
    category: true,
    priority: true,
    description: true,
    tags: true
  })
  .extend({
    assignee: z.string().min(2).default("Yuri Barbosa")
  });

export const updateStatusSchema = z.object({
  status: z.enum(ticketStatuses),
  resolution: z.string().min(8).optional()
});

export const ticketFilterSchema = z.object({
  q: z.string().optional(),
  status: z.enum(ticketStatuses).optional(),
  priority: z.enum(ticketPriorities).optional(),
  category: z.enum(ticketCategories).optional()
});

export type Ticket = z.infer<typeof ticketSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type TicketFilters = z.infer<typeof ticketFilterSchema>;
export type TicketStatus = (typeof ticketStatuses)[number];
export type TicketPriority = (typeof ticketPriorities)[number];

export type SlaState = "healthy" | "at_risk" | "breached" | "done";

export type TicketStats = {
  total: number;
  open: number;
  resolved: number;
  urgent: number;
  atRisk: number;
  breached: number;
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
};

export function getSlaState(ticket: Ticket, now = new Date()): SlaState {
  if (ticket.status === "resolved") {
    return "done";
  }

  const dueAt = new Date(ticket.dueAt).getTime();
  const current = now.getTime();

  if (current > dueAt) {
    return "breached";
  }

  const hoursLeft = (dueAt - current) / 1000 / 60 / 60;
  return hoursLeft <= 12 ? "at_risk" : "healthy";
}

export function filterTickets(tickets: Ticket[], filters: TicketFilters): Ticket[] {
  const query = filters.q?.trim().toLowerCase();

  return tickets.filter((ticket) => {
    const matchesQuery = !query
      || [ticket.title, ticket.requester, ticket.department, ticket.description, ticket.assignee, ...ticket.tags]
        .join(" ")
        .toLowerCase()
        .includes(query);

    return matchesQuery
      && (!filters.status || ticket.status === filters.status)
      && (!filters.priority || ticket.priority === filters.priority)
      && (!filters.category || ticket.category === filters.category);
  });
}

export function getTicketStats(tickets: Ticket[], now = new Date()): TicketStats {
  const byStatus = Object.fromEntries(ticketStatuses.map((status) => [status, 0])) as Record<TicketStatus, number>;
  const byPriority = Object.fromEntries(ticketPriorities.map((priority) => [priority, 0])) as Record<TicketPriority, number>;

  for (const ticket of tickets) {
    byStatus[ticket.status] += 1;
    byPriority[ticket.priority] += 1;
  }

  return {
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status !== "resolved").length,
    resolved: byStatus.resolved,
    urgent: byPriority.urgent,
    atRisk: tickets.filter((ticket) => getSlaState(ticket, now) === "at_risk").length,
    breached: tickets.filter((ticket) => getSlaState(ticket, now) === "breached").length,
    byStatus,
    byPriority
  };
}

export function getDueDateForPriority(priority: TicketPriority, createdAt = new Date()): string {
  const hoursByPriority: Record<TicketPriority, number> = {
    urgent: 24,
    high: 48,
    medium: 96,
    low: 168
  };
  const dueAt = new Date(createdAt);
  dueAt.setHours(dueAt.getHours() + hoursByPriority[priority]);
  return dueAt.toISOString();
}
