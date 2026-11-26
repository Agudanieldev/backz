import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 text-center">
      <p className="text-5xl font-extrabold tracking-tight text-primary">404</p>
      <h1 className="mt-2 text-sm font-bold text-text-primary">
        Page not found
      </h1>
      <p className="mt-1 text-xs text-text-tertiary">
        That page doesn&apos;t exist or has moved.
      </p>
      <Link
        to="/"
        className="mt-5 inline-flex h-10 items-center rounded-lg bg-action px-4 text-[0.8125rem] font-semibold text-action-foreground transition-colors hover:bg-action-hover"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
