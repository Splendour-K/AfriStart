import { CheckCircle2 } from "lucide-react";
import { cn, isVerifiedSchoolEmail } from "@/lib/utils";

interface VerifiedBadgeProps {
  email?: string | null;
  label?: string;
  compact?: boolean;
  className?: string;
}

export const VerifiedBadge = ({
  email,
  label = "Verified Student",
  compact = false,
  className,
}: VerifiedBadgeProps) => {
  if (!isVerifiedSchoolEmail(email)) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-sky-200 bg-sky-50 text-sky-700",
        compact ? "px-1.5 py-0.5 text-[11px] gap-1" : "px-2.5 py-0.5 text-xs gap-1.5",
        className
      )}
    >
      <CheckCircle2 className={cn("text-sky-600", compact ? "w-3 h-3" : "w-3.5 h-3.5")} />
      {!compact && <span>{label}</span>}
    </span>
  );
};
