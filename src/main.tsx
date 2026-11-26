import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "@/lib/theme";
import { LanguageProvider } from "@/lib/languageProvider";
import { PwaProvider, registerServiceWorker } from "@/lib/pwa";
import { GoogleTranslateWidget } from "@/components/integrations/GoogleTranslateWidget";
import { TawkWidget } from "@/components/integrations/TawkWidget";
import "./index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <PwaProvider>
          <App />
          <GoogleTranslateWidget />
          <TawkWidget />
        </PwaProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
);

registerServiceWorker();
