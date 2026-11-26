import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { appUrl } from "@/lib/appUrl";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError("Please fill in every field.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (!terms) {
      setError("Please accept the terms to create an account.");
      return;
    }

    setSubmitting(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { firstname: firstName.trim(), lastname: lastName.trim() },
        emailRedirectTo: appUrl("/dashboard"),
      },
    });

    setSubmitting(false);

    if (signUpError) {
      setError(
        /rate limit/i.test(signUpError.message)
          ? "Signup emails are temporarily rate limited. Please try again in a few minutes."
          : signUpError.message,
      );
      return;
    }

    if (data.session) {
      navigate("/dashboard", { replace: true, state: { welcome: true } });
      return;
    }

    setSuccess(
      "Account created. Check your email to confirm it, then sign in.",
    );
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirm("");
    setTerms(false);
  }

  return (
    <AuthLayout
      title="Create your account"
      footer={
        <p>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary-ink hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            size="lg"
            placeholder="Tayo"
            autoComplete="given-name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            required
          />
          <Input
            label="Last name"
            size="lg"
            placeholder="Adeyemi"
            autoComplete="family-name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            required
          />
        </div>

        <Input
          label="Email"
          type="email"
          size="lg"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <Input
          label="Password"
          type="password"
          size="lg"
          placeholder="At least 6 characters"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <Input
          label="Confirm password"
          type="password"
          size="lg"
          placeholder="Repeat your password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          required
        />

        <label className="flex cursor-pointer items-start gap-2 text-[0.6875rem] leading-relaxed text-text-tertiary">
          <input
            type="checkbox"
            checked={terms}
            onChange={(event) => setTerms(event.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-primary"
            required
          />
          <span>
            By creating an account, you agree to our{" "}
            <span className="font-semibold text-primary-ink">
              Terms &amp; Privacy
            </span>
            .
          </span>
        </label>

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
