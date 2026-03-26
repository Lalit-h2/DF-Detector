import { Layout } from "../components/Layout";
import { User, Bell, Moon, Lock, Shield } from "lucide-react";
import { Switch } from "../components/ui/switch";
import { useUser } from "../hooks/use-auth";
export default function SettingsPage() {
  const { data: user } = useUser();

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-display text-white mb-2">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Profile Section */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{user?.username || "User"}</h3>
              <p className="text-sm text-muted-foreground">Standard Plan</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="text-white">Edit Profile</span>
              </div>
              <button className="text-sm text-primary hover:text-primary/80 font-medium">Edit</button>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <span className="text-white">Change Password</span>
              </div>
              <button className="text-sm text-primary hover:text-primary/80 font-medium">Update</button>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="font-bold text-white mb-6">Preferences</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-white">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive updates about your analysis</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-white">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Always on for AI Theme</p>
                </div>
              </div>
              <Switch defaultChecked disabled />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-white">High Sensitivity</p>
                  <p className="text-xs text-muted-foreground">Increase model detection threshold</p>
                </div>
              </div>
              <Switch />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
