'use client'
import { useGameStore } from '@/store/gameStore'

export default function DungeonSelect() {
  const energy = useGameStore((s) => s.energy)
  const startBattle = useGameStore((s) => s.startBattle)
  const setScreen = useGameStore((s) => s.setScreen)

  /* stage data from store */
  const stages = [
    { id: 1, name: 'Slime Fields', waves: 5, cost: 8, boss: false },
    { id: 2, name: 'Mushroom Grove', waves: 6, cost: 10, boss: false },
    { id: 3, name: 'Dark Forest', waves: 7, cost: 12, boss: true },
    { id: 4, name: 'Bat Cave', waves: 7, cost: 12, boss: false },
    { id: 5, name: 'Dragon Lair', waves: 8, cost: 14, boss: true },
    { id: 6, name: 'Frozen Peaks', waves: 8, cost: 14, boss: false },
    { id: 7, name: 'Volcano Core', waves: 9, cost: 16, boss: false },
    { id: 8, name: 'Demon Realm', waves: 9, cost: 16, boss: true },
    { id: 9, name: 'Storm Spire', waves: 10, cost: 18, boss: false },
    { id: 10, name: 'Shadow Citadel', waves: 10, cost: 20, boss: true },
  ]

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-red-950 via-slate-900 to-slate-950 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-pixel text-sm text-red-300">⚔️ DUNGEON</h2>
        <button
          onClick={() => setScreen('town')}
          className="font-pixel text-[8px] px-3 py-1 bg-red-900 border border-red-500 rounded text-red-300"
        >
          ✖ BACK
        </button>
      </div>

      <p className="font-pixel text-[7px] text-cyan-300 mb-3">⚡ Energy: {energy}</p>

      <div className="flex-1 overflow-y-auto space-y-2">
        {stages.map((st) => {
          const canEnter = energy >= st.cost
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
                    {st.waves} waves · {st.cost} energy
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
