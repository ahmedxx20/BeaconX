import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";

export function useAdminNotifications() {
  const { user } = useAuth();
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.is_admin) return;

    const playSound = () => {
      try {
        const audio = new Audio("/notification.mp3");
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch {
        // Ignore audio errors
      }
    };

    const showBrowserNotification = (title: string, body: string) => {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body, icon: "/icon.png" });
      } else if ("Notification" in window && Notification.permission !== "denied") {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted") {
            new Notification(title, { body, icon: "/icon.png" });
          }
        });
      }
    };

    const handleNewRecord = (payload: { new: { id: string; amount: number; status: string } }, type: string) => {
      if (payload.new.status !== "pending") return;
      const key = `${type}-${payload.new.id}`;
      if (notifiedRef.current.has(key)) return;
      notifiedRef.current.add(key);

      playSound();
      showBrowserNotification(
        `New ${type} Request`,
        `Amount: ${payload.new.amount} USDT`
      );
      toast.info(`New ${type} request: ${payload.new.amount} USDT`, {
        duration: 5000,
      });
    };

    const depositChannel = supabase
      .channel("admin-deposits")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "deposits",
          filter: "status=eq.pending",
        },
        (payload) => handleNewRecord(payload as unknown as { new: { id: string; amount: number; status: string } }, "deposit")
      )
      .subscribe();

    const withdrawalChannel = supabase
      .channel("admin-withdrawals")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "withdrawals",
          filter: "status=eq.pending",
        },
        (payload) => handleNewRecord(payload as unknown as { new: { id: string; amount: number; status: string } }, "withdrawal")
      )
      .subscribe();

    return () => {
      supabase.removeChannel(depositChannel);
      supabase.removeChannel(withdrawalChannel);
    };
  }, [user?.is_admin]);
}
