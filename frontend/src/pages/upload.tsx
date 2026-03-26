import { useState } from "react";
import { Layout } from "../components/Layout";
import { UploadZone } from "../components/UploadZone";
import { useCreateVideo } from "../hooks/use-videos";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Loader2, Video as VideoIcon, CheckCircle2 } from "lucide-react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const createVideo = useCreateVideo();
  const [, setLocation] = useLocation();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleAnalyze = async () => {
  if (!file) return;

  setIsAnalyzing(true);

  createVideo.mutate(file, {
    onSuccess: (data) => {
      setLocation(`/results/${data.id}`);
    },
    onError: () => {
      setIsAnalyzing(false);
    }
  });
};

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold font-display text-white mb-2">New Analysis</h2>
          <p className="text-muted-foreground">Upload a video to detect potential deepfakes</p>
        </div>

        <div className="glass-card rounded-3xl p-8 mb-8">
            <UploadZone 
                selectedFile={file} 
                onFileSelect={setFile} 
                onClear={() => setFile(null)} 
            />

            {isAnalyzing && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-8 space-y-4"
                >
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-white font-medium flex items-center gap-2">
                            {progress < 100 ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                    Analyzing frames...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    Analysis complete
                                </>
                            )}
                        </span>
                        <span className="text-muted-foreground">{progress}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        {/* Simulation of frame analysis steps */}
                        {[
                            { label: "Face Detection", done: progress > 30 },
                            { label: "Texture Analysis", done: progress > 60 },
                            { label: "Temporal Consistency", done: progress > 80 }
                        ].map((step, idx) => (
                            <div key={idx} className="bg-white/5 rounded-lg p-3 text-center border border-white/5">
                                <div className={`w-2 h-2 rounded-full mx-auto mb-2 ${step.done ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/20'}`} />
                                <span className={`text-xs ${step.done ? 'text-white' : 'text-muted-foreground'}`}>{step.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleAnalyze}
                    disabled={!file || isAnalyzing}
                    className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isAnalyzing ? "Processing..." : "Start Analysis"}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400">
                    <VideoIcon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white mb-2">Supported Formats</h4>
                <p className="text-sm text-muted-foreground">
                    We currently support MP4, AVI, and MOV files up to 100MB in size. 
                    For best results, ensure video is at least 720p.
                </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 text-purple-400">
                    <Shield className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white mb-2">Privacy First</h4>
                <p className="text-sm text-muted-foreground">
                    Your videos are processed securely and deleted from our analysis servers 
                    24 hours after processing is complete.
                </p>
            </div>
        </div>
      </div>
    </Layout>
  );
}

import { Shield } from "lucide-react";
