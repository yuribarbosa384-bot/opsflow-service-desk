import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TicketForm } from "./TicketForm";

describe("TicketForm", () => {
  it("submits a validated ticket payload", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<TicketForm onSubmit={onSubmit} onCancel={() => undefined} />);

    await user.type(screen.getByLabelText("Titulo"), "Padronizar cadastro de lotes");
    await user.type(screen.getByLabelText("Solicitante"), "Aline Ribeiro");
    await user.type(screen.getByLabelText("Area"), "Operacoes");
    await user.type(screen.getByLabelText("Descricao"), "Criar padrao de cadastro para reduzir erros de digitacao.");
    await user.type(screen.getByLabelText("Tags"), "dados, excel");
    await user.click(screen.getByRole("button", { name: "Criar chamado" }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: "Padronizar cadastro de lotes",
      requester: "Aline Ribeiro",
      department: "Operacoes",
      tags: ["dados", "excel"]
    }));
  });
});
