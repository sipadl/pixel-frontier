'use client'
import { useGameStore, type UnitDef } from '@/store/gameStore'
import unitsRaw from '@/game/data/units.json'

const allUnits = unitsRaw as UnitDef[]
const unitDef = (id: number) => allUnits.find((u) => u.id === id)

const ELEM_EMOJI: Record<string, string> = {
  fire: '🔥', ice: '❄️', wind: '💨', earth: '🌿', light: '✨', dark: '🌑',
}

export default function SquadManager() {
  const currentSquad = useGameStore((s) => s.currentSquad)
  const squadInstances = useGameStore((s) => s.squadInstances)
  const unlockedUnits = useGameStore((s) => s.unlockedUnits)
  const setSquadSlot = useGameStore((s) => s.setSquadSlot)
  const setScreen = useGameStore((s) => s.setScreen)

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-800 to-slate-950 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-pixel text-sm text-blue-300">🛡️ SQUAD</h2>
        <button
          onClick={() => setScreen('town')}
          className="font-pixel text-[8px] px-3 py-1 bg-red-900 border border-red-500 rounded text-red-300"
        >
          ✖ BACK
        </button>
      </div>

      {/* 6 slots */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {currentSquad.map((instId, i) => {
          const inst = instId ? squadInstances[instId] : null
          const def = inst ? unitDef(inst.unitId) : null
          return (
            <div key={i} className="aspect-square rounded-lg border-2 border-slate-600 bg-slate-900/50 flex flex-col items-center justify-center p-1">
              {def ? (
                <>
                  <span className="text-2xl">{ELEM_EMOJI[def.element]}</span>
                  <span className="font-pixel text-[7px] text-white">{def.name}</span>
                  <button
                    onClick={() => setSquadSlot(i, null)}
                    className="font-pixel text-[6px] text-red-400 mt-1"
                  >
                    REMOVE
                  </button>
                </>
              ) : (
                <>
                  <span className="text-xl opacity-20">➕</span>
                  <span className="font-pixel text-[6px] text-slate-500">Empty</span>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* HP/BB summary */}
      <div className="space-y-1 mb-4">
        {currentSquad.map((instId, i) => {
          if (!instId) return null
          const inst = squadInstances[instId]
          const def = inst ? unitDef(inst.unitId) : null
          if (!def) return null
          return (
            <div key={i} className="flex items-center gap-2 text-[7px] font-pixel bg-slate-800/50 rounded px-2 py-1">
              <span>{ELEM_EMOJI[def.element]}</span>
              <span className="text-white">{def.name}</span>
              <span className="text-green-400 ml-auto">HP {inst.hp}/{inst.maxHp}</span>
              <span className="text-yellow-400">BB {inst.bbGauge}%</span>
            </div>
          )
        })}
      </div>

      <p className="font-pixel text-[7px] text-slate-500 text-center">
        {Object.keys(unlockedUnits).length} units owned
      </p>
    </div>
  )
}
