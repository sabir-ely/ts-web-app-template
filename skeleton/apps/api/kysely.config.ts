import dotenv from "dotenv";
{{#if sqlite}}
import { Kysely } from "kysely";
import { LibsqlDialect } from "@libsql/kysely-libsql";
{{else}}
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
{{/if}}
import { defineConfig } from "kysely-ctl";

dotenv.config();

{{#if sqlite}}
const db = new Kysely({
  dialect: new LibsqlDialect({
    url: process.env.DATABASE_URL ?? "file:{{name}}.db",
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
