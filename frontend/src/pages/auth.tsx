import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin, useRegister } from "../hooks/use-auth";
import { Shield, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const authSchema = z.object({
  email: z.string()
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  
  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: AuthFormData) => {
    if (isLogin) {
      loginMutation.mutate(data);
    } else {
      registerMutation.mutate(data);
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;
  const error = loginMutation.error || registerMutation.error;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-background z-0" />
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 blur-[100px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className={`glass-card rounded-3xl p-8 md:p-10 shadow-2xl border backdrop-blur-xl ${
          isLogin 
            ? 'bg-blue-900/30 border-blue-400/30' 
            : 'bg-white/10 border-white/10'
        }`}>
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6 ${
              isLogin
                ? 'bg-gradient-to-br from-blue-300 to-blue-600 shadow-blue-500/30'
                : 'bg-gradient-to-br from-cyan-400 to-purple-600 shadow-purple-500/30'
            }`}>
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold font-display tracking-tight mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className={`${isLogin ? 'text-blue-200' : 'text-muted-foreground'}`}>
              {isLogin 
                ? "Sign in to access DeepShield analytics" 
                : "Get started with advanced deepfake detection"}
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium ml-1">{isLogin ? 'Username' : 'Username'}</label>
                <input
                  {...form.register("email")}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-foreground placeholder:text-muted-foreground/50 ${
                    isLogin
                      ? 'bg-blue-900/20 border-blue-400/40 focus:border-blue-300/60 focus:ring-4 focus:ring-blue-400/20'
                      : 'bg-secondary/50 border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10'
                  }`}
                  placeholder="Enter your username"
                />
                {form.formState.errors.email && (
                  <p className="text-red-400 text-xs ml-1">{form.formState.errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium ml-1">Password</label>
                <input
                  type="password"
                  {...form.register("password")}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-foreground placeholder:text-muted-foreground/50 ${
                    isLogin
                      ? 'bg-blue-900/20 border-blue-400/40 focus:border-blue-300/60 focus:ring-4 focus:ring-blue-400/20'
                      : 'bg-secondary/50 border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10'
                  }`}
                  placeholder="••••••••"
                />
                {form.formState.errors.password && (
                  <p className="text-red-400 text-xs ml-1">{form.formState.errors.password.message}</p>
                )}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl font-bold text-white transition-all duration-200 ${
                isLogin
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-purple-600 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  form.reset();
                }}
                className={`text-sm transition-colors ${
                  isLogin
                    ? 'text-blue-200 hover:text-blue-100'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}