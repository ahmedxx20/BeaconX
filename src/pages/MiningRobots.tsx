import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pickaxe, Coins, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Plan {
  id: string;
  name: string;
  dailyRate: number;
  minAmount: number;
  maxAmount: number;
  color: string;
  iconColor: string;
}

const PLANS: Plan[] = [
  { id: "v1", name: "Robot V1", dailyRate: 1.5, minAmount: 30, maxAmount: 99, color: "border-emerald-500/30", iconColor: "text-emerald-400" },
  { id: "v2", name: "Robot V2", dailyRate: 2.2, minAmount: 100, maxAmount: 299, color: "border-blue-500/30", iconColor: "text-blue-400" },
  { id: "v3", name: "Robot V3", dailyRate: 3.4, minAmount: 300, maxAmount: 999, color: "border-purple-500/30", iconColor: "text-purple-400" },
  { id: "v4", name: "Robot V4", dailyRate: 6.5, minAmount: 1000, maxAmount: 5000, color: "border-amber-500/30", iconColor: "text-amber-400" },
  { id: "v5", name: "Robot V5", dailyRate: 9.0, minAmount: 5001, maxAmount: 100000, color: "border-red-500/30", iconColor: "text-red-400" },
];

type ActivePlan = {
  id: string;
  plan_type: string;
  amount: number;
  daily_rate: number;
  started_at: string;
  ends_at: string;
  status: string;
};

export default function MiningRobots() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [activePlans, setActivePlans] = useState<ActivePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [amount, setAmount] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [planActivated, setPlanActivated] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivePlans();
  }, [user?.id]);

  const fetchActivePlans = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from("mining_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("started_at", { ascending: false });
    setActivePlans(data || []);
    setLoading(false);
  };

  const handleStartMining = async () => {
    if (!selectedPlan || !amount) return;
    const investAmount = parseFloat(amount);
    if (investAmount < selectedPlan.minAmount || investAmount > selectedPlan.maxAmount) {
      toast.error(`Amount must be between ${selectedPlan.minAmount} and ${selectedPlan.maxAmount} USDT`);
      return;
    }
    if (investAmount > (user?.balance || 0)) {
      toast.error("Insufficient balance");
      return;
    }

    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + 1);

    const { error } = await supabase.from("mining_plans").insert({
      user_id: user!.id,
      plan_type: selectedPlan.id,
      amount: investAmount,
      daily_rate: selectedPlan.dailyRate,
      started_at: new Date().toISOString(),
      ends_at: endsAt.toISOString(),
      status: "active",
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    // Deduct balance
    await supabase
      .from("users")
      .update({ balance: (user?.balance || 0) - investAmount })
      .eq("id", user!.id);

    refreshUser();
    setPlanActivated(selectedPlan);
    setShowConfirm(true);
    setSelectedPlan(null);
    setAmount("");
    fetchActivePlans();
  };

  const getTimeRemaining = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - new Date().getTime();
    if (diff <= 0) return "Completed";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <BackButton />

        <div className="mt-6 flex items-center gap-3">
          <Pickaxe className="h-6 w-6 text-amber-400" />
          <h1 className="text-2xl font-bold">Mining Robots</h1>
        </div>

        {/* Active Plans */}
        {activePlans.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-lg font-semibold">Activated Robots</h2>
            <div className="space-y-3">
              {activePlans.map((plan) => (
                <div key={plan.id} className="card-glow-green p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Pickaxe className="h-6 w-6 text-amber-400 animate-mining-shake" />
                        <Coins className="absolute -right-1 -top-1 h-3 w-3 text-yellow-400 animate-coin-spin" />
                      </div>
                      <div>
                        <p className="font-bold">{plan.plan_type.toUpperCase()}</p>
                        <p className="text-sm text-emerald-400">{plan.daily_rate}% / 24h</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{plan.amount.toFixed(2)} USDT</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {getTimeRemaining(plan.ends_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activePlans.length === 0 && !loading && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
            <Pickaxe className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">You are not subscribed to any plan yet</p>
            <Button onClick={() => document.getElementById("plans")?.scrollIntoView()} className="mt-4 btn-glass">
              Explore Plans
            </Button>
          </div>
        )}

        {/* Plans */}
        <div id="plans" className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Robot Plans</h2>
          <div className="space-y-4">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative overflow-hidden rounded-2xl border ${plan.color} bg-white/5 p-5 backdrop-blur-sm transition-all hover:bg-white/10`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Pickaxe className={`h-8 w-8 ${plan.iconColor} animate-mining-shake`} />
                      <Coins className="absolute -right-1 -top-1 h-4 w-4 text-yellow-400 animate-coin-spin" />
                    </div>
                    <div>
                      <h3 className="font-bold">{plan.name}</h3>
                      <p className="text-sm text-emerald-400">{plan.dailyRate}% every 24 hours</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Investment Range</p>
                    <p className="font-semibold">{plan.minAmount} - {plan.maxAmount} USDT</p>
                  </div>
                </div>

                {selectedPlan?.id === plan.id ? (
                  <div className="mt-4 space-y-3">
                    <Input
                      type="number"
                      placeholder={`Amount (${plan.minAmount}-${plan.maxAmount} USDT)`}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="border-white/10 bg-white/5 focus-visible:ring-emerald-500"
                    />
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setSelectedPlan(null)} className="flex-1">
                        Cancel
                      </Button>
                      <Button onClick={handleStartMining} className="flex-1 btn-glass">
                        Start Mining
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => { setSelectedPlan(plan); setAmount(""); }}
                    className="mt-4 w-full btn-glass"
                  >
                    Start Mining
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="border-white/10 bg-card">
          <DialogHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <DialogTitle className="text-xl">Activated Successfully!</DialogTitle>
            <DialogDescription>
              {planActivated && (
                <div className="mt-2 space-y-1 text-left">
                  <p>Plan: <span className="font-semibold">{planActivated.name}</span></p>
                  <p>Daily Rate: <span className="text-emerald-400">{planActivated.dailyRate}%</span></p>
                  <p>Your profits will return to your main balance after 24 hours.</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowConfirm(false)} className="btn-glass">
            Got it!
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

