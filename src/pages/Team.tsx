import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { supabase } from "@/lib/supabase";
import { Users, UserCheck, Wallet } from "lucide-react";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  referral_code: string;
  created_at: string;
  deposits?: number;
};

export default function Team() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState({ total: 0, valid: 0, earnings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!user?.referral_code) return;

      const { data } = await supabase
        .from("users")
        .select("id, name, email, referral_code, created_at, deposits(amount)")
        .eq("referred_by", user.referral_code);

      if (data) {
        const membersList = data.map((m: unknown) => ({
          ...(m as TeamMember),
          deposits: Array.isArray((m as Record<string, unknown>).deposits)
            ? ((m as Record<string, unknown>).deposits as { amount: number }[]).reduce((sum, d) => sum + d.amount, 0)
            : 0,
        }));
        setMembers(membersList);
        const validCount = membersList.filter((m) => (m.deposits || 0) > 0).length;
        setStats({
          total: membersList.length,
          valid: validCount,
          earnings: validCount * 0.5,
        });
      }
      setLoading(false);
    };
    fetchTeam();
  }, [user?.referral_code]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <BackButton />

        <div className="mt-6 flex items-center gap-3">
          <Users className="h-6 w-6 text-purple-400" />
          <h1 className="text-2xl font-bold">Your Team</h1>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="card-glass p-3 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Invited</p>
          </div>
          <div className="card-glass p-3 text-center">
            <p className="text-2xl font-bold">{stats.valid}</p>
            <p className="text-xs text-muted-foreground">Valid</p>
          </div>
          <div className="card-glass p-3 text-center">
            <p className="text-2xl font-bold">{stats.earnings.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Earnings (USDT)</p>
          </div>
        </div>

        {/* Members */}
        {loading ? (
          <div className="mt-8 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : members.length === 0 ? (
          <div className="mt-8 text-center text-muted-foreground">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4">No team members yet</p>
            <p className="mt-1 text-sm">Share your referral link to invite friends</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {members.map((member) => (
              <div key={member.id} className="card-glass p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
                      <UserCheck className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">ID</p>
                    <p className="font-mono text-xs">{member.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-emerald-400">
                  <Wallet className="h-4 w-4" />
                  <span>{(member.deposits || 0).toFixed(2)} USDT deposited</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
