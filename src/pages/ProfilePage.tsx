import { useEffect, useState, type FormEvent } from "react";
import { LogOut, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/cn";
import { formatDate, fullName, initials } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { appUrl } from "@/lib/appUrl";
import { PageHeader } from "@/components/composite/PageHeader";
import { InstallAppCard } from "@/components/composite/InstallAppCard";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const THEMES = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
] as const;

type Notice = { variant: "success" | "error"; message: string } | null;

export default function ProfilePage() {
  const { profile, session, signOut, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const email = session?.user.email ?? profile?.email ?? "";
  const pendingEmail = session?.user.new_email;
  const name = fullName(profile ?? { email });

  const [firstName, setFirstName] = useState(profile?.firstname ?? "");
  const [lastName, setLastName] = useState(profile?.lastname ?? "");
  const [nameNotice, setNameNotice] = useState<Notice>(null);
  const [nameSaving, setNameSaving] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailNotice, setEmailNotice] = useState<Notice>(null);
  const [emailSaving, setEmailSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordNotice, setPasswordNotice] = useState<Notice>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstname ?? "");
    setLastName(profile.lastname ?? "");
  }, [profile]);

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  async function verifyPassword(password: string) {
    const { data } = await supabase.auth.getUser();
    const currentEmail = data.user?.email ?? email;

    const { error } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password,
    });
    return error;
  }

  async function handleNameSubmit(event: FormEvent) {
    event.preventDefault();
    setNameNotice(null);

    const first = firstName.trim();
    const last = lastName.trim();

    if (!first || !last) {
      setNameNotice({
        variant: "error",
        message: "First and last name are required.",
      });
      return;
    }

    setNameSaving(true);
    const { error } = await supabase.rpc("update_my_profile", {
      p_firstname: first,
      p_lastname: last,
    });
    setNameSaving(false);

    if (error) {
      setNameNotice({ variant: "error", message: error.message });
      return;
    }

    await refreshProfile();
    setNameNotice({ variant: "success", message: "Your name has been updated." });
  }

  async function handleEmailSubmit(event: FormEvent) {
    event.preventDefault();
    setEmailNotice(null);

    const nextEmail = newEmail.trim();

    if (!nextEmail) {
      setEmailNotice({
        variant: "error",
        message: "Enter the email address you want to use.",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      setEmailNotice({
        variant: "error",
        message: "Enter a valid email address.",
      });
      return;
    }

    if (nextEmail.toLowerCase() === email.toLowerCase()) {
      setEmailNotice({
        variant: "error",
        message: "That is already your email address.",
      });
      return;
    }

    if (!emailPassword) {
      setEmailNotice({
        variant: "error",
        message: "Enter your current password to change your email.",
      });
      return;
    }

    setEmailSaving(true);
    const authError = await verifyPassword(emailPassword);

    if (authError) {
      setEmailSaving(false);
      setEmailNotice({
        variant: "error",
        message: /invalid login credentials/i.test(authError.message)
          ? "Current password is incorrect."
          : authError.message,
      });
      return;
    }

    const { data, error } = await supabase.auth.updateUser(
      { email: nextEmail },
      { emailRedirectTo: appUrl("/profile") },
    );
    setEmailSaving(false);

    if (error) {
      setEmailNotice({ variant: "error", message: error.message });
      return;
    }

    setNewEmail("");
    setEmailPassword("");

    if (data.user?.email?.toLowerCase() === nextEmail.toLowerCase()) {
      await refreshProfile();
      setEmailNotice({
        variant: "success",
        message: "Your email has been updated.",
      });
      return;
    }

    setEmailNotice({
      variant: "success",
      message:
        "Confirmation link sent. Your email will change after you confirm it.",
    });
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    setPasswordNotice(null);

    if (!currentPassword) {
      setPasswordNotice({
        variant: "error",
        message: "Enter your current password.",
      });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordNotice({
        variant: "error",
        message: "New password must be at least 6 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordNotice({
        variant: "error",
        message: "New passwords do not match.",
      });
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordNotice({
        variant: "error",
        message: "Choose a password different from your current one.",
      });
      return;
    }

    setPasswordSaving(true);
    const authError = await verifyPassword(currentPassword);

    if (authError) {
      setPasswordSaving(false);
      setPasswordNotice({
        variant: "error",
        message: /invalid login credentials/i.test(authError.message)
          ? "Current password is incorrect."
          : authError.message,
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);

    if (error) {
      setPasswordNotice({ variant: "error", message: error.message });
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordNotice({
      variant: "success",
      message: "Your password has been updated.",
    });
  }

  return (
    <>
      <PageHeader
        title="Profile"
        description="Manage your personal details, email address, and password."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-muted text-lg font-bold text-primary-ink">
              {initials(name)}
            </span>
            <div className="min-w-0" translate="no">
              <p className="truncate text-base font-bold tracking-tight text-text-primary">
                {name}
              </p>
              <p className="truncate text-xs text-text-tertiary">{email}</p>
              {profile?.created_at && (
                <p className="mt-1 text-[0.625rem] text-text-muted">
                  Joined {formatDate(profile.created_at)}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-bold tracking-tight text-text-primary">
            Appearance
          </h2>
          <p className="mt-1 text-[0.6875rem] text-text-tertiary">
            Choose how the app looks.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {THEMES.map((option) => {
              const Icon = option.icon;
              const active = theme === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTheme(option.id)}
                  aria-pressed={active}
                  className={cn(
                    "flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors",
                    active
                      ? "border-action bg-action text-action-foreground"
                      : "border-border bg-surface text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      <InstallAppCard className="mt-4" />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-bold tracking-tight text-text-primary">
            Personal details
          </h2>
          <p className="mt-1 text-[0.6875rem] text-text-tertiary">
            Update the name shown on your account.
          </p>

          <form onSubmit={handleNameSubmit} className="mt-4 space-y-3">
            {nameNotice && (
              <Alert variant={nameNotice.variant}>{nameNotice.message}</Alert>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                autoComplete="given-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
              />
              <Input
                label="Last name"
                autoComplete="family-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
              />
            </div>

            <Button type="submit" loading={nameSaving}>
              Save changes
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-bold tracking-tight text-text-primary">
            Email address
          </h2>
          <p className="mt-1 text-[0.6875rem] text-text-tertiary">
            We will send a confirmation link before changing your email.
          </p>
          <p className="mt-2 break-all text-[0.6875rem] text-text-muted">
            Current email:{" "}
            <span className="font-medium text-text-secondary">{email || "—"}</span>
          </p>
          {pendingEmail && (
            <p className="mt-1 break-all text-[0.6875rem] text-amber-700">
              Pending confirmation:{" "}
              <span className="font-medium">{pendingEmail}</span>
            </p>
          )}

          <form onSubmit={handleEmailSubmit} className="mt-3 space-y-3">
            {emailNotice && (
              <Alert variant={emailNotice.variant}>{emailNotice.message}</Alert>
            )}

            <Input
              label="New email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              required
            />

            <Input
              label="Current password"
              type="password"
              placeholder="Confirm your identity"
              autoComplete="current-password"
              hint="Required before we send the confirmation link."
              value={emailPassword}
              onChange={(event) => setEmailPassword(event.target.value)}
              required
            />

            <Button type="submit" loading={emailSaving}>
              Update email
            </Button>
          </form>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-bold tracking-tight text-text-primary">
            Change password
          </h2>
          <p className="mt-1 text-[0.6875rem] text-text-tertiary">
            Use at least 6 characters.
          </p>

          <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-3">
            {passwordNotice && (
              <Alert variant={passwordNotice.variant}>
                {passwordNotice.message}
              </Alert>
            )}

            <Input
              label="Current password"
              type="password"
              placeholder="Enter your current password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="New password"
                type="password"
                placeholder="At least 6 characters"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
              <Input
                label="Confirm new password"
                type="password"
                placeholder="Repeat new password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>

            <Button type="submit" loading={passwordSaving}>
              Update password
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-bold tracking-tight text-text-primary">
            Session
          </h2>
          <p className="mt-1 text-[0.6875rem] text-text-tertiary">
            Sign out of this device. You can sign back in any time.
          </p>
          <Button
            variant="danger"
            className="mt-3"
            onClick={() => void handleSignOut()}
            leftIcon={<LogOut className="h-4 w-4" />}
          >
            Log out
          </Button>
        </Card>
      </div>
    </>
  );
}
