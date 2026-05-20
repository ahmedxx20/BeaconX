import { useEffect } from "react";

declare global {
  interface Window {
    Tawk_API: {
      maximize?: () => void;
      minimize?: () => void;
      toggle?: () => void;
      [key: string]: unknown;
    };
    Tawk_LoadStart: Date;
  }
}

export function useTawkTo() {
  useEffect(() => {
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = "https://embed.tawk.to/69eca1efb5e2bb1c2e1f8923/default";
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");

    const s0 = document.getElementsByTagName("script")[0];
    s0?.parentNode?.insertBefore(s1, s0);

    return () => {
      s1.remove();
    };
  }, []);
}

