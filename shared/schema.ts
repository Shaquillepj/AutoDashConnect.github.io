import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  role: text("role").notNull(), // 'customer' | 'provider'
  rewardPoints: integer("reward_points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const serviceProviders = pgTable("service_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  businessName: text("business_name").notNull(),
  description: text("description"),
  serviceRadius: integer("service_radius").default(25), // miles
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  reviewCount: integer("review_count").default(0),
  isActive: boolean("is_active").default(true),
  isAvailable: boolean("is_available").default(true), // for emergency requests
  businessLicense: text("business_license"),
  insurance: text("insurance"),
  location: jsonb("location"), // { lat, lng, address }
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
});

export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => serviceProviders.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // 'detailing' | 'mechanical' | 'maintenance'
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(), // minutes
  isActive: boolean("is_active").default(true),
  requirements: text("requirements").array(),
});

export const addOnServices = pgTable("addon_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceId: varchar("service_id").references(() => services.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  providerId: varchar("provider_id").references(() => serviceProviders.id).notNull(),
  serviceId: varchar("service_id").references(() => services.id).notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: text("status").notNull(), // 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  customerLocation: jsonb("customer_location").notNull(), // { lat, lng, address }
  vehicleInfo: jsonb("vehicle_info"), // { make, model, year, color, plateNumber }
  addOns: varchar("addon_ids").array().default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull(),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  providerId: varchar("provider_id").references(() => serviceProviders.id).notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => serviceProviders.id).notNull(),
  itemName: text("item_name").notNull(),
  currentStock: integer("current_stock").notNull(),
  minStock: integer("min_stock").default(5),
  unit: text("unit").notNull(), // 'bottles', 'packs', 'pieces'
  lastRestocked: timestamp("last_restocked").defaultNow(),
});

export const emergencyRequests = pgTable("emergency_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  providerId: varchar("provider_id").references(() => serviceProviders.id),
  issueType: text("issue_type").notNull(), // 'flat_tire', 'dead_battery', 'lockout', 'towing', 'other'
  description: text("description").notNull(),
  urgencyLevel: text("urgency_level").notNull().default('medium'), // 'low', 'medium', 'high', 'critical'
  customerLocation: jsonb("customer_location").notNull(), // { lat, lng, address }
  vehicleInfo: jsonb("vehicle_info").notNull(), // { make, model, year, color, plateNumber }
  issuePhoto: text("issue_photo"), // URL/path to uploaded photo
  status: text("status").notNull().default('pending'), // 'pending', 'assigned', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled'
  estimatedArrival: timestamp("estimated_arrival"),
  assignedAt: timestamp("assigned_at"),
  arrivedAt: timestamp("arrived_at"),
  completedAt: timestamp("completed_at"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertServiceProviderSchema = createInsertSchema(serviceProviders).omit({
  id: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

export const insertAddOnServiceSchema = createInsertSchema(addOnServices).omit({
  id: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  lastRestocked: true,
});

export const insertEmergencyRequestSchema = createInsertSchema(emergencyRequests).omit({
  id: true,
  createdAt: true,
  assignedAt: true,
  arrivedAt: true,
  completedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type InsertServiceProvider = z.infer<typeof insertServiceProviderSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type AddOnService = typeof addOnServices.$inferSelect;
export type InsertAddOnService = z.infer<typeof insertAddOnServiceSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type EmergencyRequest = typeof emergencyRequests.$inferSelect;
export type InsertEmergencyRequest = z.infer<typeof insertEmergencyRequestSchema>;
