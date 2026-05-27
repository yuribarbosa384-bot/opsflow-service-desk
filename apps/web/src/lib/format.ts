import type { SlaState, TicketPriority, TicketStatus } from "@opsflow/domain";

export const statusLabel: Record<TicketStatus, string> = {
  backlog: "Backlog",
  triage: "Triagem",
  in_progress: "Em andamento",
  waiting: "Aguardando",
  resolved: "Resolvido"
};

export const priorityLabel: Record<TicketPriority, string> = {
  low: "Baixa",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente"
};

export const slaLabel: Record<SlaState, string> = {
  healthy: "Dentro do prazo",
  at_risk: "Em risco",
  breached: "Vencido",
  done: "Concluido"
};

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function getPriorityClass(priority: TicketPriority): string {
  return {
    low: "bg-slate-100 text-slate-700",
    medium: "bg-cyan-50 text-cyan-800",
    high: "bg-amber-50 text-amber-800",
    urgent: "bg-rose-50 text-rose-800"
  }[priority];
}

export function getSlaClass(state: SlaState): string {
  return {
    healthy: "bg-emerald-50 text-emerald-800",
    at_risk: "bg-amber-50 text-amber-800",
    breached: "bg-rose-50 text-rose-800",
    done: "bg-slate-100 text-slate-700"
  }[state];
}
