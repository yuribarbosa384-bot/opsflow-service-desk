import type {
  CreateTicketInput,
  Ticket,
  TicketFilters,
  TicketInsight,
  TicketStats,
  TicketStatus,
  UpdateTicketInput
} from "@opsflow/domain";
import { filterTickets, getTicketInsights, getTicketStats } from "@opsflow/domain";
import { demoTickets } from "../data/demoTickets";

type ApiResponse<T> = {
  data: T;
};

const apiBase = import.meta.env.VITE_API_URL ?? "";
const isBrowser = typeof window !== "undefined";
const isLocalHost = isBrowser && ["localhost", "127.0.0.1"].includes(window.location.hostname);
const useStaticDemo = isBrowser && !apiBase && !isLocalHost;
let demoState = structuredClone(demoTickets);

function sortByDueDate(tickets: Ticket[]): Ticket[] {
  return tickets
    .slice()
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    },
    ...init
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function fetchTickets(filters: TicketFilters): Promise<Ticket[]> {
  if (useStaticDemo) {
    return sortByDueDate(filterTickets(demoState, filters));
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }

  const suffix = params.size > 0 ? `?${params.toString()}` : "";
  const response = await requestJson<ApiResponse<Ticket[]>>(`/api/tickets${suffix}`);
  return response.data;
}

export async function fetchStats(): Promise<TicketStats> {
  if (useStaticDemo) {
    return getTicketStats(demoState);
  }

  const response = await requestJson<ApiResponse<TicketStats>>("/api/analytics");
  return response.data;
}

export async function fetchInsights(): Promise<TicketInsight[]> {
  if (useStaticDemo) {
    return getTicketInsights(demoState);
  }

  const response = await requestJson<ApiResponse<TicketInsight[]>>("/api/insights");
  return response.data;
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  if (useStaticDemo) {
    const now = new Date().toISOString();
    const ticket: Ticket = {
      id: `demo-${Date.now()}`,
      ...input,
      status: "triage",
      assignee: input.assignee ?? "Yuri Barbosa",
      createdAt: now,
      updatedAt: now,
      dueAt: input.dueAt ?? now
    };
    demoState = [ticket, ...demoState];
    return ticket;
  }

  const response = await requestJson<ApiResponse<Ticket>>("/api/tickets", {
    method: "POST",
    body: JSON.stringify(input)
  });
  return response.data;
}

export async function updateTicket(id: string, input: UpdateTicketInput): Promise<Ticket> {
  if (useStaticDemo) {
    const current = demoState.find((ticket) => ticket.id === id);
    if (!current) {
      throw new Error("Task not found");
    }

    const updated: Ticket = {
      ...current,
      ...input,
      tags: input.tags ?? current.tags,
      updatedAt: new Date().toISOString()
    };
    demoState = demoState.map((ticket) => ticket.id === id ? updated : ticket);
    return updated;
  }

  const response = await requestJson<ApiResponse<Ticket>>(`/api/tickets/${id}`, {
    method: "PUT",
    body: JSON.stringify(input)
  });
  return response.data;
}

export async function updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket> {
  if (useStaticDemo) {
    return updateTicket(id, { status });
  }

  const response = await requestJson<ApiResponse<Ticket>>(`/api/tickets/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
  return response.data;
}

export async function deleteTicket(id: string): Promise<void> {
  if (useStaticDemo) {
    demoState = demoState.filter((ticket) => ticket.id !== id);
    return;
  }

  await requestJson<void>(`/api/tickets/${id}`, {
    method: "DELETE"
  });
}
