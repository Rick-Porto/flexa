import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { 
  components, 
  type Component, 
  type InsertComponent 
} from "@shared/schema";

export class ComponentService {
  async getAll(screenId: string): Promise<Component[]> {
    if (!db) {
      // Mock data for frontend testing
      return [{
        id: "mock-component-1",
        screenId,
        elementType: "text",
        model: "name",
        label: "Name",
        config: {},
        order: 0,
        required: true,
        validationRule: "",
      }];
    }
    
    return await db
      .select()
      .from(components)
      .where(eq(components.screenId, screenId))
      .orderBy(components.order);
  }

  async getById(id: string): Promise<Component | undefined> {
    if (!db) {
      // Mock data for frontend testing
      if (id === "mock-component-1") {
        return {
          id: "mock-component-1",
          screenId: "mock-screen-1",
          elementType: "text",
          model: "name",
          label: "Name",
          config: {},
          order: 0,
          required: true,
          validationRule: "",
        };
      }
      return undefined;
    }
    
    const [component] = await db
      .select()
      .from(components)
      .where(eq(components.id, id));
    return component;
  }

  async create(component: InsertComponent): Promise<Component> {
    if (!db) {
      // Mock data for frontend testing
      return {
        id: "new-mock-component",
        screenId: component.screenId,
        elementType: component.elementType,
        model: component.model,
        label: component.label,
        config: component.config ?? {},
        order: component.order ?? 0,
        required: component.required ?? false,
        validationRule: component.validationRule ?? null,
      } as Component;
    }
    
    const [newComponent] = await db
      .insert(components)
      .values(component)
      .returning();
    return newComponent;
  }

  async update(id: string, component: Partial<InsertComponent>): Promise<Component | undefined> {
    if (!db) {
      // Mock data for frontend testing
      return {
        id,
        screenId: "mock-screen-1",
        elementType: "text",
        model: "name",
        label: component.label || "Updated Component",
        config: component.config || {},
        order: component.order ?? 0,
        required: component.required ?? false,
        validationRule: component.validationRule ?? null,
      };
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
      // Mock - do nothing
      return;
    }
    
    await db.delete(components).where(eq(components.id, id));
  }
}

export const componentService = new ComponentService();
