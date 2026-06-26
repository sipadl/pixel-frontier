'use client'
import { useGameStore, type UnitDef, type UnitInstance } from '@/store/gameStore'
import CharacterSprite from '@/components/CharacterSprite'
import unitsRaw from '@/game/data/units.json'

const allUnits = unitsRaw as UnitDef[]
const unitDef = (id: number) => allUnits.find((u) => u.id === id)

const ELEM_EMOJI: Record<string, string> = {
  fire: '🔥', ice: '❄️', wind: '💨', earth: '🌿', light: '✨', dark: '🌑',
}

const ELEM_CARD: Record<string, string> = {
  fire: 'border-red-600/30 bg-gradient-to-r from-red-900/30 to-slate-900/80',
  ice: 'border-blue-600/30 bg-gradient-to-r from-blue-900/30 to-slate-900/80',
  wind: 'border-emerald-600/30 bg-gradient-to-r from-emerald-900/30 to-slate-900/80',
  earth: 'border-amber-600/30 bg-gradient-to-r from-amber-900/30 to-slate-900/80',
  light: 'border-yellow-600/30 bg-gradient-to-r from-yellow-900/30 to-slate-900/80',
  dark: 'border-purple-600/30 bg-gradient-to-r from-purple-900/30 to-slate-900/80',
}

const RARITY_CLASS: Record<number, string> = {
  3: 'border-gray-500/40 bg-gradient-to-b from-gray-800/80 to-gray-900/80',
  4: 'border-blue-400/40 bg-gradient-to-b from-blue-800/80 to-slate-900/80',
  5: 'border-yellow-400/40 bg-gradient-to-b from-amber-800/80 to-slate-900/80',
}

const ROLE_MAP: Record<string, string> = {
  warrior: 'knight', knight: 'knight', mage: 'mage', archer: 'archer',
  cleric: 'healer', healer: 'healer', guardian: 'guardian', rogue: 'rogue',
}

export default function SquadManager() {
  const currentSquad = useGameStore((s) => s.currentSquad)
  const squadInstances = useGameStore((s) => s.squadInstances)
  const unlockedUnits = useGameStore((s) => s.unlockedUnits)
  const setSquadSlot = useGameStore((s) => s.setSquadSlot)
  const setScreen = useGameStore((s) => s.setScreen)

  return (
    <div className="h-full flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0e27, #0d1530, #080c1a)' }}>

      {/* Decorative */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none" />

      {/* ═══ HEADER ═══ */}
      <div className="shrink-0 flex justify-between items-center px-4 pt-3 pb-2 z-10">
        <div className="flex items-center gap-2">
          <div className="w-1 h-7 bg-gradient-to-b from-yellow-400 to-yellow-700 rounded-full" />
          <h2 className="font-pixel text-sm text-yellow-300"
            style={{ textShadow: '0 0 6px rgba(250,204,21,0.3)' }}>
            🛡️ SQUAD
          </h2>
        </div>
        <button onClick={() => setScreen('town')}
          className="font-pixel text-xs px-4 py-2.5 rounded-lg text-white active:scale-95 transition-all"
          style={{
            background: 'linear-gradient(135deg, #dc2626, #991b1b)',
            boxShadow: '0 2px 12px rgba(220,38,38,0.3)',
          }}>
          ✖ BACK
        </button>
      </div>

      {/* ═══ SCROLLABLE ═══ */}
      <div className="flex-1 overflow-y-auto z-10 px-4 pb-4 space-y-4">

        {/* Squad slots — BIG grid */}
        <div className="grid grid-cols-3 gap-3">
          {currentSquad.map((instId, i) => {
            const inst = instId ? squadInstances[instId] : null
            const def = inst ? unitDef(inst.unitId) : null
            const rarity = def?.rarity || 3
            const spriteType = def ? ROLE_MAP[def.role] || 'knight' : 'knight'
            const rarityBorder = RARITY_CLASS[rarity] || RARITY_CLASS[3]

            return (
              <button key={i}
                onClick={() => instId && setSquadSlot(i, null)}
                className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 p-2 ${rarityBorder}`}
                style={{
                  boxShadow: rarity >= 4 ? '0 0 16px rgba(217,161,50,0.25)' : 'none',
                }}>
                {def ? (
                  <>
                    <CharacterSprite type={spriteType} size={56} />
                    <span className="font-pixel text-[9px] text-white truncate w-full text-center">{def.name}</span>
                    <span className="font-pixel text-[8px] text-amber-400">★{rarity}</span>
                    <button onClick={(e) => { e.stopPropagation(); setSquadSlot(i, null) }}
                      className="font-pixel text-[7px] text-red-400 mt-0.5 opacity-70 hover:opacity-100">
                      ✕ REMOVE
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-3xl opacity-20">➕</span>
                    <span className="font-pixel text-[8px] text-slate-500">SLOT {i + 1}</span>
                  </>
                )}
              </button>
            )
          })}
        </div>

        {/* Unit detail cards — BIG */}
        <div className="space-y-2">
          {currentSquad.map((instId, i) => {
            if (!instId) return null
            const inst = squadInstances[instId]
            const def = inst ? unitDef(inst.unitId) : null
            if (!def) return null
            const hpPct = (inst.hp / inst.maxHp) * 100
            const borderClass = ELEM_CARD[def.element] || ELEM_CARD.fire
            const spriteType = ROLE_MAP[def.role] || 'knight'

            return (
              <div key={i} className={`rounded-xl border-2 ${borderClass} p-3`}>
                <div className="flex items-center gap-3">
                  <CharacterSprite type={spriteType} size={48} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-xs text-white truncate">{ELEM_EMOJI[def.element]} {def.name}</span>
                      <span className="font-pixel text-[9px] text-amber-400">★{def.rarity}</span>
                    </div>
                    {/* HP bar */}
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-green-400 transition-all"
                          style={{ width: `${hpPct}%` }} />
                      </div>
                      <span className="font-pixel text-[9px] text-green-400">{inst.hp}/{inst.maxHp}</span>
                    </div>
                    {/* BB bar */}
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all"
                          style={{ width: `${inst.bbGauge}%` }} />
                      </div>
                      <span className="font-pixel text-[9px] text-purple-300">{inst.bbGauge}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Count */}
        <p className="font-pixel text-[10px] text-slate-500 text-center pt-2 border-t border-white/5">
          {Object.keys(unlockedUnits).length} Units Owned
        </p>
      </div>
    </div>
  )
}