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
let chatMaximized = false;

export function isMobileViewport() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(TAWK_MOBILE_QUERY).matches
  );
}

/**
 * The mobile tab bar replaces Tawk's floating bubble on authenticated pages.
 * Auth screens do not render the tab bar, so they keep the bubble.
 */
export function syncTawkVisibility() {
  const api = window.Tawk_API;
  if (!api) return;

  if (isMobileViewport() && mobileBubbleSuppressed && !chatMaximized) {
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
 * Used from Tawk's onBeforeLoad to avoid a one-frame flash of the bubble on
 * authenticated mobile screens before onLoad runs.
 */
export function prepareTawkOnMobile() {
  if (isMobileViewport() && mobileBubbleSuppressed) {
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
