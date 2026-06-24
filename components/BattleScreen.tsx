'use client'
import { useEffect, useRef, useCallback } from 'react'
import { useGameStore, type UnitDef } from '@/store/gameStore'
import PixelArt, { HERO_DOWN_1, PALETTE_DEFAULT, MONSTER_SPRITES } from '@/components/PixelArt'
import unitsRaw from '@/game/data/units.json'
import monstersRaw from '@/game/data/monsters.json'
import stagesRaw from '@/game/data/stages.json'

const allUnits = unitsRaw as UnitDef[]
const allMonsters = monstersRaw as { id: number; name: string; map: string }[]
const allStages = stagesRaw as { id: number; name: string; bg: string }[]
const unitDef = (id: number) => allUnits.find((u) => u.id === id)
const monsterName = (id: number) => allMonsters.find((m) => m.id === id)?.name || 'Unknown'
const monsterMap = (id: number) => allMonsters.find((m) => m.id === id)?.map || 'village'
const stageBg = (id: number | null) => allStages.find((s) => s.id === id)?.bg || ''

const ELEM_EMOJI: Record<string, string> = {
  fire: '🔥', ice: '❄️', wind: '💨', earth: '🌿', light: '✨', dark: '🌑',
}

// Determine battle BG theme from stage or first enemy's map
function bgTheme(stageId: number | null, enemies: { monsterId: number }[]): string {
  if (enemies.length > 0) {
    const map = monsterMap(enemies[0].monsterId)
    if (map === 'forest') return 'battle-bg-forest'
    if (map === 'cave') return 'battle-bg-cave'
  }
  if (!stageId) return ''
  if (stageId >= 7 && stageId <= 8) return 'battle-bg-volcano'
  if (stageId === 6 || stageId === 9) return 'battle-bg-ice'
  if (stageId === 10) return 'battle-bg-dark'
  return ''
}

export default function BattleScreen() {
  const currentSquad = useGameStore((s) => s.currentSquad)
  const squadInstances = useGameStore((s) => s.squadInstances)
  const enemies = useGameStore((s) => s.enemies)
  const battleLog = useGameStore((s) => s.battleLog)
  const currentWave = useGameStore((s) => s.currentWave)
  const totalWaves = useGameStore((s) => s.totalWaves)
  const inputLocked = useGameStore((s) => s.inputLocked)
  const attackUnit = useGameStore((s) => s.attackUnit)
  const braveBurst = useGameStore((s) => s.braveBurst)
  const currentStage = useGameStore((s) => s.currentStage)
  const damagePopups = useGameStore((s) => s.damagePopups)
  const autoBattle = useGameStore((s) => s.autoBattle)
  const toggleAutoBattle = useGameStore((s) => s.toggleAutoBattle)

  const autoTimerRef = useRef<NodeJS.Timeout | null>(null)

  const aliveSquad = currentSquad
    .map((instId, idx) => {
      if (!instId) return null
      const inst = squadInstances[instId]
      if (!inst || !inst.isAlive) return null
      const def = unitDef(inst.unitId)
      if (!def) return null
      return { idx, instId, inst, def }
    })
    .filter(Boolean) as { idx: number; instId: string; inst: { hp: number; maxHp: number; bbGauge: number }; def: UnitDef }[]

  const aliveEnemies = enemies.filter((e) => e.isAlive)

  // Auto-battle logic
  const runAutoBattle = useCallback(() => {
    if (inputLocked || aliveSquad.length === 0 || aliveEnemies.length === 0) return
    // Find a hero to attack
    const hero = aliveSquad[0]
    // Find first alive enemy
    const enemyIdx = enemies.findIndex(e => e.isAlive)
    if (enemyIdx === -1) return

    if (hero.inst.bbGauge >= 100) {
      braveBurst(hero.idx, enemyIdx)
    } else {
      attackUnit(hero.idx, enemyIdx)
    }
  }, [inputLocked, aliveSquad, aliveEnemies, enemies, attackUnit, braveBurst])

  useEffect(() => {
    if (!autoBattle || inputLocked || aliveSquad.length === 0 || aliveEnemies.length === 0) {
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current)
        autoTimerRef.current = null
      }
      return
    }

    autoTimerRef.current = setInterval(() => {
      runAutoBattle()
    }, 800)

    return () => {
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current)
        autoTimerRef.current = null
      }
    }
  }, [autoBattle, inputLocked, aliveSquad.length, aliveEnemies.length, runAutoBattle])

  const bgCls = bgTheme(currentStage, enemies)

  return (
    <div className={`h-full flex flex-col relative overflow-hidden ${bgCls}`}>
      {/* ═══ PARALLAX BATTLE BACKGROUND ═══ */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="battle-bg-sky absolute inset-0" />
        <div className="battle-stars" />
        <div className="battle-bg-mid" />
        <div className="battle-bg-ground" />
      </div>

      {/* ═══ WAVE INDICATOR ═══ */}
      <div className="relative z-10 text-center py-1 bg-black/40 backdrop-blur-sm border-b border-slate-700">
        <p className="font-pixel text-[8px] text-slate-300">
          ⚔️ Wave {currentWave}/{totalWaves}
        </p>
      </div>

      {/* ═══ BATTLE FIELD ═══ */}
      <div className="relative z-10 flex-1 flex items-center justify-between px-3 overflow-hidden">
        {/* Heroes (left side) */}
        <div className="flex flex-col gap-2 items-center">
          {aliveSquad.map(({ idx, inst, def }) => {
            const hpPct = (inst.hp / inst.maxHp) * 100
            return (
              <div key={idx} className="flex flex-col items-center">
                <div className="animate-slide-in-right" style={{ animationDelay: `${idx * 0.08}s` }}>
                  <PixelArt data={HERO_DOWN_1} palette={PALETTE_DEFAULT} pixelSize={6} className="drop-shadow-lg" />
                </div>
                <p className="font-pixel text-[5px] text-white mt-0.5">{ELEM_EMOJI[def.element]} {def.name}</p>
                <div className="w-14 h-1.5 bg-gray-900 rounded-full overflow-hidden mt-0.5 border border-gray-700">
                  <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{ width: `${hpPct}%` }} />
                </div>
                <p className="font-pixel text-[4px] text-green-300">{inst.hp}/{inst.maxHp}</p>
                {inst.bbGauge >= 100 && (
                  <span className="font-pixel text-[4px] text-yellow-400 animate-pulse mt-0.5">BB READY</span>
                )}
                {inst.bbGauge < 100 && inst.bbGauge > 0 && (
                  <div className="w-14 h-1 bg-gray-800 rounded-full overflow-hidden mt-0.5">
                    <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${inst.bbGauge}%` }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Floating Damage Popups */}
        {damagePopups.map((popup) => (
          <div
            key={popup.id}
            className={`damage-number ${
              popup.type === 'crit' ? 'crit' :
              popup.type === 'enemy' ? 'enemy-dmg' :
              popup.type === 'element' ? 'element-weak' :
              popup.type === 'heal' ? 'heal' : ''
            }`}
            style={{
              left: popup.targetSide === 'enemy' ? '60%' : '25%',
              top: `${20 + popup.targetIdx * 15}%`,
            }}
          >
            {popup.type === 'enemy' ? '-' : popup.type === 'heal' ? '+' : ''}{popup.amount}
            {popup.type === 'crit' && '✦'}
          </div>
        ))}

        {/* Enemies (right side) */}
        <div className="flex flex-col gap-2 items-center">
          {aliveEnemies.map((enemy, i) => {
            const hpPct = (enemy.hp / enemy.maxHp) * 100
            const mName = monsterName(enemy.monsterId)
            const spriteData = MONSTER_SPRITES[mName]
            return (
              <div key={enemy.instanceId} className="flex flex-col items-center">
                <div className="animate-slide-in-left" style={{ animationDelay: `${i * 0.08}s` }}>
                  {spriteData ? (
                    <PixelArt data={spriteData} palette={PALETTE_DEFAULT} pixelSize={enemy.isBoss ? 8 : 6} />
                  ) : (
                    <div className="text-3xl">👾</div>
                  )}
                </div>
                <p className="font-pixel text-[5px] text-white mt-0.5">
                  {enemy.isBoss ? '💀' : '👹'} {enemy.name}
                </p>
                <div className="w-14 h-1.5 bg-gray-900 rounded-full overflow-hidden mt-0.5 border border-gray-700">
                  <div className="h-full bg-red-500 rounded-full transition-all duration-300" style={{ width: `${hpPct}%` }} />
                </div>
                <p className="font-pixel text-[4px] text-red-300">{enemy.hp}/{enemy.maxHp}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ═══ BATTLE LOG ═══ */}
      <div className="relative z-10 h-16 overflow-y-auto bg-black/50 mx-2 rounded px-2 py-1 border border-slate-700/50">
        {battleLog.map((msg, i) => (
          <p key={i} className="font-pixel text-[5px] text-slate-400 leading-relaxed">{msg}</p>
        ))}
      </div>

      {/* ═══ ACTION BUTTONS ═══ */}
      <div className="relative z-10 p-2 bg-black/60 backdrop-blur-sm border-t border-slate-700 space-y-1.5">
        {/* Auto-battle toggle */}
        <div className="flex justify-center">
          <button
            onClick={toggleAutoBattle}
            className={`font-pixel text-[7px] px-3 py-1 rounded border transition-all active:scale-95 ${
              autoBattle
                ? 'bg-green-900/60 border-green-500 text-green-300 animate-auto-pulse'
                : 'bg-slate-800 border-slate-600 text-slate-400'
            }`}
          >
            {autoBattle ? '⚡ AUTO ON' : '⏸ AUTO OFF'}
          </button>
        </div>

        {/* Hero attack buttons */}
        <div className="flex gap-1.5 flex-wrap justify-center">
          {aliveSquad.map(({ idx, inst, def }) => {
            if (aliveEnemies.length === 0) return null
            return (
              <div key={idx} className="flex flex-col gap-0.5">
                <button
                  disabled={inputLocked}
                  onClick={() => {
                    // Auto-target: pick first alive enemy
                    const enemyIdx = enemies.findIndex(e => e.isAlive)
                    if (enemyIdx !== -1) attackUnit(idx, enemyIdx)
                  }}
                  className="font-pixel text-[6px] px-2 py-1.5 bg-gradient-to-b from-blue-700 to-blue-900 border border-blue-400 rounded text-white disabled:opacity-40 active:scale-95 transition-all shadow-lg shadow-blue-900/30"
                >
                  {ELEM_EMOJI[def.element]} ATK
                </button>
                {inst.bbGauge >= 100 && (
                  <button
                    disabled={inputLocked}
                    onClick={() => {
                      const enemyIdx = enemies.findIndex(e => e.isAlive)
                      if (enemyIdx !== -1) braveBurst(idx, enemyIdx)
                    }}
                    className="font-pixel text-[6px] px-2 py-1.5 bg-gradient-to-b from-yellow-600 to-orange-700 border border-yellow-400 rounded text-white animate-pulse-glow disabled:opacity-40 active:scale-95 transition-all shadow-lg shadow-yellow-900/30"
                  >
                    💥 BB
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
