import { forwardRef, useId, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: LucideIcon;
  containerClassName?: string;
  size?: "md" | "lg";
}

const inputSizes: Record<"md" | "lg", string> = {
  md: "h-10 text-xs",
  lg: "h-[52px] text-[14px]",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      hint,
      error,
      icon: Icon,
      containerClassName,
      className,
      id,
      type = "text",
      required,
      size = "md",
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const resolvedType = isPassword && showPassword ? "text" : type;

    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-[0.6875rem] font-semibold text-text-secondary"
          >
            {label}
            {required && <span className="text-red-500"> *</span>}
          </label>
        )}

        <div
          className={cn(
            "relative flex items-center rounded-[6px] border bg-field transition-colors duration-150",
            "focus-within:bg-surface",
            error
              ? "border-red-400"
              : "border-border focus-within:border-border-strong",
          )}
        >
          {Icon && (
            <span className="flex shrink-0 items-center pl-3 text-text-muted">
              <Icon className="h-4 w-4" />
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            required={required}
            aria-invalid={Boolean(error)}
            className={cn(
              "w-full min-w-0 bg-transparent px-3 text-text-primary outline-none placeholder:text-text-muted",
              inputSizes[size],
              "disabled:cursor-not-allowed disabled:opacity-50",
              Icon && "pl-2",
              isPassword && "pr-10",
              className,
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 flex cursor-pointer items-center text-text-muted transition-colors hover:text-text-secondary"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {error ? (
          <p className="text-[0.625rem] leading-relaxed text-red-600">{error}</p>
        ) : hint ? (
          <p className="text-[0.625rem] leading-relaxed text-text-muted">{hint}</p>
        ) : null}
      </div>
    );
  },
);
