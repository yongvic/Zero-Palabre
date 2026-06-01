"use client";

import { useEffect, useState } from "react";
import { PWA_CONFIG } from "@/lib/pwa/config";
import { InstallBanner } from "@/components/pwa/install-banner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      ("standalone" in navigator &&
        (navigator as Navigator & { standalone?: boolean }).standalone);

    if (standalone) setInstalled(true);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register(PWA_CONFIG.swPath, { scope: PWA_CONFIG.scope })
        .catch((err) => console.warn("[PWA] SW registration failed:", err));
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  return (
    <>
      {children}
      {!installed && deferredPrompt && (
        <InstallBanner
          onInstall={async () => {
            await deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            setDeferredPrompt(null);
          }}
          onDismiss={() => setDeferredPrompt(null)}
        />
      )}
    </>
  );
}
