'use client'
import { useState } from 'react'
import { useGameStore, type UnitDef } from '@/store/gameStore'
import unitsRaw from '@/game/data/units.json'
import GachaBorder from '@/components/ui/GachaBorder'

const allUnits = unitsRaw as UnitDef[]
const unitDef = (id: number) => allUnits.find((u) => u.id === id)

const ELEM_EMOJI: Record<string, string> = {
  fire: '🔥', ice: '❄️', wind: '💨', earth: '🌿', light: '✨', dark: '🌑',
}

const RARITY_STARS = ['★', '★★', '★★★', '★★★★', '★★★★★']
const ELEM_COLORS: Record<string, string> = {
  fire: 'from-red-900/60 to-red-800/30 border-red-600/40',
  ice: 'from-blue-900/60 to-blue-800/30 border-blue-600/40',
  wind: 'from-emerald-900/60 to-emerald-800/30 border-emerald-600/40',
  earth: 'from-amber-900/60 to-amber-800/30 border-amber-600/40',
  light: 'from-yellow-900/60 to-yellow-800/30 border-yellow-600/40',
  dark: 'from-purple-900/60 to-purple-800/30 border-purple-600/40',
}
const RARITY_BG: Record<number, string> = {
  3: 'from-gray-800/80 to-gray-700/60 border-gray-500/40',
  4: 'from-blue-800/80 to-blue-700/60 border-blue-400/40',
  5: 'from-amber-800/80 to-amber-700/60 border-yellow-400/40',
}

export default function SquadManager() {
  const currentSquad = useGameStore((s) => s.currentSquad)
  const squadInstances = useGameStore((s) => s.squadInstances)
  const unlockedUnits = useGameStore((s) => s.unlockedUnits)
  const setSquadSlot = useGameStore((s) => s.setSquadSlot)
  const setScreen = useGameStore((s) => s.setScreen)

  const [draggingUnit, setDraggingUnit] = useState<string | null>(null)

  return (
    <div className="h-full flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0e27 0%, #0d1530 40%, #080c1a 100%)' }}>
      
      {/* Decorative top glow */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none" />
      <div className="absolute top-0 inset-x-[20%] h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />

      <div className="relative z-10 flex justify-between items-center px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-yellow-700 rounded-full" />
          <h2 className="font-pixel text-[11px] text-yellow-300 drop-shadow-[0_0_6px_rgba(250,204,21,0.3)]">SQUAD</h2>
        </div>
        <button
          onClick={() => setScreen('town')}
          className="font-pixel text-[8px] px-3 py-1.5 rounded-lg text-white"
          style={{
            background: 'linear-gradient(135deg, #dc2626, #991b1b)',
            boxShadow: '0 2px 12px rgba(220,38,38,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          ✖ BACK
        </button>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {/* Squad slots */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {currentSquad.map((instId, i) => {
            const inst = instId ? squadInstances[instId] : null
            const def = inst ? unitDef(inst.unitId) : null
            const rarity = def?.rarity || 3
            return (
              <GachaBorder key={i} variant={rarity >= 5 ? 'rainbow' : rarity >= 4 ? 'gold' : 'crystal'} className="aspect-square">
                <div className={`w-full h-full rounded-xl flex flex-col items-center justify-center ${
                  def ? `bg-gradient-to-b ${RARITY_BG[rarity]}` : 'bg-black/40'
                }`}>
                  {def ? (
                    <>
                      <span className="text-2xl drop-shadow-[0_0_8px_rgba(250,204,21,0.3)]">{ELEM_EMOJI[def.element]}</span>
                      <span className="font-pixel text-[6px] text-white mt-1 truncate w-full text-center px-1">{def.name}</span>
                      <span className="font-pixel text-[4px] mt-0.5" style={{ color: rarity >= 5 ? '#fbbf24' : rarity >= 4 ? '#93c5fd' : '#9ca3af' }}>
                        {RARITY_STARS[rarity - 1] || '★★★★★'}
                      </span>
                      <button
                        onClick={() => setSquadSlot(i, null)}
                        className="font-pixel text-[5px] text-red-400 mt-1 opacity-70 hover:opacity-100"
                      >
                        ✕ REMOVE
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-xl opacity-20 drop-shadow-[0_0_4px_rgba(255,255,255,0.1)]">➕</span>
                      <span className="font-pixel text-[5px] text-slate-500 mt-0.5">SLOT {i + 1}</span>
                    </>
                  )}
                </div>
              </GachaBorder>
            )
          })}
        </div>

        {/* Squad HP/BB detail cards */}
        <div className="space-y-1.5">
          {currentSquad.map((instId, i) => {
            if (!instId) return null
            const inst = squadInstances[instId]
            const def = inst ? unitDef(inst.unitId) : null
            if (!def) return null
            const hpPct = (inst.hp / inst.maxHp) * 100
            return (
              <div
                key={i}
                className={`rounded-xl border ${ELEM_COLORS[def.element]} bg-gradient-to-r ${ELEM_COLORS[def.element]} p-2.5 backdrop-blur-sm`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base drop-shadow-[0_0_6px_rgba(250,204,21,0.3)]">{ELEM_EMOJI[def.element]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-pixel text-[7px] text-white truncate">{def.name}</span>
                      <span className="font-pixel text-[4px]" style={{ color: def.rarity >= 5 ? '#fbbf24' : '#93c5fd' }}>
                        ★{def.rarity}
                      </span>
                    </div>
                    {/* HP bar */}
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-green-400 transition-all"
                          style={{ width: `${hpPct}%` }} />
                      </div>
                      <span className="font-pixel text-[5px] text-green-400">{inst.hp}/{inst.maxHp}</span>
                    </div>
                    {/* BB bar */}
                    <div className="mt-0.5 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-black/50 rounded-full overflow-hidden border border-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all"
                          style={{ width: `${inst.bbGauge}%` }} />
                      </div>
                      <span className="font-pixel text-[5px] text-purple-300">{inst.bbGauge}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <p className="font-pixel text-[6px] text-slate-500 text-center pt-2 border-t border-white/5">
          {Object.keys(unlockedUnits).length} Units Owned
        </p>
      </div>
    </div>
  )
}