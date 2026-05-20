import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import {
  Shield,
  Users,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Ban,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

type AppUser = {
  id: string;
  name: string;
  email: string;
  balance: number;
  wallet_address: string | null;
  is_blocked: boolean;
  referral_code: string;
  created_at: string;
};

type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  type: "deposit" | "withdrawal";
  txid?: string;
  address?: string;
  user?: { name: string; email: string };
};

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<Transaction[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({ totalDeposits: 0, totalWithdrawals: 0, totalUsers: 0, onlineNow: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "deposits" | "withdrawals">("users");

  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();

  useEffect(() => {
    fetchAllData();

    // Subscribe to realtime for online users
    const channel = supabase
      .channel("online-users")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "users", filter: `last_active=gte.${twoMinutesAgo}` },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStats = async () => {
    const { data: allDeposits } = await supabase.from("deposits").select("amount").eq("status", "success");
    const { data: allWithdrawals } = await supabase.from("withdrawals").select("amount").eq("status", "success");
    const { count: userCount } = await supabase.from("users").select("*", { count: "exact", head: true });
    const { count: onlineCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("last_active", twoMinutesAgo);

    setStats({
      totalDeposits: allDeposits?.reduce((sum, d) => sum + d.amount, 0) || 0,
      totalWithdrawals: allWithdrawals?.reduce((sum, w) => sum + w.amount, 0) || 0,
      totalUsers: userCount || 0,
      onlineNow: onlineCount || 0,
    });
  };

  const fetchAllData = async () => {
    setLoading(true);
    const { data: usersData } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    const { data: depositsData } = await supabase
      .from("deposits")
      .select("*, users(name, email)")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    const { data: withdrawalsData } = await supabase
      .from("withdrawals")
      .select("*, users(name, email)")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    setUsers(usersData || []);
    setPendingDeposits(
      (depositsData || []).map((d) => ({ ...d, type: "deposit" as const, user: d.users }))
    );
    setPendingWithdrawals(
      (withdrawalsData || []).map((w) => ({ ...w, type: "withdrawal" as const, user: w.users }))
    );
    await fetchStats();
    setLoading(false);
  };

  const handleBlockUser = async (userId: string, blocked: boolean) => {
    const { error } = await supabase.from("users").update({ is_blocked: blocked }).eq("id", userId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(blocked ? "User blocked" : "User unblocked");
    fetchAllData();
  };

  const handleApproveDeposit = async (depositId: string, userId: string, amount: number) => {
    const { error } = await supabase.from("deposits").update({ status: "success" }).eq("id", depositId);
    if (error) {
      toast.error(error.message);
      return;
    }

    // Add to user balance
    const { data: userData } = await supabase.from("users").select("balance").eq("id", userId).single();
    if (userData) {
      await supabase.from("users").update({ balance: userData.balance + amount }).eq("id", userId);
    }

    toast.success("Deposit approved and balance updated!");
    fetchAllData();
  };

  const handleRejectDeposit = async (depositId: string) => {
    const { error } = await supabase.from("deposits").update({ status: "rejected" }).eq("id", depositId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Deposit rejected");
    fetchAllData();
  };

  const handleApproveWithdrawal = async (withdrawalId: string, userId: string, amount: number) => {
    const { error } = await supabase.from("withdrawals").update({ status: "success" }).eq("id", withdrawalId);
    if (error) {
      toast.error(error.message);
      return;
    }

    // Deduct from user balance
    const { data: userData } = await supabase.from("users").select("balance").eq("id", userId).single();
    if (userData) {
      await supabase.from("users").update({ balance: Math.max(0, userData.balance - amount) }).eq("id", userId);
    }

    toast.success("Withdrawal approved!");
    fetchAllData();
  };

  const handleRejectWithdrawal = async (withdrawalId: string) => {
    const { error } = await supabase.from("withdrawals").update({ status: "rejected" }).eq("id", withdrawalId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Withdrawal rejected");
    fetchAllData();
  };

  const addBalance = async () => {
    if (!selectedUserId || !balanceAmount) return;
    const amount = parseFloat(balanceAmount);
    const { data: userData } = await supabase.from("users").select("balance").eq("id", selectedUserId).single();
    if (userData) {
      const { error } = await supabase.from("users").update({ balance: userData.balance + amount }).eq("id", selectedUserId);
      if (error) {
        toast.error(error.message);
        return;
      }
    }
    toast.success(`Added ${amount} USDT to user balance`);
    setBalanceAmount("");
    setSelectedUserId("");
    fetchAllData();
  };

  const deductBalance = async () => {
    if (!selectedUserId || !balanceAmount) return;
    const amount = parseFloat(balanceAmount);
    const { data: userData } = await supabase.from("users").select("balance").eq("id", selectedUserId).single();
    if (userData) {
      const { error } = await supabase.from("users").update({ balance: Math.max(0, userData.balance - amount) }).eq("id", selectedUserId);
      if (error) {
        toast.error(error.message);
        return;
      }
    }
    toast.success(`Deducted ${amount} USDT from user balance`);
    setBalanceAmount("");
    setSelectedUserId("");
    fetchAllData();
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    if (status === "pending") return <Clock className="h-4 w-4 text-amber-400" />;
    if (status === "success") return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    return <XCircle className="h-4 w-4 text-red-400" />;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-amber-400" />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>

        {/* Stats Cards */}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="card-glow-green p-4 text-center">
            <ArrowDownLeft className="mx-auto h-6 w-6 text-emerald-400" />
            <p className="mt-2 text-2xl font-bold">{stats.totalDeposits.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Total Deposits (USDT)</p>
          </div>
          <div className="card-glow-green p-4 text-center">
            <ArrowUpRight className="mx-auto h-6 w-6 text-red-400" />
            <p className="mt-2 text-2xl font-bold">{stats.totalWithdrawals.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Total Withdrawals (USDT)</p>
          </div>
          <div className="card-glow-green p-4 text-center">
            <Users className="mx-auto h-6 w-6 text-blue-400" />
            <p className="mt-2 text-2xl font-bold">{stats.totalUsers}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </div>
          <div className="card-glow-green p-4 text-center">
            <Globe className="mx-auto h-6 w-6 text-purple-400" />
            <p className="mt-2 text-2xl font-bold">{stats.onlineNow}</p>
            <p className="text-xs text-muted-foreground">Online Now</p>
          </div>
        </div>

        {/* Balance Management */}
        <div className="mt-6 card-glass p-5">
          <h3 className="mb-3 font-semibold">Balance Management</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="User ID / UID"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="border-white/10 bg-white/5 focus-visible:ring-emerald-500"
            />
            <Input
              type="number"
              placeholder="Amount (USDT)"
              value={balanceAmount}
              onChange={(e) => setBalanceAmount(e.target.value)}
              className="border-white/10 bg-white/5 focus-visible:ring-emerald-500"
            />
            <div className="flex gap-2">
              <Button onClick={addBalance} className="flex-1 btn-glass">
                Add
              </Button>
              <Button onClick={deductBalance} variant="destructive" className="flex-1">
                Deduct
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-2">
          {(["users", "deposits", "withdrawals"] as const).map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              variant={activeTab === tab ? "default" : "outline"}
              className={`capitalize ${activeTab === tab ? "btn-glass" : "border-white/10"}`}
            >
              {tab}
              {tab === "deposits" && pendingDeposits.length > 0 && (
                <span className="ml-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs">{pendingDeposits.length}</span>
              )}
              {tab === "withdrawals" && pendingWithdrawals.length > 0 && (
                <span className="ml-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs">{pendingWithdrawals.length}</span>
              )}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="mt-8 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : (
          <div className="mt-4">
            {activeTab === "users" && (
              <>
                <div className="mb-4 flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or UID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-white/10 bg-white/5 focus-visible:ring-emerald-500"
                  />
                </div>
                <div className="space-y-3">
                  {filteredUsers.map((u) => (
                    <div key={u.id} className="card-glass p-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                          <p className="mt-1 font-mono text-xs">UID: {u.id.slice(0, 12).toUpperCase()}</p>
                          {u.wallet_address && (
                            <p className="mt-1 text-xs text-muted-foreground">Wallet: {u.wallet_address.slice(0, 20)}...</p>
                          )}
                          <p className="mt-1 font-bold text-emerald-400">Balance: {u.balance.toFixed(2)} USDT</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant={u.is_blocked ? "default" : "destructive"}
                            size="sm"
                            onClick={() => handleBlockUser(u.id, !u.is_blocked)}
                          >
                            <Ban className="mr-1 h-3 w-3" />
                            {u.is_blocked ? "Unblock" : "Block"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === "deposits" && (
              <div className="space-y-3">
                {pendingDeposits.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No pending deposits</p>
                ) : (
                  pendingDeposits.map((d) => (
                    <div key={d.id} className="card-glass p-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-medium">{d.user?.name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{d.user?.email}</p>
                          <p className="mt-1 text-lg font-bold text-emerald-400">{d.amount.toFixed(2)} USDT</p>
                          <p className="text-xs text-muted-foreground">TXID: {d.txid}</p>
                          <p className="text-xs text-muted-foreground">Address: {d.address}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="btn-glass"
                            onClick={() => handleApproveDeposit(d.id, d.user_id, d.amount)}
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectDeposit(d.id)}
                          >
                            <XCircle className="mr-1 h-3 w-3" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "withdrawals" && (
              <div className="space-y-3">
                {pendingWithdrawals.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No pending withdrawals</p>
                ) : (
                  pendingWithdrawals.map((w) => (
                    <div key={w.id} className="card-glass p-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-medium">{w.user?.name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{w.user?.email}</p>
                          <p className="mt-1 text-lg font-bold text-red-400">{w.amount.toFixed(2)} USDT</p>
                          <p className="text-xs text-muted-foreground">Address: {w.address}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="btn-glass"
                            onClick={() => handleApproveWithdrawal(w.id, w.user_id, w.amount)}
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectWithdrawal(w.id)}
                          >
                            <XCircle className="mr-1 h-3 w-3" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

