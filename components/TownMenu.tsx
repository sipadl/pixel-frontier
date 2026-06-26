'use client'
import { useState } from 'react'
import { useGameStore, type UnitDef } from '@/store/gameStore'
import PixelArt, { HERO_DOWN_1, PALETTE_DEFAULT } from '@/components/PixelArt'
import GachaBorder from '@/components/ui/GachaBorder'

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
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-black relative overflow-hidden">

      {/* ═══ Animated star particles ═══ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-1 h-1 bg-white/30 rounded-full animate-twinkle" style={{ top: '8%', left: '15%', animationDelay: '0s' }} />
        <div className="absolute w-1.5 h-1.5 bg-white/20 rounded-full animate-twinkle" style={{ top: '12%', right: '22%', animationDelay: '1.2s' }} />
        <div className="absolute w-0.5 h-0.5 bg-white/40 rounded-full animate-twinkle" style={{ top: '5%', left: '45%', animationDelay: '2.5s' }} />
        <div className="absolute w-1 h-1 bg-white/25 rounded-full animate-twinkle" style={{ top: '18%', right: '8%', animationDelay: '0.8s' }} />
        <div className="absolute w-0.5 h-0.5 bg-white/35 rounded-full animate-twinkle" style={{ top: '3%', left: '70%', animationDelay: '1.8s' }} />
      </div>

      {/* ═══════════ PREMIUM HEADER ═══════════ */}
      <GachaBorder variant="crystal" className="shrink-0 mx-2 mt-2">
        <div className="flex justify-between items-center px-3 py-2 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95">
          {/* Left: Player info */}
          <div className="flex flex-col gap-0.5">
            <p className="font-pixel text-[9px] text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.5)]">★ Lv.{level}</p>
            <div className="w-20 h-1.5 bg-gray-950 rounded-full overflow-hidden border border-slate-600 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-300 transition-all shadow-[0_0_6px_rgba(52,211,153,0.4)]"
                style={{ width: `${expPct}%` }}
              />
            </div>
            <p className="font-pixel text-[6px] text-slate-400">{exp}/{expToNext} EXP</p>
          </div>

          {/* Center: Energy */}
          <div className="flex flex-col items-center gap-0.5 mx-2">
            <p className="font-pixel text-[7px] text-cyan-300 drop-shadow-[0_0_4px_rgba(6,182,212,0.5)]">⚡ ENERGY</p>
            <div className="w-24 h-3 bg-gray-950 rounded-full overflow-hidden border border-cyan-700 shadow-inner">
              <div
                className="h-full transition-all duration-300 rounded-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                style={{ width: `${energyPct}%` }}
              />
            </div>
            <p className="font-pixel text-[7px] text-cyan-200">{energy}/{maxEnergy}</p>
          </div>

          {/* Right: Currency */}
          <div className="flex flex-col items-end gap-1">
            <span className="font-pixel text-[8px] bg-gradient-to-r from-yellow-900/60 to-yellow-800/40 px-2 py-0.5 rounded border border-yellow-600/60 text-yellow-300 shadow-[0_0_6px_rgba(234,179,8,0.15)]">
              🪙 {gold.toLocaleString()}
            </span>
            <span className="font-pixel text-[8px] bg-gradient-to-r from-purple-900/60 to-purple-800/40 px-2 py-0.5 rounded border border-purple-500/60 text-purple-300 shadow-[0_0_6px_rgba(168,85,247,0.15)]">
              💎 {gems}
            </span>
          </div>
        </div>
      </GachaBorder>

      {/* ═══════════ CENTER ═══════════ */}
      <div className="flex-1 flex flex-col items-center justify-between p-4 overflow-hidden relative">

        {/* Animated BG gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/15 via-slate-900/40 to-transparent animate-pulse-slow" />
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black via-slate-950/80 to-transparent" />
        </div>

        {/* Hero + Title */}
        <div className="relative z-10 flex flex-col items-center mb-2 mt-1">
          {/* Hero glow ring */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-yellow-400/20 to-transparent blur-xl animate-pulse-slow" style={{ width: 80, height: 80, left: -10, top: -10 }} />
            <div className="animate-bob">
              <PixelArt data={HERO_DOWN_1} palette={PALETTE_DEFAULT} pixelSize={6} />
            </div>
          </div>
          <h1 className="font-pixel text-lg text-yellow-300 drop-shadow-[0_2px_0_#000] tracking-wider mt-2 animate-text-glow">
            PIXEL FRONTIER
          </h1>
          <p className="font-pixel text-[7px] text-slate-400 mt-1">⚔️ Squad-Based Pixel RPG ⚔️</p>
        </div>

        {/* Stats row — glass cards */}
        <div className="relative z-10 grid grid-cols-3 gap-3 w-full max-w-xs mb-4">
          {[
            { label: 'SQUAD', value: `${filledSlots}/6`, color: 'text-green-400', border: 'border-green-600/30', glow: 'rgba(52,211,153,0.1)' },
            { label: 'UNITS', value: `${totalUnits}`, color: 'text-blue-400', border: 'border-blue-600/30', glow: 'rgba(96,165,250,0.1)' },
            { label: 'ENERGY', value: `${energy}`, color: 'text-cyan-400', border: 'border-cyan-600/30', glow: 'rgba(6,182,212,0.1)' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="backdrop-blur-md bg-white/5 rounded-xl p-2.5 text-center border border-white/10 shadow-lg"
              style={{ boxShadow: `0 0 20px ${stat.glow}, inset 0 1px 0 rgba(255,255,255,0.08)` }}
            >
              <p className="font-pixel text-[6px] text-slate-400 mb-0.5">{stat.label}</p>
              <p className={`font-pixel text-base ${stat.color} drop-shadow-[0_0_6px_${stat.color === 'text-green-400' ? 'rgba(52,211,153,0.4)' : stat.color === 'text-blue-400' ? 'rgba(96,165,250,0.4)' : 'rgba(6,182,212,0.4)'}]`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ═══ PREMIUM MENU BUTTONS ═══ */}
        <div className="relative z-10 w-full max-w-xs space-y-2.5">
          <button
            onClick={() => setScreen('dungeon')}
            disabled={filledSlots === 0}
            className="group w-full relative overflow-hidden font-pixel text-sm py-3.5 rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #dc2626, #991b1b, #dc2626)',
              boxShadow: '0 4px 24px rgba(220,38,38,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <span className="relative">🗡️ QUEST / DUNGEON</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setShowSquad(true)}
              className="group relative overflow-hidden font-pixel text-[10px] py-3 rounded-xl text-white active:scale-95 transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #1e3a8a, #2563eb)',
                boxShadow: '0 4px 20px rgba(37,99,235,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              <span className="relative">🛡️ SQUAD</span>
            </button>
            <button
              onClick={() => setScreen('summon')}
              className="group relative overflow-hidden font-pixel text-[10px] py-3 rounded-xl text-white active:scale-95 transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #9333ea, #581c87, #9333ea)',
                boxShadow: '0 4px 20px rgba(147,51,234,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              <span className="relative">🎰 SUMMON</span>
            </button>
          </div>

          <button
            onClick={() => setShowInventory(true)}
            className="group relative overflow-hidden w-full font-pixel text-[10px] py-2.5 rounded-xl text-white active:scale-95 transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #d97706, #92400e, #d97706)',
              boxShadow: '0 4px 20px rgba(217,119,6,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <span className="relative">📦 INVENTORY</span>
          </button>

          <button
            onClick={() => refillEnergy()}
            disabled={energy >= maxEnergy}
            className="w-full font-pixel text-[8px] py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-cyan-700/40 text-cyan-300 disabled:opacity-40 active:scale-95 transition-all hover:bg-white/10"
          >
            ⚡ REFILL ENERGY
          </button>
        </div>
      </div>

      {/* ═══════════ SQUAD OVERLAY ═══════════ */}
      {showSquad && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col">
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-pixel text-sm text-blue-300 drop-shadow-[0_0_8px_rgba(96,165,250,0.3)]">🛡️ SQUAD MANAGEMENT</h2>
              <button
                onClick={() => { setShowSquad(false); setSelectedUnit(null) }}
                className="font-pixel text-[8px] px-3 py-1 bg-red-900/60 border border-red-500/50 rounded text-red-300 active:scale-95 backdrop-blur-sm"
              >
                ✖ CLOSE
              </button>
            </div>

            {/* 2x3 Squad Slots — glass */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {currentSquad.map((instId, slotIdx) => {
                const inst = instId ? squadInstances[instId] : null
                const def = inst ? unitDef(inst.unitId) : null
                return (
                  <button
                    key={slotIdx}
                    onClick={() => {
                      if (selectedUnit) {
                        setSquadSlot(slotIdx, selectedUnit)
                        setSelectedUnit(null)
                      } else if (instId) {
                        setSquadSlot(slotIdx, null)
                      }
                    }}
                    className={`aspect-square rounded-xl backdrop-blur-sm border-2 flex flex-col items-center justify-center text-center p-1 transition-all active:scale-95 ${
                      def
                        ? 'bg-white/5 border-white/20 shadow-lg shadow-cyan-900/10'
                        : selectedUnit
                          ? 'bg-white/10 border-dashed border-cyan-400/60 animate-pulse'
                          : 'bg-white/[0.02] border-dashed border-white/10'
                    }`}
                  >
                    {def ? (
                      <>
                        <span className="text-lg">{ELEM_EMOJI[def.element]}</span>
                        <span className="font-pixel text-[6px] text-white truncate w-full mt-0.5">{def.name}</span>
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

            {selectedUnit && (
              <p className="font-pixel text-[7px] text-cyan-400 text-center mb-2 animate-pulse">
                👆 Tap a slot to place unit
              </p>
            )}

            {/* Unit grid */}
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
                      className={`flex flex-col items-center p-1.5 rounded-lg border transition-all backdrop-blur-sm ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-900/40 scale-105 shadow-lg shadow-cyan-500/20'
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
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-pixel text-sm text-amber-300 drop-shadow-[0_0_8px_rgba(217,119,6,0.3)]">📦 INVENTORY</h2>
            <button
              onClick={() => setShowInventory(false)}
              className="font-pixel text-[8px] px-3 py-1 bg-red-900/60 border border-red-500/50 rounded text-red-300 active:scale-95 backdrop-blur-sm"
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