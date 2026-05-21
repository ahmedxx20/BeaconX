import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";  // ← السطر اللي اتزود
import Dashboard from "./pages/Dashboard";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import Transactions from "./pages/Transactions";
import MiningRobots from "./pages/MiningRobots";
import Team from "./pages/Team";
import Invite from "./pages/Invite";
import Settings from "./pages/Settings";
import AdminPanel from "./pages/AdminPanel";
import AboutUs from "./pages/AboutUs";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { supabase } from "./lib/supabase";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"/></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"/></div>;
  if (!user || !user.is_admin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function UpdateLastActive() {
  const { user } = useAuth();
  useEffect(() => {
    if (user?.id) {
      supabase.from("users").update({ last_active: new Date().toISOString() }).eq("id", user.id);
    }
  }, [user?.id]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <UpdateLastActive />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback" element={<AuthCallback />} />  {/* ← السطر اللي اتزود */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
              <Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
              <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
              <Route path="/mining" element={<ProtectedRoute><MiningRobots /></ProtectedRoute>} />
              <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
              <Route path="/invite" element={<ProtectedRoute><Invite /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
