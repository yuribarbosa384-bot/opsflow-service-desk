import { useState, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { ticketCategories, ticketPriorities, type CreateTicketInput, type TicketPriority } from "@opsflow/domain";
import { priorityLabel } from "../lib/format";

type TicketFormProps = {
  onSubmit: (input: CreateTicketInput) => Promise<void> | void;
  onCancel: () => void;
};

type FormState = {
  title: string;
  requester: string;
  department: string;
  category: CreateTicketInput["category"];
  priority: TicketPriority;
  description: string;
  tags: string;
};

const initialState: FormState = {
  title: "",
  requester: "",
  department: "",
  category: "automation",
  priority: "medium",
  description: "",
  tags: ""
};

export function TicketForm({ onSubmit, onCancel }: TicketFormProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    await onSubmit({
      title: form.title.trim(),
      requester: form.requester.trim(),
      department: form.department.trim(),
      category: form.category,
      priority: form.priority,
      assignee: "Yuri Barbosa",
      description: form.description.trim(),
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    });

    setIsSubmitting(false);
    setForm(initialState);
  }

  return (
    <form className="rounded-md border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-slate-950">Novo chamado</h2>
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
          type="button"
          onClick={onCancel}
          aria-label="Fechar formulario"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700">Titulo</span>
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
          <span className="mb-1 block text-sm font-medium text-slate-700">Area</span>
          <input
            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
            minLength={2}
            required
            value={form.department}
            onChange={(event) => setForm({ ...form, department: event.target.value })}
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
              <option key={category} value={category}>{category}</option>
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

        <label className="md:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700">Descricao</span>
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
          <Plus aria-hidden="true" className="h-4 w-4" />
          Criar chamado
        </button>
      </div>
    </form>
  );
}
