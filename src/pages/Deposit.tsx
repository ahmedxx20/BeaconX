import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, CheckCircle2, Timer, QrCode } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const DEPOSIT_ADDRESSES = [
  "TJjmjkFEGXCNueYr7MR8bvtoqQJmaGHy6w",
  "TEqqyTMzxiMbngRmq9vaUdVswSv1nbyBwk",
  "TMVS4qvye4Bc9K2BSG9L9DtDuUkvoQk98R",
  "TZ6wSKz291JFnLc7BoVMR7gA7dxvNta2WE",
];

export default function Deposit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timer, setTimer] = useState(300);
  const [addressIndex, setAddressIndex] = useState(0);
  const [amount, setAmount] = useState("");
  const [txid, setTxid] = useState("");
  const [copied, setCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [depositSubmitted, setDepositSubmitted] = useState(false);

  const currentAddress = DEPOSIT_ADDRESSES[addressIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setAddressIndex((idx) => (idx + 1) % DEPOSIT_ADDRESSES.length);
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Address copied!");
  };

  const handleConfirmDeposit = async () => {
    const depositAmount = parseFloat(amount);
    if (!depositAmount || depositAmount < 30) {
      toast.error("Minimum deposit is 30 USDT");
      return;
    }
    if (!txid.trim()) {
      toast.error("Please enter the TXID");
      return;
    }

    const { error } = await supabase.from("deposits").insert({
      user_id: user!.id,
      amount: depositAmount,
      txid: txid.trim(),
      address: currentAddress,
      status: "pending",
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    setShowConfirm(true);
    setDepositSubmitted(true);
    setAmount("");
    setTxid("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <BackButton />

        <div className="mt-6">
          <h1 className="text-2xl font-bold">Deposit</h1>
          <p className="text-sm text-muted-foreground">USDT TRC20 Network Only</p>
        </div>

        {/* Timer */}
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-400">
          <Timer className="h-5 w-5" />
          <span className="font-mono text-lg font-bold">{formatTime(timer)}</span>
          <span className="text-sm">until address rotates</span>
        </div>

        {/* QR & Address */}
        <div className="mt-6 card-glow-green p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-40 w-40 items-center justify-center rounded-2xl bg-white p-3">
              <QrCode className="h-full w-full text-black" />
            </div>
            <div className="w-full">
              <Label className="text-sm text-muted-foreground">Deposit Address (TRC20)</Label>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  readOnly
                  value={currentAddress}
                  className="border-white/10 bg-white/5 text-xs focus-visible:ring-emerald-500"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyAddress}
                  className="shrink-0 border-emerald-500/30"
                >
                  {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-emerald-400" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="mt-6 space-y-2">
          <Label>Deposit Amount (USDT)</Label>
          <Input
            type="number"
            placeholder="Min 30 USDT"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border-white/10 bg-white/5 focus-visible:ring-emerald-500"
          />
        </div>

        {/* TXID */}
        <div className="mt-4 space-y-2">
          <Label>Transaction ID (TXID)</Label>
          <Input
            placeholder="Paste TXID here"
            value={txid}
            onChange={(e) => setTxid(e.target.value)}
            className="border-white/10 bg-white/5 focus-visible:ring-emerald-500"
          />
        </div>

        <Button
          onClick={handleConfirmDeposit}
          disabled={depositSubmitted}
          className="mt-6 w-full btn-glass"
        >
          {depositSubmitted ? "Deposit Submitted" : "Confirm Deposit"}
        </Button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Minimum deposit: <span className="text-amber-400">30 USDT</span>. Deposits are reviewed within 1-24 hours.
        </p>
      </main>

      <Footer />

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="border-white/10 bg-card">
          <DialogHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <DialogTitle className="text-xl">Deposit Submitted</DialogTitle>
            <DialogDescription>
              Your deposit is under review. It will be processed within 1-24 hours.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => { setShowConfirm(false); navigate("/transactions"); }} className="btn-glass">
            View Transactions
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
