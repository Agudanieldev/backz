import { useEffect } from "react";
import {
  TAWK_MOBILE_QUERY,
  handleTawkChatMaximized,
  handleTawkChatMinimized,
  openSupportChat,
  prepareTawkOnMobile,
  syncTawkVisibility,
} from "@/lib/tawk";

const DEFAULT_EMBED_URL =
  "https://embed.tawk.to/683623d24a34301911ec75e0/1is9nnrs7";
const SCRIPT_ID = "tawk-widget-script";

/**
 * Loads the legacy Tawk.to property once for the whole session. The widget
 * lives outside the router, so navigating between dashboard pages keeps the
 * same chat thread open.
 *
 * On authenticated mobile screens the floating bubble is hidden and the
 * mobile tab bar's customer-care button opens the chat instead.
 */
export function TawkWidget() {
  useEffect(() => {
    const configured = import.meta.env.VITE_TAWK_EMBED_URL?.trim();
    if (configured === "off") return;

    const mobileQuery = window.matchMedia(TAWK_MOBILE_QUERY);
    const handleViewportChange = () => syncTawkVisibility();
    mobileQuery.addEventListener("change", handleViewportChange);

    if (!document.getElementById(SCRIPT_ID)) {
      const api = (window.Tawk_API = window.Tawk_API ?? {});

      // Keep the bubble above the mobile tab bar when it is visible on auth
      // screens; authenticated screens hide it entirely.
      api.customStyle = {
        visibility: {
          desktop: { position: "br", xOffset: 20, yOffset: 20 },
          mobile: { position: "br", xOffset: 12, yOffset: 78 },
        },
      };

      api.onBeforeLoad = prepareTawkOnMobile;
      api.onLoad = () => {
        syncTawkVisibility();

        if (window.__tzTawkOpenPending) {
          window.__tzTawkOpenPending = false;
          openSupportChat();
        }
      };
      api.onChatMaximized = handleTawkChatMaximized;
      api.onChatMinimized = handleTawkChatMinimized;

      window.Tawk_LoadStart = new Date();

      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.async = true;
      script.charset = "UTF-8";
      script.src = configured || DEFAULT_EMBED_URL;
      script.setAttribute("crossorigin", "*");
      script.addEventListener("error", () => {
        console.warn("Tawk.to chat could not be loaded.");
      });
      document.head.appendChild(script);
    } else {
      // StrictMode/HMR remount after the script has already been injected.
      syncTawkVisibility();
    }

    return () => {
      mobileQuery.removeEventListener("change", handleViewportChange);
    };
  }, []);

  return null;
}
