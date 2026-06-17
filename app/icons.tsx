export function ChevronDown({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M6 8l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Plus({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M10 4v12M4 10h12"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Close({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M6 6l8 8M14 6l-8 8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M10 2.5l1.6 4.3 4.4 1.7-4.4 1.7L10 14.5 8.4 10.2 4 8.5l4.4-1.7L10 2.5z"
        fill="currentColor"
      />
      <path d="M4.5 13.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z" fill="currentColor" />
    </svg>
  );
}

export function Desktop({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 15 15" fill="none" className={className} aria-hidden>
      <rect x="1.5" y="2.5" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1" />
      <path d="M5.5 13h4M7.5 10.5V13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function Mobile({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 15 15" fill="none" className={className} aria-hidden>
      <rect x="4" y="1.5" width="7" height="12" rx="1.2" stroke="currentColor" strokeWidth="1" />
      <path d="M6.5 11.5h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function Back({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 15 15" fill="none" className={className} aria-hidden>
      <path
        d="M9 3.5L5 7.5l4 4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Grid({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      {[2, 8, 14].map((y) =>
        [2, 8, 14].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="3.2" height="3.2" rx="0.6" />),
      )}
    </svg>
  );
}

export function Search({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13.5 13.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M5 10.5l3.2 3.2L15 6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Menu({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M4 6h12M4 10h12M4 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
