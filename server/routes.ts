import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { insertAppSchema, insertScreenSchema, insertComponentSchema, insertDataEntrySchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Authentication Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // --- Apps ---

  app.get(api.apps.list.path, isAuthenticated, async (req, res) => {
    const userId = ((req as any).user as any).claims.sub;
    const apps = await storage.apps.getAll(userId);
    res.json(apps);
  });

  app.post(api.apps.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = ((req as any).user as any).claims.sub;
      const input = insertAppSchema.parse({
        ...req.body,
        ownerId: userId,
      });
      const newApp = await storage.apps.create(input);
      res.status(201).json(newApp);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.apps.get.path, isAuthenticated, async (req, res) => {
    const app = await storage.apps.getById(String(req.params.id));
    if (!app) {
      return res.status(404).json({ message: 'App not found' });
    }
    // Check ownership if needed, or allow public viewing? 
    // For now assuming owner only or public read? Let's assume owner only for edit, but maybe public for view?
    // Let's stick to simple ownership check for now or allow all for MVP.
    // Ideally we check app.ownerId === req.user.sub
    res.json(app);
  });

  app.put(api.apps.update.path, isAuthenticated, async (req, res) => {
    try {
      const existing = await storage.apps.getById(String(req.params.id));
      if (!existing) return res.status(404).json({ message: 'App not found' });
      if (existing.ownerId !== ((req as any).user as any).claims.sub) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const input = insertAppSchema.partial().parse(req.body);
      const updated = await storage.apps.update(String(req.params.id), input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.apps.delete.path, isAuthenticated, async (req, res) => {
    const existing = await storage.apps.getById(String(req.params.id));
    if (!existing) return res.status(404).json({ message: 'App not found' });
    if (existing.ownerId !== ((req as any).user as any).claims.sub) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await storage.apps.delete(String(req.params.id));
    res.status(204).send();
  });

  // Publish app
  app.post(api.apps.publish.path, isAuthenticated, async (req, res) => {
    try {
      const existing = await storage.apps.getById(String(req.params.id));
      if (!existing) return res.status(404).json({ message: 'App not found' });
      if (existing.ownerId !== ((req as any).user as any).claims.sub) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      // Generate unique public link if not already published
      const publicLink = existing.publicLink || crypto.randomUUID().slice(0, 8);
      const updated = await storage.apps.update(String(req.params.id), ({
        isPublished: true,
        publicLink,
      } as any));
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Unpublish app
  app.post(api.apps.unpublish.path, isAuthenticated, async (req, res) => {
    try {
      const existing = await storage.apps.getById(String(req.params.id));
      if (!existing) return res.status(404).json({ message: 'App not found' });
      if (existing.ownerId !== ((req as any).user as any).claims.sub) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      const updated = await storage.apps.update(String(req.params.id), ({
        isPublished: false,
        publicLink: null,
      } as any));
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Get published apps
  app.get(api.apps.published.path, async (req, res) => {
    try {
      const apps = await storage.apps.getPublished();
      res.json(apps);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Public app endpoint (no auth required)
  app.get(api.apps.public.path, async (req, res) => {
    try {
      const { publicLink } = req.params;
      const result = await storage.apps.getPublicAppWithScreens(publicLink);
      if (!result || !result.app.isPublished) {
        return res.status(404).json({ message: 'App not found or not published' });
      }
      res.json({
        ...result.app,
        screens: result.screens,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // --- Screens ---

  app.get(api.screens.list.path, isAuthenticated, async (req, res) => {
    const screens = await storage.screens.getAll(String(req.params.appId));
    res.json(screens);
  });

  app.post(api.screens.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = insertScreenSchema.parse({
        ...req.body,
        appId: req.params.appId
      });
      const newScreen = await storage.screens.create(input);
      res.status(201).json(newScreen);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.screens.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = insertScreenSchema.partial().omit({ appId: true }).parse(req.body);
      const updated = await storage.screens.update(String(req.params.id), input);
      if (!updated) return res.status(404).json({ message: 'Screen not found' });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.screens.delete.path, isAuthenticated, async (req, res) => {
    await storage.screens.delete(String(req.params.id));
    res.status(204).send();
  });

  // --- Components ---

  app.get(api.components.list.path, isAuthenticated, async (req, res) => {
    const components = await storage.components.getAll(String(req.params.screenId));
    res.json(components);
  });

  app.post(api.components.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = insertComponentSchema.parse({
        ...req.body,
        screenId: req.params.screenId
      });
      const newComponent = await storage.components.create(input);
      res.status(201).json(newComponent);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.components.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = insertComponentSchema.partial().omit({ screenId: true }).parse(req.body);
      const updated = await storage.components.update(String(req.params.id), input);
      if (!updated) return res.status(404).json({ message: 'Component not found' });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.components.delete.path, isAuthenticated, async (req, res) => {
    await storage.components.delete(String(req.params.id));
    res.status(204).send();
  });

  // --- Data Entries ---

  app.get(api.dataEntries.list.path, isAuthenticated, async (req, res) => {
    const entries = await storage.dataEntries.getAll(String(req.params.appId), String(req.params.screenId));
    res.json(entries);
  });

  app.post(api.dataEntries.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = insertDataEntrySchema.parse({
        ...req.body,
        appId: req.params.appId,
        screenId: req.params.screenId,
      });
      // attach userId for storage layer
      const userId = ((req as any).user as any).claims.sub;
      const newEntry = await storage.dataEntries.create({ ...input, userId } as any);
      res.status(201).json(newEntry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.dataEntries.get.path, isAuthenticated, async (req, res) => {
    const entry = await storage.dataEntries.getById(String(req.params.id));
    if (!entry) return res.status(404).json({ message: 'Data Entry not found' });
    res.json(entry);
  });

  app.put(api.dataEntries.update.path, isAuthenticated, async (req, res) => {
    try {
      const parsed = insertDataEntrySchema.partial().parse(req.body) as any;
      // ensure we don't accept client-supplied appId/screenId/userId
      delete parsed.appId;
      delete parsed.screenId;
      delete parsed.userId;
      const input = parsed;
      const updated = await storage.dataEntries.update(String(req.params.id), input);
      if (!updated) return res.status(404).json({ message: 'Data Entry not found' });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.dataEntries.delete.path, isAuthenticated, async (req, res) => {
    await storage.dataEntries.delete(String(req.params.id));
    res.status(204).send();
  });

  return httpServer;
}
