import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error ||!session?.user) {
        toast.error("Invalid or expired confirmation link");
        navigate("/login");
        return;
      }

      const user: User = session.user;

      // Check if user already exists in your users table
      const { data: existingUser } = await supabase
       .from("users")
       .select("id")
       .eq("id", user.id)
       .single();

      if (!existingUser) {
        const name = user.user_metadata?.name || "";
        const referralCodeGenerated = Math.random().toString(36).substring(2, 10).toUpperCase();
        const referredBy = localStorage.getItem("referralCode");

        const { error: insertError } = await supabase.from("users").insert({
          id: user.id,
          email: user.email,
          name,
          balance: 0,
          withdrawal_password: "",
          wallet_address: null,
          referral_code: referralCodeGenerated,
          referred_by: referredBy,
          is_admin: false,
          is_blocked: false,
        });

        if (insertError) {
          console.error(insertError);
          toast.error("Failed to create user profile");
          navigate("/login");
          return;
        }

        if (referredBy) localStorage.removeItem("referralCode");
      }

      toast.success("Email confirmed successfully!");
      navigate("/dashboard");
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        <p className="text-lg text-foreground">Confirming your email...</p>
      </div>
    </div>
  );
      }
