'use client'
import React from 'react'

/* ═══════════════════════════════════════════════════════════════
   SvgCharacterRenderer — High-res inline SVG character renderer
   Replaces old PixelArt placeholders with detailed BF-style chibi
   ═══════════════════════════════════════════════════════════════ */

export type CharacterClass = 'knight' | 'mage' | 'archer'
export type CharacterElement = 'fire' | 'ice' | 'wind' | 'earth' | 'light' | 'dark'

export interface SvgCharacterRendererProps {
  classType: CharacterClass
  element: CharacterElement
  size?: number          // SVG viewport size in px (default 96)
  isAttacking?: boolean  // triggers lunge animation
  isDead?: boolean       // greyed out
  className?: string
}

// Element color maps
const ELEM_COLORS: Record<CharacterElement, { primary: string; glow: string; aura: string }> = {
  fire:  { primary: '#ef4444', glow: '#f97316', aura: 'rgba(239,68,68,0.35)' },
  ice:   { primary: '#3b82f6', glow: '#60a5fa', aura: 'rgba(59,130,246,0.35)' },
  wind:  { primary: '#22c55e', glow: '#4ade80', aura: 'rgba(34,197,94,0.35)' },
  earth: { primary: '#a16207', glow: '#eab308', aura: 'rgba(161,98,7,0.35)' },
  light: { primary: '#fbbf24', glow: '#fef08a', aura: 'rgba(251,191,36,0.35)' },
  dark:  { primary: '#7c3aed', glow: '#a78bfa', aura: 'rgba(124,58,237,0.35)' },
}

const ELEMENT_EMOJI: Record<CharacterElement, string> = {
  fire: '🔥', ice: '❄️', wind: '💨', earth: '🌿', light: '✨', dark: '🌑',
}

function KnightSVG({ colors }: { colors: typeof ELEM_COLORS.fire }) {
  return (
    <g transform="translate(16, 8)">
      {/* Body — heavy plated armor */}
      <rect x="28" y="40" width="28" height="32" rx="4" fill="#6b7280" stroke="#374151" strokeWidth="1.5"/>
      {/* Armor layers */}
      <rect x="30" y="42" width="24" height="10" rx="2" fill="#9ca3af"/>
      <rect x="30" y="54" width="24" height="8" rx="2" fill="#7f8a98"/>
      <rect x="30" y="64" width="24" height="6" rx="2" fill="#6b7280"/>
      {/* Shoulder pauldrons */}
      <ellipse cx="28" cy="44" rx="8" ry="6" fill="#9ca3af" stroke="#374151" strokeWidth="1"/>
      <ellipse cx="52" cy="44" rx="8" ry="6" fill="#9ca3af" stroke="#374151" strokeWidth="1"/>
      <circle cx="28" cy="44" r="3" fill={colors.primary}/>
      <circle cx="52" cy="44" r="3" fill={colors.primary}/>
      {/* Helmet */}
      <rect x="28" y="18" width="24" height="22" rx="6" fill="#9ca3af" stroke="#374151" strokeWidth="1.5"/>
      {/* Visor */}
      <rect x="32" y="26" width="16" height="6" rx="2" fill="#1f2937"/>
      {/* Visor slit glow */}
      <rect x="34" y="28" width="5" height="2" rx="1" fill={colors.glow} opacity="0.9"/>
      <rect x="41" y="28" width="5" height="2" rx="1" fill={colors.glow} opacity="0.9"/>
      {/* Helmet crest */}
      <path d="M40 18 L40 10 L44 16 L48 10 L48 18" fill={colors.primary} stroke={colors.glow} strokeWidth="0.5"/>
      {/* Shield (left hand) */}
      <rect x="8" y="42" width="16" height="22" rx="3" fill="#7f8a98" stroke="#374151" strokeWidth="1.5"/>
      <rect x="10" y="44" width="12" height="18" rx="2" fill="#6b7280"/>
      <circle cx="16" cy="53" r="4" fill={colors.primary} stroke={colors.glow} strokeWidth="1"/>
      {/* Sword (right hand) */}
      <rect x="58" y="30" width="4" height="30" rx="1" fill="#d1d5db" stroke="#9ca3af" strokeWidth="0.5"/>
      <rect x="54" y="28" width="12" height="5" rx="1" fill="#9ca3af" stroke="#6b7280" strokeWidth="1"/>
      <circle cx="60" cy="30" r="2" fill={colors.primary}/>
      {/* Legs */}
      <rect x="30" y="72" width="10" height="12" rx="3" fill="#6b7280" stroke="#374151" strokeWidth="1"/>
      <rect x="42" y="72" width="10" height="12" rx="3" fill="#6b7280" stroke="#374151" strokeWidth="1"/>
      {/* Boots */}
      <rect x="28" y="82" width="14" height="6" rx="3" fill="#374151"/>
      <rect x="40" y="82" width="14" height="6" rx="3" fill="#374151"/>
    </g>
  )
}

function MageSVG({ colors }: { colors: typeof ELEM_COLORS.fire }) {
  return (
    <g transform="translate(16, 8)">
      {/* Robe body — long flowing */}
      <path d="M28 42 Q24 60 20 90 L60 90 Q56 60 52 42 Z" fill="#1e1b4b" stroke="#312e81" strokeWidth="1"/>
      {/* Robe inner */}
      <path d="M32 44 Q30 58 28 84 L52 84 Q50 58 48 44 Z" fill="#312e81"/>
      {/* Robe trim */}
      <path d="M20 88 Q40 92 60 88" stroke={colors.primary} strokeWidth="2" fill="none" opacity="0.8"/>
      {/* Collar / cape */}
      <path d="M30 40 Q25 35 22 42 L30 44 Z" fill="#4338ca"/>
      <path d="M50 40 Q55 35 58 42 L50 44 Z" fill="#4338ca"/>
      {/* Hood / head */}
      <path d="M30 20 Q40 8 50 20 L50 38 Q40 42 30 38 Z" fill="#1e1b4b" stroke="#312e81" strokeWidth="1"/>
      {/* Face area */}
      <ellipse cx="40" cy="30" rx="8" ry="9" fill="#fde68a"/>
      {/* Eyes */}
      <circle cx="37" cy="29" r="1.5" fill="#1e1b4b"/>
      <circle cx="43" cy="29" r="1.5" fill="#1e1b4b"/>
      <circle cx="37.5" cy="28.5" r="0.5" fill="#fff"/>
      <circle cx="43.5" cy="28.5" r="0.5" fill="#fff"/>
      {/* Staff */}
      <rect x="58" y="10" width="3" height="72" rx="1" fill="#92400e" stroke="#78350f" strokeWidth="0.5"/>
      {/* Staff crystal */}
      <polygon points="59.5,4 54,14 59.5,10 65,14" fill={colors.primary} stroke={colors.glow} strokeWidth="1"/>
      {/* Crystal glow */}
      <circle cx="59.5" cy="9" r="5" fill={colors.primary} opacity="0.3"/>
      {/* Belt */}
      <rect x="30" y="52" width="20" height="3" rx="1" fill="#92400e"/>
      <circle cx="40" cy="53.5" r="2.5" fill={colors.primary}/>
      {/* Robe flare lines */}
      <line x1="34" y1="60" x2="30" y2="84" stroke={colors.primary} strokeWidth="0.5" opacity="0.4"/>
      <line x1="46" y1="60" x2="50" y2="84" stroke={colors.primary} strokeWidth="0.5" opacity="0.4"/>
    </g>
  )
}

function ArcherSVG({ colors }: { colors: typeof ELEM_COLORS.fire }) {
  return (
    <g transform="translate(16, 8)">
      {/* Hooded cloak body */}
      <path d="M30 38 Q28 50 22 88 L58 88 Q52 50 50 38 Z" fill="#064e3b" stroke="#065f46" strokeWidth="1"/>
      {/* Cloak inner */}
      <path d="M33 40 Q32 50 28 82 L52 82 Q48 50 47 40 Z" fill="#065f46"/>
      {/* Hood */}
      <path d="M28 18 Q40 6 52 18 L52 36 Q40 40 28 36 Z" fill="#064e3b" stroke="#065f46" strokeWidth="1"/>
      {/* Face shadow + eyes */}
      <ellipse cx="40" cy="28" rx="8" ry="8" fill="#1e293b"/>
      <ellipse cx="40" cy="28" rx="7" ry="7" fill="#0f172a"/>
      {/* Glowing eyes */}
      <circle cx="37" cy="27" r="1.5" fill={colors.glow} opacity="0.9"/>
      <circle cx="43" cy="27" r="1.5" fill={colors.glow} opacity="0.9"/>
      {/* Bow (left side) */}
      <path d="M8 18 Q4 48 8 78" stroke="#92400e" strokeWidth="2.5" fill="none"/>
      <path d="M8 18 Q6 48 8 78" stroke="#a16207" strokeWidth="1" fill="none"/>
      {/* Bowstring */}
      <line x1="8" y1="18" x2="8" y2="78" stroke="#d4d4d4" strokeWidth="0.8"/>
      {/* Arrow */}
      <line x1="8" y1="48" x2="36" y2="44" stroke="#92400e" strokeWidth="1.5"/>
      <polygon points="36,44 32,42 32,46" fill="#d4d4d4"/>
      {/* Arrow fletching */}
      <line x1="8" y1="48" x2="12" y2="46" stroke={colors.primary} strokeWidth="1"/>
      <line x1="8" y1="48" x2="12" y2="50" stroke={colors.primary} strokeWidth="1"/>
      {/* Quiver on back */}
      <rect x="52" y="30" width="6" height="24" rx="2" fill="#78350f" stroke="#92400e" strokeWidth="0.5"/>
      <line x1="54" y1="28" x2="54" y2="34" stroke="#d4d4d4" strokeWidth="1"/>
      <line x1="56" y1="28" x2="56" y2="34" stroke="#d4d4d4" strokeWidth="1"/>
      {/* Belt */}
      <rect x="30" y="54" width="20" height="2.5" rx="1" fill="#78350f"/>
      <circle cx="40" cy="55.2" r="2" fill={colors.primary}/>
      {/* Boots */}
      <rect x="28" y="84" width="10" height="6" rx="3" fill="#1c1917"/>
      <rect x="42" y="84" width="10" height="6" rx="3" fill="#1c1917"/>
      {/* Cloak hem trim */}
      <path d="M22 86 Q40 90 58 86" stroke={colors.primary} strokeWidth="1" fill="none" opacity="0.5"/>
    </g>
  )
}

// Element ring aura under the character's feet
function ElementAura({ colors, size }: { colors: typeof ELEM_COLORS.fire; size: number }) {
  const cx = size / 2
  const cy = size - 10
  return (
    <g className="animate-pulse" style={{ transformOrigin: `${cx}px ${cy}px` }}>
      {/* Outer glow ring */}
      <ellipse cx={cx} cy={cy} rx={28} ry={8}
        fill="none" stroke={colors.primary} strokeWidth="1.5" opacity="0.6"/>
      {/* Inner fill */}
      <ellipse cx={cx} cy={cy} rx={22} ry={6}
        fill={colors.aura} opacity="0.4"/>
      {/* Sparkle dots */}
      <circle cx={cx - 18} cy={cy - 2} r="1" fill={colors.glow} opacity="0.7"/>
      <circle cx={cx + 18} cy={cy - 2} r="1" fill={colors.glow} opacity="0.7"/>
      <circle cx={cx} cy={cy - 6} r="1.2" fill={colors.glow} opacity="0.5"/>
    </g>
  )
}

export default function SvgCharacterRenderer({
  classType,
  element,
  size = 96,
  isAttacking = false,
  isDead = false,
  className = '',
}: SvgCharacterRendererProps) {
  const colors = ELEM_COLORS[element]
  const viewBox = `0 0 ${size} ${size}`

  const ClassComponent = classType === 'knight' ? KnightSVG
    : classType === 'mage' ? MageSVG
    : ArcherSVG

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      className={`block overflow-visible transition-all duration-300 ${
        isDead ? 'grayscale opacity-40' : ''
      } ${
        isAttacking ? 'animate-lunge-right' : ''
      } ${className}`}
      style={{ imageRendering: 'auto' }}
    >
      {/* Element aura at feet */}
      {!isDead && <ElementAura colors={colors} size={size} />}

      {/* Character */}
      <ClassComponent colors={colors} />

      {/* Element badge (top-right corner) */}
      <g transform={`translate(${size - 18}, 2)`}>
        <rect x="0" y="0" width="16" height="14" rx="3"
          fill="rgba(0,0,0,0.7)" stroke={colors.primary} strokeWidth="1"/>
        <text x="8" y="11" textAnchor="middle" fontSize="10" fill="white">
          {ELEMENT_EMOJI[element]}
        </text>
      </g>
    </svg>
  )
}
