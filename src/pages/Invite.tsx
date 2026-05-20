import { useAuth } from "@/providers/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Copy, Users, Zap, Gift } from "lucide-react";
import { toast } from "sonner";

export default function Invite() {
  const { user } = useAuth();

  const referralLink = `${window.location.origin}/register?ref=${user?.referral_code || ""}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <BackButton />

        <div className="mt-6 flex items-center gap-3">
          <Zap className="h-6 w-6 text-cyan-400" />
          <h1 className="text-2xl font-bold">Invite Friends</h1>
        </div>

        {/* Referral Link */}
        <div className="mt-6 card-glow-green p-5">
          <LabelWithIcon icon={<LinkIcon />} label="Referral Link" />
          <div className="mt-2 flex items-center gap-2">
            <input
              readOnly
              value={referralLink}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(referralLink, "Referral link")}
              className="shrink-0 border-emerald-500/30"
            >
              <Copy className="h-4 w-4 text-emerald-400" />
            </Button>
          </div>
        </div>

        {/* Referral Code */}
        <div className="mt-4 card-glow-green p-5">
          <LabelWithIcon icon={<Gift className="h-4 w-4 text-emerald-400" />} label="Referral Code" />
          <div className="mt-2 flex items-center gap-2">
            <input
              readOnly
              value={user?.referral_code || ""}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center font-mono text-lg font-bold tracking-wider"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(user?.referral_code || "", "Referral code")}
              className="shrink-0 border-emerald-500/30"
            >
              <Copy className="h-4 w-4 text-emerald-400" />
            </Button>
          </div>
        </div>

        {/* Commission Card */}
        <div className="mt-6 card-glass p-5">
          <h3 className="mb-4 text-center font-semibold">Commission Structure</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <span className="text-sm">Level 1 (Direct)</span>
              <span className="font-bold text-emerald-400">10% Commission</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
              <span className="text-sm">Level 2</span>
              <span className="font-bold text-blue-400">4% Commission</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-purple-500/20 bg-purple-500/5 p-3">
              <span className="text-sm">Level 3</span>
              <span className="font-bold text-purple-400">1% Commission</span>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Share your referral link to earn commissions from all levels
          </p>
        </div>

        {/* How it works */}
        <div className="mt-6 card-glass p-5">
          <h3 className="mb-3 font-semibold">How it works</h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-bold text-emerald-400">1.</span>
              Share your referral link with friends
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-emerald-400">2.</span>
              Friends register using your link
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-emerald-400">3.</span>
              Earn commissions on their deposits
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-emerald-400">4.</span>
              Withdraw your earnings anytime
            </li>
          </ol>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function LabelWithIcon({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function LinkIcon() {
  return (
    <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

