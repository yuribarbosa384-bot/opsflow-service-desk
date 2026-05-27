import { Search, SlidersHorizontal } from "lucide-react";
import { ticketCategories, ticketPriorities, ticketStatuses, type TicketFilters } from "@opsflow/domain";
import { priorityLabel, statusLabel } from "../lib/format";

type TicketFiltersProps = {
  filters: TicketFilters;
  onChange: (filters: TicketFilters) => void;
};

export function TicketFilters({ filters, onChange }: TicketFiltersProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
        Filtros
      </div>
      <div className="grid gap-3 md:grid-cols-[minmax(220px,1.4fr)_1fr_1fr_1fr]">
        <label className="relative block">
          <span className="sr-only">Buscar chamados</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900"
            placeholder="Buscar por titulo, area ou tag"
            value={filters.q ?? ""}
            onChange={(event) => onChange({ ...filters, q: event.target.value })}
          />
        </label>

        <label>
          <span className="sr-only">Status</span>
          <select
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900"
            value={filters.status ?? ""}
            onChange={(event) => onChange({ ...filters, status: event.target.value ? event.target.value as TicketFilters["status"] : undefined })}
          >
            <option value="">Todos os status</option>
            {ticketStatuses.map((status) => (
              <option key={status} value={status}>{statusLabel[status]}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Prioridade</span>
          <select
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900"
            value={filters.priority ?? ""}
            onChange={(event) => onChange({ ...filters, priority: event.target.value ? event.target.value as TicketFilters["priority"] : undefined })}
          >
            <option value="">Todas as prioridades</option>
            {ticketPriorities.map((priority) => (
              <option key={priority} value={priority}>{priorityLabel[priority]}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Categoria</span>
          <select
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900"
            value={filters.category ?? ""}
            onChange={(event) => onChange({ ...filters, category: event.target.value ? event.target.value as TicketFilters["category"] : undefined })}
          >
            <option value="">Todas as categorias</option>
            {ticketCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
