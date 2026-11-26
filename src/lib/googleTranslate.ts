import {
  GOOGLE_TRANSLATE_LANGUAGES,
  normalizeLanguage,
  writeGoogtransCookie,
} from "./language";

const SCRIPT_ID = "google-translate-script";
const CONTAINER_ID = "google_translate_element";
const DOM_GUARD_FLAG = "__tzGoogleTranslateGuard";

type TranslateElementConstructor = new (
  options: Record<string, unknown>,
  elementId: string,
) => unknown;

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement?: TranslateElementConstructor;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

let pendingCallbacks: Array<() => void> = [];

/**
 * Google Translate replaces text nodes with <font> elements. React still holds
 * references to the original nodes, so a later commit can throw NotFoundError
 * and unmount the app. Remove/insert from the node's real parent instead.
 * This is the workaround suggested by the React team for issue #11538.
 */
function installDomGuard() {
  if (typeof Node === "undefined") return;

  const prototype = Node.prototype as typeof Node.prototype & {
    [DOM_GUARD_FLAG]?: boolean;
  };
  if (prototype[DOM_GUARD_FLAG]) return;
  prototype[DOM_GUARD_FLAG] = true;

  const originalRemoveChild = prototype.removeChild;
  prototype.removeChild = function (this: Node, child: Node): Node {
    try {
      return originalRemoveChild.call(this, child);
    } catch (error) {
      if ((error as DOMException)?.name !== "NotFoundError") throw error;

      const parent = child.parentNode;
      if (parent) {
        try {
          originalRemoveChild.call(parent, child);
        } catch {
          // The node was already detached; nothing left to remove.
        }
      }
      return child;
    }
  } as typeof prototype.removeChild;

  const originalInsertBefore = prototype.insertBefore;
  prototype.insertBefore = function (
    this: Node,
    newNode: Node,
    referenceNode: Node | null,
  ): Node {
    try {
      return originalInsertBefore.call(this, newNode, referenceNode);
    } catch (error) {
      if ((error as DOMException)?.name !== "NotFoundError") throw error;

      // Google Translate re-parented the reference node. Appending keeps the
      // commit from crashing the tree; translated text is re-rendered on the
      // next route change or reload.
      try {
        return this.appendChild(newNode);
      } catch {
        return newNode;
      }
    }
  } as typeof prototype.insertBefore;
}

function flushCallbacks() {
  const callbacks = pendingCallbacks;
  pendingCallbacks = [];
  for (const callback of callbacks) callback();
}

function whenGoogleTranslateReady(callback: () => void) {
  installDomGuard();

  if (window.google?.translate?.TranslateElement) {
    callback();
    return;
  }

  pendingCallbacks.push(callback);

  if (document.getElementById(SCRIPT_ID)) return;

  window.googleTranslateElementInit = flushCallbacks;

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.src =
    "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.addEventListener("error", () => {
    console.warn("Google Translate could not be loaded.");
  });
  document.head.appendChild(script);
}

function applyInitialComboLanguage(container: HTMLElement, language: string) {
  const target = normalizeLanguage(language);
  if (target === "en") return;

  let attempts = 0;
  const timer = window.setInterval(() => {
    const combo = container.querySelector<HTMLSelectElement>(
      "select.goog-te-combo",
    );

    if (combo) {
      window.clearInterval(timer);
      if (combo.value !== target) {
        combo.value = target;
        combo.dispatchEvent(new Event("change", { bubbles: true }));
      }
      return;
    }

    attempts += 1;
    if (attempts > 20) window.clearInterval(timer);
  }, 250);
}

function initGoogleTranslateWidget(language: string) {
  const container = document.getElementById(CONTAINER_ID);
  if (!container || container.dataset.initialized === "true") return;

  const TranslateElement = window.google?.translate?.TranslateElement;
  if (!TranslateElement) return;

  container.dataset.initialized = "true";

  try {
    new TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: GOOGLE_TRANSLATE_LANGUAGES,
        autoDisplay: false,
        layout: 1, // InlineLayout.SIMPLE
      },
      CONTAINER_ID,
    );
  } catch (error) {
    delete container.dataset.initialized;
    console.warn("Google Translate could not be initialised.", error);
    return;
  }

  // If the element did not pick the persisted language up from the cookie,
  // select it explicitly once the combo has rendered.
  applyInitialComboLanguage(container, language);
}

export function requestGoogleTranslateLanguage(language: string) {
  writeGoogtransCookie(language);

  // Reload so every route is translated consistently instead of relying on
  // the element's dynamic re-scan timing.
  window.location.reload();
}

export function initGoogleTranslate(language: string) {
  // The cookie must exist before the element script initialises.
  writeGoogtransCookie(language);
  whenGoogleTranslateReady(() => initGoogleTranslateWidget(language));
}
