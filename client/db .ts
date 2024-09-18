import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const client = postgres({
  db: "kanban",
  host: "localhost",
  username: "postgres",
  password: "postgres",
});
export const db = drizzle(client, { schema });
