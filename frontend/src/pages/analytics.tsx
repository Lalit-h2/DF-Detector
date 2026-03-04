import { Layout } from "../components/Layout";
import { useAnalytics } from "../hooks/use-videos";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { motion } from "framer-motion";

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useAnalytics();

  // Mock data for additional charts
  const hourlyData = [
    { hour: '00:00', detections: 2 },
    { hour: '04:00', detections: 1 },
    { hour: '08:00', detections: 8 },
    { hour: '12:00', detections: 15 },
    { hour: '16:00', detections: 22 },
    { hour: '20:00', detections: 10 },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-display text-white mb-2">Advanced Analytics</h2>
        <p className="text-muted-foreground">Deep dive into detection metrics and trends</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl border-t-4 border-cyan-500">
            <h3 className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Total Scans</h3>
            <p className="text-4xl font-bold text-white font-display">{analytics?.totalAnalyzed}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl border-t-4 border-red-500">
            <h3 className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Threats Detected</h3>
            <p className="text-4xl font-bold text-white font-display">
                {analytics ? Math.round(analytics.totalAnalyzed * (analytics.fakePercentage / 100)) : 0}
            </p>
        </div>
        <div className="glass-card p-6 rounded-2xl border-t-4 border-purple-500">
            <h3 className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Model Accuracy</h3>
            <p className="text-4xl font-bold text-white font-display">{analytics?.accuracy}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 rounded-2xl"
        >
            <h3 className="font-bold text-white mb-6">Weekly Detection Trends</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ fill: '#ffffff05' }}
                        />
                        <Legend />
                        <Bar dataKey="real" name="Real Videos" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="fake" name="Deepfakes" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 rounded-2xl"
        >
            <h3 className="font-bold text-white mb-6">Detection by Time of Day</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                        <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis dataKey="hour" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={50} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ fill: '#ffffff05' }}
                        />
                        <Bar dataKey="detections" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
      </div>
    </Layout>
  );
}
