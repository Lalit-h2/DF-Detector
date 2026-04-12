import { useParams, Link } from "wouter";
import { Layout } from "../components/Layout";
import { useVideo } from "../hooks/use-videos";
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle,
  ArrowLeft,
  Share2,
  Download,
  Info
} from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,CartesianGrid } from "recharts";
import { useEffect } from "react";

export default function ResultsPage() {
  const { id } = useParams();
  const { data: video, isLoading } = useVideo(Number(id));
    useEffect(()=>{
        console.log(video)
    },[isLoading])
  // Mock timeline data for the graph
  const base = Number(video?.confidence) || 0;

const timelineData = Array.from({ length: 20 }, (_, i) => ({
  frame: i * 5,
  confidence: Math.min(
    100,
    Math.max(base*100, base + (Math.random() * 10 - 5))
  )
}));


  if (isLoading) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!video) {
    return (
      <Layout>
        <div className="text-center mt-20">
          <h2 className="text-2xl font-bold text-white">Video not found</h2>
          <Link href="/dashboard">
            <span className="text-primary hover:underline mt-4 inline-block cursor-pointer">Return to Dashboard</span>
          </Link>
        </div>
      </Layout>
    );
  }

  const isFake = video.prediction === 'FAKE';
  const colorClass = isFake ? 'text-red-400' : 'text-emerald-400';
  const bgClass = isFake ? 'bg-red-500/10' : 'bg-emerald-500/10';
  const borderClass = isFake ? 'border-red-500/20' : 'border-emerald-500/20';
  const Icon = isFake ? ShieldAlert : ShieldCheck;

  return (
    <Layout>
      <div className="mb-6">
        <Link href="/history">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors cursor-pointer mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back to History
            </div>
        </Link>
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold font-display text-white">Analysis Results</h1>
            <div className="flex gap-3">
                <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors">
                    <Share2 className="w-4 h-4" />
                </button>
                <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors">
                    <Download className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Result */}
        <div className="lg:col-span-2 space-y-6">
            {/* Video Preview Placeholder */}
            <div className="aspect-video bg-black/40 rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                <div className="z-10 text-center">
                    <p className="text-white font-medium mb-2">{video.filename}</p>
                    <p className="text-sm text-muted-foreground">Video Preview Unavailable</p>
                </div>
                {/* Result Overlay */}
                <div className="absolute top-4 right-4 z-20">
                    <div className={`px-4 py-1.5 rounded-full backdrop-blur-md border ${bgClass} ${borderClass} ${colorClass} font-bold text-sm flex items-center gap-2`}>
                        <div className={`w-2 h-2 rounded-full ${isFake ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                        {video.prediction}
                    </div>
                </div>
            </div>

            {/* Confidence Graph */}
            <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-white">Frame-by-Frame Confidence</h3>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Analysis Timeline
                    </div>
                </div>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timelineData}>
                            <defs>
                                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isFake ? "#ef4444" : "#10b981"} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={isFake ? "#ef4444" : "#10b981"} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <XAxis dataKey="frame" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'Frame Sequence', position: 'insideBottom', offset: -5 }} />
                            <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="confidence" 
                                stroke={isFake ? "#ef4444" : "#10b981"} 
                                strokeWidth={2} 
                                fillOpacity={1} 
                                fill="url(#confidenceGradient)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Right Column - Stats & Details */}
        <div className="space-y-6">
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`glass-card p-8 rounded-3xl border-2 ${borderClass} relative overflow-hidden`}
            >
                <div className={`absolute -right-10 -top-10 w-40 h-40 ${isFake ? 'bg-red-500/20' : 'bg-emerald-500/20'} blur-[50px] rounded-full`} />
                
                <div className="relative z-10 text-center">
                    <Icon className={`w-16 h-16 mx-auto mb-4 ${colorClass}`} />
                    <h2 className="text-4xl font-bold text-white mb-2 font-display">{video.confidence}%</h2>
                    <p className="text-muted-foreground uppercase tracking-widest text-xs font-semibold mb-6">Confidence Score</p>
                    
                    <div className={`inline-block px-4 py-2 rounded-lg ${bgClass} ${colorClass} font-bold border ${borderClass}`}>
                        {video.riskBadge}
                    </div>
                </div>
            </motion.div>

            <div className="glass-card p-6 rounded-2xl space-y-4">
                <h3 className="font-bold text-white mb-2">Model Intelligence</h3>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                        <span className="text-sm text-muted-foreground">Architecture</span>
                        <span className="text-sm font-medium text-white">CNN + LSTM</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                        <span className="text-sm text-muted-foreground">Probability</span>
                        <span className="text-sm font-medium text-white">{video.probabilityScore}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                        <span className="text-sm text-muted-foreground">Artifacts</span>
                        <span className="text-sm font-medium text-white">
                            {isFake ? 'Temporal Inconsistency' : 'None Detected'}
                        </span>
                    </div>
                </div>
            </div>

            {isFake && (
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex gap-3 items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-yellow-500 text-sm mb-1">Attention Required</h4>
                        <p className="text-xs text-yellow-200/70 leading-relaxed">
                            This content has been flagged with high confidence as synthetic media. Please verify source authenticity before sharing.
                        </p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </Layout>
  );
}
