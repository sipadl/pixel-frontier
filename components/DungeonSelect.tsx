'use client'
import { useGameStore, type StageDef } from '@/store/gameStore'
import GachaBorder from '@/components/ui/GachaBorder'
import stagesRaw from '@/game/data/stages.json'

const allStages = stagesRaw as StageDef[]

export default function DungeonSelect() {
  const energy = useGameStore((s) => s.energy)
  const startBattle = useGameStore((s) => s.startBattle)
  const setScreen = useGameStore((s) => s.setScreen)
  const currentStage = useGameStore((s) => s.currentStage)

  return (
    <div className="relative h-full flex flex-col overflow-hidden font-pixel">
      {/* Ornate parchment world map background */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(217,161,50,0.15),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(15,23,42,0.9),transparent_60%)]" />
      {/* subtle grid texture */}
      <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:'repeating-linear-gradient(45deg,#000 0,#000 1px,transparent 1px,transparent 8px)'}} />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-px w-6 bg-gradient-to-r from-amber-500 to-transparent" />
          <h2 className="text-xs tracking-widest text-amber-300 drop-shadow-[0_0_6px_rgba(217,161,50,0.35)]">
            ✦ WORLD MAP ✦
          </h2>
          <div className="h-px w-6 bg-gradient-to-l from-amber-500 to-transparent" />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[9px] text-cyan-300 bg-slate-900/60 border border-cyan-800/60 rounded-full px-2 py-0.5 shadow-[0_0_8px_rgba(34,211,238,0.12)]">
            ⚡ {energy}
          </span>
          <button
            onClick={() => setScreen('town')}
            className="text-[8px] tracking-wider px-3 py-1 bg-slate-900/70 border border-amber-700/50 rounded text-amber-200 hover:border-amber-400 hover:text-amber-50 active:scale-95 transition-colors"
          >
            ✖ BACK
          </button>
        </div>
      </div>

      {/* Scrollable stage chain */}
      <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-24">
        <div className="relative mx-auto max-w-lg">
          {/* Decorative chain spine SVG */}
          <svg
            className="absolute inset-x-0 top-0 h-full pointer-events-none"
            preserveAspectRatio="none"
          >
            {/* Gold dotted pathway */}
            <path
              d="M 24 0 L 24 100%"
              stroke="url(#chainGrad)"
              strokeDasharray="6 8"
              strokeWidth="2"
              fill="none"
              className="opacity-70"
            />
            {/* Chain-link nodes along spine */}
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <circle
                key={i}
                cx="24"
                cy={`${(100 / 6) * i}%`}
                r="3.5"
                fill="#fbbf24"
                className="drop-shadow-[0_0_4px_rgba(251,191,36,0.65)]"
              />
            ))}
            <defs>
              <linearGradient id="chainGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d9a132" />
                <stop offset="50%" stopColor="#f5d478" />
                <stop offset="100%" stopColor="#d9a132" />
              </linearGradient>
            </defs>
          </svg>

          {/* Stage nodes */}
          <div className="flex flex-col gap-4 pl-12">
            {allStages.map((st) => {
              const canEnter = energy >= st.energy
              const isCurrent = currentStage === st.id
              const isCleared = isCurrent
              const difficulty = (() => {
                if (st.boss) return 3
                if (st.energy >= 18) return 3
                if (st.energy >= 14) return 2
                return 1
              })()

              return (
                <div
                  key={st.id}
                  className={`relative group transition-all duration-300 ${isCurrent ? 'scale-[1.01]' : ''}`}
                >
                  {/* Active stage pulse */}
                  {isCurrent && (
                    <span className="absolute -inset-1 rounded-2xl bg-amber-500/20 blur-md animate-pulse" />
                  )}

                  <GachaBorder variant="gold" className={`${!canEnter ? 'opacity-40 grayscale' : ''}`}>
                    <button
                      disabled={!canEnter}
                      onClick={() => canEnter && startBattle(st.id)}
                      className="w-full relative text-left p-3 transition-transform active:scale-[0.98]"
                    >
                      {/* Locked overlay */}
                      {!canEnter && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-slate-950/30 backdrop-blur-[1px]">
                          <span className="font-pixel text-[9px] text-slate-400 tracking-wider drop-shadow-md">🔒 LOCKED</span>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        {/* Stage emblem */}
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-700/50 bg-gradient-to-b from-amber-600/20 to-amber-900/20 shadow-[0_0_10px_rgba(217,161,50,0.1)]">
                          <span className="text-lg leading-none">
                            {st.boss ? '👑' : '⚔️'}
                          </span>
                        </div>

                        {/* Info block */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-[10px] font-medium text-amber-50 tracking-wide drop-shadow-sm">
                              {st.name}
                            </p>
                            {isCleared && (
                              <span className="shrink-0 text-[7px] rounded bg-emerald-900/50 border border-emerald-500/40 px-1.5 py-0.5 text-emerald-300">
                                ✓ CLEAR
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex items-center gap-2 text-[8px] text-amber-200/75">
                            <span className="rounded border border-amber-800/50 bg-amber-950/30 px-1 py-0.5">
                              {st.waves} WAVES
                            </span>
                            <span className="rounded border border-cyan-900/60 bg-slate-950/40 px-1 py-0.5 text-cyan-300">
                              ⚡ {st.energy}
                            </span>
                            <span className="ml-auto flex items-center gap-0.5">
                              {Array.from({ length: 3 }).map((_, i) => (
                                <span
                                  key={i}
                                  className={`inline-block h-1.5 w-3 rounded-sm ${
                                    i < difficulty
                                      ? 'bg-gradient-to-r from-amber-500 to-red-500 shadow-[0_0_4px_rgba(245,158,11,0.5)]'
                                      : 'bg-slate-700'
                                  }`}
                                />
                              ))}
                            </span>
                          </div>
                        </div>

                        {/* Right badge */}
                        <div className="hidden sm:flex flex-col items-end gap-1">
                          <span
                            className={`rounded border px-1.5 py-0.5 text-[7px] tracking-wider ${
                              st.boss
                                ? 'border-red-600/70 bg-red-950/40 text-red-300'
                                : 'border-amber-700/40 bg-amber-950/30 text-amber-300'
                            }`}
                          >
                            {st.boss ? 'BOSS' : 'NORMAL'}
                          </span>
                        </div>
                      </div>
                    </button>
                  </GachaBorder>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
