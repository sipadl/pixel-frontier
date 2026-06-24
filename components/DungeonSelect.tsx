'use client'
import { useGameStore, type StageDef } from '@/store/gameStore'
import stagesRaw from '@/game/data/stages.json'

const allStages = stagesRaw as StageDef[]

export default function DungeonSelect() {
  const energy = useGameStore((s) => s.energy)
  const startBattle = useGameStore((s) => s.startBattle)
  const setScreen = useGameStore((s) => s.setScreen)

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-red-950 via-slate-900 to-slate-950 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-pixel text-sm text-red-300">⚔️ DUNGEON</h2>
        <button
          onClick={() => setScreen('town')}
          className="font-pixel text-[8px] px-3 py-1 bg-red-900 border border-red-500 rounded text-red-300 active:scale-95"
        >
          ✖ BACK
        </button>
      </div>

      <p className="font-pixel text-[7px] text-cyan-300 mb-3">⚡ Energy: {energy}</p>

      <div className="flex-1 overflow-y-auto space-y-2">
        {allStages.map((st) => {
          const canEnter = energy >= st.energy
          return (
            <button
              key={st.id}
              disabled={!canEnter}
              onClick={() => startBattle(st.id)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all active:scale-[0.98] ${
                canEnter
                  ? 'bg-slate-800/60 border-slate-600 hover:border-red-400'
                  : 'bg-slate-900/30 border-slate-800 opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-pixel text-[9px] text-white">
                    {st.boss ? '💀' : '⚔️'} {st.name}
                  </p>
                  <p className="font-pixel text-[6px] text-slate-400 mt-0.5">
                    {st.waves} waves · {st.energy} energy
                  </p>
                </div>
                {st.boss && (
                  <span className="font-pixel text-[6px] px-2 py-0.5 bg-red-900/50 border border-red-500 rounded text-red-300">
                    BOSS
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
