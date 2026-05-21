import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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

      const user = session.user;

      // Check if user already exists in your users table
      const { data: existingUser } = await supabase
       .from("users")
       .select("id")
       .eq("id", user.id)
       .single();

      if (!existingUser) {
        // Get data from user_metadata that we saved in signUp
        const { name } = user.user_metadata;
        const referralCodeGenerated = Math.random().toString(36).substring(2, 10).toUpperCase();

        // Get referral code from localStorage if you saved it before redirect
        const referredBy = localStorage.getItem("referralCode") || null;

        const { error: insertError } = await supabase.from("users").insert({
          id: user.id,
          email: user.email,
          name: name || "",
          balance: 0,
          withdrawal_password: "", // هتحتاج تاخده من مكان تاني لو مش عايز تسيبه فاضي
          wallet_address: null,
          referral_code: referralCodeGenerated,
          referred_by: referredBy,
          is_admin: false,
          is_blocked: false,
        });

        if (insertError) {
          toast.error("Failed to create user profile");
          navigate("/login");
          return;
        }

        localStorage.removeItem("referralCode");
      }

      toast.success("Email confirmed successfully!");
      navigate("/");
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        <p className="text-lg">Confirming your email...</p>
      </div>
    </div>
  );
        }
