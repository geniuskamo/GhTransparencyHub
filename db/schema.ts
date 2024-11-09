import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const institutions = pgTable("institutions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description"),
  contactInfo: jsonb("contact_info")
});

export const requests = pgTable("requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status", { 
    enum: ["pending", "processing", "completed", "rejected"] 
  }).default("pending").notNull(),
  userId: integer("user_id").references(() => users.id),
  institutionId: integer("institution_id").references(() => institutions.id),
  documentUrl: text("document_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;

export const insertRequestSchema = createInsertSchema(requests);
export const selectRequestSchema = createSelectSchema(requests);
export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type Request = z.infer<typeof selectRequestSchema>;

export const insertInstitutionSchema = createInsertSchema(institutions);
export const selectInstitutionSchema = createSelectSchema(institutions);
export type InsertInstitution = z.infer<typeof insertInstitutionSchema>;
export type Institution = z.infer<typeof selectInstitutionSchema>;
