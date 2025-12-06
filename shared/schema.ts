import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Drizzle users table (database users)
 */
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  username: text("username").notNull().unique(), // MUST NOT pass boolean to unique()

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
 * Type for selecting a user from DB
 */
export type User = typeof users.$inferSelect;

/**
 * Type for inserting user with auto-generated id
 */
export type NewUser = typeof users.$inferInsert;
