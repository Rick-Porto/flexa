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

  async getByPublicLink(publicLink: string): Promise<App | undefined> {
    if (!db) {
      // Mock data for frontend testing
      if (publicLink === "mock-link") {
        return {
          id: "mock-app-1",
          name: "Sample App",
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          ownerId: "mock-user",
          isPublished: true,
          publicLink: "mock-link",
        };
      }
      return undefined;
    }

    const [app] = await db.select().from(apps).where(eq(apps.publicLink, publicLink));
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

  async publish(id: string, userId: string): Promise<App | undefined> {
    if (!db) {
      // Mock data for frontend testing
      if (id === "mock-app-1") {
        return {
          id: "mock-app-1",
          name: "Sample App",
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          ownerId: userId,
          isPublished: true,
          publicLink: "mock-link",
        };
      }
      return undefined;
    }

    const existing = await this.getById(id);
    if (!existing || existing.ownerId !== userId) {
      return undefined;
    }

    const publicLink = existing.publicLink || crypto.randomUUID().slice(0, 8);
    const [updatedApp] = await db
      .update(apps)
      .set({ isPublished: true, publicLink, updatedAt: new Date() })
      .where(eq(apps.id, id))
      .returning();
    return updatedApp;
  }

  async unpublish(id: string, userId: string): Promise<App | undefined> {
    if (!db) {
      // Mock data for frontend testing
      if (id === "mock-app-1") {
        return {
          id: "mock-app-1",
          name: "Sample App",
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          ownerId: userId,
          isPublished: false,
          publicLink: null,
        };
      }
      return undefined;
    }

    const existing = await this.getById(id);
    if (!existing || existing.ownerId !== userId) {
      return undefined;
    }

    const [updatedApp] = await db
      .update(apps)
      .set({ isPublished: false, publicLink: null, updatedAt: new Date() })
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
