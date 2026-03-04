import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { api, type InsertUser } from "@shared/schema"; // This import might need adjustment based on strict schema access
import { z } from "zod";
import { useLocation } from "wouter";

// Manually defining inputs based on routes manifest to avoid type issues if exports are missing
const loginInputSchema = z.object({ username: z.string(), password: z.string() });
const registerInputSchema = z.object({ username: z.string(), password: z.string() });

type LoginInput = z.infer<typeof loginInputSchema>;
type RegisterInput = z.infer<typeof registerInputSchema>;

export function useUser() {
  return useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return await res.json();
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
      }
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/me"], user);
      setLocation("/");
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (credentials: RegisterInput) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Registration failed");
      }
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/me"], user);
      setLocation("/");
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async () => {
      // Mock logout - simply invalidate query
      // In a real app, this would hit a POST /api/auth/logout endpoint
      queryClient.setQueryData(["/api/auth/me"], null);
    },
    onSuccess: () => {
      setLocation("/auth");
    },
  });
}
