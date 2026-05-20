import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Wallet, Lock, KeyRound, Save, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const { user, refreshUser, signOut } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [wallet, setWallet] = useState(user?.wallet_address || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentWithdrawalPin, setCurrentWithdrawalPin] = useState("");
  const [newWithdrawalPin, setNewWithdrawalPin] = useState("");
  const [showLogout, setShowLogout] = useState(false);

  const updateName = async () => {
    if (!name.trim()) return;
    const { error } = await supabase.from("users").update({ name }).eq("id", user!.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    refreshUser();
    toast.success("Name updated successfully!");
  };

  const updateWallet = async () => {
    if (!wallet.trim()) return;
    const { error } = await supabase.from("users").update({ wallet_address: wallet }).eq("id", user!.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    refreshUser();
    toast.success("Wallet address updated!");
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      toast.error("Please fill all fields. New password must be 6+ chars.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    toast.success("Password changed successfully!");
  };

  const changeWithdrawalPin = async () => {
    if (currentWithdrawalPin !== user?.withdrawal_password) {
      toast.error("Incorrect current withdrawal PIN");
      return;
    }
    if (!newWithdrawalPin || newWithdrawalPin.length < 4) {
      toast.error("New PIN must be at least 4 digits");
      return;
    }
    const { error } = await supabase.from("users").update({ withdrawal_password: newWithdrawalPin }).eq("id", user!.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    refreshUser();
    setCurrentWithdrawalPin("");
    setNewWithdrawalPin("");
    toast.success("Withdrawal PIN changed!");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <BackButton />

        <div className="mt-6 flex items-center gap-3">
          <SettingsIcon className="h-6 w-6 text-gray-400" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        {/* Name */}
        <div className="mt-6 card-glass p-5">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-5 w-5 text-emerald-400" />
            <h3 className="font-semibold">Profile Name</h3>
          </div>
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-white/10 bg-white/5 focus-visible:ring-emerald-500"
            />
            <Button onClick={updateName} variant="outline" className="shrink-0 border-emerald-500/30">
              <Save className="h-4 w-4 text-emerald-400" />
            </Button>
          </div>
        </div>

        {/* Wallet */}
        <div className="mt-4 card-glass p-5">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="h-5 w-5 text-blue-400" />
            <h3 className="font-semibold">USDT Wallet Address (TRC20)</h3>
          </div>
          <div className="flex gap-2">
            <Input
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="Enter TRC20 wallet address"
              className="border-white/10 bg-white/5 focus-visible:ring-emerald-500"
            />
            <Button onClick={updateWallet} variant="outline" className="shrink-0 border-emerald-500/30">
              <Save className="h-4 w-4 text-emerald-400" />
            </Button>
          </div>
        </div>

        {/* Change Password */}
        <div className="mt-4 card-glass p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="h-5 w-5 text-red-400" />
            <h3 className="font-semibold">Change Password</h3>
          </div>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="border-white/10 bg-white/5 focus-visible:ring-emerald-500"
            />
            <Input
              type="password"
              placeholder="New password (min 6 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border-white/10 bg-white/5 focus-visible:ring-emerald-500"
            />
            <Button onClick={changePassword} className="w-full btn-glass">
              Change Password
            </Button>
          </div>
        </div>

        {/* Change Withdrawal PIN */}
        <div className="mt-4 card-glass p-5">
          <div className="flex items-center gap-2 mb-3">
            <KeyRound className="h-5 w-5 text-amber-400" />
            <h3 className="font-semibold">Change Withdrawal PIN</h3>
          </div>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Current PIN"
              value={currentWithdrawalPin}
              onChange={(e) => setCurrentWithdrawalPin(e.target.value)}
              className="border-white/10 bg-white/5 focus-visible:ring-emerald-500"
            />
            <Input
              type="password"
              placeholder="New PIN (min 4 digits)"
              value={newWithdrawalPin}
              onChange={(e) => setNewWithdrawalPin(e.target.value)}
              className="border-white/10 bg-white/5 focus-visible:ring-emerald-500"
            />
            <Button onClick={changeWithdrawalPin} className="w-full btn-glass">
              Change PIN
            </Button>
          </div>
        </div>

        {/* Logout */}
        <Button
          onClick={() => setShowLogout(true)}
          variant="destructive"
          className="mt-6 w-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </main>
      <Footer />

      <Dialog open={showLogout} onOpenChange={setShowLogout}>
        <DialogContent className="border-white/10 bg-card">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out of BeaconX?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowLogout(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await signOut();
                navigate("/login");
              }}
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

