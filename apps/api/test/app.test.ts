import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { createMemoryRepository } from "../src/repository";
import type { Ticket } from "@opsflow/domain";

const tickets: Ticket[] = [
  {
    id: "tk-test-1",
    title: "Automatizar painel de contratos",
    requester: "Marina Alves",
    department: "Administrativo",
    category: "automation",
    priority: "high",
    status: "in_progress",
    assignee: "Yuri Barbosa",
    description: "Criar acompanhamento de contratos com responsáveis e prazos.",
    tags: ["excel", "power-apps"],
    createdAt: "2026-05-25T12:00:00.000Z",
    updatedAt: "2026-05-25T12:00:00.000Z",
    dueAt: "2026-05-28T12:00:00.000Z"
  }
];

describe("OpsFlow API", () => {
  it("returns health status", async () => {
    const app = createApp(createMemoryRepository(tickets));

    const response = await request(app).get("/health").expect(200);

    expect(response.body).toEqual({ ok: true, service: "opsflow-api" });
  });

  it("filters ticket queue", async () => {
    const app = createApp(createMemoryRepository(tickets));

    const response = await request(app).get("/api/tickets?q=contratos").expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].title).toContain("contratos");
  });

  it("validates and creates a new ticket", async () => {
    const app = createApp(createMemoryRepository(tickets));

    const response = await request(app)
      .post("/api/tickets")
      .send({
        title: "Padronizar cadastro de lotes",
        requester: "Aline Ribeiro",
        department: "Operacoes",
        category: "data",
        priority: "medium",
        assignee: "Yuri Barbosa",
        description: "Criar padrao de cadastro para reduzir erros de digitacao.",
        tags: ["dados"]
      })
      .expect(201);

    expect(response.body.data.id).toMatch(/^tk-/);
    expect(response.body.data.status).toBe("triage");
  });

  it("updates ticket status", async () => {
    const app = createApp(createMemoryRepository(tickets));

    const response = await request(app)
      .patch("/api/tickets/tk-test-1/status")
      .send({ status: "resolved", resolution: "Fluxo validado com a equipe." })
      .expect(200);

    expect(response.body.data.status).toBe("resolved");
    expect(response.body.data.resolution).toContain("Fluxo");
  });
});
