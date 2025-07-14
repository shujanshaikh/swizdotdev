// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import type { InferSelectModel } from "drizzle-orm";
import {
  jsonb,
  pgTableCreator,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `swiz_${name}`);

export const project = createTable("project", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Project = InferSelectModel<typeof project>;

export const message = createTable("message", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  projectId: uuid("project_id").references(() => project.id),
  model: text("model"),
  parts: jsonb("parts").notNull(),
  role: varchar("role").notNull(),
  attachments: jsonb("attachments"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type DBMessage = InferSelectModel<typeof message>;
