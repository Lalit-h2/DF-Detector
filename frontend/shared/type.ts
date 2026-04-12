import { pgTable, text, serial, integer, boolean, timestamp,numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  filename: text("filename").notNull(),
  size: integer("size").notNull(), // in bytes
  uploadDate: timestamp("upload_date").defaultNow(),
  status: text("status").notNull(), // 'analyzing', 'complete', 'failed'
  prediction: text("prediction"), // 'REAL', 'FAKE'
  confidence: numeric("confidence"), // e.g., 94.5
  probabilityScore: numeric("probability_score"), // e.g., 0.945
  riskBadge: text("risk_badge"), // 'Safe', 'Suspicious', 'High Risk'
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertVideoSchema = createInsertSchema(videos).omit({ id: true, uploadDate: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;

// Request types
export type CreateVideoRequest = InsertVideo;
export type UpdateVideoRequest = Partial<InsertVideo>;

// Response types
export type VideoResponse = Video;
export type VideosListResponse = Video[];

export interface AnalyticsResponse {
  totalAnalyzed: number;
  fakePercentage: number;
  accuracy: number;
  weeklyData: {
    name: string;
    real: number;
    fake: number;
  }[];
}
