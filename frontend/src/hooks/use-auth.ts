import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { api, type InsertUser } from "@shared/schema"; // This import might need adjustment based on strict schema access
import { z } from "zod";
import { useLocation } from "wouter";
import axios,{AxiosError} from "axios"
// Manually defining inputs based on routes manifest to avoid type issues if exports are missing
const loginInputSchema = z.object({ email: z.string(), password: z.string() });
const registerInputSchema = z.object({ email: z.string(), password: z.string() });

type LoginInput = z.infer<typeof loginInputSchema>;
type RegisterInput = z.infer<typeof registerInputSchema>;

const isTokenExpired = (token:any) => {
  try {
    const payload = JSON.parse(window.atob(token.split('.')[1]));
    return payload.exp < Date.now() / 1000;
  } catch (e) { return true; }
};

export function useUser() {
  return useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      if (!localStorage.getItem("auth-token")){
        throw new Error("Auth Token doesnt exists login again")
      }
      return localStorage.getItem("auth-token")
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (credentials: LoginInput) => {
      console.log("LOGIN API CALLED", credentials);
     
      try{

        const res = await axios.post("/api/auth/login", credentials,{
        });
        console.log("RESPONSE:", res);
        if (res.data?.result=="success"){
          localStorage.setItem("auth-token",res.data?.auth_token)
        }
        return  res.data;
      }catch(err:any){
          const error = await err.response?.data;
          throw new Error(error || "Login failed");
      }
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
      try{

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });
        
        if (!res.ok) {
          const error = await res.text();
          throw new Error(error || "Registration failed");
        }
        return await res.json();

      }catch(err:any){
          console.log(err)
          throw new Error(err.message)
      }
    },
    onSuccess: (user) => {
      setLocation("/auth");
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

export {isTokenExpired};