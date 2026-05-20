import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useTawkTo } from "@/hooks/useTawkTo";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Users,
  Pickaxe,
  Settings,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [showOffer, setShowOffer] = useState(true);
  const [offerPulsing, setOfferPulsing] = useState(true);

  useTawkTo();
  useAdminNotifications();

  useEffect(() => {
    refreshUser();
    const timer = setTimeout(() => setShowOffer(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOfferPulsing((p) => !p);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { icon: ArrowDownLeft, label: "Deposit", path: "/deposit", color: "text-emerald-400" },
    { icon: ArrowUpRight, label: "Withdraw", path: "/withdraw", color: "text-red-400" },
    { icon: Receipt, label: "Transactions", path: "/transactions", color: "text-blue-400" },
    { icon: Pickaxe, label: "Mining", path: "/mining", color: "text-amber-400" },
    { icon: Users, label: "Team", path: "/team", color: "text-purple-400" },
    { icon: Zap, label: "Invite", path: "/invite", color: "text-cyan-400" },
    { icon: Settings, label: "Settings", path: "/settings", color: "text-gray-400" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-background to-background">
      <Header />

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        {/* Offer Card */}
        <div
          className={`mb-6 overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl transition-all duration-1000 ${
            offerPulsing ? "shadow-[0_0_40px_rgba(34,197,94,0.3)]" : "shadow-[0_0_15px_rgba(34,197,94,0.1)]"
          }`}
        >
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold text-emerald-400">Exclusive Offer</h3>
              </div>
              <button
                onClick={() => setShowOffer(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <p className="mt-2 text-sm text-foreground">
              Get a <span className="font-bold text-emerald-400">20% bonus</span> on your first deposit!
            </p>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <p>• Share your link in 5 groups → get 1 USDT</p>
              <p>• Invite 5 friends same day → get 1 USDT</p>
              <p>• Invite 10 friends same day → get 5 USDT</p>
              <p>• Invite 10 good friends → get 10 USDT</p>
            </div>
            <p className="mt-2 text-xs text-amber-400">Tasks must be completed same day to get reward</p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="card-glow-green mb-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Welcome back</p>
              <h2 className="mt-1 text-xl font-bold">{user?.name || "User"}</h2>
              <p className="mt-1 text-xs text-muted-foreground">UID: {user?.id?.slice(0, 8).toUpperCase() || "-"}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
              <Wallet className="h-6 w-6 text-emerald-400" />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="mt-1 text-3xl font-bold">
                {showBalance ? `${(user?.balance || 0).toFixed(2)} USDT` : "****"}
              </p>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            >
              {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Main Buttons Grid */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {menuItems.slice(0, 3).map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] active:scale-95"
            >
              <item.icon className={`h-6 w-6 ${item.color}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Secondary Buttons Grid */}
        <div className="grid grid-cols-4 gap-3">
          {menuItems.slice(3).map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] active:scale-95"
            >
              <item.icon className={`h-5 w-5 ${item.color}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

