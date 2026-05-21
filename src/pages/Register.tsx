import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [withdrawalPin, setWithdrawalPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("ref") || "";
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword || !withdrawalPin) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (withdrawalPin.length < 4) {
      toast.error("Withdrawal PIN must be at least 4 digits");
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      },
    });

    setLoading(false);

    if (authError) {
      toast.error(authError.message);
      return;
    }

    toast.success("Check your email to confirm your account");
    // مفيش Navigate، خليه يستنى يأكد من الميل
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-background to-background px-4 py-8">
      <div className="w-full max-w-md animate-scale-in">
        <div className="mb-8 text-center">
          <img src="/icon.png" alt="BeaconX" className="mx-auto mb-4 h-16 w-16 rounded-2xl object-cover shadow-[0_0_30px_rgba(34,197,94,0.3)]" />
          <h1 className="text-3xl font-bold text-foreground">BeaconX</h1>
          <p className="mt-2 text-muted-foreground">Create your investment account</p>
        </div>

        <div className="card-glow-green p-8">
          <h2 className="mb-6 text-center text-xl font-semibold">Register</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-emerald-400" />
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-white/10 bg-white/5 focus-visible:ring-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-emerald-400" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-white/10 bg-white/5 focus-visible:ring-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-sm">
                <Lock className="h-4 w-4 text-emerald-400" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-white/10 bg-white/5 pr-10 focus-visible:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-white/10 bg-white/5 focus-visible:ring-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdrawalPin" className="text-sm">Withdrawal PIN</Label>
              <Input
                id="withdrawalPin"
                type="password"
                placeholder="Min 4 digits"
                value={withdrawalPin}
                onChange={(e) => setWithdrawalPin(e.target.value)}
                className="border-white/10 bg-white/5 focus-visible:ring-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referralCode" className="text-sm">Referral Code (optional)</Label>
              <Input
                id="referralCode"
                placeholder="Referral code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="border-white/10 bg-white/5 focus-visible:ring-emerald-500"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full btn-glass">
              {loading ? "Creating Account..." : "Register"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-emerald-400 hover:text-emerald-300 hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
                }
