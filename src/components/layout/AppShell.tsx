import { useEffect } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { ChevronRight, Headset } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth";
import { fullName, initials } from "@/lib/format";
import { openSupportChat, setMobileBubbleSuppressed } from "@/lib/tawk";
import { InstallAppBanner } from "@/components/composite/InstallAppBanner";
import { NAV_ITEMS, NAV_SECTIONS } from "./nav";
import { Brand } from "./Brand";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function AppShell() {
  const { profile, session } = useAuth();
  const supportChatEnabled =
    import.meta.env.VITE_TAWK_EMBED_URL?.trim() !== "off";

  useEffect(() => {
    // The mobile tab bar owns chat access here, so hide Tawk's bubble only
    // while an authenticated shell is mounted. Auth screens hide it themselves.
    setMobileBubbleSuppressed(true);
    return () => setMobileBubbleSuppressed(false);
  }, []);

  const email = profile?.email ?? session?.user.email ?? "";
  const name = fullName(profile ?? { email });
  const isAdmin = profile?.role === "admin";
  const items = NAV_ITEMS.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.userOnly && isAdmin) return false;
    return true;
  });
  const mobileNavColumns = items.length + (supportChatEnabled ? 1 : 0);

  return (
    <div className="min-h-dvh bg-canvas-soft">
      {/* Centered dashboard shell (same approach as kove-main): the sidebar
          and content share one max-width band instead of hugging the viewport. */}
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl border-x border-border-soft bg-canvas shadow-xs">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 z-40 hidden h-dvh w-60 shrink-0 flex-col border-r border-border-soft bg-surface md:flex">
          <div className="flex h-16 shrink-0 items-center border-b border-border-faint px-5">
            <Brand />
          </div>

          <nav className="flex-1 space-y-5 overflow-y-auto p-3">
            {NAV_SECTIONS.map((section) => {
              const sectionItems = items.filter(
                (item) => item.section === section,
              );
              if (!sectionItems.length) return null;

              return (
                <div key={section} className="space-y-0.5">
                  <p className="px-3 pb-1 text-[0.625rem] font-semibold uppercase tracking-wider text-text-muted">
                    {section}
                  </p>
                  {sectionItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === "/admin"}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-[0.8125rem] transition-colors",
                          isActive
                            ? "bg-primary-muted font-semibold text-primary-ink"
                            : "font-medium text-text-secondary hover:bg-notice hover:text-text-primary",
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              );
            })}
          </nav>

          <div className="shrink-0 border-t border-border-faint p-3">
            <InstallAppBanner variant="sidebar" className="mb-2" />
            <LanguageSwitcher className="mb-2" />
            <Link
              to="/profile"
              translate="no"
              className="flex items-center gap-2.5 rounded-xl border border-border-soft bg-notice p-3 transition-colors hover:border-border-strong"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-muted text-[0.625rem] font-bold text-primary-ink">
                {initials(name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-text-primary">
                  {name}
                </span>
                <span className="block truncate text-[0.625rem] text-text-muted">
                  {email}
                </span>
              </span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-muted" />
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Mobile header */}
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border-soft bg-surface px-4 md:hidden">
            <Brand />
            <LanguageSwitcher className="ml-auto w-[9.5rem] shrink-0" />
          </header>

          <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-5 sm:px-6 md:pb-10 md:pt-8 lg:px-8">
            <div className="md:hidden">
              <InstallAppBanner />
            </div>
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border-soft bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div
          className="mx-auto grid max-w-md"
          style={{
            gridTemplateColumns: `repeat(${mobileNavColumns}, minmax(0, 1fr))`,
          }}
        >
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              aria-label={item.label}
              title={item.label}
              className="flex items-center justify-center py-2.5"
            >
              {({ isActive }) => (
                <span
                  className={cn(
                    "flex h-11 w-12 items-center justify-center rounded-xl transition-colors",
                    isActive
                      ? "bg-primary-muted text-primary-ink"
                      : "text-text-muted",
                  )}
                >
                  <item.icon className="h-6 w-6" />
                </span>
              )}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={openSupportChat}
            aria-label="Customer care"
            title="Customer care"
            className={cn(
              "flex items-center justify-center py-2.5",
              !supportChatEnabled && "hidden",
            )}
          >
            <span className="flex h-11 w-12 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-surface-subtle hover:text-primary-ink">
              <Headset className="h-6 w-6" />
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
