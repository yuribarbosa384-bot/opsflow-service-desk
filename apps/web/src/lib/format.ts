import type { DueState, SlaState, TicketCategory, TicketPriority, TicketStatus } from "@opsflow/domain";

export const statusLabel: Record<TicketStatus, string> = {
  backlog: "Pendente",
  triage: "Triagem",
  in_progress: "Em andamento",
  waiting: "Aguardando retorno",
  resolved: "Concluído"
};

export const priorityLabel: Record<TicketPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente"
};

export const categoryLabel: Record<TicketCategory, string> = {
  access: "Acessos",
  documentation: "Documentos",
  automation: "Automação",
  data: "Dados",
  incident: "Incidentes"
};

export const slaLabel: Record<SlaState, string> = {
  healthy: "Dentro do prazo",
  at_risk: "Em risco",
  breached: "Vencido",
  done: "Concluído"
};

export const dueLabel: Record<DueState, string> = {
  overdue: "Vencidas",
  today: "Vencem hoje",
  week: "Vencem em 7 dias"
};

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

export function formatDateInput(value: string): string {
  return value.slice(0, 10);
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
