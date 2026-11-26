import { Link } from "react-router-dom";

export function Brand() {
  return (
    <Link
      to="/dashboard"
      translate="no"
      aria-label="TradeZanga × Infinite Shares dashboard"
      className="flex flex-col items-start gap-0.5"
    >
      <span className="text-[1.0625rem] font-extrabold leading-none tracking-tight text-primary">
        TradeZanga
      </span>
      <span className="text-[0.5625rem] font-semibold uppercase leading-none tracking-[0.18em] text-text-muted">
        Infinite Shares
      </span>
    </Link>
  );
}
