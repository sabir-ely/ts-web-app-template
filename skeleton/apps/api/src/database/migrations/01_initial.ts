import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("users")
{{#if sqlite}}
    .addColumn("id", "integer", (col) => col.primaryKey())
{{else}}
    .addColumn("id", "serial", (col) => col.primaryKey())
{{/if}}
    .addColumn("username", "text", (col) => col.notNull().unique())
    .addColumn("hashed_password", "text", (col) => col.notNull())
    .addColumn("metadata", "jsonb")
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("users").execute();
}
