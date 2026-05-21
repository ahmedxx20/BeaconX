import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [withdrawalPin, setWithdrawalPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert("اكتب الجيميل والباسورد");
      return;
    }

    setLoading(true);

    // جرب Login الأول
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInData.session) {
      setLoading(false);
      alert("تم تسجيل الدخول بنجاح");
      window.location.replace("/dashboard");
      return;
    }

    // لو Login فشل عشان الحساب مش موجود، اعمل Register
    if (signInError?.message.includes("Invalid login credentials")) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, withdrawalPin } },
      });

      setLoading(false);

      if (signUpError) {
        alert("Error: " + signUpError.message);
        return;
      }

      if (signUpData.session) {
        alert("تم انشاء الحساب بنجاح");
        window.location.replace("/dashboard");
        return;
      }
    } else if (signInError) {
      setLoading(false);
      alert("Error: " + signInError.message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <h2 className="mb-6 text-center text-xl font-semibold">Register / Login</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdrawalPin">Withdrawal PIN</Label>
            <Input id="withdrawalPin" type="password" value={withdrawalPin} onChange={(e) => setWithdrawalPin(e.target.value)} />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Processing..." : "Register / Login"}
          </Button>
        </form>
      </div>
    </div>
  );
  }
