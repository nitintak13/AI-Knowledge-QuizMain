import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { z } from "zod";

/**
 * Drizzle users table
 */
export const users = pgTable("users", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  name: varchar("name", { length: 255 }).notNull(),

  username: varchar("username", { length: 255 }).notNull().unique(),

  password: text("password").notNull(),
});

/**
 * Zod schema for inserting users
 */
export const insertUserSchema = z.object({
  name: z.string().min(1, "Name is required.").max(255, "Name must be at most 255 characters."),
  username: z.string().min(3, "Username must be at least 3 characters."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

/**
 * Types
 */
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
