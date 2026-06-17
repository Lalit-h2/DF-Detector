import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { useUser } from "./hooks/use-auth";
import { Loader2 } from "lucide-react";

import AuthPage from "./pages/auth";
import Dashboard from "./pages/dashboard";
import UploadPage from "./pages/upload";
import ResultsPage from "./pages/results";
import HistoryPage from "./pages/history";
import AnalyticsPage from "./pages/analytics";
// import SettingsPage from "./pages/settings";
import NotFound from "./pages/not-found";
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, [key: string]: any }) {
  const { data: user, isLoading } = useUser();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    // We use a timeout to avoid React state update warnings during render
    setTimeout(() => setLocation("/auth"), 0);
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      
      
      {/* <Route path="/" component={Dashboard} />
      <Route path="/upload" component={UploadPage} />
      <Route path="/results" component={ResultsPage} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/settings" component={SettingsPage} /> */}

      <Route path="/auth" component={AuthPage} />
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
        </Route>
      <Route path="/upload">
        <ProtectedRoute component={UploadPage} />
      </Route>
      <Route path="/results/:id">
        <ProtectedRoute component={ResultsPage} />
      </Route>
      <Route path="/history">
        <ProtectedRoute component={HistoryPage} />
      </Route>
      <Route path="/analytics">
        <ProtectedRoute component={AnalyticsPage} />
      </Route>
      {/* <Route path="/settings">
        <ProtectedRoute component={SettingsPage} />
      </Route> */}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
