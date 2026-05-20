import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="mt-auto w-full border-t border-white/10 bg-background/80 py-8 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <h3 className="text-xl font-bold text-foreground">BeaconX</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Automated, secure investing powered by decentralized AI
        </p>
        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <button
            onClick={() => navigate("/about")}
            className="text-emerald-400 hover:text-emerald-300"
          >
            About Us
          </button>
          <span className="text-muted-foreground">|</span>
          <button
            onClick={() => navigate("/terms")}
            className="text-emerald-400 hover:text-emerald-300"
          >
            Terms & Privacy
          </button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          © 2026 BeaconX. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

