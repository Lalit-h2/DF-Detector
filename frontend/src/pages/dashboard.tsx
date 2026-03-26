import { Layout } from "../components/Layout";
import { useVideos, useAnalytics } from "../hooks/use-videos";
import {
  ShieldCheck,
  ShieldAlert,
  Activity,
  Clock,
  ArrowUpRight,
  Play,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format } from "date-fns";
import { Link } from "wouter";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
//   const analytics = {
//   totalAnalyzed: 4,
//   fakePercentage: 50,
//   accuracy: 94.5,
//   weeklyData: [
//     { name: 'Mon', real: 4, fake: 2 },
//     { name: 'Tue', real: 3, fake: 5 },
//     { name: 'Wed', real: 6, fake: 1 },
//     { name: 'Thu', real: 4, fake: 3 },
//     { name: 'Fri', real: 7, fake: 2 },
//   ]
// };
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: videos, isLoading: videosLoading } = useVideos();

  // Use last 5 videos for recent uploads
  const recentVideos = videos?.slice(-5).reverse() || [];

  const pieData = analytics
    ? [
        {
          name: "Real",
          value:
            analytics.totalAnalyzed -
            Math.round(
              analytics.totalAnalyzed * (analytics.fakePercentage / 100),
            ),
        },
        {
          name: "Fake",
          value: Math.round(
            analytics.totalAnalyzed * (analytics.fakePercentage / 100),
          ),
        },
      ]
    : [];

  const COLORS = ["#06b6d4", "#ef4444"]; // Cyan for Real, Red for Fake

  if (analyticsLoading || videosLoading) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold font-display text-white mb-2">
            Dashboard Overview
          </h2>
          <p className="text-muted-foreground">
            Monitor your content integrity and analysis stats
          </p>
        </div>
        <Link href="/upload">
          <button className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all">
            + New Analysis
          </button>
        </Link>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            variants={item}
            className="glass-card p-6 rounded-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="w-24 h-24" />
            </div>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                +12% <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {analytics?.totalAnalyzed}
            </h3>
            <p className="text-sm text-muted-foreground">
              Total Videos Analyzed
            </p>
          </motion.div>

          <motion.div
            variants={item}
            className="glass-card p-6 rounded-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldAlert className="w-24 h-24 text-red-500" />
            </div>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-red-400 bg-red-500/10 px-2 py-1 rounded-full">
                Critical
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {analytics?.fakePercentage}%
            </h3>
            <p className="text-sm text-muted-foreground">
              Deepfake Detection Rate
            </p>
          </motion.div>

          <motion.div
            variants={item}
            className="glass-card p-6 rounded-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="w-24 h-24 text-emerald-500" />
            </div>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {analytics?.accuracy}%
            </h3>
            <p className="text-sm text-muted-foreground">Model Accuracy</p>
          </motion.div>

          <motion.div
            variants={item}
            className="glass-card p-6 rounded-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock className="w-24 h-24 text-purple-500" />
            </div>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">1.2s</h3>
            <p className="text-sm text-muted-foreground">
              Avg. Processing Time
            </p>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <motion.div
            variants={item}
            className="lg:col-span-2 glass-card p-6 rounded-2xl"
          >
            <h3 className="text-lg font-bold text-white mb-6">
              Detection Activity
            </h3>
            <div className="w-full" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics?.weeklyData || []}>
                  {" "}
                  <defs>
                    <linearGradient id="colorFake" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#ffffff10"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #1e293b",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="real"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorReal)"
                  />
                  <Area
                    type="monotone"
                    dataKey="fake"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorFake)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            variants={item}
            className="glass-card p-6 rounded-2xl flex flex-col"
          >
            <h3 className="text-lg font-bold text-white mb-6">
              Real vs Fake Ratio
            </h3>
            <div className="relative w-full" style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #1e293b",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-3xl font-bold text-white">
                  {analytics?.fakePercentage}%
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Fake
                </span>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500" />
                <span className="text-sm text-muted-foreground">Real</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-muted-foreground">Fake</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Uploads Table */}
        <motion.div
          variants={item}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Recent Analysis</h3>
            <Link href="/history">
              <span className="text-sm text-primary hover:text-primary/80 cursor-pointer">
                View All
              </span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Video</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Result</th>
                  <th className="px-6 py-4 font-medium">Confidence</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentVideos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      No videos analyzed yet.
                    </td>
                  </tr>
                ) : (
                  recentVideos.map((video) => (
                    <tr
                      key={video.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-black/50 flex items-center justify-center">
                            <Play className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <span className="font-medium text-white">
                            {video.filename}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {video.uploadDate
                          ? format(new Date(video.uploadDate), "MMM d, yyyy")
                          : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                          ${
                            video.prediction === "REAL"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : video.prediction === "FAKE"
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                          }
                        `}
                        >
                          {video.prediction || "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {video.confidence ? `${video.confidence}%` : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/results/${video.id}`}>
                          <button className="text-sm text-primary hover:text-primary/80 font-medium">
                            Details
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
}
