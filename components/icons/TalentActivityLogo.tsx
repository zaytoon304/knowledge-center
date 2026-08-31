import { useId } from "react";

// شعار وحدة الموهبة والنشاط الطلابي — نجمة (تميّز وموهبة) فوق شريط وسام (إنجاز ونشاط)
export default function TalentActivityLogo({ className = "" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const hex = `hex_${uid}`;
  const star = `star_${uid}`;
  const ribbonL = `ribL_${uid}`;
  const ribbonR = `ribR_${uid}`;
  const glow = `glow_${uid}`;

  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id={hex} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#065f46" />
          <stop offset="60%" stopColor="#047857" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        <linearGradient id={star} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id={ribbonL} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
        <linearGradient id={ribbonR} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
        <filter id={glow}>
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Hexagon base */}
      <path d="M32 3 L57 17.5 L57 46.5 L32 61 L7 46.5 L7 17.5 Z" fill={`url(#${hex})`} />

      {/* Inner hex ring */}
      <path d="M32 9 L52 20.5 L52 43.5 L32 55 L12 43.5 L12 20.5 Z"
        fill="none" stroke="white" strokeOpacity="0.12" strokeWidth="1" />

      {/* Corner dots */}
      <circle cx="32" cy="4" r="1.5" fill="#6ee7b7" opacity="0.55" />
      <circle cx="56" cy="18" r="1.5" fill="#6ee7b7" opacity="0.55" />
      <circle cx="56" cy="46" r="1.5" fill="#6ee7b7" opacity="0.55" />
      <circle cx="32" cy="60" r="1.5" fill="#6ee7b7" opacity="0.55" />
      <circle cx="8" cy="46" r="1.5" fill="#6ee7b7" opacity="0.55" />
      <circle cx="8" cy="18" r="1.5" fill="#6ee7b7" opacity="0.55" />

      {/* Ribbon tails — النشاط الطلابي (وسام إنجاز) */}
      <path d="M25 40 L18 58 L25 54.5 L29 59 L27 41 Z" fill={`url(#${ribbonL})`} opacity="0.95" />
      <path d="M39 40 L46 58 L39 54.5 L35 59 L37 41 Z" fill={`url(#${ribbonR})`} opacity="0.95" />
      <path d="M25 40 L18 58 L25 54.5 L27 41 Z" fill="black" opacity="0.08" />

      {/* Ribbon knot */}
      <circle cx="32" cy="39" r="6.5" fill="#dc2626" />
      <circle cx="32" cy="39" r="6.5" fill="none" stroke="#fecaca" strokeOpacity="0.4" strokeWidth="1" />

      {/* Star — الموهبة والتميّز */}
      <path
        d="M32,16 L34.53,23.52 L42.46,23.60 L36.09,28.33 L38.47,35.90 L32,31.3 L25.53,35.90 L27.91,28.33 L21.54,23.60 L29.47,23.52 Z"
        fill={`url(#${star})`} filter={`url(#${glow})`} />
      <circle cx="28.5" cy="21" r="2" fill="white" opacity="0.25" />

      {/* Rays */}
      <line x1="32" y1="9" x2="32" y2="6" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" filter={`url(#${glow})`} />
      <line x1="42" y1="13" x2="44.5" y2="11" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" filter={`url(#${glow})`} />
      <line x1="22" y1="13" x2="19.5" y2="11" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" filter={`url(#${glow})`} />

      {/* Small stars */}
      <circle cx="13" cy="30" r="1.5" fill="#fbbf24" opacity="0.55" />
      <circle cx="51" cy="30" r="1.5" fill="#fbbf24" opacity="0.55" />
      <circle cx="45" cy="12" r="1" fill="#fde68a" opacity="0.7" />
      <circle cx="19" cy="12" r="1" fill="#fde68a" opacity="0.7" />
    </svg>
  );
}
