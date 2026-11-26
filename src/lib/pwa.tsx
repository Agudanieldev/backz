import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt: () => Promise<void>;
}

declare global {
  interface Window {
    __deferredPwaPrompt?: BeforeInstallPromptEvent | null;
  }
  interface WindowEventMap {
    "tz-pwa-prompt-ready": Event;
    "tz-pwa-installed": Event;
  }
}

interface PwaContextValue {
  installed: boolean;
  canInstall: boolean;
  isIos: boolean;
  dismissed: boolean;
  promptInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
  dismiss: () => void;
}

const PwaContext = createContext<PwaContextValue | null>(null);
const DISMISS_KEY = "tz-install-dismissed";
const DISMISS_DAYS = 14;

function isStandalone() {
  if (typeof window === "undefined") return false;

  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    nav.standalone === true
  );
}

function isIosDevice() {
  if (typeof navigator === "undefined") return false;

  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function readDismissed() {
  if (typeof window === "undefined") return false;

  try {
    const value = Number(window.localStorage.getItem(DISMISS_KEY));
    return (
      Number.isFinite(value) &&
      value > 0 &&
      Date.now() - value < DISMISS_DAYS * 24 * 60 * 60 * 1000
    );
  } catch {
    return false;
  }
}

export function PwaProvider({ children }: { children: ReactNode }) {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(
      () => window.__deferredPwaPrompt ?? null,
    );
  const [installed, setInstalled] = useState(isStandalone);
  const [dismissed, setDismissed] = useState(readDismissed);

  useEffect(() => {
    const handlePromptReady = () => {
      setPromptEvent(window.__deferredPwaPrompt ?? null);
    };
    const handleInstalled = () => {
      window.__deferredPwaPrompt = null;
      setPromptEvent(null);
      setInstalled(true);
    };
    const displayMode = window.matchMedia("(display-mode: standalone)");
    const handleDisplayMode = () => setInstalled(isStandalone());

    window.addEventListener("tz-pwa-prompt-ready", handlePromptReady);
    window.addEventListener("tz-pwa-installed", handleInstalled);
    window.addEventListener("appinstalled", handleInstalled);
    displayMode.addEventListener("change", handleDisplayMode);

    return () => {
      window.removeEventListener("tz-pwa-prompt-ready", handlePromptReady);
      window.removeEventListener("tz-pwa-installed", handleInstalled);
      window.removeEventListener("appinstalled", handleInstalled);
      displayMode.removeEventListener("change", handleDisplayMode);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    const event = promptEvent ?? window.__deferredPwaPrompt ?? null;
    if (!event) return "unavailable" as const;

    try {
      await event.prompt();
      const choice = await event.userChoice;

      window.__deferredPwaPrompt = null;
      setPromptEvent(null);

      if (choice.outcome === "dismissed") {
        try {
          window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
        } catch {
          // localStorage can be unavailable in private mode.
        }
        setDismissed(true);
      }

      return choice.outcome;
    } catch {
      return "unavailable" as const;
    }
  }, [promptEvent]);

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // localStorage can be unavailable in private mode.
    }
    setDismissed(true);
  }, []);

  const value = useMemo<PwaContextValue>(
    () => ({
      installed,
      canInstall: Boolean(promptEvent) && !installed,
      isIos: isIosDevice(),
      dismissed,
      promptInstall,
      dismiss,
    }),
    [installed, promptEvent, dismissed, promptInstall, dismiss],
  );

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}

export function usePwa() {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error("usePwa must be used inside <PwaProvider>");
  }
  return context;
}

export function registerServiceWorker() {
  if (!import.meta.env.PROD) return;
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  const register = () => {
    void navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("Service worker registration failed.", error);
    });
  };

  if (document.readyState === "complete") {
    register();
  } else {
    window.addEventListener("load", register, { once: true });
  }
}
