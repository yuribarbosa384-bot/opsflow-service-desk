import { useEffect, useState, type FormEvent } from "react";
import { Plus, Save, X } from "lucide-react";
import {
  ticketCategories,
  ticketPriorities,
  ticketStatuses,
  type CreateTicketInput,
  type Ticket,
  type TicketPriority
} from "@opsflow/domain";
import { categoryLabel, formatDateInput, priorityLabel, statusLabel } from "../lib/format";

export type TicketFormPayload = CreateTicketInput & Partial<Pick<Ticket, "status">>;

type TicketFormProps = {
  mode?: "create" | "edit";
  initialValue?: Ticket;
  onSubmit: (input: TicketFormPayload) => Promise<void> | void;
  onCancel: () => void;
};

type FormState = {
  title: string;
  requester: string;
  department: string;
  category: CreateTicketInput["category"];
  priority: TicketPriority;
  status: Ticket["status"];
  assignee: string;
  dueAt: string;
  description: string;
  tags: string;
};

function getDefaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 4);
  return date.toISOString().slice(0, 10);
}

function getInitialState(ticket?: Ticket): FormState {
  if (ticket) {
    return {
      title: ticket.title,
      requester: ticket.requester,
      department: ticket.department,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      assignee: ticket.assignee,
      dueAt: formatDateInput(ticket.dueAt),
      description: ticket.description,
      tags: ticket.tags.join(", ")
    };
  }

  return {
    title: "",
    requester: "",
    department: "",
    category: "automation",
    priority: "medium",
    status: "triage",
    assignee: "Yuri Barbosa",
    dueAt: getDefaultDueDate(),
    description: "",
    tags: ""
  };
}

function toDateTime(value: string): string {
  return new Date(`${value}T18:00:00.000Z`).toISOString();
}

export function TicketForm({ mode = "create", initialValue, onSubmit, onCancel }: TicketFormProps) {
  const [form, setForm] = useState<FormState>(() => getInitialState(initialValue));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setForm(getInitialState(initialValue));
  }, [initialValue]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const payload: TicketFormPayload = {
      title: form.title.trim(),
      requester: form.requester.trim(),
      department: form.department.trim(),
      category: form.category,
      priority: form.priority,
      assignee: form.assignee.trim(),
      dueAt: toDateTime(form.dueAt),
      description: form.description.trim(),
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    };

    if (mode === "edit") {
      payload.status = form.status;
    }

    await onSubmit(payload);

    setIsSubmitting(false);
    setForm(getInitialState());
  }

  const title = mode === "edit" ? "Editar tarefa" : "Nova tarefa";
  const submitLabel = mode === "edit" ? "Salvar alterações" : "Criar tarefa";
  const SubmitIcon = mode === "edit" ? Save : Plus;

  return (
    <form className="rounded-md border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
          type="button"
          onClick={onCancel}
          aria-label="Fechar formulário"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700">Título</span>
          <input
            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
            minLength={4}
            required
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium text-slate-700">Solicitante</span>
          <input
            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
            minLength={2}
            required
            value={form.requester}
            onChange={(event) => setForm({ ...form, requester: event.target.value })}
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium text-slate-700">Área</span>
          <input
            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
            minLength={2}
            required
            value={form.department}
            onChange={(event) => setForm({ ...form, department: event.target.value })}
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium text-slate-700">Responsável</span>
          <input
            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
            minLength={2}
            required
            value={form.assignee}
            onChange={(event) => setForm({ ...form, assignee: event.target.value })}
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium text-slate-700">Prazo</span>
          <input
            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
            required
            type="date"
            value={form.dueAt}
            onChange={(event) => setForm({ ...form, dueAt: event.target.value })}
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium text-slate-700">Categoria</span>
          <select
            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value as CreateTicketInput["category"] })}
          >
            {ticketCategories.map((category) => (
              <option key={category} value={category}>{categoryLabel[category]}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium text-slate-700">Prioridade</span>
          <select
            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
            value={form.priority}
            onChange={(event) => setForm({ ...form, priority: event.target.value as TicketPriority })}
          >
            {ticketPriorities.map((priority) => (
              <option key={priority} value={priority}>{priorityLabel[priority]}</option>
            ))}
          </select>
        </label>

        {mode === "edit" && (
          <label className="md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700">Status</span>
            <select
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value as Ticket["status"] })}
            >
              {ticketStatuses.map((status) => (
                <option key={status} value={status}>{statusLabel[status]}</option>
              ))}
            </select>
          </label>
        )}

        <label className="md:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700">Descrição</span>
          <textarea
            className="min-h-28 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            minLength={12}
            required
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
        </label>

        <label className="md:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700">Tags</span>
          <input
            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
            placeholder="excel, automação, documentos"
            value={form.tags}
            onChange={(event) => setForm({ ...form, tags: event.target.value })}
          />
        </label>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          type="button"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          <SubmitIcon aria-hidden="true" className="h-4 w-4" />
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
