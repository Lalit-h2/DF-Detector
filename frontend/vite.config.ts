import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },

  // ✅ ADD THIS BLOCK
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000", // 🔴 CHANGE if your backend uses different port
        changeOrigin: true,
      },
    },
  },
});