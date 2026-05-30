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

    const response = await request(app).get("/api/tickets?q=contratos&assignee=Yuri&month=2026-05").expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].title).toContain("contratos");
  });

  it("returns dashboard insights", async () => {
    const app = createApp(createMemoryRepository(tickets));

    const response = await request(app).get("/api/insights").expect(200);

    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0]).toHaveProperty("title");
  });

  it("validates and creates a new ticket", async () => {
    const app = createApp(createMemoryRepository(tickets));

    const response = await request(app)
      .post("/api/tickets")
      .send({
        title: "Padronizar cadastro de lotes",
        requester: "Aline Ribeiro",
        department: "Operações",
        category: "data",
        priority: "medium",
        assignee: "Yuri Barbosa",
        description: "Criar padrão de cadastro para reduzir erros de digitação.",
        tags: ["dados"]
      })
      .expect(201);

    expect(response.body.data.id).toMatch(/^tk-/);
    expect(response.body.data.status).toBe("triage");
  });

  it("edits a task", async () => {
    const app = createApp(createMemoryRepository(tickets));

    const response = await request(app)
      .put("/api/tickets/tk-test-1")
      .send({
        title: "Automatizar painel administrativo",
        status: "waiting",
        assignee: "Carlos Lima"
      })
      .expect(200);

    expect(response.body.data.title).toBe("Automatizar painel administrativo");
    expect(response.body.data.status).toBe("waiting");
    expect(response.body.data.assignee).toBe("Carlos Lima");

    const events = await request(app).get("/api/tickets/tk-test-1/events").expect(200);
    expect(events.body.data.some((event: { type: string }) => event.type === "updated")).toBe(true);
  });

  it("updates ticket status", async () => {
    const app = createApp(createMemoryRepository(tickets));

    const response = await request(app)
      .patch("/api/tickets/tk-test-1/status")
      .send({ status: "resolved", resolution: "Fluxo validado com a equipe." })
      .expect(200);

    expect(response.body.data.status).toBe("resolved");
    expect(response.body.data.resolution).toContain("Fluxo");

    const events = await request(app).get("/api/tickets/tk-test-1/events").expect(200);
    expect(events.body.data[0].type).toBe("status_changed");
  });

  it("adds internal comments to the audit timeline", async () => {
    const app = createApp(createMemoryRepository(tickets));

    const response = await request(app)
      .post("/api/tickets/tk-test-1/comments")
      .send({ message: "Validar dependência com o financeiro antes do fechamento." })
      .expect(201);

    expect(response.body.data.type).toBe("comment_added");
    expect(response.body.data.actor).toBe("Yuri Barbosa");

    const events = await request(app).get("/api/tickets/tk-test-1/events").expect(200);
    expect(events.body.data[0].message).toContain("financeiro");
  });

  it("deletes a task with confirmation support", async () => {
    const app = createApp(createMemoryRepository(tickets));

    await request(app).delete("/api/tickets/tk-test-1").expect(204);

    const response = await request(app).get("/api/tickets").expect(200);
    expect(response.body.data).toHaveLength(0);

    const events = await request(app).get("/api/events").expect(200);
    expect(events.body.data[0].type).toBe("deleted");
  });
});
