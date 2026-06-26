'use client'
import { useState } from 'react'
import { useGameStore, type UnitDef } from '@/store/gameStore'
import CharacterSprite from '@/components/CharacterSprite'

import unitsRaw from '@/game/data/units.json'
const allUnits = unitsRaw as UnitDef[]
function unitDef(id: number): UnitDef | undefined {
  return allUnits.find((u) => u.id === id)
}

const ELEM_EMOJI: Record<string, string> = {
  fire: '🔥', ice: '❄️', wind: '💨', earth: '🌿', light: '✨', dark: '🌑',
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
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null)

  const filledSlots = currentSquad.filter((id) => id !== null).length
  const totalUnits = Object.keys(unlockedUnits).length
  const energyPct = (energy / maxEnergy) * 100
  const expPct = (exp / expToNext) * 100

  const ownedInstances: { instId: string; unitId: number; name: string; rarity: number; element: string; role: string }[] = []
  for (const instId of Object.keys(squadInstances)) {
    const inst = squadInstances[instId]
    const def = unitDef(inst.unitId)
    if (def) ownedInstances.push({ instId, unitId: inst.unitId, name: def.name, rarity: def.rarity, element: def.element, role: def.role })
  }

  return (
    <div className="h-full flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0e27 0%, #0d0a1f 100%)' }}>

      {/* ═══ TOP HUD — sticky ═══ */}
      <div className="shrink-0 px-3 pt-3 pb-2 z-20"
        style={{
          background: 'linear-gradient(180deg, rgba(10,14,39,0.98), rgba(10,14,39,0.9))',
          borderBottom: '2px solid rgba(217,161,50,0.3)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.6)',
        }}>
        <div className="flex justify-between items-center">
          {/* Level */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-900/30 border border-amber-600/40">
              <span className="text-yellow-400 text-sm">⚔️</span>
              <span className="font-pixel text-xs text-yellow-300">Lv.{level}</span>
            </div>
            <div className="w-24 h-2 bg-black/60 rounded-full overflow-hidden border border-amber-700/30">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-700 to-yellow-400 transition-all"
                style={{ width: `${expPct}%` }} />
            </div>
            <span className="font-pixel text-[8px] text-amber-400/60">{exp}/{expToNext} EXP</span>
          </div>

          {/* Energy */}
          <div className="flex flex-col items-center gap-1">
            <span className="font-pixel text-[10px] text-cyan-300">⚡ ENERGY</span>
            <div className="w-32 h-3 bg-black/60 rounded-full overflow-hidden border border-cyan-700/40">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-700 to-cyan-300 transition-all"
                style={{ width: `${energyPct}%` }} />
            </div>
            <span className="font-pixel text-[9px] text-cyan-200">{energy}/{maxEnergy}</span>
          </div>

          {/* Currency */}
          <div className="flex flex-col gap-1 items-end">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-900/30 border border-amber-600/40">
              <span className="text-sm">🪙</span>
              <span className="font-pixel text-xs text-yellow-300">{gold.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-purple-900/30 border border-purple-500/40">
              <span className="text-sm">💎</span>
              <span className="font-pixel text-xs text-purple-300">{gems}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CENTER — scrollable ═══ */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

        {/* Hero character */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-xl"
              style={{ background: 'radial-gradient(circle, rgba(217,161,50,0.2), transparent 70%)', transform: 'scale(2)' }} />
            <CharacterSprite type="knight" size={128} />
          </div>
          <h1 className="font-pixel text-xl text-yellow-300 mt-3 tracking-wider"
            style={{ textShadow: '0 0 12px rgba(250,204,21,0.4), 0 2px 0 #000' }}>
            PIXEL FRONTIER
          </h1>
          <p className="font-pixel text-[9px] text-amber-400/60 mt-1">⚔ Squad-Based Pixel RPG ⚔</p>
        </div>

        {/* Stat cards — BIG */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'SQUAD', value: `${filledSlots}/6`, icon: '🛡️', color: 'border-green-600/40', bg: 'from-green-900/20 to-green-950/20' },
            { label: 'UNITS', value: `${totalUnits}`, icon: '👥', color: 'border-blue-600/40', bg: 'from-blue-900/20 to-blue-950/20' },
            { label: 'ENERGY', value: `${energy}`, icon: '⚡', color: 'border-cyan-600/40', bg: 'from-cyan-900/20 to-cyan-950/20' },
          ].map((stat) => (
            <div key={stat.label}
              className={`rounded-xl p-4 text-center bg-gradient-to-b ${stat.bg} border ${stat.color}`}>
              <p className="font-pixel text-[9px] text-slate-400 mb-1">{stat.label}</p>
              <div className="flex items-center justify-center gap-1">
                <span className="text-base">{stat.icon}</span>
                <span className="font-pixel text-lg text-white">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ═══ MENU BUTTONS — BIG, CLEAR, TAPPABLE ═══ */}
        <div className="space-y-3">
          {/* QUEST — primary CTA */}
          <button
            onClick={() => setScreen('dungeon')}
            disabled={filledSlots === 0}
            className="w-full py-5 rounded-2xl font-pixel text-base text-white disabled:opacity-30 active:scale-[0.97] transition-all"
            style={{
              background: 'linear-gradient(180deg, #dc2626, #991b1b)',
              boxShadow: '0 4px 24px rgba(220,38,38,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
              border: '2px solid rgba(239,68,68,0.5)',
            }}>
            <span className="text-xl mr-2">🗡️</span>
            QUEST / DUNGEON
          </button>

          {/* Squad + Summon row */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowSquad(true)}
              className="py-5 rounded-2xl font-pixel text-sm text-white active:scale-[0.97] transition-all"
              style={{
                background: 'linear-gradient(180deg, #2563eb, #1e40af)',
                boxShadow: '0 4px 20px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
                border: '2px solid rgba(96,165,250,0.4)',
              }}>
              <span className="text-xl mr-1">🛡️</span>
              SQUAD
            </button>
            <button
              onClick={() => setScreen('summon')}
              className="py-5 rounded-2xl font-pixel text-sm text-white active:scale-[0.97] transition-all"
              style={{
                background: 'linear-gradient(180deg, #9333ea, #6b21a8)',
                boxShadow: '0 4px 20px rgba(147,51,234,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
                border: '2px solid rgba(168,85,247,0.4)',
              }}>
              <span className="text-xl mr-1">🎰</span>
              SUMMON
            </button>
          </div>

          {/* Inventory */}
          <button
            onClick={() => setScreen('town')}
            className="w-full py-4 rounded-2xl font-pixel text-sm text-white active:scale-[0.97] transition-all"
            style={{
              background: 'linear-gradient(180deg, #d97706, #92400e)',
              boxShadow: '0 4px 20px rgba(217,119,6,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
              border: '2px solid rgba(245,158,11,0.4)',
            }}>
            <span className="text-xl mr-2">📦</span>
            INVENTORY
          </button>

          {/* Refill energy */}
          <button
            onClick={() => refillEnergy()}
            disabled={energy >= maxEnergy}
            className="w-full py-3 rounded-xl font-pixel text-xs text-cyan-300 disabled:opacity-30 active:scale-[0.97] transition-all"
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(6,182,212,0.3)',
            }}>
            ⚡ REFILL ENERGY
          </button>
        </div>
      </div>

      {/* ═══ BOTTOM NAV — sticky ═══ */}
      <div className="shrink-0 z-20 px-2 py-2 flex justify-around items-center"
        style={{
          background: 'linear-gradient(180deg, rgba(10,14,39,0.95), rgba(5,3,15,0.98))',
          borderTop: '2px solid rgba(217,161,50,0.3)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.6)',
        }}>
        {[
          { icon: '🏠', label: 'Home', active: true, action: () => {} },
          { icon: '🛡️', label: 'Squad', active: false, action: () => setShowSquad(true) },
          { icon: '🎰', label: 'Summon', active: false, action: () => setScreen('summon') },
          { icon: '⚔️', label: 'Quest', active: false, action: () => { if (filledSlots > 0) setScreen('dungeon') } },
        ].map((tab) => (
          <button key={tab.label} onClick={tab.action}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all active:scale-90 ${tab.active ? 'bg-amber-900/30 border border-amber-600/30' : 'hover:bg-white/5 border border-transparent'}`}>
            <span className="text-2xl">{tab.icon}</span>
            <span className="font-pixel text-[9px]" style={{ color: tab.active ? '#fbbf24' : 'rgba(217,161,50,0.5)' }}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* ═══ SQUAD OVERLAY ═══ */}
      {showSquad && (
        <div className="absolute inset-0 z-50 flex flex-col"
          style={{ background: 'linear-gradient(180deg, rgba(5,3,20,0.98), rgba(10,5,30,0.99))' }}>
          {/* Header */}
          <div className="shrink-0 flex justify-between items-center px-4 py-3 border-b border-amber-700/30">
            <h2 className="font-pixel text-sm text-yellow-300">🛡️ SQUAD</h2>
            <button onClick={() => { setShowSquad(false); setSelectedUnit(null) }}
              className="font-pixel text-[10px] px-4 py-2 rounded-lg text-red-300 bg-red-900/40 border border-red-500/40 active:scale-95">
              ✖ CLOSE
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 6 slots — BIG */}
            <div className="grid grid-cols-3 gap-3">
              {currentSquad.map((instId, i) => {
                const inst = instId ? squadInstances[instId] : null
                const def = inst ? unitDef(inst.unitId) : null
                return (
                  <button key={i}
                    onClick={() => {
                      if (selectedUnit) { setSquadSlot(i, selectedUnit); setSelectedUnit(null) }
                      else if (instId) setSquadSlot(i, null)
                    }}
                    className="aspect-square rounded-2xl flex flex-col items-center justify-center p-2 active:scale-95 transition-all border-2"
                    style={{
                      background: def ? 'rgba(15,10,40,0.9)' : 'rgba(0,0,0,0.3)',
                      borderColor: def ? 'rgba(217,161,50,0.5)' : selectedUnit ? 'rgba(217,161,50,0.6)' : 'rgba(217,161,50,0.15)',
                      borderStyle: !def && selectedUnit ? 'dashed' : 'solid',
                    }}>
                    {def ? (
                      <>
                        <CharacterSprite type={def.sprite || def.role} size={48} />
                        <span className="font-pixel text-[8px] text-white mt-1 truncate w-full text-center">{def.name}</span>
                        <span className="font-pixel text-[7px] text-amber-400">★{def.rarity} {ELEM_EMOJI[def.element]}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-3xl opacity-20">➕</span>
                        <span className="font-pixel text-[8px] text-slate-500 mt-1">Slot {i + 1}</span>
                      </>
                    )}
                  </button>
                )
              })}
            </div>

            {selectedUnit && (
              <p className="font-pixel text-[10px] text-yellow-300 text-center animate-pulse">
                👆 Tap a slot to place unit
              </p>
            )}

            {/* Owned units — BIG grid */}
            <div>
              <p className="font-pixel text-[9px] text-amber-400/60 mb-2 text-center">
                ── OWNED UNITS ({ownedInstances.length}) ──
              </p>
              <div className="grid grid-cols-3 gap-3">
                {ownedInstances.map(({ instId, name, rarity, element, role }) => {
                  const inSlot = currentSquad.indexOf(instId)
                  const isSel = selectedUnit === instId
                  return (
                    <button key={instId}
                      onClick={() => setSelectedUnit(isSel ? null : instId)}
                      className="flex flex-col items-center p-3 rounded-2xl border-2 transition-all active:scale-95"
                      style={{
                        background: isSel ? 'rgba(217,161,50,0.15)' : 'rgba(15,10,40,0.6)',
                        borderColor: isSel ? '#fbbf24' : inSlot !== -1 ? 'rgba(100,100,100,0.3)' : 'rgba(217,161,50,0.2)',
                        opacity: inSlot !== -1 ? 0.5 : 1,
                      }}>
                      <CharacterSprite type={role} size={56} />
                      <span className="font-pixel text-[8px] text-white mt-1 truncate w-full text-center">{name}</span>
                      <span className="font-pixel text-[7px] text-amber-400">★{rarity} {ELEM_EMOJI[element]}</span>
                      {inSlot !== -1 && <span className="font-pixel text-[6px] text-cyan-400">Slot {inSlot + 1}</span>}
                    </button>
                  )
                })}
                {ownedInstances.length === 0 && (
                  <p className="col-span-3 font-pixel text-[10px] text-slate-500 text-center py-8">
                    No units yet. Visit the Summon Gate!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
