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
  pendingDamage: { sourceIdx: number; amount: number; ts: number }[]  // for spark detection
}

export interface GachaResult {
  unit: UnitDef
  isNew: boolean
  shardsGained: number
}

export type Screen = 'loading' | 'town' | 'squad' | 'summon' | 'dungeon' | 'battle' | 'gameover' | 'result'

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
  unlockedUnits: Record<number, { count: number; level: number }>  // unitId → {count, level}
  materials: Record<number, number>  // unitId → shard qty (from dup conversion)

  // Squad
  currentSquad: (string | null)[]  // 6 slots → instanceIds
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

  // Actions
  deductEnergy: (amount: number) => boolean
  refillEnergy: () => void
  pullGacha: (count: 1 | 10) => GachaResult[]
  setSquadSlot: (slot: number, instanceId: string | null) => void
  unlockUnit: (unitId: number) => string  // returns instanceId
  startBattle: (stageId: number) => boolean
  attackUnit: (squadIdx: number, enemyIdx: number) => void
  braveBurst: (squadIdx: number, enemyIdx: number) => void
  resolveEnemyAttacks: () => void
  checkWaveEnd: () => void
  nextWave: () => void
  retryBattle: () => void
  returnToTown: () => void
  setScreen: (screen: Screen) => void
  refreshEnergy: () => void
  lastEnergyRegen: number  // timestamp of last energy regen check
  resetGame: () => void
}

const GACHA_COST = { 1: 5, 10: 50 }
const GACHA_RATES = { 5: 0.05, 4: 0.25, 3: 0.70 }
const SHARDS_PER_DUP = 5

let instCounter = 0
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
    pendingDamage: [],
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
        const REGEN_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes per energy point
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
            // First time
            newUnlocked[unit.id] = { count: 1, level: 1 }
            isNew = true
          } else {
            // Duplicate → convert to shards
            newUnlocked[unit.id] = { ...owned, count: owned.count + 1 }
            const shardKey = unit.id
            newMaterials[shardKey] = (newMaterials[shardKey] || 0) + SHARDS_PER_DUP
            shardsGained = SHARDS_PER_DUP
          }

          results.push({ unit, isNew, shardsGained })

          // Auto-equip the first 6 unlocked units into empty squad slots
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
          // If putting a unit in, remove it from any other slot first
          if (instanceId) {
            for (let i = 0; i < 6; i++) {
              if (newSquad[i] === instanceId) newSquad[i] = null
            }
          }
          newSquad[slot] = instanceId
          return { currentSquad: newSquad }
        })
      },

      // ===== BATTLE =====
      startBattle: (stageId) => {
        const s = get()
        const stage = stages.find(st => st.id === stageId)
        if (!stage) return false
        if (s.energy < stage.energy) return false

        // Check squad has at least 1 unit
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
        })
        // Spawn wave 1
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

        // Calculate damage
        const variance = 0.9 + Math.random() * 0.2
        const baseDmg = Math.max(1, Math.floor((def.atk - enemy.def * 0.5) * variance))
        const newHp = Math.max(0, enemy.hp - baseDmg)
        const dmgDealt = enemy.hp - newHp

        // Queue damage for spark detection (within 100ms window)
        const updatedEnemies = [...s.enemies]
        updatedEnemies[enemyIdx] = {
          ...enemy,
          hp: newHp,
          isAlive: newHp > 0,
          pendingDamage: [...enemy.pendingDamage, { sourceIdx: squadIdx, amount: dmgDealt, ts: Date.now() }],
        }

        // Build updated squad instance with BB gauge +20 (cap 100)
        const newBbGauge = Math.min(100, unit.bbGauge + 20)
        const newInstances = {
          ...s.squadInstances,
          [instId]: { ...unit, bbGauge: newBbGauge },
        }

        set({
          enemies: updatedEnemies,
          squadInstances: newInstances,
          battleLog: [...s.battleLog.slice(-9), `${def.name} → ${enemy.name}: ${dmgDealt} dmg`],
        })

        // Resolve spark after 100ms window
        setTimeout(() => get().resolveEnemyAttacks(), 100)
      },

      braveBurst: (squadIdx, enemyIdx) => {
        const s = get()
        if (s.inputLocked || s.screen !== 'battle') return
        const instId = s.currentSquad[squadIdx]
        if (!instId) return
        const unit = s.squadInstances[instId]
        if (!unit || !unit.isAlive) return
        if (unit.bbGauge < 100) return  // BB must be full
        const def = findUnit(unit.unitId)
        if (!def) return
        const enemy = s.enemies[enemyIdx]
        if (!enemy || !enemy.isAlive) return

        // BB does multi-hit damage
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
          battleLog: [...s.battleLog.slice(-9), `💥 ${def.bb.name}! ${actualDmg} dmg to ${enemy.name}`],
        })
      },

      resolveEnemyAttacks: () => {
        const s = get()
        if (s.screen !== 'battle' || s.inputLocked) return

        // Check for spark: multiple units attacking same enemy within window
        const updatedEnemies = s.enemies.map(enemy => {
          if (!enemy.isAlive) return enemy
          const recentHits = enemy.pendingDamage.filter(h => Date.now() - h.ts < 200)
          if (recentHits.length < 2) return { ...enemy, pendingDamage: [] }
          // Spark bonus: 1.5x multiplier on all hits in this window
          const bonus = Math.floor(recentHits.reduce((sum, h) => sum + h.amount, 0) * 0.5)
          const newHp = Math.max(0, enemy.hp - bonus)
          set(st => ({
            battleLog: [...st.battleLog.slice(-9), `✨ SPARK! +${bonus} bonus dmg`],
          }))
          return { ...enemy, hp: newHp, isAlive: newHp > 0, pendingDamage: [] }
        })

        set({ enemies: updatedEnemies })

        // Check wave end
        get().checkWaveEnd()
      },

      checkWaveEnd: () => {
        const s = get()
        const allDead = s.enemies.every(e => !e.isAlive)
        if (!allDead) return

        // Wave cleared — enemy counter-attack skipped for simplicity
        // If final wave → victory
        if (s.currentWave >= s.totalWaves) {
          // Victory
          const stage = stages.find(st => st.id === s.currentStage)
          const baseGold = stage ? stage.id * 100 : 100
          const baseGems = stage && stage.boss ? 5 : 1
          const baseExp = 30 + (stage?.id || 1) * 10
          set({
            screen: 'result',
            showResult: { won: true, rewards: { gold: baseGold, gems: baseGems, exp: baseExp } },
            gold: s.gold + baseGold,
            gems: s.gems + baseGems,
            exp: s.exp + baseExp,
            battleLog: [...s.battleLog, `🏆 Victory! +${baseGold}g +${baseGems}💎 +${baseExp}exp`],
          })
          return
        }

        // Next wave
        get().nextWave()
      },

      nextWave: () => {
        const s = get()
        const stage = stages.find(st => st.id === s.currentStage)
        if (!stage) return
        const wave = s.currentWave

        // Pick 1-3 monsters based on wave
        const eligibleMonsters = monsters.filter(m => m.map === 'village' || m.map === 'forest' || m.map === 'cave')
        const numEnemies = wave === stage.waves ? 1 : Math.min(3, 1 + Math.floor(wave / 2))
        const newEnemies: ActiveEnemy[] = []

        // Boss on final wave
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
          battleLog: [...s.battleLog, `🌊 Wave ${wave}/${stage.waves}: ${newEnemies.length} enemy(ies)`],
        })
      },

      retryBattle: () => {
        const s = get()
        // Heal squad HP, reset BB, restart wave 1 — NO energy cost
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
        unlockedUnits: state.unlockedUnits,
        materials: state.materials,
        currentSquad: state.currentSquad,
        squadInstances: state.squadInstances,
        lastEnergyRegen: state.lastEnergyRegen,
      }),
    }
  )
)

// Helper: check if squad wiped (all currentSquad units HP = 0)
export function checkSquadWipe(state: GameState): boolean {
  return state.currentSquad.every(id => {
    if (!id) return true  // empty slot counts as "dead"
    const inst = state.squadInstances[id]
    return !inst || !inst.isAlive
  })
}
