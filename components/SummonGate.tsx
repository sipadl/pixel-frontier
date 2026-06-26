'use client'
import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import GachaBorder from '@/components/ui/GachaBorder'

/* ── element → icon/color maps ── */
const ELEMENT_ICON: Record<string, string> = {
  fire: '🔥', ice: '❄️', wind: '💨', earth: '🌿', light: '✨', dark: '🌑',
}
const ELEMENT_COLOR: Record<string, string> = {
  fire: 'text-red-400', ice: 'text-blue-300', wind: 'text-emerald-400',
  earth: 'text-amber-400', light: 'text-yellow-200', dark: 'text-purple-400',
}
const RARITY_VARIANT: Record<number, 'gold' | 'crystal' | 'rainbow'> = {
  3: 'gold', 4: 'gold', 5: 'rainbow',
}
const RARITY_GLOW: Record<number, string> = {
  3: 'from-gray-700/40 to-gray-900/60',
  4: 'from-amber-500/30 to-amber-900/50',
  5: 'from-purple-400/40 via-pink-400/30 to-cyan-400/40',
}
const RARITY_BORDER_COLOR: Record<number, string> = {
  3: 'border-gray-500/60',
  4: 'border-amber-400/80',
  5: 'border-purple-400/80',
}

export default function SummonGate() {
  const gems = useGameStore((s) => s.gems)
  const pullGacha = useGameStore((s) => s.pullGacha)
  const setScreen = useGameStore((s) => s.setScreen)
  const [results, setResults] = useState<{ name: string; rarity: number; element: string; isNew: boolean; shards: number }[]>([])
  const [summoning, setSummoning] = useState(false)
  const [revealedCount, setRevealedCount] = useState(0)
  const [showLightBeam, setShowLightBeam] = useState(false)

  const doPull = (count: 1 | 10) => {
    setSummoning(true)
    setResults([])
    setRevealedCount(0)
    setShowLightBeam(true)

    setTimeout(() => {
      const raw = pullGacha(count)
      setResults(
        raw.map((r) => ({
          name: r.unit.name,
          rarity: r.unit.rarity,
          element: r.unit.element,
          isNew: r.isNew,
          shards: r.shardsGained,
        })),
      )
      setSummoning(false)
      /* stagger reveal cards */
      for (let i = 0; i <= raw.length; i++) {
        setTimeout(() => setRevealedCount(i), 200 + i * 180)
      }
      setTimeout(() => setShowLightBeam(false), 1200)
    }, 1400)
  }

  /* ── SVG Gate Arch ── */
  const GateArch = () => (
    <svg viewBox="0 0 260 300" className="w-56 h-64 mx-auto drop-shadow-[0_0_20px_rgba(217,161,50,0.5)]" aria-hidden="true">
      {/* outer glow */}
      <defs>
        <radialGradient id="gateGlow" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#f5d478" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f5d478" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="archGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5d478" />
          <stop offset="40%" stopColor="#d9a132" />
          <stop offset="100%" stopColor="#8b6914" />
        </linearGradient>
        <linearGradient id="archGoldH" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d9a132" />
          <stop offset="50%" stopColor="#f5d478" />
          <stop offset="100%" stopColor="#d9a132" />
        </linearGradient>
      </defs>

      {/* glow backdrop */}
      <ellipse cx="130" cy="150" rx="120" ry="140" fill="url(#gateGlow)" />

      {/* arch frame */}
      <path d="M40 290 L40 120 A90 90 0 0 1 220 120 L220 290" fill="none" stroke="url(#archGold)" strokeWidth="8" strokeLinecap="round" />
      {/* inner arch */}
      <path d="M60 290 L60 130 A70 70 0 0 1 200 130 L200 290" fill="none" stroke="url(#archGoldH)" strokeWidth="3" opacity="0.6" />

      {/* pillar bases */}
      <rect x="28" y="276" width="28" height="18" rx="3" fill="url(#archGoldH)" />
      <rect x="204" y="276" width="28" height="18" rx="3" fill="url(#archGoldH)" />

      {/* pillar ornaments */}
      <circle cx="52" cy="160" r="5" fill="#f5d478" opacity="0.7" />
      <circle cx="208" cy="160" r="5" fill="#f5d478" opacity="0.7" />
      <circle cx="52" cy="200" r="4" fill="#d9a132" opacity="0.5" />
      <circle cx="208" cy="200" r="4" fill="#d9a132" opacity="0.5" />

      {/* apex gem */}
      <polygon points="130,30 138,44 130,38 122,44" fill="#f5d478" opacity="0.9" />
      <circle cx="130" cy="38" r="5" fill="#ffe066" opacity="0.6" />

      {/* decorative runes on arch */}
      <text x="90" y="92" fill="#d9a132" fontSize="10" opacity="0.4" fontFamily="serif">⚔</text>
      <text x="158" y="92" fill="#d9a132" fontSize="10" opacity="0.4" fontFamily="serif">⚔</text>

      {/* floor line */}
      <line x1="40" y1="293" x2="220" y2="293" stroke="#d9a132" strokeWidth="2" opacity="0.4" />
    </svg>
  )

  /* ── Light Beam animation overlay ── */
  const LightBeam = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 overflow-hidden">
      <div
        className="w-4 bg-gradient-to-b from-yellow-200 via-amber-300 to-transparent opacity-90 rounded-full"
        style={{
          height: '300%',
          filter: 'blur(6px)',
          animation: 'lightBeamPulse 1.2s ease-in-out',
        }}
      />
      <style>{`
        @keyframes lightBeamPulse {
          0%   { opacity: 0;   transform: scaleY(0.3); }
          40%  { opacity: 1;   transform: scaleY(1); }
          100% { opacity: 0.4; transform: scaleY(1.1); }
        }
      `}</style>
    </div>
  )

  /* ── Vortex particles ── */
  const VortexParticles = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 2 + Math.random() * 3,
            height: 2 + Math.random() * 3,
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            background: `hsl(${260 + Math.random() * 60}, 80%, ${60 + Math.random() * 20}%)`,
            opacity: 0.3 + Math.random() * 0.4,
            animation: `vortexFloat ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 2}s infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes vortexFloat {
          0%   { transform: translateY(0) scale(1);   opacity: 0.2; }
          100% { transform: translateY(-20px) scale(1.4); opacity: 0.6; }
        }
        @keyframes gentleBob {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes cardReveal {
          0%   { transform: scale(0.7) rotateY(90deg); opacity: 0; }
          60%  { transform: scale(1.08) rotateY(-5deg); opacity: 1; }
          100% { transform: scale(1) rotateY(0deg); opacity: 1; }
        }
        @keyframes rainbowBorder {
          0%   { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
      `}</style>
    </div>
  )

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-purple-950 via-slate-950 to-black relative overflow-hidden">
      <VortexParticles />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center px-4 pt-4 pb-2">
        <h2 className="font-pixel text-sm text-amber-400 drop-shadow-[0_0_8px_rgba(217,161,50,0.6)]">
          ⛩ SUMMON GATE
        </h2>
        <div className="flex items-center gap-3">
          <span className="font-pixel text-[8px] text-cyan-300 drop-shadow-[0_0_4px_rgba(0,255,255,0.4)]">
            💎 {gems}
          </span>
          <button
            onClick={() => setScreen('town')}
            className="font-pixel text-[8px] px-3 py-1 bg-red-950 border border-red-600 rounded text-red-300 hover:bg-red-900 transition-colors"
          >
            ✖ BACK
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
        {showLightBeam && <LightBeam />}

        {/* Gate */}
        <div
          className="mb-4"
          style={{ animation: summoning ? 'lightBeamPulse 0.8s ease-in-out infinite' : 'gentleBob 4s ease-in-out infinite' }}
        >
          <GateArch />
        </div>

        <p className="font-pixel text-[9px] text-amber-300/70 mb-4 tracking-widest uppercase">
          Mystic Summon Gate
        </p>

        {/* Pull Buttons */}
        <div className="flex gap-4 mb-3">
          <button
            onClick={() => doPull(1)}
            disabled={gems < 5 || summoning}
            className="group relative font-pixel text-[10px] px-6 py-3 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all duration-200 overflow-hidden border-2 border-purple-400/80"
            style={{ background: 'linear-gradient(180deg, #7c3aed 0%, #4c1d95 100%)' }}
          >
            <span className="relative z-10 flex items-center gap-2">
              ⚡ SUMMON ×1
              <span className="text-[8px] text-purple-200">5💎</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => doPull(10)}
            disabled={gems < 50 || summoning}
            className="group relative font-pixel text-[10px] px-6 py-3 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all duration-200 overflow-hidden border-2 border-amber-400"
            style={{ background: 'linear-gradient(180deg, #d97706 0%, #92400e 100%)' }}
          >
            <span className="relative z-10 flex items-center gap-2">
              ⚡ SUMMON ×10
              <span className="text-[8px] text-amber-100">50💎</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {/* guaranteed label */}
            <span className="absolute -top-1 -right-1 font-pixel text-[5px] bg-red-600 text-white px-1 rounded-sm z-10">
              ★
            </span>
          </button>
        </div>

        {/* Rates info */}
        <div className="flex gap-4 mb-4">
          <p className="font-pixel text-[6px] text-gray-400">3★ 70%</p>
          <p className="font-pixel text-[6px] text-amber-500">4★ 25%</p>
          <p className="font-pixel text-[6px] text-purple-400">5★ 5%</p>
        </div>

        {/* Summoning indicator */}
        {summoning && (
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <div className="flex flex-col items-center gap-2">
              <div className="font-pixel text-[10px] text-amber-300 animate-pulse tracking-widest">
                ✦ SUMMONING ✦
              </div>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-amber-400"
                    style={{ animation: `pulseDot 1s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
              <style>{`
                @keyframes pulseDot {
                  0%, 100% { opacity: 0.3; transform: scale(0.8); }
                  50%      { opacity: 1;   transform: scale(1.3); }
                }
              `}</style>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {results.length > 0 && (
          <div className="mt-4 grid grid-cols-5 gap-2 w-full max-w-lg">
            {results.map((r, i) => {
              const visible = i < revealedCount
              const variant = RARITY_VARIANT[r.rarity] ?? 'gold'
              const isMaxRarity = r.rarity === 5

              return (
                <div
                  key={i}
                  className={`transition-all duration-500 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
                  style={{
                    animation: visible ? 'cardReveal 0.5s ease-out forwards' : 'none',
                    animationDelay: `${i * 0.05}s`,
                  }}
                >
                  <GachaBorder variant={variant} className="w-full">
                    <div className={`
                      flex flex-col items-center p-2 rounded-lg relative overflow-hidden
                      bg-gradient-to-b ${RARITY_GLOW[r.rarity] ?? RARITY_GLOW[3]}
                      ${isMaxRarity ? 'border border-purple-400/30' : ''}
                    `}>
                      {/* Rarity glow backdrop */}
                      {isMaxRarity && (
                        <div
                          className="absolute inset-0 opacity-20 pointer-events-none"
                          style={{ animation: 'rainbowBorder 3s linear infinite' }}
                        />
                      )}

                      {/* Unit portrait placeholder */}
                      <div className={`
                        w-10 h-10 rounded-md border ${RARITY_BORDER_COLOR[r.rarity]}
                        bg-gradient-to-b from-slate-800 to-slate-900
                        flex items-center justify-center text-xl mb-1
                        ${isMaxRarity ? 'shadow-[0_0_10px_rgba(168,85,247,0.4)]' : ''}
                      `}>
                        {ELEMENT_ICON[r.element] ?? '❓'}
                      </div>

                      {/* Unit name */}
                      <span className="font-pixel text-[6px] text-white text-center leading-tight truncate w-full">
                        {r.name}
                      </span>

                      {/* Element + Rarity */}
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <span className={`text-[6px] ${ELEMENT_COLOR[r.element] ?? 'text-gray-400'}`}>
                          {ELEMENT_ICON[r.element] ?? '?'}
                        </span>
                        <span className="font-pixel text-[5px] text-amber-400">
                          {'★'.repeat(Math.min(r.rarity, 5))}
                        </span>
                      </div>

                      {/* New / Shards badges */}
                      {r.isNew && (
                        <span className="absolute top-0.5 right-0.5 font-pixel text-[4px] bg-green-600 text-white px-0.5 rounded-sm leading-none">
                          NEW
                        </span>
                      )}
                      {r.shards > 0 && (
                        <span className="font-pixel text-[4px] text-amber-300 mt-0.5">
                          +{r.shards}🔮
                        </span>
                      )}
                    </div>
                  </GachaBorder>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom decorative border */}
      <div className="relative z-10 h-1 bg-gradient-to-r from-transparent via-amber-600/40 to-transparent" />
    </div>
  )
}
