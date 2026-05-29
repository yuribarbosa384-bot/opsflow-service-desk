import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { ticketSchema, type Ticket } from "@opsflow/domain";

const ticketArraySchema = ticketSchema.array();

export type TicketRepository = {
  findAll: () => Promise<Ticket[]>;
  replaceAll: (tickets: Ticket[]) => Promise<void>;
};

type TicketRow = Omit<Ticket, "tags" | "resolution"> & {
  tags: string;
  resolution: string | null;
};

export class SqliteTicketRepository implements TicketRepository {
  private readonly db: DatabaseSync;

  constructor(
    private readonly dbPath = path.resolve("data/opsflow.sqlite"),
    private readonly seedPath = path.resolve("data/tickets.seed.json")
  ) {
    mkdirSync(path.dirname(this.dbPath), { recursive: true });
    this.db = new DatabaseSync(this.dbPath);
    this.createSchema();
    this.seedIfEmpty();
  }

  async findAll(): Promise<Ticket[]> {
    const rows = this.db.prepare(`
      SELECT id, title, requester, department, category, priority, status, assignee,
             description, tags, createdAt, updatedAt, dueAt, resolution
      FROM tickets
      ORDER BY datetime(dueAt) ASC
    `).all() as TicketRow[];

    return ticketArraySchema.parse(rows.map((row) => ({
      ...row,
      tags: JSON.parse(row.tags) as string[],
      resolution: row.resolution ?? undefined
    })));
  }

  async replaceAll(tickets: Ticket[]): Promise<void> {
    const parsedTickets = ticketArraySchema.parse(tickets);
    const insert = this.db.prepare(`
      INSERT INTO tickets (
        id, title, requester, department, category, priority, status, assignee,
        description, tags, createdAt, updatedAt, dueAt, resolution
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    this.db.exec("BEGIN TRANSACTION");
    try {
      this.db.exec("DELETE FROM tickets");
      for (const ticket of parsedTickets) {
        insert.run(
          ticket.id,
          ticket.title,
          ticket.requester,
          ticket.department,
          ticket.category,
          ticket.priority,
          ticket.status,
          ticket.assignee,
          ticket.description,
          JSON.stringify(ticket.tags),
          ticket.createdAt,
          ticket.updatedAt,
          ticket.dueAt,
          ticket.resolution ?? null
        );
      }
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  private createSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        requester TEXT NOT NULL,
        department TEXT NOT NULL,
        category TEXT NOT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL,
        assignee TEXT NOT NULL,
        description TEXT NOT NULL,
        tags TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        dueAt TEXT NOT NULL,
        resolution TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
      CREATE INDEX IF NOT EXISTS idx_tickets_assignee ON tickets(assignee);
      CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
      CREATE INDEX IF NOT EXISTS idx_tickets_dueAt ON tickets(dueAt);
    `);
  }

  private seedIfEmpty(): void {
    const row = this.db.prepare("SELECT COUNT(*) AS total FROM tickets").get() as { total: number };
    if (row.total > 0) {
      return;
    }

    const seed = ticketArraySchema.parse(JSON.parse(readFileSync(this.seedPath, "utf-8")));
    const insert = this.db.prepare(`
      INSERT INTO tickets (
        id, title, requester, department, category, priority, status, assignee,
        description, tags, createdAt, updatedAt, dueAt, resolution
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    this.db.exec("BEGIN TRANSACTION");
    try {
      for (const ticket of seed) {
        insert.run(
          ticket.id,
          ticket.title,
          ticket.requester,
          ticket.department,
          ticket.category,
          ticket.priority,
          ticket.status,
          ticket.assignee,
          ticket.description,
          JSON.stringify(ticket.tags),
          ticket.createdAt,
          ticket.updatedAt,
          ticket.dueAt,
          ticket.resolution ?? null
        );
      }
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
}

export function createMemoryRepository(initialTickets: Ticket[]): TicketRepository {
  let tickets = ticketArraySchema.parse(initialTickets);

  return {
    async findAll() {
      return structuredClone(tickets);
    },
    async replaceAll(nextTickets) {
      tickets = ticketArraySchema.parse(nextTickets);
    }
  };
}
