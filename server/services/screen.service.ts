import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { 
  screens, 
  type Screen, 
  type InsertScreen 
} from "@shared/schema";

export class ScreenService {
  async getAll(appId: string): Promise<Screen[]> {
    if (!db) {
      // Mock data for frontend testing
      return [{
        id: "mock-screen-1",
        appId,
        name: "Main Screen",
        order: 0,
        metadata: {},
      }];
    }
    
    return await db
      .select()
      .from(screens)
      .where(eq(screens.appId, appId))
      .orderBy(screens.order);
  }

  async getById(id: string): Promise<Screen | undefined> {
    if (!db) {
      // Mock data for frontend testing
      if (id === "mock-screen-1") {
        return {
          id: "mock-screen-1",
          appId: "mock-app-1",
          name: "Main Screen",
          order: 0,
          metadata: {},
        };
      }
      return undefined;
    }
    
    const [screen] = await db.select().from(screens).where(eq(screens.id, id));
    return screen;
  }

  async create(screen: InsertScreen): Promise<Screen> {
    if (!db) {
      // Mock data for frontend testing
      return {
        id: "new-mock-screen",
        ...screen,
      };
    }
    
    const [newScreen] = await db.insert(screens).values(screen).returning();
    return newScreen;
  }

  async update(id: string, screen: Partial<InsertScreen>): Promise<Screen | undefined> {
    if (!db) {
      // Mock data for frontend testing
      return {
        id,
        appId: "mock-app-1",
        name: screen.name || "Updated Screen",
        order: screen.order || 0,
        metadata: screen.metadata || {},
      };
    }
    
    const [updatedScreen] = await db
      .update(screens)
      .set(screen)
      .where(eq(screens.id, id))
      .returning();
    return updatedScreen;
  }

  async delete(id: string): Promise<void> {
    if (!db) {
      // Mock - do nothing
      return;
    }
    
    await db.delete(screens).where(eq(screens.id, id));
  }
}

export const screenService = new ScreenService();
