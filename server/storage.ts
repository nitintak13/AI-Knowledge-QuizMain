import { randomUUID } from "crypto";

/**
 * In-memory user type.
 * This is intentionally NOT tied to the Drizzle DB schema.
 */
export type MemoryUser = {
  id: string;
  name?: string;
  username?: string;
  password?: string;
};

export type MemoryInsertUser = {
  name?: string;
  username?: string;
  password?: string;
};

export interface IStorage {
  getUser(id: string): Promise<MemoryUser | undefined>;
  getUserByUsername(username: string): Promise<MemoryUser | undefined>;
  createUser(user: MemoryInsertUser): Promise<MemoryUser>;
}

export class MemStorage implements IStorage {
  private users: Map<string, MemoryUser>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<MemoryUser | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<MemoryUser | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: MemoryInsertUser): Promise<MemoryUser> {
    const id = randomUUID();

    const user: MemoryUser = {
      id,
      ...insertUser,
    };

    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
