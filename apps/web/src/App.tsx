import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardList, Loader2, Plus, RefreshCcw, ShieldAlert, Sparkles } from "lucide-react";
import {
  ticketStatuses,
  type CreateTicketInput,
  type Ticket,
  type TicketFilters,
  type TicketStats,
  type TicketStatus
} from "@opsflow/domain";
import { createTicket, fetchStats, fetchTickets, updateTicketStatus } from "./lib/api";
import { formatDateTime, priorityLabel, statusLabel } from "./lib/format";
import { StatTile } from "./components/StatTile";
import { TicketFilters as TicketFiltersPanel } from "./components/TicketFilters";
import { TicketForm } from "./components/TicketForm";
import { TicketTable } from "./components/TicketTable";

const emptyStats: TicketStats = {
  total: 0,
  open: 0,
  resolved: 0,
  urgent: 0,
  atRisk: 0,
  breached: 0,
  byStatus: {
    backlog: 0,
    triage: 0,
    in_progress: 0,
    waiting: 0,
    resolved: 0
  },
  byPriority: {
    low: 0,
    medium: 0,
    high: 0,
    urgent: 0
  }
};

export function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats>(emptyStats);
  const [filters, setFilters] = useState<TicketFilters>({});
  const [selectedId, setSelectedId] = useState<string>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const latestRequestId = useRef(0);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedId) ?? tickets[0],
    [selectedId, tickets]
  );

  async function loadData(nextFilters = filters) {
    const requestId = latestRequestId.current + 1;
    latestRequestId.current = requestId;
    setIsLoading(true);
    setError(undefined);

    try {
      const [ticketData, statsData] = await Promise.all([
        fetchTickets(nextFilters),
        fetchStats()
      ]);
      if (requestId !== latestRequestId.current) {
        return;
      }
      setTickets(ticketData);
      setStats(statsData);
      setSelectedId((current) => current ?? ticketData[0]?.id);
      setError(undefined);
    } catch {
      if (requestId !== latestRequestId.current) {
        return;
      }
      setError("Nao foi possivel carregar os chamados. Verifique se a API esta rodando.");
    } finally {
      if (requestId === latestRequestId.current) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    void loadData(filters);
  }, []);

  async function handleFilterChange(nextFilters: TicketFilters) {
    setFilters(nextFilters);
    await loadData(nextFilters);
  }

  async function handleCreateTicket(input: CreateTicketInput) {
    const ticket = await createTicket(input);
    const clearedFilters: TicketFilters = {};
    setIsFormOpen(false);
    setFilters(clearedFilters);
    await loadData(clearedFilters);
    setSelectedId(ticket.id);
  }

  async function handleStatusChange(status: TicketStatus) {
    if (!selectedTicket) {
      return;
    }

    const ticket = await updateTicketStatus(selectedTicket.id, status);
    await loadData(filters);
    setSelectedId(ticket.id);
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 md:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">OpsFlow</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">Service Desk Operacional</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              type="button"
              onClick={() => void loadData(filters)}
            >
              <RefreshCcw aria-hidden="true" className="h-4 w-4" />
              Atualizar
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              type="button"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              Novo chamado
            </button>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatTile icon={ClipboardList} label="Chamados abertos" value={stats.open} />
          <StatTile icon={ShieldAlert} label="Urgentes" value={stats.urgent} tone={stats.urgent > 0 ? "danger" : "default"} />
          <StatTile icon={AlertTriangle} label="Em risco" value={stats.atRisk} tone={stats.atRisk > 0 ? "warning" : "default"} />
          <StatTile icon={AlertTriangle} label="Vencidos" value={stats.breached} tone={stats.breached > 0 ? "danger" : "default"} />
          <StatTile icon={CheckCircle2} label="Resolvidos" value={stats.resolved} />
        </section>

        <TicketFiltersPanel filters={filters} onChange={(nextFilters) => void handleFilterChange(nextFilters)} />

        {error && (
          <section className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
            {error}
          </section>
        )}

        {isFormOpen && (
          <TicketForm onSubmit={handleCreateTicket} onCancel={() => setIsFormOpen(false)} />
        )}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          {isLoading ? (
            <section className="flex min-h-80 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600">
              <Loader2 aria-hidden="true" className="mr-2 h-5 w-5 animate-spin" />
              Carregando chamados
            </section>
          ) : (
            <TicketTable tickets={tickets} selectedId={selectedTicket?.id} onSelect={(ticket) => setSelectedId(ticket.id)} />
          )}

          <aside className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            {selectedTicket ? (
              <div className="flex h-full flex-col gap-5">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="rounded-sm bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-800">{selectedTicket.category}</span>
                    <span className="text-xs text-slate-500">{selectedTicket.id}</span>
                  </div>
                  <h2 className="text-lg font-semibold leading-tight text-slate-950">{selectedTicket.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{selectedTicket.description}</p>
                </div>

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">Solicitante</dt>
                    <dd className="mt-1 text-slate-900">{selectedTicket.requester}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">Area</dt>
                    <dd className="mt-1 text-slate-900">{selectedTicket.department}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">Prioridade</dt>
                    <dd className="mt-1 text-slate-900">{priorityLabel[selectedTicket.priority]}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">Vencimento</dt>
                    <dd className="mt-1 text-slate-900">{formatDateTime(selectedTicket.dueAt)}</dd>
                  </div>
                </dl>

                <div>
                  <div className="mb-2 text-xs font-semibold uppercase text-slate-500">Status</div>
                  <div className="grid grid-cols-2 gap-2">
                    {ticketStatuses.map((status) => (
                      <button
                        key={status}
                        className={`rounded-md border px-3 py-2 text-left text-sm font-medium transition ${
                          selectedTicket.status === status
                            ? "border-slate-950 bg-slate-950 text-white"
                            : "border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                        type="button"
                        onClick={() => void handleStatusChange(status)}
                      >
                        {statusLabel[status]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-auto rounded-md border border-cyan-100 bg-cyan-50 p-3 text-sm text-cyan-950">
                  <div className="mb-1 flex items-center gap-2 font-semibold">
                    <Sparkles aria-hidden="true" className="h-4 w-4" />
                    Proxima acao
                  </div>
                  Priorizar chamados vencidos, validar dependencia com o solicitante e registrar resolucao antes de mover para concluido.
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">Nenhum chamado encontrado.</p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
