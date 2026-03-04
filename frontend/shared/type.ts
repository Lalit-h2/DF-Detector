export type Video = {
  id: number;
  filename: string;
  prediction: "REAL" | "FAKE";
  confidence?: number;
  createdAt: string;
};

export type InsertVideo = {
  filename: string;
  prediction: "REAL" | "FAKE";
  confidence?: number;
};