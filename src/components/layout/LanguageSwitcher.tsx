import { Globe2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { LANGUAGES } from "@/lib/language";
import { useLanguage } from "@/lib/languageProvider";
import { Select } from "@/components/ui/Select";

interface LanguageSwitcherProps {
  className?: string;
}

/**
 * Compact language picker shared by the auth screens, desktop sidebar and
 * mobile header. It drives the hidden Google Translate element and uses the
 * same custom dropdown as the rest of the dashboard.
 */
export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  const options = LANGUAGES.map((option) => ({
    value: option.code,
    label: option.label,
  }));

  return (
    <Select
      options={options}
      value={language}
      onChange={setLanguage}
      size="sm"
      ariaLabel="Language"
      leftIcon={<Globe2 className="h-3.5 w-3.5" />}
      notranslate
      menuMinWidth={220}
      containerClassName={cn("w-full", className)}
      className="hover:border-border-strong hover:bg-surface-subtle"
    />
  );
}
