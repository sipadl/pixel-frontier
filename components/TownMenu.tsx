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
    <div
      className="h-full flex flex-col relative overflow-hidden font-pixel"
      style={{
        background: 'linear-gradient(180deg, #0a0e27 0%, #110b2e 30%, #0d0a1f 60%, #050510 100%)',
      }}
    >
      {/* ═══ Animated star particles ═══ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-1 h-1 bg-yellow-200/30 rounded-full animate-twinkle" style={{ top: '8%', left: '15%', animationDelay: '0s' }} />
        <div className="absolute w-1.5 h-1.5 bg-purple-300/20 rounded-full animate-twinkle" style={{ top: '12%', right: '22%', animationDelay: '1.2s' }} />
        <div className="absolute w-0.5 h-0.5 bg-yellow-100/40 rounded-full animate-twinkle" style={{ top: '5%', left: '45%', animationDelay: '2.5s' }} />
        <div className="absolute w-1 h-1 bg-purple-200/25 rounded-full animate-twinkle" style={{ top: '18%', right: '8%', animationDelay: '0.8s' }} />
        <div className="absolute w-0.5 h-0.5 bg-yellow-300/35 rounded-full animate-twinkle" style={{ top: '3%', left: '70%', animationDelay: '1.8s' }} />
      </div>

      {/* ═══════════ TOP HUD BAR ═══════════ */}
      <div className="shrink-0 relative mx-2 mt-2 z-20">
        {/* Ornate gold border container */}
        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            border: '2px solid transparent',
            borderImage: 'linear-gradient(135deg, #d9a132, #f5d478, #d9a132, #b8860b, #d9a132) 1',
            boxShadow: '0 0 12px rgba(217,161,50,0.3), inset 0 0 20px rgba(0,0,0,0.5)',
          }}
        >
          {/* Corner rivets */}
          <div className="absolute top-0 left-0 w-2 h-2 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 z-10" style={{ boxShadow: '0 0 4px rgba(217,161,50,0.8)' }} />
          <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 z-10" style={{ boxShadow: '0 0 4px rgba(217,161,50,0.8)' }} />
          <div className="absolute bottom-0 left-0 w-2 h-2 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 z-10" style={{ boxShadow: '0 0 4px rgba(217,161,50,0.8)' }} />
          <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 z-10" style={{ boxShadow: '0 0 4px rgba(217,161,50,0.8)' }} />

          <div
            className="flex justify-between items-center px-3 py-2"
            style={{
              background: 'linear-gradient(180deg, rgba(15,10,40,0.98) 0%, rgba(10,5,30,0.98) 100%)',
            }}
          >
            {/* Left: Player level with gold ornament */}
            <div className="flex flex-col gap-0.5">
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded"
                style={{
                  background: 'linear-gradient(135deg, rgba(217,161,50,0.15), rgba(184,134,11,0.1))',
                  border: '1px solid rgba(217,161,50,0.4)',
                }}
              >
                <span className="text-yellow-400 text-[8px]">⚔</span>
                <p className="text-[9px] text-yellow-300 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]">Lv.{level}</p>
              </div>
              <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(217,161,50,0.3)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${expPct}%`,
                    background: 'linear-gradient(90deg, #b8860b, #f5d478, #d9a132)',
                    boxShadow: '0 0 6px rgba(245,212,120,0.4)',
                  }}
                />
              </div>
              <p className="text-[6px] text-amber-300/60">{exp}/{expToNext} EXP</p>
            </div>

            {/* Center: Energy bar */}
            <div className="flex flex-col items-center gap-0.5 mx-2">
              <p className="text-[7px] text-cyan-300 drop-shadow-[0_0_4px_rgba(6,182,212,0.5)]">⚡ ENERGY</p>
              <div
                className="w-24 h-3 rounded-full overflow-hidden"
                style={{
                  background: 'rgba(0,0,0,0.6)',
                  border: '1px solid rgba(6,182,212,0.4)',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
                }}
              >
                <div
                  className="h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${energyPct}%`,
                    background: 'linear-gradient(90deg, #0e7490, #06b6d4, #67e8f9)',
                    boxShadow: '0 0 8px rgba(6,182,212,0.4)',
                  }}
                />
              </div>
              <p className="text-[7px] text-cyan-200">{energy}/{maxEnergy}</p>
            </div>

            {/* Right: Gold + Gems */}
            <div className="flex flex-col items-end gap-1">
              <span
                className="text-[8px] px-2 py-0.5 rounded text-yellow-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(217,161,50,0.15), rgba(184,134,11,0.08))',
                  border: '1px solid rgba(217,161,50,0.5)',
                  boxShadow: '0 0 6px rgba(217,161,50,0.15)',
                }}
              >
                🪙 {gold.toLocaleString()}
              </span>
              <span
                className="text-[8px] px-2 py-0.5 rounded text-purple-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(128,50,200,0.08))',
                  border: '1px solid rgba(168,85,247,0.5)',
                  boxShadow: '0 0 6px rgba(168,85,247,0.15)',
                }}
              >
                💎 {gems}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ CENTER CONTENT ═══════════ */}
      <div className="flex-1 flex flex-col items-center justify-between p-4 overflow-hidden relative">

        {/* Animated BG overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 animate-pulse-slow" style={{ background: 'radial-gradient(ellipse at center top, rgba(217,161,50,0.06) 0%, transparent 60%)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-1/3" style={{ background: 'linear-gradient(to top, rgba(5,5,16,0.9), transparent)' }} />
        </div>

        {/* ═══ Hero Character Portrait ═══ */}
        <div className="relative z-10 flex flex-col items-center mb-2 mt-1">
          {/* Ornate portrait frame */}
          <div className="relative">
            {/* Outer golden glow ring */}
            <div
              className="absolute rounded-full animate-pulse-slow"
              style={{
                width: 100,
                height: 100,
                left: -15,
                top: -15,
                background: 'radial-gradient(circle, rgba(217,161,50,0.25) 0%, rgba(168,85,247,0.1) 50%, transparent 70%)',
                filter: 'blur(8px)',
              }}
            />
            {/* Gold filigree ring behind character */}
            <div
              className="absolute rounded-full"
              style={{
                width: 88,
                height: 88,
                left: -6,
                top: -6,
                border: '2px solid rgba(217,161,50,0.3)',
                boxShadow: '0 0 20px rgba(217,161,50,0.2), inset 0 0 15px rgba(217,161,50,0.1)',
              }}
            />
            <div className="animate-bob">
              <PixelArt data={HERO_DOWN_1} palette={PALETTE_DEFAULT} pixelSize={6} />
            </div>
          </div>

          {/* Title with ornate gold styling */}
          <div
            className="mt-3 px-4 py-1.5 rounded"
            style={{
              background: 'linear-gradient(180deg, rgba(217,161,50,0.08) 0%, rgba(0,0,0,0.3) 100%)',
              borderTop: '1px solid rgba(217,161,50,0.3)',
              borderBottom: '1px solid rgba(217,161,50,0.3)',
            }}
          >
            <h1 className="text-lg text-yellow-300 drop-shadow-[0_2px_0_#000,0_0_10px_rgba(250,204,21,0.4)] tracking-wider text-center animate-text-glow">
              PIXEL FRONTIER
            </h1>
          </div>
          <p className="text-[7px] text-amber-300/50 mt-1">⚔️ Squad-Based Pixel RPG ⚔️</p>
        </div>

        {/* ═══ Stat Cards — Ornate gold-bordered ═══ */}
        <div className="relative z-10 grid grid-cols-3 gap-3 w-full max-w-xs mb-4">
          {[
            { label: 'SQUAD', value: `${filledSlots}/6`, icon: '🛡️', glowColor: 'rgba(52,211,153,0.25)' },
            { label: 'UNITS', value: `${totalUnits}`, icon: '👥', glowColor: 'rgba(96,165,250,0.25)' },
            { label: 'ENERGY', value: `${energy}`, icon: '⚡', glowColor: 'rgba(6,182,212,0.25)' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="relative rounded-lg p-2.5 text-center"
              style={{
                background: 'linear-gradient(180deg, rgba(15,10,40,0.9) 0%, rgba(10,5,30,0.95) 100%)',
                border: '1.5px solid rgba(217,161,50,0.35)',
                boxShadow: `0 0 12px ${stat.glowColor}, inset 0 0 10px rgba(0,0,0,0.4)`,
              }}
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
              <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
              <p className="text-[6px] text-amber-300/60 mb-0.5">{stat.label}</p>
              <div className="text-base text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]">
                <span className="text-[8px] mr-0.5">{stat.icon}</span>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* ═══ Menu Buttons — Large ornate panels ═══ */}
        <div className="relative z-10 w-full max-w-xs space-y-2.5">
          {/* QUEST / DUNGEON — primary action */}
          <button
            onClick={() => setScreen('dungeon')}
            disabled={filledSlots === 0}
            className="group w-full relative overflow-hidden font-pixel text-sm py-3.5 rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all duration-200"
            style={{
              background: 'linear-gradient(180deg, rgba(15,10,40,0.9) 0%, rgba(10,5,30,0.95) 100%)',
              border: '2px solid transparent',
              borderImage: 'linear-gradient(135deg, #dc2626, #f87171, #dc2626, #991b1b) 1',
              boxShadow: '0 4px 20px rgba(220,38,38,0.25), inset 0 0 15px rgba(220,38,38,0.08)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none" />
            {/* Gold filigree top/bottom lines */}
            <div className="absolute top-0 left-2 right-2 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(217,161,50,0.4), transparent)' }} />
            <div className="absolute bottom-0 left-2 right-2 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(217,161,50,0.4), transparent)' }} />
            <span className="relative text-red-300 drop-shadow-[0_0_6px_rgba(220,38,38,0.4)]">🗡️ QUEST / DUNGEON</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            {/* SQUAD */}
            <button
              onClick={() => setShowSquad(true)}
              className="group relative overflow-hidden font-pixel text-[10px] py-3 rounded-lg text-white active:scale-95 transition-all duration-200"
              style={{
                background: 'linear-gradient(180deg, rgba(15,10,40,0.9) 0%, rgba(10,5,30,0.95) 100%)',
                border: '2px solid transparent',
                borderImage: 'linear-gradient(135deg, #2563eb, #60a5fa, #2563eb, #1e3a8a) 1',
                boxShadow: '0 4px 16px rgba(37,99,235,0.2), inset 0 0 12px rgba(37,99,235,0.06)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
              <div className="absolute top-0 left-2 right-2 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(217,161,50,0.3), transparent)' }} />
              <span className="relative text-blue-300 drop-shadow-[0_0_4px_rgba(37,99,235,0.4)]">🛡️ SQUAD</span>
            </button>

            {/* SUMMON */}
            <button
              onClick={() => setScreen('summon')}
              className="group relative overflow-hidden font-pixel text-[10px] py-3 rounded-lg text-white active:scale-95 transition-all duration-200"
              style={{
                background: 'linear-gradient(180deg, rgba(15,10,40,0.9) 0%, rgba(10,5,30,0.95) 100%)',
                border: '2px solid transparent',
                borderImage: 'linear-gradient(135deg, #9333ea, #c084fc, #9333ea, #581c87) 1',
                boxShadow: '0 4px 16px rgba(147,51,234,0.2), inset 0 0 12px rgba(147,51,234,0.06)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />
              <div className="absolute top-0 left-2 right-2 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(217,161,50,0.3), transparent)' }} />
              <span className="relative text-purple-300 drop-shadow-[0_0_4px_rgba(147,51,234,0.4)]">🎰 SUMMON</span>
            </button>
          </div>

          {/* INVENTORY */}
          <button
            onClick={() => setShowInventory(true)}
            className="group relative overflow-hidden w-full font-pixel text-[10px] py-2.5 rounded-lg text-white active:scale-95 transition-all duration-200"
            style={{
              background: 'linear-gradient(180deg, rgba(15,10,40,0.9) 0%, rgba(10,5,30,0.95) 100%)',
              border: '2px solid transparent',
              borderImage: 'linear-gradient(135deg, #d97706, #fbbf24, #d97706, #92400e) 1',
              boxShadow: '0 4px 16px rgba(217,119,6,0.18), inset 0 0 12px rgba(217,119,6,0.05)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/8 to-transparent pointer-events-none" />
            <div className="absolute top-0 left-2 right-2 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(217,161,50,0.3), transparent)' }} />
            <span className="relative text-amber-300 drop-shadow-[0_0_4px_rgba(217,119,6,0.3)]">📦 INVENTORY</span>
          </button>

          {/* REFILL ENERGY */}
          <button
            onClick={() => refillEnergy()}
            disabled={energy >= maxEnergy}
            className="w-full font-pixel text-[8px] py-2 rounded-lg disabled:opacity-40 active:scale-95 transition-all hover:bg-white/5 text-cyan-300"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(6,182,212,0.3)',
              boxShadow: 'inset 0 0 8px rgba(6,182,212,0.05)',
            }}
          >
            ⚡ REFILL ENERGY
          </button>
        </div>
      </div>

      {/* ═══════════ BOTTOM NAV BAR ═══════════ */}
      <div className="shrink-0 relative z-20">
        <div
          className="flex justify-around items-center py-2 px-1"
          style={{
            background: 'linear-gradient(180deg, rgba(15,10,40,0.95) 0%, rgba(8,5,25,0.98) 100%)',
            borderTop: '2px solid rgba(217,161,50,0.3)',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.5), 0 -1px 0 rgba(217,161,50,0.15)',
          }}
        >
          {/* Gold filigree line at top */}
          <div
            className="absolute top-0 left-4 right-4 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(217,161,50,0.5), transparent)' }}
          />

          {[
            { icon: '🏠', label: 'Home', action: () => {} },
            { icon: '🛡️', label: 'Squad', action: () => setShowSquad(true) },
            { icon: '🎰', label: 'Summon', action: () => setScreen('summon') },
            { icon: '⚔️', label: 'Dungeon', action: () => { if (filledSlots > 0) setScreen('dungeon') } },
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={tab.action}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded transition-all active:scale-90 hover:bg-white/5"
            >
              <span className="text-base">{tab.icon}</span>
              <span
                className="text-[7px]"
                style={{
                  color: 'rgba(217,161,50,0.7)',
                  textShadow: '0 0 4px rgba(217,161,50,0.3)',
                }}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════ SQUAD OVERLAY ═══════════ */}
      {showSquad && (
        <div
          className="absolute inset-0 z-50 flex flex-col"
          style={{
            background: 'linear-gradient(180deg, rgba(5,3,20,0.97) 0%, rgba(10,5,30,0.98) 100%)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            {/* Header with ornate gold border */}
            <div
              className="flex justify-between items-center mb-4 px-3 py-2 rounded-lg"
              style={{
                background: 'linear-gradient(180deg, rgba(15,10,40,0.8) 0%, rgba(10,5,30,0.9) 100%)',
                border: '1.5px solid rgba(217,161,50,0.35)',
                boxShadow: '0 0 10px rgba(217,161,50,0.1), inset 0 0 10px rgba(0,0,0,0.3)',
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
                <h2 className="text-sm text-yellow-300 drop-shadow-[0_0_8px_rgba(217,161,50,0.3)]">🛡️ SQUAD MANAGEMENT</h2>
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
              </div>
              <button
                onClick={() => { setShowSquad(false); setSelectedUnit(null) }}
                className="font-pixel text-[8px] px-3 py-1 rounded text-red-300 active:scale-95"
                style={{
                  background: 'linear-gradient(180deg, rgba(180,30,30,0.4) 0%, rgba(120,20,20,0.4) 100%)',
                  border: '1px solid rgba(239,68,68,0.4)',
                  boxShadow: 'inset 0 0 8px rgba(0,0,0,0.3)',
                }}
              >
                ✖ CLOSE
              </button>
            </div>

            {/* 2x3 Squad Slots — ornate gold-bordered */}
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
                    className="aspect-square rounded-lg flex flex-col items-center justify-center text-center p-1 transition-all active:scale-95"
                    style={{
                      background: def
                        ? 'linear-gradient(180deg, rgba(15,10,40,0.9) 0%, rgba(10,5,30,0.95) 100%)'
                        : selectedUnit
                          ? 'rgba(217,161,50,0.08)'
                          : 'rgba(0,0,0,0.3)',
                      border: def
                        ? '1.5px solid rgba(217,161,50,0.4)'
                        : selectedUnit
                          ? '1.5px dashed rgba(217,161,50,0.6)'
                          : '1.5px dashed rgba(217,161,50,0.15)',
                      boxShadow: def
                        ? '0 0 12px rgba(217,161,50,0.15), inset 0 0 8px rgba(0,0,0,0.3)'
                        : 'none',
                      animation: selectedUnit && !def ? 'pulse 2s infinite' : undefined,
                    }}
                  >
                    {def ? (
                      <>
                        <span className="text-lg">{ELEM_EMOJI[def.element]}</span>
                        <span className="text-[6px] text-white truncate w-full mt-0.5">{def.name}</span>
                        <span className="text-[5px] text-amber-300/60">★{def.rarity}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl opacity-30">➕</span>
                        <span className="text-[6px] text-amber-300/40">Slot {slotIdx + 1}</span>
                      </>
                    )}
                  </button>
                )
              })}
            </div>

            {selectedUnit && (
              <p className="text-[7px] text-yellow-300 text-center mb-2 animate-pulse drop-shadow-[0_0_4px_rgba(217,161,50,0.3)]">
                👆 Tap a slot to place unit
              </p>
            )}

            {/* Unit grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(217,161,50,0.3), transparent)' }} />
                <p className="text-[8px] text-amber-300/60">OWNED UNITS ({ownedInstances.length})</p>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(217,161,50,0.3), transparent)' }} />
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {ownedInstances.map(({ instId, unitId, name, rarity, element }) => {
                  const inSlot = currentSquad.indexOf(instId)
                  const isSelected = selectedUnit === instId
                  return (
                    <button
                      key={instId}
                      onClick={() => setSelectedUnit(isSelected ? null : instId)}
                      className="flex flex-col items-center p-1.5 rounded-lg transition-all"
                      style={{
                        background: isSelected
                          ? 'linear-gradient(180deg, rgba(217,161,50,0.2) 0%, rgba(217,161,50,0.05) 100%)'
                          : 'linear-gradient(180deg, rgba(15,10,40,0.8) 0%, rgba(10,5,30,0.9) 100%)',
                        border: isSelected
                          ? '1.5px solid rgba(217,161,50,0.7)'
                          : `${RARITY_COLORS[rarity] ? '1.5px' : '1.5px'} solid`,
                        borderColor: isSelected ? undefined : inSlot !== -1 ? 'rgba(100,100,100,0.3)' : 'rgba(217,161,50,0.2)',
                        boxShadow: isSelected
                          ? '0 0 12px rgba(217,161,50,0.25), inset 0 0 8px rgba(217,161,50,0.1)'
                          : '0 0 4px rgba(0,0,0,0.3)',
                        opacity: inSlot !== -1 ? 0.5 : 1,
                        transform: isSelected ? 'scale(1.05)' : undefined,
                      }}
                    >
                      <span className="text-sm">{ELEM_EMOJI[element]}</span>
                      <span className="text-[5px] text-white truncate w-full text-center">{name}</span>
                      {inSlot !== -1 && (
                        <span className="text-[4px] text-yellow-300/70">Slot {inSlot + 1}</span>
                      )}
                    </button>
                  )
                })}
                {ownedInstances.length === 0 && (
                  <p className="col-span-4 text-[8px] text-amber-300/40 text-center py-4">
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
        <div
          className="absolute inset-0 z-50 flex flex-col p-4"
          style={{
            background: 'linear-gradient(180deg, rgba(5,3,20,0.97) 0%, rgba(10,5,30,0.98) 100%)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Header */}
          <div
            className="flex justify-between items-center mb-4 px-3 py-2 rounded-lg"
            style={{
              background: 'linear-gradient(180deg, rgba(15,10,40,0.8) 0%, rgba(10,5,30,0.9) 100%)',
              border: '1.5px solid rgba(217,161,50,0.35)',
              boxShadow: '0 0 10px rgba(217,161,50,0.1), inset 0 0 10px rgba(0,0,0,0.3)',
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
              <h2 className="text-sm text-amber-300 drop-shadow-[0_0_8px_rgba(217,161,50,0.3)]">📦 INVENTORY</h2>
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
            </div>
            <button
              onClick={() => setShowInventory(false)}
              className="font-pixel text-[8px] px-3 py-1 rounded text-red-300 active:scale-95"
              style={{
                background: 'linear-gradient(180deg, rgba(180,30,30,0.4) 0%, rgba(120,20,20,0.4) 100%)',
                border: '1px solid rgba(239,68,68,0.4)',
                boxShadow: 'inset 0 0 8px rgba(0,0,0,0.3)',
              }}
            >
              ✖ CLOSE
            </button>
          </div>

          {/* Empty state */}
          <div className="flex-1 flex items-center justify-center">
            <div
              className="px-6 py-8 rounded-lg text-center"
              style={{
                background: 'linear-gradient(180deg, rgba(15,10,40,0.5) 0%, rgba(10,5,30,0.6) 100%)',
                border: '1.5px dashed rgba(217,161,50,0.2)',
              }}
            >
              <p className="text-[8px] text-amber-300/40">No materials yet.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
