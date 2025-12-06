import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Drizzle users table (persistent database users)
 * Note: This schema is different from MemoryUser used in development.
 */
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

/**
 * Zod schema for inserting new database users
 */
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

/**
 * Type for inserting a new DB user
 */
export type InsertUser = z.infer<typeof insertUserSchema>;

/**
 * Type for selecting a user from the DB
 */
export type User = typeof users.$inferSelect;

/**
 * Type for inserting user with id auto-generated
 */
export type NewUser = typeof users.$inferInsert;
