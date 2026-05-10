import { users, type User, type UpsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { appService, AppService } from "./services/app.service";
import { screenService, ScreenService } from "./services/screen.service";
import { componentService, ComponentService } from "./services/component.service";
import { dataEntryService, DataEntryService } from "./services/data-entry.service";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

export class DatabaseStorage implements IAuthStorage {
  public apps: AppService;
  public screens: ScreenService;
  public components: ComponentService;
  public dataEntries: DataEntryService;

  constructor() {
    this.apps = appService;
    this.screens = screenService;
    this.components = componentService;
    this.dataEntries = dataEntryService;
  }

  async getUser(id: string): Promise<User | undefined> {
    if (!db) {
      // Mock user for frontend testing
      return {
        id,
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        profileImageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (!db) {
      // Mock user for frontend testing
      return {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
// Export authStorage for Replit Auth integration compatibility
export const authStorage = storage;
