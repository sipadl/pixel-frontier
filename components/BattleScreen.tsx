'use client'
import { useGameStore, type UnitDef } from '@/store/gameStore'
import PixelArt, { HERO_DOWN_1, PALETTE_DEFAULT, MONSTER_SPRITES } from '@/components/PixelArt'
import unitsRaw from '@/game/data/units.json'
import monstersRaw from '@/game/data/monsters.json'

const allUnits = unitsRaw as UnitDef[]
const allMonsters = monstersRaw as { id: number; name: string }[]
const unitDef = (id: number) => allUnits.find((u) => u.id === id)
const monsterName = (id: number) => allMonsters.find((m) => m.id === id)?.name || 'Unknown'

const ELEM_EMOJI: Record<string, string> = {
  fire: '🔥', ice: '❄️', wind: '💨', earth: '🌿', light: '✨', dark: '🌑',
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

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 to-gray-950">
      {/* Wave indicator */}
      <div className="text-center py-1 bg-gray-900 border-b border-gray-700">
        <p className="font-pixel text-[8px] text-gray-400">
          ⚔️ Wave {currentWave}/{totalWaves}
        </p>
      </div>

      {/* Battle field: hero left, enemy right */}
      <div className="flex-1 flex items-center justify-between px-4 relative overflow-hidden">
        {/* Heroes (left) */}
        <div className="flex flex-col gap-3 items-center">
          {aliveSquad.map(({ idx, inst, def }) => {
            const hpPct = (inst.hp / inst.maxHp) * 100
            return (
              <div key={idx} className="flex flex-col items-center animate-slide-in-right" style={{ animationDelay: `${idx * 0.1}s` }}>
                <PixelArt data={HERO_DOWN_1} palette={PALETTE_DEFAULT} pixelSize={6} className="drop-shadow-lg" />
                <p className="font-pixel text-[6px] text-white mt-0.5">{ELEM_EMOJI[def.element]} {def.name}</p>
                <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden mt-0.5">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${hpPct}%` }} />
                </div>
                {inst.bbGauge >= 100 && (
                  <span className="font-pixel text-[5px] text-yellow-400 animate-pulse">BB READY</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Enemies (right) */}
        <div className="flex flex-col gap-3 items-center">
          {aliveEnemies.map((enemy, i) => {
            const hpPct = (enemy.hp / enemy.maxHp) * 100
            const mName = monsterName(enemy.monsterId)
            const spriteData = MONSTER_SPRITES[mName]
            return (
              <div key={enemy.instanceId} className="flex flex-col items-center">
                {spriteData ? (
                  <PixelArt data={spriteData} palette={PALETTE_DEFAULT} pixelSize={enemy.isBoss ? 8 : 6} />
                ) : (
                  <div className="text-3xl">👾</div>
                )}
                <p className="font-pixel text-[6px] text-white mt-0.5">
                  {enemy.isBoss ? '💀' : '👹'} {enemy.name}
                </p>
                <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden mt-0.5">
                  <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${hpPct}%` }} />
                </div>
                <p className="font-pixel text-[5px] text-red-300">{enemy.hp}/{enemy.maxHp}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-2 bg-gray-900 border-t border-gray-700 space-y-1">
        {/* Hero attack buttons */}
        <div className="flex gap-1 flex-wrap justify-center">
          {aliveSquad.map(({ idx, inst, def }) => {
            if (aliveEnemies.length === 0) return null
            return (
              <div key={idx} className="flex flex-col gap-0.5">
                <button
                  disabled={inputLocked}
                  onClick={() => attackUnit(idx, 0)}
                  className="font-pixel text-[6px] px-2 py-1 bg-blue-800 border border-blue-500 rounded text-white disabled:opacity-40 active:scale-95"
                >
                  {ELEM_EMOJI[def.element]} ATK
                </button>
                {inst.bbGauge >= 100 && (
                  <button
                    disabled={inputLocked}
                    onClick={() => braveBurst(idx, 0)}
                    className="font-pixel text-[6px] px-2 py-1 bg-yellow-700 border border-yellow-400 rounded text-white animate-pulse-glow disabled:opacity-40 active:scale-95"
                  >
                    💥 BB
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Battle log */}
        <div className="h-14 overflow-y-auto bg-black/40 rounded px-2 py-1">
          {battleLog.map((msg, i) => (
            <p key={i} className="font-pixel text-[5px] text-slate-400 leading-relaxed">{msg}</p>
          ))}
        </div>
      </div>
    </div>
  )
}
