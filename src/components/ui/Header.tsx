import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Headphones, Shield, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Header() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div
          className="flex cursor-pointer items-center gap-2"
          onClick={() => navigate("/dashboard")}
        >
          <img src="/icon.png" alt="BeaconX" className="h-8 w-8 rounded-lg object-cover" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            BeaconX
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => {
              if (window.Tawk_API?.maximize) {
                window.Tawk_API.maximize();
              }
            }}
          >
            <Headphones className="h-5 w-5 text-emerald-400" />
          </Button>

          {user?.is_admin && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => navigate("/admin")}
            >
              <Shield className="h-5 w-5 text-amber-400" />
            </Button>
          )}

          {user && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <LogOut className="h-5 w-5 text-red-400" />
                </Button>
              </DialogTrigger>
              <DialogContent className="border-white/10 bg-card">
                <DialogHeader>
                  <DialogTitle>Confirm Logout</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to log out of BeaconX?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => {}}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await signOut();
                      navigate("/login");
                    }}
                  >
                    Logout
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </header>
  );
}

