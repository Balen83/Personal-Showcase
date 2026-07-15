import { Crown, ShieldCheck, BadgeCheck } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

export function RoleBadge({ role, className }: { role?: string; className?: string }) {
  const { t } = useLanguage();
  if (role === "super_admin") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40",
          className
        )}
      >
        <Crown className="w-3 h-3" />
        {t("badge.creator")}
      </span>
    );
  }
  if (role === "admin") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-slate-400/15 text-slate-300 border border-slate-400/30",
          className
        )}
      >
        <ShieldCheck className="w-3 h-3" />
        {t("badge.admin")}
      </span>
    );
  }
  return null;
}

export function VerifiedBadge({ className }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30",
        className
      )}
    >
      <BadgeCheck className="w-3 h-3" />
      {t("badge.verified")}
    </span>
  );
}
