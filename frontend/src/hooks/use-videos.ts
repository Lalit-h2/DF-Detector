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
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("video", file);

      const res = await fetch("/api/videos", {
        method: "POST",
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
      const res = await fetch("/api/analytics");

      if (!res.ok) throw new Error("Failed to fetch analytics");

      return await res.json();
    },
  });
}