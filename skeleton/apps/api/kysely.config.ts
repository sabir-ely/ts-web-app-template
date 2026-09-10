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
import { defineConfig } from "kysely-ctl";

dotenv.config();

{{#if sqlite}}
const db = new Kysely({
  dialect: new NodeWasmDialect({
    database: new Database(process.env.DATABASE_URL ?? "{{name}}.db"),
  }),
});
{{else}}
const db = new Kysely({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString:
        process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/{{name}}",
    }),
  }),
});
{{/if}}

export default defineConfig({
  kysely: db,
  migrations: {
    migrationFolder: "./src/database/migrations",
  },
});
