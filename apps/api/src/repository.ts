import { access, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ticketSchema, type Ticket } from "@opsflow/domain";

const ticketArraySchema = ticketSchema.array();

export type TicketRepository = {
  findAll: () => Promise<Ticket[]>;
  replaceAll: (tickets: Ticket[]) => Promise<void>;
};

export class FileTicketRepository implements TicketRepository {
  constructor(
    private readonly dataPath = path.resolve("data/runtime-tickets.json"),
    private readonly seedPath = path.resolve("data/tickets.seed.json")
  ) {}

  async findAll(): Promise<Ticket[]> {
    await this.ensureDataFile();
    const raw = await readFile(this.dataPath, "utf-8");
    return ticketArraySchema.parse(JSON.parse(raw));
  }

  async replaceAll(tickets: Ticket[]): Promise<void> {
    await this.ensureDataFile();
    await writeFile(this.dataPath, `${JSON.stringify(ticketArraySchema.parse(tickets), null, 2)}\n`);
  }

  private async ensureDataFile(): Promise<void> {
    await mkdir(path.dirname(this.dataPath), { recursive: true });

    try {
      await access(this.dataPath);
    } catch {
      await copyFile(this.seedPath, this.dataPath);
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
