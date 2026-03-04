import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { InsertVideo, Video }  from "../../shared/type.ts";
export function useVideos() {
  return useQuery({
    queryKey: ["/api/videos"],
    queryFn: async () => {
      const res = await fetch("/api/videos");
      if (!res.ok) throw new Error("Failed to fetch videos");
      return await res.json() as Video[];
    },
  });
}

export function useVideo(id: number) {
  return useQuery({
    queryKey: ["/api/videos", id],
    queryFn: async () => {
      const res = await fetch(`/api/videos/${id}`);
      if (!res.ok) throw new Error("Failed to fetch video");
      return await res.json() as Video;
    },
    enabled: !!id,
  });
}

export function useCreateVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (video: InsertVideo) => {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(video),
      });
      if (!res.ok) throw new Error("Failed to create video record");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      // Invalidate analytics as well since stats changed
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
      // Mock analytics response structure matching schema
      const res = await fetch("/api/videos"); 
      const videos = await res.json() as Video[];
      
      // Calculate dummy analytics based on actual video data
      const total = videos.length;
      const fakes = videos.filter(v => v.prediction === "FAKE").length;
      
      // Mock weekly data
      const weeklyData = [
        { name: 'Mon', real: 4, fake: 2 },
        { name: 'Tue', real: 3, fake: 1 },
        { name: 'Wed', real: 2, fake: 5 },
        { name: 'Thu', real: 6, fake: 2 },
        { name: 'Fri', real: 4, fake: 3 },
        { name: 'Sat', real: 7, fake: 1 },
        { name: 'Sun', real: 5, fake: 2 },
      ];

      return {
        totalAnalyzed: total || 124,
        fakePercentage: total ? Math.round((fakes / total) * 100) : 34,
        accuracy: 94.5,
        weeklyData,
      };
    },
  });
}
