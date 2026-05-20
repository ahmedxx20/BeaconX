import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function Withdraw() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [amount, setAmount] = useState("");
  const [withdrawalPin, setWithdrawalPin] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || withdrawAmount < 20) {
      toast.error("Minimum withdrawal is 20 USDT");
      return;
    }
    if (!withdrawalPin) {
      toast.error("Please enter your withdrawal PIN");
      return;
    }
    if (withdrawAmount > (user?.balance || 0)) {
      toast.error("Insufficient balance");
      return;
    }
    if (withdrawalPin !== user?.withdrawal_password) {
      toast.error("Incorrect withdrawal PIN");
      return;
    }

    const fee = withdrawAmount * 0.01;
    const netAmount = withdrawAmount - fee;

    const { error } = await supabase.from("withdrawals").insert({
      user_id: user!.id,
      amount: netAmount,
      address: user?.wallet_address || "",
      status: "pending",
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    setShowSuccess(true);
    setAmount("");
    setWithdrawalPin("");
    refreshUser();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <BackButton />

        <div className="mt-6">
          <h1 className="text-2xl font-bold">Withdraw USDT</h1>
        </div>

        {/* Balance */}
        <div className="mt-4 card-glow-green p-4">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-xl font-bold">{(user?.balance || 0).toFixed(2)} USDT</p>
            </div>
          </div>
        </div>

        {/* Withdrawal Address */}
        <div className="mt-6 space-y-2">
          <Label>Withdrawal Address</Label>
          <Input
            readOnly
            value={user?.wallet_address || "No wallet linked"}
            className="border-white/10 bg-white/5 focus-visible:ring-emerald-500"
          />
          {!user?.wallet_address && (
            <p className="text-xs text-amber-400">
              Please add a wallet address in Settings first.
            </p>
          )}
        </div>

        {/* Amount */}
        <div className="mt-4 space-y-2">
          <Label>Amount (USDT)</Label>
          <Input
            type="number"
            placeholder="Min 20 USDT"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border-white/10 bg-white/5 focus-visible:ring-emerald-500"
          />
          <p className="text-xs text-muted-foreground">Fee: 1% (deducted from amount)</p>
        </div>

        {/* PIN */}
        <div className="mt-4 space-y-2">
          <Label>Withdrawal PIN</Label>
          <Input
            type="password"
            placeholder="Enter withdrawal PIN"
            value={withdrawalPin}
            onChange={(e) => setWithdrawalPin(e.target.value)}
            className="border-white/10 bg-white/5 focus-visible:ring-emerald-500"
          />
        </div>

        <Button onClick={handleWithdraw} className="mt-6 w-full btn-glass">
          Request Withdrawal
        </Button>

        <div className="mt-6 space-y-2 rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm text-muted-foreground">
          <p>Minimum withdrawal: <span className="text-amber-400">20 USDT</span></p>
          <p>Withdrawal fee: <span className="text-amber-400">1%</span></p>
          <p>Processing time: <span className="text-amber-400">1-24 hours</span></p>
        </div>
      </main>

      <Footer />

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="border-white/10 bg-card">
          <DialogHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <DialogTitle className="text-xl">Withdrawal Requested</DialogTitle>
            <DialogDescription>
              Your withdrawal is successful and in progress. It will be processed within 1-24 hours.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => { setShowSuccess(false); navigate("/transactions"); }} className="btn-glass">
            View Transactions
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

