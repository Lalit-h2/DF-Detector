import { useState, useRef } from "react";
import { UploadCloud, FileVideo, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export function UploadZone({ onFileSelect, selectedFile, onClear }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload MP4, MOV, or AVI files only.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 100MB.",
        variant: "destructive",
      });
      return;
    }

    onFileSelect(file);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`
              relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300
              ${isDragging 
                ? 'border-primary bg-primary/5 scale-[1.01]' 
                : 'border-white/10 hover:border-primary/50 hover:bg-white/5'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".mp4,.mov,.avi"
              onChange={handleFileInput}
            />
            
            <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10">
              <UploadCloud className="w-10 h-10 text-primary" />
            </div>
            
            <h3 className="text-xl font-bold mb-2">Upload Video for Analysis</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Drag and drop your video here, or click to browse. 
              Supports MP4, MOV, AVI (Max 100MB).
            </p>
            
            <button className="px-6 py-2.5 rounded-xl bg-secondary text-white font-medium text-sm border border-white/10 hover:bg-secondary/80 transition-colors">
              Select Video
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card/50 border border-white/10 rounded-2xl p-6 flex items-center gap-6 relative overflow-hidden"
          >
            <div className="w-24 h-24 bg-black/40 rounded-xl flex-shrink-0 flex items-center justify-center border border-white/5">
              <FileVideo className="w-10 h-10 text-primary/80" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-lg truncate mb-1">{selectedFile.name}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              
              <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full w-fit">
                <AlertCircle className="w-3 h-3" />
                Ready for analysis
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="p-3 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Background gradient effect */}
            <div className="absolute -z-10 top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
