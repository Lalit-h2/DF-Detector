import { useState } from "react";
import { Layout } from "../components/Layout";
import { useVideos, useDeleteVideo } from "../hooks/use-videos";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import {
  Search,
  Trash2,
  Filter,
  MoreVertical,
  Play,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "../components/ui/context-menu";

export default function HistoryPage() {
  const { data: videos, isLoading } = useVideos();
  const deleteVideo = useDeleteVideo();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "REAL" | "FAKE">("ALL");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const filteredVideos = videos?.filter((v: any) => {
    const matchesSearch = v.Name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || v.prediction === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold font-display text-white mb-2">
            Analysis History
          </h2>
          <p className="text-muted-foreground">
            Manage and review past video detections
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-secondary/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 w-64"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="p-2.5 bg-secondary/50 border border-white/10 rounded-xl text-white hover:bg-white/5 transition-colors">
              <Filter className="w-5 h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 bg-card border-white/10 text-white"
            >
              <DropdownMenuItem onClick={() => setFilter("ALL")}>
                All Results
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("REAL")}>
                Real Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("FAKE")}>
                Fake Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden min-h-[500px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Video File
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Result
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Video Hash
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Model
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {!filteredVideos?.length && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      No videos found matching your criteria.
                    </td>
                  </tr>
                )}
                {filteredVideos?.map((video: any) => {
                  video["prediction"] = video.IsFake ? "FAKE" : "REAL";

                  return (
                    <ContextMenu key={video.AID}>
                      <ContextMenuTrigger asChild>
                        <tr className="group hover:bg-white/5 transition-colors cursor-context-menu select-none">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                                <Play className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium text-white truncate max-w-[200px]">
                                  {video.Name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {(video.size / (1024 * 1024)).toFixed(1)} MB
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {video.ActivityTimestamp
                                ? format(
                                    new Date(video.ActivityTimestamp),
                                    "MMM d, yyyy"
                                  )
                                : "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className={`
                                inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border
                                ${
                                  video.prediction === "REAL"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : video.prediction === "FAKE"
                                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                                      : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                }
                              `}
                            >
                              {video.prediction === "REAL" ? (
                                <ShieldCheck className="w-3 h-3" />
                              ) : (
                                <ShieldAlert className="w-3 h-3" />
                              )}
                              {video.prediction}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${video.prediction === "FAKE" ? "bg-red-500" : "bg-emerald-500"}`}
                                  style={{
                                    width: `${video.Confidence * 100 || 0}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium text-white">
                                {video.Confidence}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {video.VideoHash ? (
                              <span
                                title={video.VideoHash}
                                className="font-mono text-xs text-muted-foreground bg-white/5 border border-white/10 rounded-md px-2 py-1 cursor-default inline-block max-w-[120px] truncate align-middle"
                              >
                                {video.VideoHash}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                —
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {video.ModelVersion ? (
                              <span
                                title={video.ModelVersion}
                                className="text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 rounded-full px-2.5 py-1 cursor-default inline-block max-w-[100px] truncate align-middle"
                              >
                                {video.ModelVersion}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      </ContextMenuTrigger>

                      {/* Right-click context menu */}
                      <ContextMenuContent className="bg-card border-white/10 text-white w-48">
                        <ContextMenuItem
                          className="cursor-pointer gap-2"
                          onClick={() => navigate(`/results/${video.AID}`)}
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Details
                        </ContextMenuItem>
                        <ContextMenuSeparator className="bg-white/10" />
                        <ContextMenuItem
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer gap-2"
                          onClick={() => setPendingDeleteId(video.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog — lives outside the row map so it isn't re-mounted */}
      <AlertDialog
        open={!!pendingDeleteId}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent className="bg-card border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete the
              video analysis record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white border-0"
              onClick={() => {
                if (!pendingDeleteId) return;
                deleteVideo.mutate(2, {
                  onSuccess: () => {
                    alert("Deleted successfully");
                    setPendingDeleteId(null);
                  },
                  onError: () => {
                    alert("Delete failed");
                    setPendingDeleteId(null);
                  },
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}