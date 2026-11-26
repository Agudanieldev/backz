import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

const ALLOWED_TYPES: EmailOtpType[] = [
  "signup",
  "recovery",
  "invite",
  "magiclink",
  "email_change",
  "email",
];

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return value !== null && (ALLOWED_TYPES as string[]).includes(value);
}

export default function AuthConfirmPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const started = useRef(false);

  const tokenHash = params.get("token_hash");
  const type = params.get("type");
  const next = params.get("next") ?? "/dashboard";

  const [working, setWorking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function confirm() {
      if (!tokenHash || !isEmailOtpType(type)) {
        setWorking(false);
        setError("This confirmation link is invalid or incomplete.");
        return;
      }

      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });

      if (verifyError) {
        setWorking(false);
        setError(verifyError.message);
        return;
      }

      const safeNext =
        next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
      navigate(safeNext, { replace: true });
    }

    void confirm();
  }, [tokenHash, type, next, navigate]);

  return (
    <AuthLayout
      title={error ? "Link problem" : "Confirming your link"}
      subtitle={
        error ? undefined : "Please wait while we verify your link."
      }
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
      {working ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-text-tertiary">Verifying your link…</p>
        </div>
      ) : error ? (
        <div className="space-y-3">
          <Alert variant="error">{error}</Alert>
          <Button
            fullWidth
            onClick={() => navigate("/login", { replace: true })}
          >
            Go to sign in
          </Button>
          <p className="text-center text-[0.6875rem] text-text-tertiary">
            <Link
              to="/forgot-password"
              className="font-semibold text-primary-ink hover:underline"
            >
              Request a new password link
            </Link>
          </p>
        </div>
      ) : null}
    </AuthLayout>
  );
}
