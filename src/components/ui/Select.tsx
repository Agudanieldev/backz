import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  containerClassName?: string;
  className?: string;
  ariaLabel?: string;
  leftIcon?: ReactNode;
  /** Exempt the trigger and menu from Google Translate. */
  notranslate?: boolean;
  /** Optional minimum width for the dropdown menu (the trigger can stay compact). */
  menuMinWidth?: number;
}

interface MenuPosition {
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
}

/**
 * Custom select built on a trigger button + portalled listbox.
 * Avoids native OS menus and keeps the same look across browsers.
 */
export function Select({
  options,
  value,
  onChange,
  label,
  hint,
  error,
  placeholder = "Select an option",
  disabled = false,
  size = "md",
  containerClassName,
  className,
  ariaLabel,
  leftIcon,
  notranslate = false,
  menuMinWidth,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const baseId = useId();
  const listId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  function openMenu() {
    if (disabled) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }

  function closeMenu() {
    setOpen(false);
    setActiveIndex(-1);
  }

  function choose(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    closeMenu();
    triggerRef.current?.focus();
  }

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const gap = 6;
      const viewportHeight = window.innerHeight;
      const below = viewportHeight - rect.bottom - gap;
      const above = rect.top - gap;
      const placeBelow = below >= 160 || below >= above;
      const menuWidth = Math.max(rect.width, menuMinWidth ?? rect.width);
      const left = Math.max(
        8,
        Math.min(rect.left, window.innerWidth - menuWidth - 8),
      );

      setPosition({
        left,
        width: menuWidth,
        maxHeight: Math.max(120, Math.min(260, placeBelow ? below : above)),
        ...(placeBelow
          ? { top: rect.bottom + gap }
          : { bottom: viewportHeight - rect.top + gap }),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, menuMinWidth]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Close only the menu, not an enclosing modal dialog.
      event.stopPropagation();
      closeMenu();
      triggerRef.current?.focus();
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [open]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    document
      .getElementById(optionId(activeIndex))
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, baseId]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (!open) {
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        openMenu();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        Math.min(options.length - 1, Math.max(0, index) + 1),
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(0, index - 1));
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0) choose(activeIndex);
    } else if (event.key === "Tab") {
      closeMenu();
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5",
        notranslate && "notranslate",
        containerClassName,
      )}
      translate={notranslate ? "no" : undefined}
    >
      {label && (
        <label
          htmlFor={baseId}
          className="text-[0.6875rem] font-semibold text-text-secondary"
        >
          {label}
        </label>
      )}

      <button
        ref={triggerRef}
        id={baseId}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={
          open && activeIndex >= 0 ? optionId(activeIndex) : undefined
        }
        aria-label={ariaLabel ?? label}
        aria-invalid={error ? true : undefined}
        disabled={disabled}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between gap-2 rounded-[6px] border bg-field text-left font-auth transition-colors duration-150",
          size === "sm" ? "h-8 px-2.5 text-[0.6875rem]" : "h-10 px-3 text-xs",
          open
            ? "border-border-strong bg-surface"
            : error
              ? "border-red-400"
              : "border-border",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        {leftIcon && (
          <span
            aria-hidden="true"
            className="shrink-0 text-text-muted"
          >
            {leftIcon}
          </span>
        )}
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            selected ? "text-text-primary" : "text-text-muted",
          )}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-text-muted transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {error ? (
        <p className="text-[0.625rem] leading-relaxed text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-[0.625rem] leading-relaxed text-text-muted">{hint}</p>
      ) : null}

      {open &&
        position &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[60]"
              onMouseDown={(event) => {
                event.preventDefault();
                closeMenu();
              }}
            />
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-label={ariaLabel ?? label}
              className={cn(
                "da-fade-in fixed z-[70] overflow-y-auto overscroll-contain rounded-xl border border-border bg-surface p-1.5 font-auth shadow-lg",
                notranslate && "notranslate",
              )}
              translate={notranslate ? "no" : undefined}
              style={{
                left: position.left,
                width: position.width,
                top: position.top,
                bottom: position.bottom,
                maxHeight: position.maxHeight,
              }}
            >
              {options.map((option, index) => {
                const isSelected = index === selectedIndex;
                const isActive = index === activeIndex;

                return (
                  <li
                    key={`${option.value}-${index}`}
                    id={optionId(index)}
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      choose(index);
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors",
                      isSelected
                        ? "bg-primary-muted font-semibold text-primary-ink"
                        : isActive
                          ? "bg-surface-subtle text-text-primary"
                          : "text-text-secondary hover:bg-surface-subtle",
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                    )}
                  </li>
                );
              })}
            </ul>
          </>,
          document.body,
        )}
    </div>
  );
}
