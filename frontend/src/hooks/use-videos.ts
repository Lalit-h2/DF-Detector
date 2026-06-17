import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { InsertVideo, Video } from "../../shared/type.ts";
import { isTokenExpired } from "./use-auth.ts";

export function useVideos() {
  return useQuery({
    queryKey: ["/api/videos"],
    queryFn: async () => {
      const token = localStorage.getItem("auth-token");
      
      if (!token) {
        throw new Error("Auth Token doesn't exist. Please login again.");
      }
      
      if (isTokenExpired(token)) {
        throw new Error("Auth Token has expired. Please login again.");
      }
      const res = await fetch("/api/videos",{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });
      if (!res.ok) return Error(await res.text());
      const data =await res.json()
      console.log(data)
      return data.data
      // return (await res.json()) as Video[];
    },
  });
}

export function useVideo(id: number) {
  return useQuery({
    queryKey: ["/api/videos", id],
    queryFn: async () => {
      const token = localStorage.getItem("auth-token");

      if (!token) {
        throw new Error("Auth Token doesn't exist. Please login again.");
      }

      if (isTokenExpired(token)) {
        throw new Error("Auth Token has expired. Please login again.");
      }

      const res = await fetch(`/api/videos/${id}`,{  headers: {
          Authorization: `Bearer ${token}`, 
        }});
      if (!res.ok) throw new Error("Failed to fetch video");
      const data = await res.json();
      const obj: Video = {
        id: data.id, 
        title:
          data.title ||
          data.video_name.replace(/[_\-]/g, " ").replace(/\.[^/.]+$/, "") ||
          "Untitled",
        filename: data.video_name, 

        size: 0, 
        uploadDate: data.activity_date
          ? new Date(data.activity_date)
          : new Date(),
        status: data.is_fake ? "Completed" : "Completed",

        prediction: data.is_fake ? "FAKE" : "REAL",
        confidence: data.confidence,

        probabilityScore: data.confidence
          ? `${(parseFloat(data.confidence) * 100).toFixed(0)}%`
          : "50%",

        riskBadge: data.is_fake
          ? parseFloat(data.confidence) > 0.5
            ? "High Risk"
            : "Suspicious"
          : "Safe", // Real videos are low risk by default
      };
      return (obj) as Video;
    },
    enabled: !!id,
  });
}

export function useCreateVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const token = localStorage.getItem("auth-token");

      if (!token) {
        throw new Error("Auth Token doesn't exist. Please login again.");
      }

      if (isTokenExpired(token)) {
        throw new Error("Auth Token has expired. Please login again.");
      }
      const formData = new FormData();
      
      formData.append("video", file);
      
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Add the token to the Authorization header
        },
        body: formData,
      });
      
      if (!res.ok) throw new Error("Failed to upload video");
      return await res.json();
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
    },
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/videos/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete video");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
    },
  });
}
export function useAnalytics() {
  return useQuery({
    queryKey: ["/api/analytics"],
    queryFn: async () => {
      const token = localStorage.getItem("auth-token");
      
      if (!token) {
        throw new Error("Auth Token doesn't exist. Please login again.");
      }
      
      if (isTokenExpired(token)) {
        throw new Error("Auth Token has expired. Please login again.");
      }
      const res = await fetch("/api/analytics",{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const data=await res.json();
      if(data.weeklyData!=null){
        data.weeklyData=atob(data.weeklyData)
      }
      console.log(data  )
      return data;
    },
  });
}
