export const TAWK_MOBILE_QUERY = "(max-width: 767px)";

export interface TawkApi {
  customStyle?: {
    visibility?: {
      desktop?: {
        position?: string;
        xOffset?: number | string;
        yOffset?: number | string;
      };
      mobile?: {
        position?: string;
        xOffset?: number | string;
        yOffset?: number | string;
      };
    };
    zIndex?: number | string;
  };
  maximize?: () => void;
  minimize?: () => void;
  showWidget?: () => void;
  hideWidget?: () => void;
  onLoad?: () => void;
  onBeforeLoad?: () => void;
  onChatMaximized?: () => void;
  onChatMinimized?: () => void;
  onChatHidden?: () => void;
}

declare global {
  interface Window {
    Tawk_API?: TawkApi;
    Tawk_LoadStart?: Date;
    __tzTawkOpenPending?: boolean;
  }
}

let mobileBubbleSuppressed = false;
let authPageActive = false;
let chatMaximized = false;

export function isMobileViewport() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(TAWK_MOBILE_QUERY).matches
  );
}

/**
 * The chat widget is never shown on auth screens. On authenticated mobile
 * pages the tab bar replaces Tawk's floating bubble instead.
 */
export function syncTawkVisibility() {
  const api = window.Tawk_API;
  if (!api) return;

  if (
    authPageActive ||
    (isMobileViewport() && mobileBubbleSuppressed && !chatMaximized)
  ) {
    api.hideWidget?.();
  } else {
    api.showWidget?.();
  }
}

export function setMobileBubbleSuppressed(suppressed: boolean) {
  mobileBubbleSuppressed = suppressed;
  syncTawkVisibility();
}

/**
 * Auth screens call this while they are mounted so the widget stays hidden
 * even if the Tawk script has already loaded.
 */
export function setChatSuppressed(suppressed: boolean) {
  authPageActive = suppressed;
  syncTawkVisibility();
}

/**
 * Used from Tawk's onBeforeLoad to avoid a one-frame flash of the bubble on
 * auth screens and authenticated mobile screens before onLoad runs.
 */
export function prepareTawkOnMobile() {
  if (authPageActive || (isMobileViewport() && mobileBubbleSuppressed)) {
    window.Tawk_API?.hideWidget?.();
  }
}

export function openSupportChat() {
  const api = window.Tawk_API;

  if (!api?.maximize) {
    // Tawk may still be loading; the widget's onLoad handler opens it then.
    window.__tzTawkOpenPending = true;
    return;
  }

  api.showWidget?.();
  api.maximize();
}

export function handleTawkChatMaximized() {
  chatMaximized = true;
}

export function handleTawkChatMinimized() {
  chatMaximized = false;

  if (isMobileViewport() && mobileBubbleSuppressed) {
    window.Tawk_API?.hideWidget?.();
  }
}
