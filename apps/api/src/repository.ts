import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { ticketEventSchema, ticketSchema, type Ticket, type TicketEvent } from "@opsflow/domain";

const ticketArraySchema = ticketSchema.array();
const ticketEventArraySchema = ticketEventSchema.array();

export type TicketRepository = {
  findAll: () => Promise<Ticket[]>;
  findEvents: (ticketId?: string) => Promise<TicketEvent[]>;
  replaceAll: (tickets: Ticket[]) => Promise<void>;
  appendEvent: (event: TicketEvent) => Promise<void>;
};

type TicketRow = Omit<Ticket, "tags" | "resolution"> & {
  tags: string;
  resolution: string | null;
};

type TicketEventRow = Omit<TicketEvent, "changes"> & {
  changes: string;
};

function createSeedEvents(tickets: Ticket[]): TicketEvent[] {
  return tickets.flatMap((ticket) => {
    const events: TicketEvent[] = [
      {
        id: `evt-${ticket.id}-created`,
        ticketId: ticket.id,
        type: "created",
        actor: "Sistema demo",
        message: "Tarefa criada a partir da base demonstrativa",
        changes: [
          `Status inicial: ${ticket.status}`,
          `Responsável inicial: ${ticket.assignee}`
        ],
        createdAt: ticket.createdAt
      }
    ];

    if (ticket.updatedAt !== ticket.createdAt) {
      events.push({
        id: `evt-${ticket.id}-updated`,
        ticketId: ticket.id,
        type: ticket.status === "resolved" ? "status_changed" : "updated",
        actor: "Sistema demo",
        message: ticket.status === "resolved" ? "Tarefa concluída na base demonstrativa" : "Tarefa atualizada na base demonstrativa",
        changes: ticket.resolution ? [ticket.resolution] : ["Dados operacionais revisados"],
        createdAt: ticket.updatedAt
      });
    }

    return events;
  });
}

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
    this.seedEventsIfEmpty();
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

  async findEvents(ticketId?: string): Promise<TicketEvent[]> {
    const rows = ticketId
      ? this.db.prepare(`
          SELECT id, ticketId, type, actor, message, changes, createdAt
          FROM ticket_events
          WHERE ticketId = ?
          ORDER BY createdAt DESC
        `).all(ticketId) as TicketEventRow[]
      : this.db.prepare(`
          SELECT id, ticketId, type, actor, message, changes, createdAt
          FROM ticket_events
          ORDER BY createdAt DESC
        `).all() as TicketEventRow[];

    return ticketEventArraySchema.parse(rows.map((row) => ({
      ...row,
      changes: JSON.parse(row.changes) as string[]
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

  async appendEvent(event: TicketEvent): Promise<void> {
    const parsedEvent = ticketEventSchema.parse(event);
    this.db.prepare(`
      INSERT INTO ticket_events (id, ticketId, type, actor, message, changes, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      parsedEvent.id,
      parsedEvent.ticketId,
      parsedEvent.type,
      parsedEvent.actor,
      parsedEvent.message,
      JSON.stringify(parsedEvent.changes),
      parsedEvent.createdAt
    );
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

      CREATE TABLE IF NOT EXISTS ticket_events (
        id TEXT PRIMARY KEY,
        ticketId TEXT NOT NULL,
        type TEXT NOT NULL,
        actor TEXT NOT NULL,
        message TEXT NOT NULL,
        changes TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_ticket_events_ticketId ON ticket_events(ticketId);
      CREATE INDEX IF NOT EXISTS idx_ticket_events_createdAt ON ticket_events(createdAt);
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

  private seedEventsIfEmpty(): void {
    const row = this.db.prepare("SELECT COUNT(*) AS total FROM ticket_events").get() as { total: number };
    if (row.total > 0) {
      return;
    }

    const tickets = ticketArraySchema.parse(JSON.parse(readFileSync(this.seedPath, "utf-8")));
    const insert = this.db.prepare(`
      INSERT INTO ticket_events (id, ticketId, type, actor, message, changes, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    this.db.exec("BEGIN TRANSACTION");
    try {
      for (const event of createSeedEvents(tickets)) {
        insert.run(
          event.id,
          event.ticketId,
          event.type,
          event.actor,
          event.message,
          JSON.stringify(event.changes),
          event.createdAt
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
  let events = ticketEventArraySchema.parse(createSeedEvents(tickets));

  return {
    async findAll() {
      return structuredClone(tickets);
    },
    async findEvents(ticketId) {
      return structuredClone(
        events
          .filter((event) => !ticketId || event.ticketId === ticketId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );
    },
    async replaceAll(nextTickets) {
      tickets = ticketArraySchema.parse(nextTickets);
    },
    async appendEvent(event) {
      events = ticketEventArraySchema.parse([ticketEventSchema.parse(event), ...events]);
    }
  };
}
