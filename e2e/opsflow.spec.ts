import { expect, test } from "@playwright/test";

test("cria, filtra, edita e exclui uma tarefa administrativa", async ({ page }) => {
  const suffix = Date.now();
  const title = `Validar lote E2E ${suffix}`;
  const updatedTitle = `${title} atualizado`;

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Command Center" })).toBeVisible();

  await page.getByRole("button", { name: "Fila operacional" }).click();
  await page.getByRole("button", { name: "Nova tarefa" }).click();

  const createForm = page.locator("form");
  await createForm.getByLabel("Título").fill(title);
  await createForm.getByLabel("Solicitante").fill("Equipe de Testes");
  await createForm.getByLabel("Área").fill("Qualidade");
  await createForm.getByLabel("Responsável").fill("Yuri Barbosa");
  await createForm.getByLabel("Prazo").fill("2026-06-15");
  await createForm.getByLabel("Categoria").selectOption("documentation");
  await createForm.getByLabel("Prioridade").selectOption("urgent");
  await createForm.getByLabel("Descrição").fill("Validar o fluxo principal de criação, filtro, edição e exclusão.");
  await createForm.getByLabel("Tags").fill("e2e, documentos");
  await page.getByRole("button", { name: "Criar tarefa" }).click();

  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  await page.getByPlaceholder(/Buscar/).fill(title);
  await expect(page).toHaveURL(/q=/);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  await page.getByRole("button", { name: "Editar" }).click();
  const editForm = page.locator("form");
  await editForm.getByLabel("Título").fill(updatedTitle);
  await editForm.getByLabel("Status").selectOption("in_progress");
  await page.getByRole("button", { name: "Salvar alterações" }).click();

  await expect(page.getByRole("heading", { name: updatedTitle })).toBeVisible();
  await expect(page.getByRole("button", { name: "Em andamento" })).toBeVisible();

  await page.getByRole("button", { name: "Excluir" }).click();
  await expect(page.getByRole("heading", { name: "Excluir tarefa?" })).toBeVisible();
  await page.getByRole("button", { name: "Confirmar exclusão" }).click();

  await expect(page.getByText("Nenhuma tarefa encontrada para os filtros atuais")).toBeVisible();
});
