import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ===== DATA =====
import unitsRaw from '@/game/data/units.json'
import monstersRaw from '@/game/data/monsters.json'
import stagesRaw from '@/game/data/stages.json'

const units = unitsRaw as UnitDef[]
const monsters = monstersRaw as MonsterDef[]
const stages = stagesRaw as StageDef[]

// ===== TYPES =====
export interface UnitDef {
  id: number
  name: string
  rarity: 3 | 4 | 5
  element: 'fire' | 'ice' | 'wind' | 'earth' | 'light' | 'dark'
  hp: number
  atk: number
  def: number
  bb: { name: string; mult: number; hits: number }
  sprite: 'warrior' | 'mage' | 'archer' | 'guardian' | 'cleric' | 'rogue'
}

export interface MonsterDef {
  id: number
  name: string
  hp: number
  atk: number
  def: number
  exp: number
  gold: number
  skills: { name: string; damage: number }[]
  map: string
  boss: boolean
}

export interface StageDef {
  id: number
  name: string
  waves: number
  energy: number
  boss: boolean
  bg: string
}

export interface UnitInstance {
  instanceId: string
  unitId: number
  hp: number
  maxHp: number
  bbGauge: number  // 0-100
  isAlive: boolean
}

export interface ActiveEnemy {
  instanceId: string
  monsterId: number
  name: string
  hp: number
  maxHp: number
  atk: number
  def: number
  isBoss: boolean
  isAlive: boolean
}

export interface GachaResult {
  unit: UnitDef
  isNew: boolean
  shardsGained: number
}

export interface DamagePopup {
  id: string
  amount: number
  type: 'normal' | 'crit' | 'heal' | 'enemy' | 'element'
  targetIdx: number    // enemy index or squad index
  targetSide: 'enemy' | 'hero'
  ts: number
}

export type Screen = 'loading' | 'town' | 'squad' | 'summon' | 'dungeon' | 'battle' | 'gameover' | 'result'

// ===== ELEMENTAL ADVANTAGE =====
const ELEM_ADVANTAGE: Record<string, string> = {
  fire: 'ice',
  ice: 'wind',
  wind: 'earth',
  earth: 'fire',
  light: 'dark',
  dark: 'light',
}

function elemMult(atkElem: string, defElem: string): number {
  if (ELEM_ADVANTAGE[atkElem] === defElem) return 1.3
  if (ELEM_ADVANTAGE[defElem] === atkElem) return 0.7
  return 1.0
}

// ===== GAME STATE =====
export interface GameState {
  // Currency & resources
  gems: number
  gold: number
  energy: number
  maxEnergy: number

  // Player
  level: number
  exp: number
  expToNext: number

  // Collection
  unlockedUnits: Record<number, { count: number; level: number }>
  materials: Record<number, number>

  // Squad
  currentSquad: (string | null)[]
  squadInstances: Record<string, UnitInstance>

  // Battle
  screen: Screen
  currentStage: number | null
  currentWave: number
  totalWaves: number
  enemies: ActiveEnemy[]
  battleLog: string[]
  inputLocked: boolean
  gameOver: { won: boolean; wave: number } | null
  showResult: { won: boolean; rewards: { gold: number; gems: number; exp: number } } | null
  damagePopups: DamagePopup[]
  autoBattle: boolean

  // Actions
  deductEnergy: (amount: number) => boolean
  refillEnergy: () => void
  pullGacha: (count: 1 | 10) => GachaResult[]
  setSquadSlot: (slot: number, instanceId: string | null) => void
  unlockUnit: (unitId: number) => string
  startBattle: (stageId: number) => boolean
  attackUnit: (squadIdx: number, enemyIdx: number) => void
  braveBurst: (squadIdx: number, enemyIdx: number) => void
  enemyTurn: () => void
  checkWaveEnd: () => void
  nextWave: () => void
  retryBattle: () => void
  returnToTown: () => void
  setScreen: (screen: Screen) => void
  refreshEnergy: () => void
  lastEnergyRegen: number
  addDamagePopup: (popup: Omit<DamagePopup, 'id' | 'ts'>) => void
  removeDamagePopup: (id: string) => void
  toggleAutoBattle: () => void
  resetGame: () => void
}

const GACHA_COST = { 1: 5, 10: 50 }
const GACHA_RATES = { 5: 0.05, 4: 0.25, 3: 0.70 }
const SHARDS_PER_DUP = 5

let instCounter = 0
let popupCounter = 0
function genInstanceId(unitId: number): string {
  instCounter++
  return `u${unitId}_${Date.now()}_${instCounter}`
}

function findUnit(id: number): UnitDef | undefined {
  return units.find(u => u.id === id)
}

function pickGachaUnit(): UnitDef {
  const r = Math.random()
  let rarity: 3 | 4 | 5 = 3
  if (r < GACHA_RATES[5]) rarity = 5
  else if (r < GACHA_RATES[5] + GACHA_RATES[4]) rarity = 4
  const pool = units.filter(u => u.rarity === rarity)
  return pool[Math.floor(Math.random() * pool.length)]
}

function buildEnemyFromMonster(m: MonsterDef, wave: number, isFinal: boolean): ActiveEnemy {
  const scaling = 1 + (wave - 1) * 0.15
  const bossBonus = m.boss ? 1.5 : 1
  const maxHp = Math.floor(m.hp * scaling * bossBonus)
  return {
    instanceId: `e${m.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    monsterId: m.id,
    name: m.name,
    hp: maxHp,
    maxHp,
    atk: Math.floor(m.atk * scaling * bossBonus),
    def: Math.floor(m.def * scaling * bossBonus),
    isBoss: m.boss,
    isAlive: true,
  }
}

const defaultState = {
  gems: 50,
  gold: 1000,
  energy: 100,
  maxEnergy: 100,
  level: 1,
  exp: 0,
  expToNext: 50,

  unlockedUnits: {} as Record<number, { count: number; level: number }>,
  materials: {} as Record<number, number>,

  currentSquad: [null, null, null, null, null, null] as (string | null)[],
  squadInstances: {} as Record<string, UnitInstance>,

  screen: 'town' as Screen,
  currentStage: null as number | null,
  currentWave: 1,
  totalWaves: 1,
  enemies: [] as ActiveEnemy[],
  battleLog: [] as string[],
  inputLocked: false,
  gameOver: null as { won: boolean; wave: number } | null,
  showResult: null as { won: boolean; rewards: { gold: number; gems: number; exp: number } } | null,
  damagePopups: [] as DamagePopup[],
  autoBattle: false,
  lastEnergyRegen: Date.now(),
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      // ===== RESOURCES =====
      deductEnergy: (amount) => {
        const s = get()
        if (s.energy < amount) return false
        set({ energy: s.energy - amount })
        return true
      },

      refillEnergy: () => set({ energy: get().maxEnergy }),

      refreshEnergy: () => {
        const s = get()
        const now = Date.now()
        const elapsed = now - s.lastEnergyRegen
        const REGEN_INTERVAL_MS = 5 * 60 * 1000
        const pointsRegained = Math.floor(elapsed / REGEN_INTERVAL_MS)
        if (pointsRegained <= 0) return
        const newEnergy = Math.min(s.maxEnergy, s.energy + pointsRegained)
        set({
          energy: newEnergy,
          lastEnergyRegen: s.lastEnergyRegen + pointsRegained * REGEN_INTERVAL_MS,
        })
      },

      // ===== GACHA =====
      pullGacha: (count) => {
        const cost = GACHA_COST[count]
        const s = get()
        if (s.gems < cost) return []
        const results: GachaResult[] = []
        const newUnlocked = { ...s.unlockedUnits }
        const newMaterials = { ...s.materials }
        const newInstances = { ...s.squadInstances }
        const newSquad = [...s.currentSquad]

        for (let i = 0; i < count; i++) {
          const unit = pickGachaUnit()
          const owned = newUnlocked[unit.id]
          let isNew = false
          let shardsGained = 0

          if (!owned) {
            newUnlocked[unit.id] = { count: 1, level: 1 }
            isNew = true
          } else {
            newUnlocked[unit.id] = { ...owned, count: owned.count + 1 }
            newMaterials[unit.id] = (newMaterials[unit.id] || 0) + SHARDS_PER_DUP
            shardsGained = SHARDS_PER_DUP
          }

          results.push({ unit, isNew, shardsGained })

          if (isNew) {
            const emptySlot = newSquad.findIndex(s => s === null)
            if (emptySlot !== -1) {
              const instId = genInstanceId(unit.id)
              newInstances[instId] = {
                instanceId: instId,
                unitId: unit.id,
                hp: unit.hp,
                maxHp: unit.hp,
                bbGauge: 0,
                isAlive: true,
              }
              newSquad[emptySlot] = instId
            }
          }
        }

        set({
          gems: s.gems - cost,
          unlockedUnits: newUnlocked,
          materials: newMaterials,
          squadInstances: newInstances,
          currentSquad: newSquad,
        })

        return results
      },

      // ===== SQUAD =====
      unlockUnit: (unitId) => {
        const def = findUnit(unitId)
        if (!def) return ''
        const instId = genInstanceId(unitId)
        set(s => ({
          squadInstances: {
            ...s.squadInstances,
            [instId]: {
              instanceId: instId,
              unitId,
              hp: def.hp,
              maxHp: def.hp,
              bbGauge: 0,
              isAlive: true,
            },
          },
        }))
        return instId
      },

      setSquadSlot: (slot, instanceId) => {
        if (slot < 0 || slot > 5) return
        set(s => {
          const newSquad = [...s.currentSquad]
          if (instanceId) {
            for (let i = 0; i < 6; i++) {
              if (newSquad[i] === instanceId) newSquad[i] = null
            }
          }
          newSquad[slot] = instanceId
          return { currentSquad: newSquad }
        })
      },

      // ===== DAMAGE POPUPS =====
      addDamagePopup: (popup) => {
        popupCounter++
        const id = `pop_${popupCounter}_${Date.now()}`
        set(s => ({
          damagePopups: [...s.damagePopups.slice(-8), { ...popup, id, ts: Date.now() }],
        }))
        // Auto-remove after animation
        setTimeout(() => get().removeDamagePopup(id), 1000)
      },

      removeDamagePopup: (id) => {
        set(s => ({
          damagePopups: s.damagePopups.filter(p => p.id !== id),
        }))
      },

      toggleAutoBattle: () => set(s => ({ autoBattle: !s.autoBattle })),

      // ===== BATTLE =====
      startBattle: (stageId) => {
        const s = get()
        const stage = stages.find(st => st.id === stageId)
        if (!stage) return false
        if (s.energy < stage.energy) return false

        const aliveCount = s.currentSquad.filter(id => {
          if (!id) return false
          const inst = s.squadInstances[id]
          return inst && inst.isAlive
        }).length
        if (aliveCount === 0) return false

        set({
          energy: s.energy - stage.energy,
          screen: 'battle',
          currentStage: stageId,
          currentWave: 1,
          totalWaves: stage.waves,
          enemies: [],
          battleLog: [`⚔️ Stage ${stageId}: ${stage.name}`],
          inputLocked: false,
          gameOver: null,
          showResult: null,
          damagePopups: [],
          autoBattle: false,
        })
        get().nextWave()
        return true
      },

      attackUnit: (squadIdx, enemyIdx) => {
        const s = get()
        if (s.inputLocked || s.screen !== 'battle') return
        const instId = s.currentSquad[squadIdx]
        if (!instId) return
        const unit = s.squadInstances[instId]
        if (!unit || !unit.isAlive) return
        const def = findUnit(unit.unitId)
        if (!def) return
        const enemy = s.enemies[enemyIdx]
        if (!enemy || !enemy.isAlive) return

        // Damage calc with elemental advantage (fire emblem of monster uses first skill element = 'fire' as default)
        const variance = 0.9 + Math.random() * 0.2
        const baseDmg = Math.max(1, Math.floor((def.atk - enemy.def * 0.5) * variance))
        const isCrit = Math.random() < 0.15
        const critMult = isCrit ? 1.5 : 1.0
        const finalDmg = Math.floor(baseDmg * critMult)
        const newHp = Math.max(0, enemy.hp - finalDmg)
        const dmgDealt = enemy.hp - newHp

        const updatedEnemies = [...s.enemies]
        updatedEnemies[enemyIdx] = { ...enemy, hp: newHp, isAlive: newHp > 0 }

        const newBbGauge = Math.min(100, unit.bbGauge + 20)
        const newInstances = {
          ...s.squadInstances,
          [instId]: { ...unit, bbGauge: newBbGauge },
        }

        set({
          enemies: updatedEnemies,
          squadInstances: newInstances,
          battleLog: [...s.battleLog.slice(-14),
            `${def.name} → ${enemy.name}: ${finalDmg}${isCrit ? ' CRIT!' : ''} dmg`
          ],
        })

        // Damage popup on enemy
        get().addDamagePopup({
          amount: finalDmg,
          type: isCrit ? 'crit' : 'normal',
          targetIdx: enemyIdx,
          targetSide: 'enemy',
        })

        // After hero attacks, enemy turn follows
        setTimeout(() => get().enemyTurn(), 500)
      },

      braveBurst: (squadIdx, enemyIdx) => {
        const s = get()
        if (s.inputLocked || s.screen !== 'battle') return
        const instId = s.currentSquad[squadIdx]
        if (!instId) return
        const unit = s.squadInstances[instId]
        if (!unit || !unit.isAlive) return
        if (unit.bbGauge < 100) return
        const def = findUnit(unit.unitId)
        if (!def) return
        const enemy = s.enemies[enemyIdx]
        if (!enemy || !enemy.isAlive) return

        let totalDmg = 0
        let newEnemyHp = enemy.hp
        for (let i = 0; i < def.bb.hits; i++) {
          const hitDmg = Math.floor(def.atk * def.bb.mult * (0.9 + Math.random() * 0.2))
          totalDmg += hitDmg
          newEnemyHp = Math.max(0, newEnemyHp - hitDmg)
        }
        const actualDmg = enemy.hp - newEnemyHp

        const updatedEnemies = [...s.enemies]
        updatedEnemies[enemyIdx] = { ...enemy, hp: newEnemyHp, isAlive: newEnemyHp > 0 }
        const newInstances = {
          ...s.squadInstances,
          [instId]: { ...unit, bbGauge: 0 },
        }

        set({
          enemies: updatedEnemies,
          squadInstances: newInstances,
          battleLog: [...s.battleLog.slice(-14), `💥 ${def.bb.name}! ${actualDmg} dmg to ${enemy.name}`],
        })

        get().addDamagePopup({
          amount: actualDmg,
          type: 'crit',
          targetIdx: enemyIdx,
          targetSide: 'enemy',
        })

        // After BB, enemy turn
        setTimeout(() => get().enemyTurn(), 500)
      },

      // ===== ENEMY TURN =====
      enemyTurn: () => {
        const s = get()
        if (s.screen !== 'battle') return

        // Lock input during enemy turn
        set({ inputLocked: true })

        const aliveEnemies = s.enemies.filter(e => e.isAlive)
        const aliveSquadIndices: number[] = []
        s.currentSquad.forEach((instId, idx) => {
          if (!instId) return
          const inst = s.squadInstances[instId]
          if (inst && inst.isAlive) aliveSquadIndices.push(idx)
        })

        if (aliveSquadIndices.length === 0) {
          // Squad wiped
          set({ gameOver: { won: false, wave: s.currentWave }, inputLocked: false })
          return
        }

        let totalDamage = 0

        // Each alive enemy attacks a random hero
        aliveEnemies.forEach((enemy, eIdx) => {
          const targetIdx = aliveSquadIndices[Math.floor(Math.random() * aliveSquadIndices.length)]
          const targetInstId = s.currentSquad[targetIdx]
          if (!targetInstId) return
          const targetUnit = s.squadInstances[targetInstId]
          if (!targetUnit || !targetUnit.isAlive) return
          const targetDef = findUnit(targetUnit.unitId)
          if (!targetDef) return

          const variance = 0.85 + Math.random() * 0.3
          const rawDmg = Math.floor((enemy.atk * variance) - (targetDef.def * 0.3))
          const dmg = Math.max(1, rawDmg)
          const newHp = Math.max(0, targetUnit.hp - dmg)
          totalDamage += dmg

          const newInstances = { ...s.squadInstances }
          newInstances[targetInstId] = {
            ...targetUnit,
            hp: newHp,
            isAlive: newHp > 0,
          }
          set({ squadInstances: newInstances })

          get().addDamagePopup({
            amount: dmg,
            type: 'enemy',
            targetIdx,
            targetSide: 'hero',
          })
        })

        // Log
        if (aliveEnemies.length > 0) {
          set(st => ({
            battleLog: [...st.battleLog.slice(-14),
              `👹 Enemies attack! ${totalDamage} total dmg to squad`
            ],
          }))
        }

        // Check squad wipe
        const updatedSquad = get().currentSquad
        const updatedInstances = get().squadInstances
        const anyAlive = updatedSquad.some(instId => {
          if (!instId) return false
          const inst = updatedInstances[instId]
          return inst && inst.isAlive
        })

        if (!anyAlive) {
          setTimeout(() => {
            set({ gameOver: { won: false, wave: get().currentWave }, inputLocked: false })
          }, 400)
          return
        }

        // Unlock input after enemy turn
        setTimeout(() => {
          set({ inputLocked: false })
          get().checkWaveEnd()
        }, 400)
      },

      checkWaveEnd: () => {
        const s = get()
        const allDead = s.enemies.every(e => !e.isAlive)
        if (!allDead) return

        if (s.currentWave >= s.totalWaves) {
          const stage = stages.find(st => st.id === s.currentStage)
          const baseGold = stage ? stage.id * 100 : 100
          const baseGems = stage && stage.boss ? 5 : 1
          const baseExp = 30 + (stage?.id || 1) * 10

          // Level up check
          let newExp = s.exp + baseExp
          let newLevel = s.level
          let newExpToNext = s.expToNext
          while (newExp >= newExpToNext) {
            newExp -= newExpToNext
            newLevel++
            newExpToNext = Math.floor(newExpToNext * 1.3)
          }

          set({
            screen: 'result',
            showResult: { won: true, rewards: { gold: baseGold, gems: baseGems, exp: baseExp } },
            gold: s.gold + baseGold,
            gems: s.gems + baseGems,
            exp: newExp,
            level: newLevel,
            expToNext: newExpToNext,
            battleLog: [...s.battleLog, `🏆 Victory! +${baseGold}g +${baseGems}💎 +${baseExp}exp`],
          })
          return
        }

        get().nextWave()
      },

      nextWave: () => {
        const s = get()
        const stage = stages.find(st => st.id === s.currentStage)
        if (!stage) return
        const wave = s.currentWave

        const eligibleMonsters = monsters.filter(m => m.map === 'village' || m.map === 'forest' || m.map === 'cave')
        const numEnemies = wave === stage.waves ? 1 : Math.min(3, 1 + Math.floor(wave / 2))
        const newEnemies: ActiveEnemy[] = []

        if (wave === stage.waves && stage.boss) {
          const bossPool = monsters.filter(m => m.boss)
          const boss = bossPool[Math.floor(Math.random() * bossPool.length)]
          newEnemies.push(buildEnemyFromMonster(boss, wave, true))
        } else {
          for (let i = 0; i < numEnemies; i++) {
            const m = eligibleMonsters[Math.floor(Math.random() * eligibleMonsters.length)]
            newEnemies.push(buildEnemyFromMonster(m, wave, false))
          }
        }

        set({
          enemies: newEnemies,
          inputLocked: false,
          battleLog: [...s.battleLog, `🌊 Wave ${wave}/${stage.waves}: ${newEnemies.length} enemy(ies)`],
        })
      },

      retryBattle: () => {
        const s = get()
        const newInstances: Record<string, UnitInstance> = {}
        for (const instId of Object.keys(s.squadInstances)) {
          const inst = s.squadInstances[instId]
          if (s.currentSquad.includes(instId)) {
            const def = findUnit(inst.unitId)
            if (def) {
              newInstances[instId] = { ...inst, hp: def.hp, maxHp: def.hp, bbGauge: 0, isAlive: true }
            } else {
              newInstances[instId] = inst
            }
          } else {
            newInstances[instId] = inst
          }
        }
        set({
          squadInstances: newInstances,
          currentWave: 1,
          enemies: [],
          battleLog: [`🔄 Retry Stage ${s.currentStage}`],
          inputLocked: false,
          gameOver: null,
          showResult: null,
          damagePopups: [],
        })
        get().nextWave()
      },

      returnToTown: () => {
        set({
          screen: 'town',
          currentStage: null,
          currentWave: 1,
          enemies: [],
          battleLog: [],
          inputLocked: false,
          gameOver: null,
          showResult: null,
          damagePopups: [],
          autoBattle: false,
        })
      },

      setScreen: (screen) => set({ screen }),
      resetGame: () => set({ ...defaultState }),
    }),
    {
      name: 'pixel-frontier-save',
      partialize: (state) => ({
        gems: state.gems,
        gold: state.gold,
        energy: state.energy,
        level: state.level,
        exp: state.exp,
        expToNext: state.expToNext,
        unlockedUnits: state.unlockedUnits,
        materials: state.materials,
        currentSquad: state.currentSquad,
        squadInstances: state.squadInstances,
        lastEnergyRegen: state.lastEnergyRegen,
      }),
    }
  )
)

// Helper: check if squad wiped
export function checkSquadWipe(state: GameState): boolean {
  return state.currentSquad.every(id => {
    if (!id) return true
    const inst = state.squadInstances[id]
    return !inst || !inst.isAlive
  })
}
