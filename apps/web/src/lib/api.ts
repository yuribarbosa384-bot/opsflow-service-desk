import type {
  CreateTicketInput,
  Ticket,
  TicketFilters,
  TicketInsight,
  TicketStats,
  TicketStatus,
  UpdateTicketInput
} from "@opsflow/domain";

type ApiResponse<T> = {
  data: T;
};

const apiBase = import.meta.env.VITE_API_URL ?? "";

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
  const response = await requestJson<ApiResponse<TicketStats>>("/api/analytics");
  return response.data;
}

export async function fetchInsights(): Promise<TicketInsight[]> {
  const response = await requestJson<ApiResponse<TicketInsight[]>>("/api/insights");
  return response.data;
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const response = await requestJson<ApiResponse<Ticket>>("/api/tickets", {
    method: "POST",
    body: JSON.stringify(input)
  });
  return response.data;
}

export async function updateTicket(id: string, input: UpdateTicketInput): Promise<Ticket> {
  const response = await requestJson<ApiResponse<Ticket>>(`/api/tickets/${id}`, {
    method: "PUT",
    body: JSON.stringify(input)
  });
  return response.data;
}

export async function updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket> {
  const response = await requestJson<ApiResponse<Ticket>>(`/api/tickets/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
  return response.data;
}

export async function deleteTicket(id: string): Promise<void> {
  await requestJson<void>(`/api/tickets/${id}`, {
    method: "DELETE"
  });
}
