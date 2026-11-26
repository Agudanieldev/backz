import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { appUrl } from "@/lib/appUrl";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setSubmitting(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: appUrl("/reset-password") },
    );

    setSubmitting(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSuccess(
      "If that email is registered, a password reset link is on its way.",
    );
  }

  return (
    <AuthLayout
      title="Forgot password"
      footer={
        <p>
          Remembered it?{" "}
          <Link to="/login" className="font-semibold text-primary-ink hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Input
          label="Email"
          type="email"
          icon={Mail}
          size="lg"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Send reset link
        </Button>
      </form>
    </AuthLayout>
  );
}
