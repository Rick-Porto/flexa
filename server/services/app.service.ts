import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { 
  apps, 
  type App, 
  type InsertApp,
  users
} from "@shared/schema";

export class AppService {
  async getAll(userId?: string): Promise<(App & { owner: typeof users.$inferSelect })[]> {
    if (!db) {
      // Mock data for frontend testing
      return [{
        id: "mock-app-1",
        name: "Sample App",
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: userId || "mock-user",
        owner: {
          id: userId || "mock-user",
          email: "test@example.com",
          firstName: "Test",
          lastName: "User",
          profileImageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }];
    }
    
    const query = db.select().from(apps).leftJoin(users, eq(apps.ownerId, users.id));
    
    if (userId) {
      query.where(eq(apps.ownerId, userId));
    }
    
    const results = await query;
    return results.map(r => ({ ...r.apps, owner: r.users! }));
  }

  async getById(id: string): Promise<App | undefined> {
    if (!db) {
      // Mock data for frontend testing
      if (id === "mock-app-1") {
        return {
          id: "mock-app-1",
          name: "Sample App",
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          ownerId: "mock-user",
        };
      }
      return undefined;
    }
    
    const [app] = await db.select().from(apps).where(eq(apps.id, id));
    return app;
  }

  async create(app: InsertApp): Promise<App> {
    if (!db) {
      // Mock data for frontend testing
      return {
        id: "new-mock-app",
        ...app,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    
    const [newApp] = await db.insert(apps).values(app).returning();
    return newApp;
  }

  async update(id: string, app: Partial<InsertApp>): Promise<App | undefined> {
    if (!db) {
      // Mock data for frontend testing
      return {
        id,
        name: app.name || "Updated App",
        metadata: app.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: "mock-user",
      };
    }
    
    const [updatedApp] = await db
      .update(apps)
      .set({ ...app, updatedAt: new Date() })
      .where(eq(apps.id, id))
      .returning();
    return updatedApp;
  }

  async delete(id: string): Promise<void> {
    if (!db) {
      // Mock - do nothing
      return;
    }
    
    await db.delete(apps).where(eq(apps.id, id));
  }
}

export const appService = new AppService();
