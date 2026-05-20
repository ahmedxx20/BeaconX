import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          balance: number;
          withdrawal_password: string;
          wallet_address: string | null;
          referral_code: string;
          referred_by: string | null;
          is_admin: boolean;
          is_blocked: boolean;
          last_active: string;
          created_at: string;
        };
      };
      deposits: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          txid: string;
          address: string;
          status: "pending" | "success" | "rejected";
          created_at: string;
        };
      };
      withdrawals: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          address: string;
          status: "pending" | "success" | "rejected";
          created_at: string;
        };
      };
      mining_plans: {
        Row: {
          id: string;
          user_id: string;
          plan_type: string;
          amount: number;
          daily_rate: number;
          started_at: string;
          ends_at: string;
          status: "active" | "completed";
        };
      };
    };
  };
};
