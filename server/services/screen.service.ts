import { db } from "../db";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { 
  screens, 
  type Screen, 
  type InsertScreen 
} from "@shared/schema";

const memoryScreens: Screen[] = [];

export class ScreenService {
  async getAll(appId: string): Promise<Screen[]> {
    if (!db) {
      const appScreens = memoryScreens
        .filter((screen) => screen.appId === appId)
        .sort((a, b) => a.order - b.order);
      if (appScreens.length > 0) return appScreens;

      const defaultScreen: Screen = {
        id: randomUUID(),
        appId,
        name: "Main Screen",
        order: 0,
        metadata: {},
      };
      memoryScreens.push(defaultScreen);
      return [defaultScreen];
    }
    
    return await db
      .select()
      .from(screens)
      .where(eq(screens.appId, appId))
      .orderBy(screens.order);
  }

  async getById(id: string): Promise<Screen | undefined> {
    if (!db) {
      return memoryScreens.find((screen) => screen.id === id);
    }
    
    const [screen] = await db.select().from(screens).where(eq(screens.id, id));
    return screen;
  }

  async create(screen: InsertScreen): Promise<Screen> {
    if (!db) {
      const newScreen: Screen = {
        id: randomUUID(),
        appId: screen.appId,
        name: screen.name ?? null,
        order: screen.order ?? 0,
        metadata: (screen as any).metadata ?? {},
      };
      memoryScreens.push(newScreen);
      return newScreen;
    }
    
    const [newScreen] = await db.insert(screens).values(screen).returning();
    return newScreen;
  }

  async update(id: string, screen: Partial<InsertScreen>): Promise<Screen | undefined> {
    if (!db) {
      const index = memoryScreens.findIndex((item) => item.id === id);
      if (index < 0) return undefined;
      memoryScreens[index] = { ...memoryScreens[index], ...screen };
      return memoryScreens[index];
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
      const index = memoryScreens.findIndex((item) => item.id === id);
      if (index >= 0) memoryScreens.splice(index, 1);
      return;
    }
    
    await db.delete(screens).where(eq(screens.id, id));
  }
}

export const screenService = new ScreenService();
