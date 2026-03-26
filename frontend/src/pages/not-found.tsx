import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="glass-card p-12 rounded-3xl text-center max-w-md border border-white/10 shadow-2xl">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2 font-display">404</h1>
        <h2 className="text-xl font-medium text-white mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Link href="/">
          <button className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors w-full">
            Return Home
          </button>
        </Link>
      </div>
    </div>
  );
}
