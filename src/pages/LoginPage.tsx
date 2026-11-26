import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { FullScreenLoader } from "@/components/layout/guards";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "Invalid email or password.",
  "Email not confirmed":
    "Please confirm your email address before signing in.",
  "Too many requests": "Too many attempts. Please try again later.",
};

export default function LoginPage() {
  const { session, profile, loading, profileLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const flash = (location.state as { message?: string } | null)?.message;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading || profileLoading || !session || submitting) return;
    navigate(profile?.role === "admin" ? "/admin" : "/dashboard", {
      replace: true,
    });
  }, [session, profile, loading, profileLoading, submitting, navigate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email: email.trim(),
        password,
      },
    );

    if (signInError) {
      setError(ERROR_MESSAGES[signInError.message] ?? signInError.message);
      setSubmitting(false);
      return;
    }

    const { data: userProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const isAdmin = userProfile?.role === "admin";
    navigate(isAdmin ? "/admin" : "/dashboard", {
      replace: true,
      state: isAdmin ? null : { welcome: true },
    });
  }

  if (loading) return <FullScreenLoader />;

  return (
    <AuthLayout
      title="Welcome back"
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-primary-ink hover:underline"
          >
            Create one
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {flash && <Alert variant="success">{flash}</Alert>}
        {error && <Alert variant="error">{error}</Alert>}

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
          placeholder="Enter your password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-[0.6875rem] font-semibold text-primary-ink hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
