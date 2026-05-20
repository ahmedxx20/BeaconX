import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  balance: number;
  wallet_address: string | null;
  referral_code: string;
  referred_by: string | null;
  is_admin: boolean;
  is_blocked: boolean;
  withdrawal_password: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  setUser: (user: AppUser | null) => void;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAppUser = async (userId: string): Promise<AppUser | null> => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    if (error || !data) return null;
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      balance: data.balance,
      wallet_address: data.wallet_address,
      referral_code: data.referral_code,
      referred_by: data.referred_by,
      is_admin: data.is_admin,
      is_blocked: data.is_blocked,
      withdrawal_password: data.withdrawal_password,
    };
  };

  const updateLastActive = async (userId: string) => {
    await supabase.from("users").update({ last_active: new Date().toISOString() }).eq("id", userId);
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      if (data.session?.user) {
        const appUser = await fetchAppUser(data.session.user.id);
        setUserState(appUser);
        if (appUser) await updateLastActive(appUser.id);
      }
      setLoading(false);
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        const appUser = await fetchAppUser(newSession.user.id);
        setUserState(appUser);
        if (appUser) await updateLastActive(appUser.id);
      } else {
        setUserState(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserState(null);
    setSession(null);
  };

  const refreshUser = async () => {
    if (user?.id) {
      const appUser = await fetchAppUser(user.id);
      setUserState(appUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, setUser: setUserState, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
