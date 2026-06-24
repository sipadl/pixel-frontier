'use client'
import { useState } from 'react'
import { useGameStore, type UnitDef } from '@/store/gameStore'
import PixelArt, { HERO_DOWN_1, PALETTE_DEFAULT } from '@/components/PixelArt'

/* ── inline unit data lookup ── */
import unitsRaw from '@/game/data/units.json'
const allUnits = unitsRaw as UnitDef[]

function unitDef(id: number): UnitDef | undefined {
  return allUnits.find((u) => u.id === id)
}

/* ── rarity badge colors ── */
const RARITY_COLORS: Record<number, string> = {
  3: 'border-gray-400 bg-gray-800/60',
  4: 'border-blue-400 bg-blue-900/60',
  5: 'border-yellow-400 bg-yellow-900/60 animate-pulse-glow',
}

/* ── element emoji ── */
const ELEM_EMOJI: Record<string, string> = {
  fire: '🔥',
  ice: '❄️',
  wind: '💨',
  earth: '🌿',
  light: '✨',
  dark: '🌑',
}

export default function TownMenu() {
  const gems = useGameStore((s) => s.gems)
  const gold = useGameStore((s) => s.gold)
  const energy = useGameStore((s) => s.energy)
  const maxEnergy = useGameStore((s) => s.maxEnergy)
  const level = useGameStore((s) => s.level)
  const exp = useGameStore((s) => s.exp)
  const expToNext = useGameStore((s) => s.expToNext)
  const currentSquad = useGameStore((s) => s.currentSquad)
  const squadInstances = useGameStore((s) => s.squadInstances)
  const unlockedUnits = useGameStore((s) => s.unlockedUnits)
  const setSquadSlot = useGameStore((s) => s.setSquadSlot)
  const setScreen = useGameStore((s) => s.setScreen)
  const refillEnergy = useGameStore((s) => s.refillEnergy)

  const [showSquad, setShowSquad] = useState(false)
  const [showInventory, setShowInventory] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null) // instanceId

  const filledSlots = currentSquad.filter((id) => id !== null).length
  const totalUnits = Object.keys(unlockedUnits).length
  const energyPct = (energy / maxEnergy) * 100
  const expPct = (exp / expToNext) * 100

  /* ── build list of all owned instance IDs ── */
  const ownedInstances: { instId: string; unitId: number; name: string; rarity: number; element: string }[] = []
  for (const instId of Object.keys(squadInstances)) {
    const inst = squadInstances[instId]
    const def = unitDef(inst.unitId)
    if (def) {
      ownedInstances.push({ instId, unitId: inst.unitId, name: def.name, rarity: def.rarity, element: def.element })
    }
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 relative">
      {/* ═══════════ HEADER (top ~10%) ═══════════ */}
      <div className="flex justify-between items-center p-3 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 shrink-0">
        {/* Left: Player info */}
        <div className="flex flex-col gap-0.5">
          <p className="font-pixel text-[9px] text-yellow-400">★ Lv.{level}</p>
          <div className="w-20 h-1.5 bg-gray-950 rounded-full overflow-hidden border border-slate-600">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
              style={{ width: `${expPct}%` }}
            />
          </div>
          <p className="font-pixel text-[6px] text-slate-500">{exp}/{expToNext} EXP</p>
        </div>

        {/* Center: Energy Bar */}
        <div className="flex flex-col items-center gap-0.5 mx-4">
          <p className="font-pixel text-[7px] text-cyan-300">⚡ ENERGY</p>
          <div className="w-28 h-3 bg-gray-950 rounded-full overflow-hidden border border-cyan-700">
            <div
              className="h-full transition-all duration-300 rounded-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-300"
              style={{ width: `${energyPct}%` }}
            />
          </div>
          <p className="font-pixel text-[7px] text-cyan-200">{energy}/{maxEnergy}</p>
        </div>

        {/* Right: Currency */}
        <div className="flex flex-col items-end gap-1">
          <span className="font-pixel text-[8px] bg-yellow-900/50 px-2 py-0.5 rounded border border-yellow-600 text-yellow-300">
            🪙 {gold.toLocaleString()}
          </span>
          <span className="font-pixel text-[8px] bg-purple-900/50 px-2 py-0.5 rounded border border-purple-500 text-purple-300">
            💎 {gems}
          </span>
        </div>
      </div>

      {/* ═══════════ CENTER MENU (center ~75%) ═══════════ */}
      <div className="flex-1 flex flex-col items-center justify-between p-4 overflow-hidden">
        {/* Village BG */}
        <div className="absolute inset-0 top-[10%] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-slate-900/40 to-slate-950" />
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
          {/* decorative trees */}
          <div className="absolute bottom-[28%] left-[8%] text-3xl opacity-30">🌲</div>
          <div className="absolute bottom-[30%] right-[12%] text-2xl opacity-25">🌳</div>
          <div className="absolute bottom-[32%] left-[50%] text-2xl opacity-20">🏡</div>
        </div>

        {/* Hero preview */}
        <div className="relative z-10 flex flex-col items-center mb-4 mt-2">
          <div className="animate-bob">
            <PixelArt data={HERO_DOWN_1} palette={PALETTE_DEFAULT} pixelSize={6} />
          </div>
          <h1 className="font-pixel text-lg text-yellow-300 drop-shadow-[0_2px_0_#000] tracking-wider mt-2">
            PIXEL FRONTIER
          </h1>
          <p className="font-pixel text-[7px] text-slate-400 mt-1">⚔️ Squad-Based Pixel RPG ⚔️</p>
        </div>

        {/* Stats row */}
        <div className="relative z-10 grid grid-cols-3 gap-2 w-full max-w-xs mb-4">
          <div className="bg-black/50 border border-slate-600 rounded p-2 text-center">
            <p className="font-pixel text-[6px] text-slate-400">SQUAD</p>
            <p className="font-pixel text-sm text-green-400">{filledSlots}/6</p>
          </div>
          <div className="bg-black/50 border border-slate-600 rounded p-2 text-center">
            <p className="font-pixel text-[6px] text-slate-400">UNITS</p>
            <p className="font-pixel text-sm text-blue-400">{totalUnits}</p>
          </div>
          <div className="bg-black/50 border border-slate-600 rounded p-2 text-center">
            <p className="font-pixel text-[6px] text-slate-400">ENERGY</p>
            <p className="font-pixel text-sm text-cyan-400">{energy}</p>
          </div>
        </div>

        {/* ═══════════ MENU BUTTONS ═══════════ */}
        <div className="relative z-10 w-full space-y-2">
          <button
            onClick={() => setScreen('dungeon')}
            disabled={filledSlots === 0}
            className="w-full font-pixel text-sm py-3 bg-gradient-to-b from-red-600 to-red-800 border-2 border-red-400 rounded-lg text-white shadow-lg shadow-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            🗡️ QUEST / DUNGEON
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowSquad(true)}
              className="font-pixel text-[10px] py-3 bg-gradient-to-b from-blue-600 to-blue-800 border-2 border-blue-400 rounded-lg text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
            >
              🛡️ SQUAD
            </button>
            <button
              onClick={() => setScreen('summon')}
              className="font-pixel text-[10px] py-3 bg-gradient-to-b from-purple-600 to-purple-800 border-2 border-purple-400 rounded-lg text-white shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
            >
              🎰 SUMMON
            </button>
          </div>

          <button
            onClick={() => setShowInventory(true)}
            className="w-full font-pixel text-[10px] py-2.5 bg-gradient-to-b from-amber-700 to-amber-900 border-2 border-amber-500 rounded-lg text-white shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            📦 INVENTORY
          </button>

          <button
            onClick={() => refillEnergy()}
            disabled={energy >= maxEnergy}
            className="w-full font-pixel text-[8px] py-2 bg-gray-800 border border-cyan-700 rounded text-cyan-300 disabled:opacity-40 active:scale-95 transition-all"
          >
            ⚡ REFILL ENERGY
          </button>
        </div>
      </div>

      {/* ═══════════ SQUAD MANAGEMENT OVERLAY ═══════════ */}
      {showSquad && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col">
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-pixel text-sm text-blue-300">🛡️ SQUAD MANAGEMENT</h2>
              <button
                onClick={() => { setShowSquad(false); setSelectedUnit(null) }}
                className="font-pixel text-[8px] px-3 py-1 bg-red-900 border border-red-500 rounded text-red-300 active:scale-95"
              >
                ✖ CLOSE
              </button>
            </div>

            {/* 6 Squad Slots (2x3 grid) */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {currentSquad.map((instId, slotIdx) => {
                const inst = instId ? squadInstances[instId] : null
                const def = inst ? unitDef(inst.unitId) : null
                return (
                  <button
                    key={slotIdx}
                    onClick={() => {
                      if (selectedUnit) {
                        // place selected unit into this slot
                        setSquadSlot(slotIdx, selectedUnit)
                        setSelectedUnit(null)
                      } else if (instId) {
                        // remove from slot
                        setSquadSlot(slotIdx, null)
                      }
                    }}
                    className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-center p-1 transition-all active:scale-95 ${
                      def
                        ? `bg-gradient-to-b from-slate-800 to-slate-900 border-${def.element === 'fire' ? 'red' : def.element === 'ice' ? 'cyan' : def.element === 'wind' ? 'teal' : def.element === 'earth' ? 'green' : def.element === 'light' ? 'yellow' : 'purple'}-500`
                        : selectedUnit
                          ? 'bg-slate-800/60 border-dashed border-cyan-500 animate-pulse'
                          : 'bg-slate-900/40 border-dashed border-slate-600'
                    }`}
                  >
                    {def ? (
                      <>
                        <span className="text-lg">{ELEM_EMOJI[def.element]}</span>
                        <span className="font-pixel text-[6px] text-white truncate w-full">{def.name}</span>
                        <span className="font-pixel text-[5px] text-slate-400">★{def.rarity}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl opacity-30">➕</span>
                        <span className="font-pixel text-[6px] text-slate-500">Slot {slotIdx + 1}</span>
                      </>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Instruction */}
            {selectedUnit && (
              <p className="font-pixel text-[7px] text-cyan-400 text-center mb-2 animate-pulse">
                👆 Tap a slot to place unit, or tap unit again to deselect
              </p>
            )}

            {/* Owned Units List */}
            <div className="flex-1 overflow-y-auto">
              <p className="font-pixel text-[8px] text-slate-400 mb-2">
                OWNED UNITS ({ownedInstances.length})
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {ownedInstances.map(({ instId, unitId, name, rarity, element }) => {
                  const inSlot = currentSquad.indexOf(instId)
                  const isSelected = selectedUnit === instId
                  return (
                    <button
                      key={instId}
                      onClick={() => setSelectedUnit(isSelected ? null : instId)}
                      className={`flex flex-col items-center p-1.5 rounded border transition-all ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-900/40 scale-105'
                          : inSlot !== -1
                            ? `${RARITY_COLORS[rarity]} opacity-50`
                            : RARITY_COLORS[rarity]
                      }`}
                    >
                      <span className="text-sm">{ELEM_EMOJI[element]}</span>
                      <span className="font-pixel text-[5px] text-white truncate w-full text-center">{name}</span>
                      {inSlot !== -1 && (
                        <span className="font-pixel text-[4px] text-cyan-400">Slot {inSlot + 1}</span>
                      )}
                    </button>
                  )
                })}
                {ownedInstances.length === 0 && (
                  <p className="col-span-4 font-pixel text-[8px] text-slate-500 text-center py-4">
                    No units yet. Visit the Summon Gate!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ INVENTORY OVERLAY ═══════════ */}
      {showInventory && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-pixel text-sm text-amber-300">📦 INVENTORY</h2>
            <button
              onClick={() => setShowInventory(false)}
              className="font-pixel text-[8px] px-3 py-1 bg-red-900 border border-red-500 rounded text-red-300 active:scale-95"
            >
              ✖ CLOSE
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="font-pixel text-[8px] text-slate-500">No materials yet.</p>
          </div>
        </div>
      )}
    </div>
  )
}
