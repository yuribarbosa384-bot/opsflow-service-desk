import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app";
import { SqliteTicketRepository } from "./repository";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(dirname, "../data/opsflow.sqlite");
const seedPath = path.resolve(dirname, "../data/tickets.seed.json");
const port = Number(process.env.PORT ?? 3333);

const app = createApp(new SqliteTicketRepository(dataPath, seedPath));

app.listen(port, () => {
  console.log(`OpsFlow API listening on http://localhost:${port}`);
});
