import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Gauge,
  Lightbulb,
  Loader2,
  Pencil,
  Plus,
  RefreshCcw,
  ShieldAlert,
  Trash2
} from "lucide-react";
import {
  ticketStatuses,
  type CreateTicketInput,
  type Ticket,
  type TicketFilters,
  type TicketInsight,
  type TicketStats,
  type TicketStatus,
  type UpdateTicketInput
} from "@opsflow/domain";
import { createTicket, deleteTicket, fetchInsights, fetchStats, fetchTickets, updateTicket, updateTicketStatus } from "./lib/api";
import { categoryLabel, formatDateTime, priorityLabel, statusLabel } from "./lib/format";
import { StatTile } from "./components/StatTile";
import { TicketFilters as TicketFiltersPanel } from "./components/TicketFilters";
import { TicketForm, type TicketFormPayload } from "./components/TicketForm";
import { TicketTable } from "./components/TicketTable";

const emptyStats: TicketStats = {
  total: 0,
  open: 0,
  resolved: 0,
  urgent: 0,
  atRisk: 0,
  breached: 0,
  completionRate: 0,
  overdueRate: 0,
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
  },
  byCategory: {
    access: 0,
    documentation: 0,
    automation: 0,
    data: 0,
    incident: 0
  },
  byAssignee: {}
};

const insightClass: Record<TicketInsight["severity"], string> = {
  info: "border-slate-200 bg-white text-slate-800",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  critical: "border-rose-200 bg-rose-50 text-rose-950",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950"
};

export function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats>(emptyStats);
  const [insights, setInsights] = useState<TicketInsight[]>([]);
  const [filters, setFilters] = useState<TicketFilters>({});
  const [selectedId, setSelectedId] = useState<string>();
  const [formMode, setFormMode] = useState<"create" | "edit">();
  const [ticketToDelete, setTicketToDelete] = useState<Ticket>();
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
      const [ticketData, statsData, insightData] = await Promise.all([
        fetchTickets(nextFilters),
        fetchStats(),
        fetchInsights()
      ]);
      if (requestId !== latestRequestId.current) {
        return;
      }
      setTickets(ticketData);
      setStats(statsData);
      setInsights(insightData);
      setSelectedId((current) => {
        if (current && ticketData.some((ticket) => ticket.id === current)) {
          return current;
        }

        return ticketData[0]?.id;
      });
      setError(undefined);
    } catch {
      if (requestId !== latestRequestId.current) {
        return;
      }
      setError("Não foi possível carregar as tarefas. Verifique se a API está rodando.");
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
    setFormMode(undefined);
    setFilters(clearedFilters);
    await loadData(clearedFilters);
    setSelectedId(ticket.id);
  }

  async function handleUpdateTicket(input: TicketFormPayload) {
    if (!selectedTicket) {
      return;
    }

    const ticket = await updateTicket(selectedTicket.id, input as UpdateTicketInput);
    setFormMode(undefined);
    await loadData(filters);
    setSelectedId(ticket.id);
  }

  async function handleDeleteTicket() {
    if (!ticketToDelete) {
      return;
    }

    await deleteTicket(ticketToDelete.id);
    setTicketToDelete(undefined);
    setFormMode(undefined);
    await loadData(filters);
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
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">OpsFlow Administrativo</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">Sistema de Gestão de Tarefas</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Controle de demandas internas com banco SQLite, filtros por prazo e responsável, edição, exclusão e leitura automática de gargalos.
            </p>
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
              onClick={() => setFormMode("create")}
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              Nova tarefa
            </button>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <StatTile icon={ClipboardList} label="Tarefas abertas" value={stats.open} />
          <StatTile icon={Gauge} label="Conclusão" value={`${stats.completionRate}%`} />
          <StatTile icon={ShieldAlert} label="Urgentes" value={stats.urgent} tone={stats.urgent > 0 ? "danger" : "default"} />
          <StatTile icon={AlertTriangle} label="Em risco" value={stats.atRisk} tone={stats.atRisk > 0 ? "warning" : "default"} />
          <StatTile icon={AlertTriangle} label="Vencidas" value={stats.breached} tone={stats.breached > 0 ? "danger" : "default"} />
          <StatTile icon={CheckCircle2} label="Concluídas" value={stats.resolved} />
        </section>

        <section className="grid gap-3 lg:grid-cols-4">
          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm lg:col-span-1">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Lightbulb aria-hidden="true" className="h-4 w-4 text-cyan-700" />
              Insights operacionais
            </div>
            <div className="space-y-2">
              {insights.map((insight) => (
                <article key={insight.id} className={`rounded-md border p-3 ${insightClass[insight.severity]}`}>
                  <h2 className="text-sm font-semibold">{insight.title}</h2>
                  <p className="mt-1 text-xs leading-5">{insight.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <TicketFiltersPanel filters={filters} onChange={(nextFilters) => void handleFilterChange(nextFilters)} />
          </div>
        </section>

        {error && (
          <section className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
            {error}
          </section>
        )}

        {formMode && (
          <TicketForm
            mode={formMode}
            initialValue={formMode === "edit" ? selectedTicket : undefined}
            onSubmit={(input) => formMode === "edit" ? handleUpdateTicket(input) : handleCreateTicket(input)}
            onCancel={() => setFormMode(undefined)}
          />
        )}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          {isLoading ? (
            <section className="flex min-h-80 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600">
              <Loader2 aria-hidden="true" className="mr-2 h-5 w-5 animate-spin" />
              Carregando tarefas
            </section>
          ) : (
            <TicketTable tickets={tickets} selectedId={selectedTicket?.id} onSelect={(ticket) => setSelectedId(ticket.id)} />
          )}

          <aside className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            {selectedTicket ? (
              <div className="flex h-full flex-col gap-5">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="rounded-sm bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-800">{categoryLabel[selectedTicket.category]}</span>
                    <span className="text-xs text-slate-500">{selectedTicket.id}</span>
                  </div>
                  <h2 className="text-lg font-semibold leading-tight text-slate-950">{selectedTicket.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{selectedTicket.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    type="button"
                    onClick={() => setFormMode("edit")}
                  >
                    <Pencil aria-hidden="true" className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-md border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-50"
                    type="button"
                    onClick={() => setTicketToDelete(selectedTicket)}
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                    Excluir
                  </button>
                </div>

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">Solicitante</dt>
                    <dd className="mt-1 text-slate-900">{selectedTicket.requester}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">Área</dt>
                    <dd className="mt-1 text-slate-900">{selectedTicket.department}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">Responsável</dt>
                    <dd className="mt-1 text-slate-900">{selectedTicket.assignee}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">Prioridade</dt>
                    <dd className="mt-1 text-slate-900">{priorityLabel[selectedTicket.priority]}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs font-semibold uppercase text-slate-500">Prazo</dt>
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
                    <Lightbulb aria-hidden="true" className="h-4 w-4" />
                    Próxima ação
                  </div>
                  Validar bloqueios, ajustar responsável ou prazo quando necessário e manter a tarefa registrada até a conclusão.
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">Nenhuma tarefa encontrada.</p>
            )}
          </aside>
        </div>
      </div>

      {ticketToDelete && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/45 px-4">
          <section className="w-full max-w-md rounded-md border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-rose-50 p-2 text-rose-700">
                <Trash2 aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-950">Excluir tarefa?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  A tarefa "{ticketToDelete.title}" será removida do banco local. Essa ação evita exclusão acidental por exigir confirmação.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                type="button"
                onClick={() => setTicketToDelete(undefined)}
              >
                Cancelar
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-md bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800"
                type="button"
                onClick={() => void handleDeleteTicket()}
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
                Confirmar exclusão
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
