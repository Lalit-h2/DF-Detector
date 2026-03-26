import { useState } from "react";
import { Layout } from "../components/Layout";
import { useVideos, useDeleteVideo } from "../hooks/use-videos";
import { Link } from "wouter";
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

export default function HistoryPage() {
  const { data: videos, isLoading } = useVideos();
  const deleteVideo = useDeleteVideo();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "REAL" | "FAKE">("ALL");

  const filteredVideos = videos?.filter((v) => {
    const matchesSearch = v.filename
      .toLowerCase()
      .includes(search.toLowerCase());
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
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {!filteredVideos?.length && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      No videos found matching your criteria.
                    </td>
                  </tr>
                )}
                {filteredVideos?.map((video) => (
                  <tr
                    key={video.id}
                    className="group hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                          <Play className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-white truncate max-w-[200px]">
                            {video.filename}
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
                        {video.uploadDate
                          ? format(new Date(video.uploadDate), "MMM d, yyyy")
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
                            style={{ width: `${video.confidence || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-white">
                          {video.confidence}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white">
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-card border-white/10 text-white"
                        >
                          <Link href={`/results/${video.id}`}>
                            <DropdownMenuItem className="cursor-pointer">
                              View Details
                            </DropdownMenuItem>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border-white/10 text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                  This action cannot be undone. This will
                                  permanently delete the video analysis record.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700 text-white border-0"
                                  onClick={() =>
                                    deleteVideo.mutate(video.id, {
                                      onSuccess: () =>
                                        alert("Deleted successfully"),
                                      onError: () => alert("Delete failed"),
                                    })
                                  }
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}
