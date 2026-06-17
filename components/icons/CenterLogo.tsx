export default function CenterLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="hexGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="60%" stopColor="#3730a3" />
          <stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>
        <linearGradient id="bulbGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id="bookGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Hexagon base */}
      <path d="M32 3 L57 17.5 L57 46.5 L32 61 L7 46.5 L7 17.5 Z" fill="url(#hexGrad)" />

      {/* Inner hex ring */}
      <path d="M32 9 L52 20.5 L52 43.5 L32 55 L12 43.5 L12 20.5 Z"
        fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="1" />

      {/* Corner dots */}
      <circle cx="32" cy="4" r="1.5" fill="#818cf8" opacity="0.5" />
      <circle cx="56" cy="18" r="1.5" fill="#818cf8" opacity="0.5" />
      <circle cx="56" cy="46" r="1.5" fill="#818cf8" opacity="0.5" />
      <circle cx="32" cy="60" r="1.5" fill="#818cf8" opacity="0.5" />
      <circle cx="8" cy="46" r="1.5" fill="#818cf8" opacity="0.5" />
      <circle cx="8" cy="18" r="1.5" fill="#818cf8" opacity="0.5" />

      {/* Open book - bottom */}
      {/* Left page */}
      <path d="M13 43 Q22 38 31 39 L31 52 Q22 51 13 54 Z" fill="url(#bookGrad)" opacity="0.92" />
      {/* Right page */}
      <path d="M51 43 Q42 38 33 39 L33 52 Q42 51 51 54 Z" fill="white" opacity="0.72" />
      {/* Book spine */}
      <rect x="30.5" y="38" width="3" height="15" rx="1.5" fill="#93c5fd" />
      {/* Book lines */}
      <line x1="16" y1="43" x2="29" y2="41" stroke="#bfdbfe" strokeWidth="0.8" opacity="0.6" />
      <line x1="16" y1="46" x2="29" y2="44.5" stroke="#bfdbfe" strokeWidth="0.8" opacity="0.5" />
      <line x1="48" y1="43" x2="35" y2="41" stroke="#e2e8f0" strokeWidth="0.8" opacity="0.5" />
      <line x1="48" y1="46" x2="35" y2="44.5" stroke="#e2e8f0" strokeWidth="0.8" opacity="0.4" />

      {/* Lightbulb body */}
      <circle cx="32" cy="24" r="11" fill="url(#bulbGrad)" filter="url(#glow)" />
      {/* Bulb highlight */}
      <circle cx="28" cy="20" r="3.5" fill="white" opacity="0.22" />
      {/* Bulb base */}
      <rect x="28" y="33" width="8" height="2.5" rx="1" fill="#b45309" />
      <rect x="29.5" y="36" width="5" height="1.5" rx="0.75" fill="#92400e" />

      {/* Rays */}
      <line x1="32" y1="10" x2="32" y2="7" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" filter="url(#glow)" />
      <line x1="40" y1="13" x2="42.5" y2="11" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" filter="url(#glow)" />
      <line x1="45" y1="22" x2="48" y2="22" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" filter="url(#glow)" />
      <line x1="24" y1="13" x2="21.5" y2="11" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" filter="url(#glow)" />
      <line x1="19" y1="22" x2="16" y2="22" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" filter="url(#glow)" />

      {/* Small stars */}
      <circle cx="14" cy="32" r="1.5" fill="#fbbf24" opacity="0.55" />
      <circle cx="50" cy="32" r="1.5" fill="#fbbf24" opacity="0.55" />
      <circle cx="43" cy="13" r="1" fill="#fde68a" opacity="0.7" />
      <circle cx="21" cy="13" r="1" fill="#fde68a" opacity="0.7" />

      {/* STEAM letters hint - tiny circuit dots at bottom */}
      <circle cx="22" cy="57" r="1" fill="#93c5fd" opacity="0.4" />
      <circle cx="27" cy="58" r="1" fill="#93c5fd" opacity="0.4" />
      <circle cx="32" cy="58.5" r="1" fill="#93c5fd" opacity="0.4" />
      <circle cx="37" cy="58" r="1" fill="#93c5fd" opacity="0.4" />
      <circle cx="42" cy="57" r="1" fill="#93c5fd" opacity="0.4" />
    </svg>
  );
}
