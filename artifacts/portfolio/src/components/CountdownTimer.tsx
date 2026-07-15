import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

export function CountdownTimer({ until, className }: { until: string; className?: string }) {
  const [remaining, setRemaining] = useState(() => new Date(until).getTime() - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(new Date(until).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [until]);

  if (remaining <= 0) return null;

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      className={className ?? "inline-flex items-center gap-1.5 text-xs font-medium text-[#D4AF37]"}
      dir="ltr"
    >
      <Flame className="w-3.5 h-3.5" />
      <span>
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </span>
    </div>
  );
}
