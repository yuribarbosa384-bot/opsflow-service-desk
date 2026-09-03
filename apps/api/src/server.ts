import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app";
import { SqliteTicketRepository } from "./repository";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(process.env.OPSFLOW_DB_PATH ?? path.resolve(dirname, "../data/opsflow.sqlite"));
const seedPath = path.resolve(process.env.OPSFLOW_SEED_PATH ?? path.resolve(dirname, "../data/tickets.seed.json"));
const port = Number(process.env.PORT ?? 3333);
const host = process.env.OPSFLOW_HOST ?? "127.0.0.1";

const app = createApp(new SqliteTicketRepository(dataPath, seedPath));

app.listen(port, host, () => {
  console.log(`OpsFlow API listening on http://${host}:${port}`);
});
