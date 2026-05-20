import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { supabase } from "@/lib/supabase";
import { Receipt, ArrowDownLeft, ArrowUpRight, Users, Clock, CheckCircle2, XCircle } from "lucide-react";

type Transaction = {
  id: string;
  type: "deposit" | "withdrawal" | "referral";
  amount: number;
  status: "pending" | "success" | "rejected";
  created_at: string;
  txid?: string;
  reason?: string;
};

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) return;
      const { data: deposits } = await supabase
        .from("deposits")
        .select("id, amount, status, created_at, txid")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const { data: withdrawals } = await supabase
        .from("withdrawals")
        .select("id, amount, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const all: Transaction[] = [];
      deposits?.forEach((d) =>
        all.push({
          id: d.id,
          type: "deposit",
          amount: d.amount,
          status: d.status as "pending" | "success" | "rejected",
          created_at: d.created_at,
          txid: d.txid,
        })
      );
      withdrawals?.forEach((w) =>
        all.push({
          id: w.id,
          type: "withdrawal",
          amount: w.amount,
          status: w.status as "pending" | "success" | "rejected",
          created_at: w.created_at,
        })
      );

      all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTransactions(all);
      setLoading(false);
    };

    fetchTransactions();
  }, [user?.id]);

  const getStatusIcon = (status: string) => {
    if (status === "pending") return <Clock className="h-4 w-4 text-amber-400" />;
    if (status === "success") return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    return <XCircle className="h-4 w-4 text-red-400" />;
  };

  const getStatusColor = (status: string) => {
    if (status === "pending") return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    if (status === "success") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    return "text-red-400 bg-red-500/10 border-red-500/30";
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <BackButton />

        <div className="mt-6 flex items-center gap-3">
          <Receipt className="h-6 w-6 text-emerald-400" />
          <h1 className="text-2xl font-bold">Transactions</h1>
        </div>

        {loading ? (
          <div className="mt-8 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="mt-8 text-center text-muted-foreground">
            <Receipt className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4">No transactions yet</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {transactions.map((tx) => (
              <div
                key={`${tx.type}-${tx.id}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tx.type === "deposit" ? "bg-emerald-500/20" : tx.type === "withdrawal" ? "bg-red-500/20" : "bg-purple-500/20"}`}>
                    {tx.type === "deposit" ? (
                      <ArrowDownLeft className="h-5 w-5 text-emerald-400" />
                    ) : tx.type === "withdrawal" ? (
                      <ArrowUpRight className="h-5 w-5 text-red-400" />
                    ) : (
                      <Users className="h-5 w-5 text-purple-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{tx.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                    {tx.txid && (
                      <p className="mt-1 max-w-[150px] truncate text-xs text-muted-foreground">
                        TXID: {tx.txid}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.type === "withdrawal" ? "text-red-400" : "text-emerald-400"}`}>
                    {tx.type === "withdrawal" ? "-" : "+"}{tx.amount.toFixed(2)} USDT
                  </p>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${getStatusColor(tx.status)}`}>
                    {getStatusIcon(tx.status)}
                    <span className="capitalize">{tx.status}</span>
                  </span>
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

