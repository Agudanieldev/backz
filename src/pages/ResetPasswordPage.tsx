import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function prepare() {
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code).catch(() => null);
      }

      const { data } = await supabase.auth.getSession();
      if (!active) return;

      setHasSession(Boolean(data.session));
      setChecking(false);
    }

    void prepare();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await supabase.auth.signOut();
    navigate("/login", {
      replace: true,
      state: { message: "Password updated. Sign in with your new password." },
    });
  }

  return (
    <AuthLayout
      title="Set a new password"
      footer={
        <p>
          <Link
            to="/login"
            className="font-semibold text-primary-ink hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      }
    >
      {checking ? (
        <div className="flex items-center justify-center py-8 text-text-muted">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : !hasSession ? (
        <div className="space-y-3.5">
          <Alert variant="info">
            Open the password reset link from your email first.
          </Alert>
          <Link
            to="/forgot-password"
            className="block text-center text-[0.6875rem] font-semibold text-primary-ink hover:underline"
          >
            Request a new reset link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && <Alert variant="error">{error}</Alert>}

          <Input
            label="New password"
            type="password"
            size="lg"
            placeholder="At least 6 characters"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <Input
            label="Confirm new password"
            type="password"
            size="lg"
            placeholder="Repeat your new password"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            required
          />

          <Button type="submit" size="lg" fullWidth loading={submitting}>
            Update password
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
