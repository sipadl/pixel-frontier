'use client'
import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import CharacterSprite from '@/components/CharacterSprite'

const ELEM_EMOJI: Record<string, string> = {
  fire: '🔥', ice: '❄️', wind: '💨', earth: '🌿', light: '✨', dark: '🌑',
}

const RARITY_BG: Record<number, string> = {
  3: 'from-gray-700/60 to-gray-900/80 border-gray-500/50',
  4: 'from-amber-600/40 to-amber-900/60 border-amber-400/70',
  5: 'from-purple-500/40 via-pink-500/30 to-cyan-500/40 border-purple-400/80',
}

const ROLE_MAP: Record<string, string> = {
  warrior: 'knight', knight: 'knight', mage: 'mage', archer: 'archer',
  cleric: 'healer', healer: 'healer', guardian: 'guardian', rogue: 'rogue',
}

export default function SummonGate() {
  const gems = useGameStore((s) => s.gems)
  const pullGacha = useGameStore((s) => s.pullGacha)
  const setScreen = useGameStore((s) => s.setScreen)
  const [results, setResults] = useState<{ name: string; rarity: number; element: string; role: string; isNew: boolean; shards: number }[]>([])
  const [summoning, setSummoning] = useState(false)
  const [revealedCount, setRevealedCount] = useState(0)
  const [showBeam, setShowBeam] = useState(false)

  const doPull = (count: 1 | 10) => {
    setSummoning(true)
    setResults([])
    setRevealedCount(0)
    setShowBeam(true)

    setTimeout(() => {
      const raw = pullGacha(count)
      setResults(
        raw.map((r) => ({
          name: r.unit.name,
          rarity: r.unit.rarity,
          element: r.unit.element,
          role: r.unit.role,
          isNew: r.isNew,
          shards: r.shardsGained,
        })),
      )
      setSummoning(false)
      for (let i = 0; i <= raw.length; i++) {
        setTimeout(() => setRevealedCount(i), 200 + i * 180)
      }
      setTimeout(() => setShowBeam(false), 1200)
    }, 1400)
  }

  return (
    <div className="h-full flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0020 0%, #050318 40%, #000 100%)' }}>

      {/* ═══ VORTEX PARTICLES ═══ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width: 3 + (i % 3) * 2,
              height: 3 + (i % 3) * 2,
              left: `${8 + (i * 4.3) % 84}%`,
              top: `${8 + (i * 5.7) % 84}%`,
              background: `hsl(${260 + (i * 13) % 60}, 80%, ${60 + (i % 4) * 8}%)`,
              opacity: 0.3 + (i % 5) * 0.08,
              animation: `vortexFloat ${3 + (i % 4)}s ease-in-out ${(i % 3) * 0.5}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* ═══ HEADER ═══ */}
      <div className="shrink-0 flex justify-between items-center px-4 pt-3 pb-2 z-10"
        style={{
          background: 'linear-gradient(180deg, rgba(10,0,32,0.95), transparent)',
        }}>
        <h2 className="font-pixel text-base text-amber-400"
          style={{ textShadow: '0 0 12px rgba(217,161,50,0.6)' }}>
          ⛩ SUMMON GATE
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-900/40 border border-purple-500/40">
            <span className="text-sm">💎</span>
            <span className="font-pixel text-sm text-purple-300">{gems}</span>
          </div>
          <button onClick={() => setScreen('town')}
            className="font-pixel text-xs px-4 py-2.5 rounded-lg text-red-300 bg-red-900/40 border border-red-500/40 active:scale-95 transition-all">
            ✖ BACK
          </button>
        </div>
      </div>

      {/* ═══ GATE ARCH (SVG inline) ═══ */}
      <div className="shrink-0 relative z-10 flex justify-center mt-2 mb-4">
        <div style={{ animation: summoning ? 'gatePulse 0.8s ease-in-out infinite' : 'gentleBob 4s ease-in-out infinite' }}>
          <svg viewBox="0 0 260 280" className="w-48 h-56" aria-hidden="true">
            <defs>
              <radialGradient id="gateGlow" cx="50%" cy="30%" r="60%">
                <stop offset="0%" stopColor="#f5d478" stopOpacity="0.4" />
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
            <ellipse cx="130" cy="140" rx="115" ry="130" fill="url(#gateGlow)" />
            <path d="M40 270 L40 110 A90 90 0 0 1 220 110 L220 270" fill="none" stroke="url(#archGold)" strokeWidth="7" strokeLinecap="round" />
            <path d="M60 270 L60 120 A70 70 0 0 1 200 120 L200 270" fill="none" stroke="url(#archGoldH)" strokeWidth="2.5" opacity="0.5" />
            <rect x="28" y="256" width="26" height="16" rx="3" fill="url(#archGoldH)" />
            <rect x="206" y="256" width="26" height="16" rx="3" fill="url(#archGoldH)" />
            <circle cx="52" cy="150" r="4" fill="#f5d478" opacity="0.7" />
            <circle cx="208" cy="150" r="4" fill="#f5d478" opacity="0.7" />
            <polygon points="130,28 137,40 130,35 123,40" fill="#f5d478" opacity="0.9" />
            <circle cx="130" cy="35" r="4" fill="#ffe066" opacity="0.6" />
            <line x1="40" y1="272" x2="220" y2="272" stroke="#d9a132" strokeWidth="1.5" opacity="0.4" />
          </svg>
        </div>
      </div>

      {/* ═══ SCROLLABLE CONTENT ═══ */}
      <div className="flex-1 overflow-y-auto z-10 px-4 pb-4 flex flex-col items-center">

        {/* Pull buttons — BIG */}
        <div className="w-full max-w-sm space-y-3 mb-4">
          <button
            onClick={() => doPull(10)}
            disabled={gems < 50 || summoning}
            className="w-full py-5 rounded-2xl font-pixel text-base text-white disabled:opacity-30 active:scale-[0.97] transition-all relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #d97706, #92400e)',
              boxShadow: '0 4px 24px rgba(217,119,6,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
              border: '2px solid rgba(245,158,11,0.6)',
            }}>
            <span className="text-xl mr-2">⚡</span>
            SUMMON ×10
            <span className="ml-2 text-sm text-amber-100">50💎</span>
            <div className="absolute top-1 right-2 font-pixel text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded">
              ★ GUARANTEED 4★+
            </div>
          </button>

          <button
            onClick={() => doPull(1)}
            disabled={gems < 5 || summoning}
            className="w-full py-4 rounded-2xl font-pixel text-sm text-white disabled:opacity-30 active:scale-[0.97] transition-all"
            style={{
              background: 'linear-gradient(180deg, #7c3aed, #4c1d95)',
              boxShadow: '0 4px 20px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
              border: '2px solid rgba(167,139,250,0.4)',
            }}>
            <span className="text-lg mr-2">⚡</span>
            SUMMON ×1
            <span className="ml-2 text-xs text-purple-200">5💎</span>
          </button>
        </div>

        {/* Rates */}
        <div className="flex gap-5 mb-4">
          <span className="font-pixel text-xs text-gray-400">3★ 70%</span>
          <span className="font-pixel text-xs text-amber-400">4★ 25%</span>
          <span className="font-pixel text-xs text-purple-400">5★ 5%</span>
        </div>

        {/* ═══ SUMMONING OVERLAY ═══ */}
        {summoning && (
          <div className="fixed inset-0 flex items-center justify-center z-40 bg-black/60">
            <div className="flex flex-col items-center gap-3">
              <div className="font-pixel text-lg text-amber-300 animate-pulse tracking-widest">
                ✦ SUMMONING ✦
              </div>
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-3 h-3 rounded-full bg-amber-400"
                    style={{ animation: `pulseDot 1s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ LIGHT BEAM ═══ */}
        {showBeam && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-30">
            <div className="w-5 bg-gradient-to-b from-yellow-200 via-amber-300 to-transparent rounded-full"
              style={{ height: '300%', filter: 'blur(6px)', animation: 'beamFlash 1.2s ease-in-out' }} />
          </div>
        )}

        {/* ═══ RESULTS — BIG cards ═══ */}
        {results.length > 0 && (
          <div className={`w-full max-w-md grid gap-3 ${results.length > 5 ? 'grid-cols-5' : 'grid-cols-3'}`}>
            {results.map((r, i) => {
              const visible = i < revealedCount
              const spriteType = ROLE_MAP[r.role] || 'knight'
              const rarityClass = RARITY_BG[r.rarity] || RARITY_BG[3]
              const isMax = r.rarity === 5

              return (
                <div key={i}
                  className={`transition-all duration-500 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
                  style={{
                    animation: visible ? 'cardReveal 0.5s ease-out forwards' : 'none',
                    animationDelay: `${i * 0.05}s`,
                  }}>
                  <div className={`
                    rounded-2xl border-2 p-3 flex flex-col items-center gap-1
                    bg-gradient-to-b ${rarityClass}
                    ${isMax ? 'shadow-[0_0_20px_rgba(168,85,247,0.5)]' : ''}
                  `}
                    style={isMax ? { animation: 'rainbowBorder 3s linear infinite' } : undefined}>

                    {/* Character sprite — BIG */}
                    <CharacterSprite type={spriteType} size={56} />

                    {/* Name */}
                    <span className="font-pixel text-[10px] text-white text-center leading-tight truncate w-full">
                      {r.name}
                    </span>

                    {/* Element + Rarity */}
                    <span className="font-pixel text-[9px] text-amber-300">
                      {ELEM_EMOJI[r.element]} {'★'.repeat(r.rarity)}
                    </span>

                    {/* Badges */}
                    {r.isNew && (
                      <span className="font-pixel text-[7px] bg-green-600 text-white px-1.5 py-0.5 rounded">
                        NEW
                      </span>
                    )}
                    {r.shards > 0 && (
                      <span className="font-pixel text-[8px] text-amber-300">
                        +{r.shards}🔮
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {results.length === 0 && !summoning && (
          <div className="text-center mt-8">
            <CharacterSprite type="knight" size={80} className="mx-auto mb-3 opacity-40" />
            <p className="font-pixel text-xs text-slate-500">
              Choose a summon to begin...
            </p>
          </div>
        )}
      </div>

      {/* ═══ BOTTOM DECORATIVE ═══ */}
      <div className="shrink-0 h-1 bg-gradient-to-r from-transparent via-amber-600/30 to-transparent z-10" />

      <style jsx>{`
        @keyframes vortexFloat {
          0% { transform: translateY(0) scale(1); opacity: 0.2; }
          100% { transform: translateY(-20px) scale(1.4); opacity: 0.6; }
        }
        @keyframes gentleBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes gatePulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.05); filter: brightness(1.3); }
        }
        @keyframes cardReveal {
          0% { transform: scale(0.7) rotateY(90deg); opacity: 0; }
          60% { transform: scale(1.08) rotateY(-5deg); opacity: 1; }
          100% { transform: scale(1) rotateY(0deg); opacity: 1; }
        }
        @keyframes beamFlash {
          0% { opacity: 0; transform: scaleY(0.3); }
          40% { opacity: 1; transform: scaleY(1); }
          100% { opacity: 0.4; transform: scaleY(1.1); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes rainbowBorder {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
