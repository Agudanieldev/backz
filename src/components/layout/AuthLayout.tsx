import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-surface-ink font-auth">
      {/* Legacy auth background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/login-pic.jpg')" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/25"
      />

      <div className="relative z-10 flex min-h-dvh flex-col justify-center px-4 py-10 sm:px-6 lg:items-start lg:px-[8vw]">
        <div className="mx-auto w-full max-w-sm lg:mx-0">
          <Link
            to="/login"
            translate="no"
            aria-label="TradeZanga × Infinite Shares"
            className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1"
          >
            <span className="font-auth-display text-lg font-extrabold tracking-tight text-primary">
              TradeZanga
            </span>
            <span className="text-xs font-medium text-white/40">×</span>
            <span className="text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-white/80">
              Infinite Shares
            </span>
          </Link>

          <div className="rounded-2xl border border-black/5 bg-surface/95 p-6 shadow-2xl backdrop-blur-md sm:p-7 dark:border-white/10">
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-auth-display text-lg font-bold tracking-tight text-text-primary">
                {title}
              </h1>
              <LanguageSwitcher className="w-[9.5rem] shrink-0" />
            </div>
            {subtitle && (
              <p className="mt-1 text-xs leading-relaxed text-text-tertiary">
                {subtitle}
              </p>
            )}

            <div className="mt-5">{children}</div>

            {footer && (
              <div className="mt-5 border-t border-border-faint pt-4 text-center text-[0.6875rem] leading-relaxed text-text-tertiary">
                {footer}
              </div>
            )}
          </div>

          <p className="mt-5 text-[0.625rem] text-white/60">
            Secure access · © {new Date().getFullYear()}{" "}
            <span translate="no">TradeZanga × Infinite Shares</span>
          </p>
        </div>
      </div>
    </div>
  );
}
