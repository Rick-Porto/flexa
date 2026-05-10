import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { 
  dataEntries, 
  type DataEntry, 
  type InsertDataEntry,
  users
} from "@shared/schema";

export class DataEntryService {
  async getAll(appId: string, screenId: string): Promise<DataEntry[]> {
    if (!db) {
      // Mock data for frontend testing
      return [{
        id: "mock-entry-1",
        appId,
        screenId,
        userId: "mock-user",
        data: { name: "John Doe" },
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      }];
    }
    
    return await db
      .select()
      .from(dataEntries)
      .where(
        and(
          eq(dataEntries.appId, appId),
          eq(dataEntries.screenId, screenId),
          eq(dataEntries.isDeleted, false)
        )
      )
      .orderBy(dataEntries.createdAt);
  }

  async getById(id: string): Promise<DataEntry | undefined> {
    if (!db) {
      // Mock data for frontend testing
      if (id === "mock-entry-1") {
        return {
          id: "mock-entry-1",
          appId: "mock-app-1",
          screenId: "mock-screen-1",
          userId: "mock-user",
          data: { name: "John Doe" },
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        };
      }
      return undefined;
    }
    
    const [entry] = await db
      .select()
      .from(dataEntries)
      .where(and(eq(dataEntries.id, id), eq(dataEntries.isDeleted, false)));
    return entry;
  }

  async create(entry: InsertDataEntry): Promise<DataEntry> {
    if (!db) {
      // Mock data for frontend testing
      return {
        id: "new-mock-entry",
        ...entry,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      };
    }
    
    const [newEntry] = await db
      .insert(dataEntries)
      .values(entry)
      .returning();
    return newEntry;
  }

  async update(id: string, entry: Partial<InsertDataEntry>): Promise<DataEntry | undefined> {
    if (!db) {
      // Mock data for frontend testing
      return {
        id,
        appId: "mock-app-1",
        screenId: "mock-screen-1",
        userId: "mock-user",
        data: entry.data || { name: "Updated" },
        version: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      };
    }
    
    // We update the existing entry (or create a new version if we wanted versioning logic, 
    // but here we just update for simplicity as per requirements for now, 
    // although the schema has a version column which we can increment)
    
    // Fetch current to increment version
    const current = await this.getById(id);
    if (!current) return undefined;

    const [updatedEntry] = await db
      .update(dataEntries)
      .set({ 
        ...entry, 
        updatedAt: new Date(),
        version: current.version + 1
      })
      .where(eq(dataEntries.id, id))
      .returning();
    return updatedEntry;
  }

  async delete(id: string): Promise<void> {
    if (!db) {
      // Mock - do nothing
      return;
    }
    
    // Soft delete
    await db
      .update(dataEntries)
      .set({ isDeleted: true })
      .where(eq(dataEntries.id, id));
  }
}

export const dataEntryService = new DataEntryService();
