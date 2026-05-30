import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";

import { Loader2 } from "lucide-react";

// Pages
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Editor from "@/pages/Editor";
import Preview from "@/pages/Preview";
import Templates from "@/pages/Templates";
import Data from "@/pages/Data";
import NotFound from "@/pages/NotFound";
import { Navigation } from "@/components/Navigation";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Switch>
      {/* Public / Conditional Routes */}
      <Route path="/">
        {user ? (
          <>
            <Navigation />
            <Dashboard />
          </>
        ) : (
          <Landing />
        )}
      </Route>

      {/* Protected Routes */}
      <Route path="/templates">
        {user ? (
          <>
            <Navigation />
            <Templates />
          </>
        ) : (
          <Redirect to="/" />
        )}
      </Route>

      <Route path="/app/:id/editor">
        {user ? <Editor /> : <Redirect to="/" />}
      </Route>

      <Route path="/app/:id/preview">
        {user ? <Preview /> : <Redirect to="/" />}
      </Route>

      <Route path="/app/:id/data">
        {user ? <Data /> : <Redirect to="/" />}
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
