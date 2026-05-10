import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

// --- Entities (Domain) ---

export const apps = pgTable("apps", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  ownerId: text("owner_id").notNull().references(() => users.id), // Owner is a Replit Auth user (string ID)
});

export const screens = pgTable("screens", {
  id: uuid("id").primaryKey().defaultRandom(),
  appId: uuid("app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  order: integer("order").notNull().default(0),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
});

export const components = pgTable("components", {
  id: uuid("id").primaryKey().defaultRandom(),
  screenId: uuid("screen_id").notNull().references(() => screens.id, { onDelete: "cascade" }),
  elementType: text("element_type").notNull(), // e.g., 'input', 'dropdown', 'date'
  model: text("model").notNull(), // Field name in the data entry
  label: text("label").notNull(),
  config: jsonb("config").$type<Record<string, any>>().default({}),
  order: integer("order").notNull().default(0),
  required: boolean("required").default(false).notNull(),
  validationRule: text("validation_rule"), // Regex or other rule identifier
});

export const dataEntries = pgTable("data_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  appId: uuid("app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
  screenId: uuid("screen_id").notNull().references(() => screens.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id),
  data: jsonb("data").$type<Record<string, any>>().notNull(),
  version: integer("version").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
});

// --- Relations ---

export const appsRelations = relations(apps, ({ one, many }) => ({
  owner: one(users, {
    fields: [apps.ownerId],
    references: [users.id],
  }),
  screens: many(screens),
  dataEntries: many(dataEntries),
}));

export const screensRelations = relations(screens, ({ one, many }) => ({
  app: one(apps, {
    fields: [screens.appId],
    references: [apps.id],
  }),
  components: many(components),
  dataEntries: many(dataEntries),
}));

export const componentsRelations = relations(components, ({ one }) => ({
  screen: one(screens, {
    fields: [components.screenId],
    references: [screens.id],
  }),
}));

export const dataEntriesRelations = relations(dataEntries, ({ one }) => ({
  app: one(apps, {
    fields: [dataEntries.appId],
    references: [apps.id],
  }),
  screen: one(screens, {
    fields: [dataEntries.screenId],
    references: [screens.id],
  }),
  user: one(users, {
    fields: [dataEntries.userId],
    references: [users.id],
  }),
}));

// --- Schemas & Types ---

export const insertAppSchema = createInsertSchema(apps).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  ownerId: true // Set server-side from session
});

export const insertScreenSchema = createInsertSchema(screens).omit({ 
  id: true 
});

export const insertComponentSchema = createInsertSchema(components).omit({ 
  id: true 
});

export const insertDataEntrySchema = createInsertSchema(dataEntries).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  version: true,
  isDeleted: true,
  userId: true // Set server-side from session
});

export type App = typeof apps.$inferSelect;
export type InsertApp = z.infer<typeof insertAppSchema>;

export type Screen = typeof screens.$inferSelect;
export type InsertScreen = z.infer<typeof insertScreenSchema>;

export type Component = typeof components.$inferSelect;
export type InsertComponent = z.infer<typeof insertComponentSchema>;

export type DataEntry = typeof dataEntries.$inferSelect;
export type InsertDataEntry = z.infer<typeof insertDataEntrySchema>;
