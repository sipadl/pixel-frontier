'use client'
import { useGameStore, type StageDef } from '@/store/gameStore'
import CharacterSprite from '@/components/CharacterSprite'
import stagesRaw from '@/game/data/stages.json'

const allStages = stagesRaw as StageDef[]

export default function DungeonSelect() {
  const energy = useGameStore((s) => s.energy)
  const startBattle = useGameStore((s) => s.startBattle)
  const setScreen = useGameStore((s) => s.setScreen)
  const currentStage = useGameStore((s) => s.currentStage)

  return (
    <div className="h-full flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0f0a20, #050318)' }}>

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg,#000 0,#000 1px,transparent 1px,transparent 12px)' }} />

      {/* ═══ HEADER ═══ */}
      <div className="shrink-0 flex justify-between items-center px-4 pt-3 pb-2 z-10">
        <div className="flex items-center gap-2">
          <div className="h-px w-6 bg-gradient-to-r from-amber-500 to-transparent" />
          <h2 className="font-pixel text-sm text-amber-300 tracking-widest"
            style={{ textShadow: '0 0 6px rgba(217,161,50,0.35)' }}>
            ✦ WORLD MAP ✦
          </h2>
          <div className="h-px w-6 bg-gradient-to-l from-amber-500 to-transparent" />
        </div>
        <div className="flex items-center gap-3">
          <span className="font-pixel text-xs text-cyan-300 px-3 py-1.5 rounded-full bg-slate-900/60 border border-cyan-800/50">
            ⚡ {energy}
          </span>
          <button onClick={() => setScreen('town')}
            className="font-pixel text-xs px-4 py-2.5 rounded-lg text-red-300 bg-red-900/40 border border-red-500/40 active:scale-95 transition-all">
            ✖ BACK
          </button>
        </div>
      </div>

      {/* ═══ STAGE CHAIN — scrollable ═══ */}
      <div className="flex-1 overflow-y-auto z-10 px-4 pb-6">
        <div className="relative mx-auto max-w-md">

          {/* Gold dotted path */}
          <svg className="absolute left-4 top-0 h-full w-3 pointer-events-none" preserveAspectRatio="none">
            <line x1="6" y1="0" x2="6" y2="100%" stroke="#d9a132" strokeDasharray="6 8" strokeWidth="2" opacity="0.6" />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <circle key={i} cx="6" cy={`${(100 / 6) * i}%`} r="2.5" fill="#fbbf24"
                style={{ filter: 'drop-shadow(0 0 3px rgba(251,191,36,0.6))' }} />
            ))}
          </svg>

          {/* Stage nodes */}
          <div className="flex flex-col gap-4 pl-10">
            {allStages.map((st) => {
              const canEnter = energy >= st.energy
              const isCurrent = currentStage === st.id

              return (
                <div key={st.id} className={`relative transition-all ${isCurrent ? 'scale-[1.02]' : ''}`}>
                  {isCurrent && (
                    <div className="absolute -inset-1.5 rounded-2xl bg-amber-500/15 blur-md animate-pulse pointer-events-none" />
                  )}

                  <button
                    disabled={!canEnter}
                    onClick={() => canEnter && startBattle(st.id)}
                    className={`w-full relative rounded-2xl p-4 transition-all active:scale-[0.97] border-2
                      ${canEnter
                        ? 'border-amber-600/50 bg-gradient-to-b from-amber-900/20 to-slate-900/80'
                        : 'border-slate-700/40 bg-slate-900/40 opacity-50'}`}
                    style={{
                      boxShadow: canEnter ? '0 4px 24px rgba(217,161,50,0.15), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
                    }}>
                    {/* Locked overlay */}
                    {!canEnter && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-slate-950/30 backdrop-blur-[1px]">
                        <span className="font-pixel text-xs text-slate-400">🔒 LOCKED</span>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      {/* Stage sprite emblem */}
                      <div className="mt-0.5 shrink-0">
                        {st.boss ? (
                          <div className="flex flex-col items-center">
                            <CharacterSprite type="guardian" size={48} />
                            <span className="font-pixel text-[7px] text-red-400 mt-0.5">BOSS</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <CharacterSprite type="knight" size={40} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-pixel text-xs text-amber-50 truncate">{st.name}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="font-pixel text-[9px] text-amber-300/70 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded">
                            {st.waves} WAVES
                          </span>
                          <span className="font-pixel text-[9px] text-cyan-300 bg-slate-950/40 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                            ⚡ {st.energy}
                          </span>
                        </div>
                      </div>

                      {/* Difficulty + type */}
                      <div className="flex flex-col items-end gap-1">
                        <span className={`font-pixel text-[9px] px-2 py-0.5 rounded border ${
                          st.boss
                            ? 'border-red-600/60 bg-red-950/40 text-red-300'
                            : 'border-amber-700/40 bg-amber-950/30 text-amber-300'
                        }`}>
                          {st.boss ? 'BOSS' : 'NORMAL'}
                        </span>
                        <div className="flex gap-0.5">
                          {[0, 1, 2].map((i) => {
                            const diff = st.boss ? 3 : st.energy >= 18 ? 3 : st.energy >= 14 ? 2 : 1
                            return (
                              <div key={i} className={`w-2.5 h-1 rounded-sm ${
                                i < diff ? 'bg-amber-500 shadow-[0_0_3px_rgba(245,158,11,0.5)]' : 'bg-slate-700'
                              }`} />
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Gold ornamental corners */}
                    <svg className="absolute top-0 left-0 w-4 h-4 pointer-events-none">
                      <path d="M0 4 L0 0 L4 0" fill="none" stroke="#d9a132" strokeWidth="1.5" opacity="0.5" />
                    </svg>
                    <svg className="absolute top-0 right-0 w-4 h-4 pointer-events-none">
                      <path d="M16 4 L16 0 L12 0" fill="none" stroke="#d9a132" strokeWidth="1.5" opacity="0.5" />
                    </svg>
                    <svg className="absolute bottom-0 left-0 w-4 h-4 pointer-events-none">
                      <path d="M0 12 L0 16 L4 16" fill="none" stroke="#d9a132" strokeWidth="1.5" opacity="0.5" />
                    </svg>
                    <svg className="absolute bottom-0 right-0 w-4 h-4 pointer-events-none">
                      <path d="M16 12 L16 16 L12 16" fill="none" stroke="#d9a132" strokeWidth="1.5" opacity="0.5" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}