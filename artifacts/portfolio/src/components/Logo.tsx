export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 4L36 30H4L20 4Z"
        stroke="#D4AF37"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="rgba(212,175,55,0.08)"
      />
      <path d="M20 4V30" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <path d="M12 30V22C12 18.5 15.5 16 20 16C24.5 16 28 18.5 28 22V30" stroke="#D4AF37" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="2" y1="34" x2="38" y2="34" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
