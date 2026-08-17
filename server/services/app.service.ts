import { db } from "../db";
import { eq } from "drizzle-orm";
import {
  apps,
  type App,
  type InsertApp,
  users
} from "@shared/schema";
import { screens, components } from "@shared/schema";

const memoryApps: App[] = [];

function getUserAppList(userId?: string): App[] {
  return memoryApps.filter((app) => !userId || app.ownerId === userId);
}

export class AppService {
  async getAll(userId?: string): Promise<(App & { owner: typeof users.$inferSelect })[]> {
    if (!db) {
      return getUserAppList(userId).map((app) => ({
        ...app,
        owner: {
          id: app.ownerId,
          email: "local@flexa.dev",
          firstName: "Local",
          lastName: "User",
          profileImageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as typeof users.$inferSelect,
      }));
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
      return memoryApps.find((app) => app.id === id);
    }

    const [app] = await db.select().from(apps).where(eq(apps.id, id));
    return app;
  }

  async getByPublicLink(publicLink: string): Promise<App | undefined> {
    const dbConn = db;
    if (!dbConn) return undefined;

    const [app] = await dbConn.select().from(apps).where(eq(apps.publicLink, publicLink));
    return app;
  }

  async getPublicAppWithScreens(publicLink: string): Promise<{ app: App; screens: any[] } | undefined> {
    const dbConn = db;
    if (!dbConn) return undefined;

    const [app] = await dbConn.select().from(apps).where(eq(apps.publicLink, publicLink));
    if (!app || !app.isPublished) return undefined;

    // Get screens for this app
    const appScreens = await dbConn.select().from(screens).where(eq(screens.appId, app.id)).orderBy(screens.order);

    // Get components for each screen
    const screensWithComponents = await Promise.all(appScreens.map(async (screenRow) => {
      const screenComponents = await dbConn.select().from(components).where(eq(components.screenId, screenRow.id));
      return { ...screenRow, components: screenComponents };
    }));

    return { app, screens: screensWithComponents };
  }

  async getPublished(): Promise<(App & { owner: typeof users.$inferSelect })[]> {
    if (!db) return [];

    const query = db.select().from(apps).leftJoin(users, eq(apps.ownerId, users.id)).where(eq(apps.isPublished, true));

    const results = await query;
    return results.map(r => ({ ...r.apps, owner: r.users! }));
  }

  async create(app: any): Promise<App> {
    if (!db) {
      const newApp: App = {
        id: `local-${Date.now()}`,
        name: app.name ?? null,
        description: app.description ?? null,
        metadata: app.metadata ?? {},
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: app.ownerId ?? "local-user",
        publicLink: app.publicLink ?? null,
        isPublished: app.isPublished ?? false,
      } as App;
      memoryApps.push(newApp);
      return newApp;
    }

    const [newApp] = await db.insert(apps).values(app as any).returning();
    return newApp;
  }

  async update(id: string, app: Partial<InsertApp>): Promise<App | undefined> {
    if (!db) {
      const index = memoryApps.findIndex((item) => item.id === id);
      if (index === -1) return undefined;
      memoryApps[index] = {
        ...memoryApps[index],
        ...app,
        updatedAt: new Date(),
      } as App;
      return memoryApps[index];
    }

    const [updatedApp] = await db
      .update(apps)
      .set({ ...(app as any), updatedAt: new Date() } as any)
      .where(eq(apps.id, id))
      .returning();
    return updatedApp;
  }

  async publish(id: string, userId: string): Promise<App | undefined> {
    const existing = await this.getById(id);
    if (!existing || existing.ownerId !== userId) {
      return undefined;
    }

    if (!db) {
      const index = memoryApps.findIndex((item) => item.id === id);
      if (index === -1) return undefined;
      const publicLink = existing.publicLink || crypto.randomUUID().slice(0, 8);
      memoryApps[index] = {
        ...memoryApps[index],
        isPublished: true,
        publicLink,
        updatedAt: new Date(),
      } as App;
      return memoryApps[index];
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
    const existing = await this.getById(id);
    if (!existing || existing.ownerId !== userId) {
      return undefined;
    }

    if (!db) {
      const index = memoryApps.findIndex((item) => item.id === id);
      if (index === -1) return undefined;
      memoryApps[index] = {
        ...memoryApps[index],
        isPublished: false,
        publicLink: null,
        updatedAt: new Date(),
      } as App;
      return memoryApps[index];
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
      const index = memoryApps.findIndex((item) => item.id === id);
      if (index !== -1) {
        memoryApps.splice(index, 1);
      }
      return;
    }

    await db.delete(apps).where(eq(apps.id, id));
  }
}

export const appService = new AppService();
