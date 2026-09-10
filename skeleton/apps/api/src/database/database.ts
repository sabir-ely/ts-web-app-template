import dotenv from "dotenv";

{{#if sqlite}}
import NodeSqlite from "node-sqlite3-wasm";
import { Kysely } from "kysely";
import { NodeWasmDialect } from "kysely-wasm";

const { Database } = NodeSqlite;
{{else}}
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
{{/if}}

import type { DB } from "./types"; // this is the Database interface we defined earlier

dotenv.config();

{{#if sqlite}}
const dialect = new NodeWasmDialect({
  database: new Database(process.env.DATABASE_URL ?? "{{name}}.db"),
});
{{else}}
const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString:
      process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/{{name}}",
  }),
});
{{/if}}

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<DB>({
  dialect,
});
