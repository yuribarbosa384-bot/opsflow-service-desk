import { Clock3 } from "lucide-react";
import { getSlaState, type Ticket } from "@opsflow/domain";
import { categoryLabel, formatDateTime, getPriorityClass, getSlaClass, priorityLabel, slaLabel, statusLabel } from "../lib/format";

type TicketTableProps = {
  tickets: Ticket[];
  selectedId?: string;
  onSelect: (ticket: Ticket) => void;
};

export function TicketTable({ tickets, selectedId, onSelect }: TicketTableProps) {
  return (
    <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-950">Fila de tarefas administrativas</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-3 font-semibold">Tarefa</th>
              <th className="px-3 py-3 font-semibold">Solicitante</th>
              <th className="px-3 py-3 font-semibold">Responsável</th>
              <th className="px-3 py-3 font-semibold">Categoria</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold">Prioridade</th>
              <th className="px-3 py-3 font-semibold">Prazo</th>
              <th className="px-3 py-3 font-semibold">Entrega</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket) => {
              const sla = getSlaState(ticket);
              const isSelected = ticket.id === selectedId;

              return (
                <tr
                  key={ticket.id}
                  className={`cursor-pointer transition hover:bg-slate-50 ${isSelected ? "bg-cyan-50/70" : "bg-white"}`}
                  onClick={() => onSelect(ticket)}
                >
                  <td className="px-3 py-3">
                    <div className="font-medium text-slate-950">{ticket.title}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {ticket.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-sm bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-700">
                    <div>{ticket.requester}</div>
                    <div className="text-xs text-slate-500">{ticket.department}</div>
                  </td>
                  <td className="px-3 py-3 text-slate-700">{ticket.assignee}</td>
                  <td className="px-3 py-3 text-slate-700">{categoryLabel[ticket.category]}</td>
                  <td className="px-3 py-3 text-slate-700">{statusLabel[ticket.status]}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-sm px-2 py-1 text-xs font-semibold ${getPriorityClass(ticket.priority)}`}>
                      {priorityLabel[ticket.priority]}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-semibold ${getSlaClass(sla)}`}>
                      <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                      {slaLabel[sla]}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-700">{formatDateTime(ticket.dueAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
