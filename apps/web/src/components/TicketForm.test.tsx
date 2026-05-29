import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TicketForm } from "./TicketForm";

describe("TicketForm", () => {
  it("submits a validated ticket payload", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<TicketForm onSubmit={onSubmit} onCancel={() => undefined} />);

    await user.type(screen.getByLabelText("Título"), "Padronizar cadastro de lotes");
    await user.type(screen.getByLabelText("Solicitante"), "Aline Ribeiro");
    await user.type(screen.getByLabelText("Área"), "Operações");
    await user.type(screen.getByLabelText("Descrição"), "Criar padrão de cadastro para reduzir erros de digitação.");
    await user.type(screen.getByLabelText("Tags"), "dados, excel");
    await user.click(screen.getByRole("button", { name: "Criar tarefa" }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: "Padronizar cadastro de lotes",
      requester: "Aline Ribeiro",
      department: "Operações",
      assignee: "Yuri Barbosa",
      tags: ["dados", "excel"]
    }));
  });
});
