import { db } from "../db";
import { randomUUID } from "node:crypto";
import { eq, and } from "drizzle-orm";
import { 
  components, 
  type Component, 
  type InsertComponent 
} from "@shared/schema";

const memoryComponents = new Map<string, Component[]>();

export class ComponentService {
  async getAll(screenId: string): Promise<Component[]> {
    if (!db) {
      return [...(memoryComponents.get(screenId) ?? [])].sort((a, b) => a.order - b.order);
    }
    
    return await db
      .select()
      .from(components)
      .where(eq(components.screenId, screenId))
      .orderBy(components.order);
  }

  async getById(id: string): Promise<Component | undefined> {
    if (!db) {
      return Array.from(memoryComponents.values()).flat().find((component) => component.id === id);
    }
    
    const [component] = await db
      .select()
      .from(components)
      .where(eq(components.id, id));
    return component;
  }

  async create(component: InsertComponent): Promise<Component> {
    if (!db) {
      const newComponent: Component = {
        id: randomUUID(),
        screenId: component.screenId,
        elementType: component.elementType,
        model: component.model,
        label: component.label,
        config: component.config ?? {},
        order: component.order ?? 0,
        required: component.required ?? false,
        validationRule: component.validationRule ?? null,
      };
      const screenComponents = memoryComponents.get(component.screenId) ?? [];
      screenComponents.push(newComponent);
      memoryComponents.set(component.screenId, screenComponents);
      return newComponent;
    }
    
    const [newComponent] = await db
      .insert(components)
      .values(component)
      .returning();
    return newComponent;
  }

  async update(id: string, component: Partial<InsertComponent>): Promise<Component | undefined> {
    if (!db) {
      const existing = await this.getById(id);
      if (!existing) return undefined;
      const updated = { ...existing, ...component };
      const screenComponents = memoryComponents.get(existing.screenId) ?? [];
      const index = screenComponents.findIndex((item) => item.id === id);
      if (index >= 0) screenComponents[index] = updated;
      return updated;
    }
    
    const [updatedComponent] = await db
      .update(components)
      .set(component)
      .where(eq(components.id, id))
      .returning();
    return updatedComponent;
  }

  async delete(id: string): Promise<void> {
    if (!db) {
      memoryComponents.forEach((screenComponents, screenId) => {
        const remaining = screenComponents.filter((component) => component.id !== id);
        if (remaining.length !== screenComponents.length) {
          memoryComponents.set(screenId, remaining);
        }
      });
      return;
    }
    
    await db.delete(components).where(eq(components.id, id));
  }
}

export const componentService = new ComponentService();
