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
  targetIdx: number
  targetSide: 'enemy' | 'hero'
  ts: number
}

export type Screen = 'loading' | 'town' | 'squad' | 'summon' | 'dungeon' | 'battle' | 'gameover' | 'result'

// ===== BATTLE STATE MACHINE =====
export type BattleState =
  | 'NOT_IN_BATTLE'
  | 'PLAYER_TURN'
  | 'ANIMATION_PLAYING'
  | 'ENEMY_TURN'
  | 'REWARD_SCREEN'
  | 'GAME_OVER'

// Squad state for the current battle (decoupled from persistent instances during battle)
export interface BattleSquadMember {
  instanceId: string
  unitId: number
  name: string
  element: string
  hp: number
  maxHp: number
  atk: number
  def: number
  bbGauge: number
  bbName: string
  isAlive: boolean
}

export interface EnemyWaveMember {
  instanceId: string
  name: string
  hp: number
  maxHp: number
  atk: number
  def: number
  element: string  // default 'fire' for monsters
  isBoss: boolean
  isAlive: boolean
}

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

  // Squad (persistent)
  currentSquad: (string | null)[]
  squadInstances: Record<string, UnitInstance>

  // Screen
  screen: Screen

  // === BATTLE STATE MACHINE (new) ===
  battleState: BattleState
  currentStage: number | null
  currentWave: number
  totalWaves: number
  battleSquadState: BattleSquadMember[]
  enemyWave: EnemyWaveMember[]
  battleLog: string[]
  damagePopups: DamagePopup[]
  autoBattle: boolean

  // Legacy compat (kept for routing — page.tsx checks gameOver)
  gameOver: { won: boolean; wave: number } | null
  showResult: { won: boolean; rewards: { gold: number; gems: number; exp: number } } | null

  // Energy regen
  lastEnergyRegen: number

  // === ACTIONS ===
  // Resources
  deductEnergy: (amount: number) => boolean
  refillEnergy: () => void
  refreshEnergy: () => void

  // Gacha
  pullGacha: (count: 1 | 10) => GachaResult[]

  // Squad management
  unlockUnit: (unitId: number) => string
  setSquadSlot: (slot: number, instanceId: string | null) => void

  // Battle actions (new state machine)
  startBattle: (stageId: number) => boolean
  triggerUnitAttack: (instanceId: string) => void
  executeEnemyTurn: () => void
  checkWaveCompletion: () => void
  resetBattleForRetry: () => void

  // Navigation
  returnToTown: () => void
  setScreen: (screen: Screen) => void

  // Damage popups
  addDamagePopup: (popup: Omit<DamagePopup, 'id' | 'ts'>) => void
  removeDamagePopup: (id: string) => void

  // Auto battle
  toggleAutoBattle: () => void

  // Legacy compat actions (kept for page.tsx / other components)
  attackUnit: (squadIdx: number, enemyIdx: number) => void
  braveBurst: (squadIdx: number, enemyIdx: number) => void
  enemyTurn: () => void
  checkWaveEnd: () => void
  nextWave: () => void
  retryBattle: () => void

  // Reset
  resetGame: () => void
}

const GACHA_COST = { 1: 5, 10: 50 }
const GACHA_RATES = { 5: 0.05, 4: 0.25, 3: 0.70 }
const SHARDS_PER_DUP = 5

// Animation timing (ms)
const ANIM_DELAY = 600       // hero attack animation
const ENEMY_TURN_DELAY = 700 // enemy attack animation
const WAVE_DELAY = 800       // wave transition
const BC_DROP_CHANCE = 0.3   // 30% chance to drop a BC on attack
const BC_BB_FILL = 8         // each BC fills 8% BB

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

// ===== DEFAULT STATE =====
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

  // Battle state machine
  battleState: 'NOT_IN_BATTLE' as BattleState,
  currentStage: null as number | null,
  currentWave: 1,
  totalWaves: 1,
  battleSquadState: [] as BattleSquadMember[],
  enemyWave: [] as EnemyWaveMember[],
  battleLog: [] as string[],
  damagePopups: [] as DamagePopup[],
  autoBattle: false,

  // Legacy compat
  gameOver: null as { won: boolean; wave: number } | null,
  showResult: null as { won: boolean; rewards: { gold: number; gems: number; exp: number } } | null,

  lastEnergyRegen: Date.now(),
}

// ===== BUILD WAVE =====
function buildWaveEnemies(waveNum: number, totalWaves: number, stageDef: StageDef): EnemyWaveMember[] {
  const eligibleMonsters = monsters.filter(m =>
    m.map === 'village' || m.map === 'forest' || m.map === 'cave'
  )
  const isBossWave = waveNum === totalWaves && stageDef.boss
  const numEnemies = isBossWave ? 1 : Math.min(3, 1 + Math.floor(waveNum / 2))
  const result: EnemyWaveMember[] = []

  const scaling = 1 + (waveNum - 1) * 0.15

  if (isBossWave) {
    const bossPool = monsters.filter(m => m.boss)
    const m = bossPool[Math.floor(Math.random() * bossPool.length)]
    const maxHp = Math.floor(m.hp * scaling * 1.5)
    result.push({
      instanceId: `e${m.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: m.name,
      hp: maxHp,
      maxHp,
      atk: Math.floor(m.atk * scaling * 1.5),
      def: Math.floor(m.def * scaling * 1.5),
      element: 'fire',
      isBoss: true,
      isAlive: true,
    })
  } else {
    for (let i = 0; i < numEnemies; i++) {
      const m = eligibleMonsters[Math.floor(Math.random() * eligibleMonsters.length)]
      const maxHp = Math.floor(m.hp * scaling)
      result.push({
        instanceId: `e${m.id}_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
        name: m.name,
        hp: maxHp,
        maxHp,
        atk: Math.floor(m.atk * scaling),
        def: Math.floor(m.def * scaling),
        element: 'fire',
        isBoss: false,
        isAlive: true,
      })
    }
  }

  return result
}

// ===== STORE =====
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
          damagePopups: [...s.damagePopups.slice(-12), { ...popup, id, ts: Date.now() }],
        }))
        setTimeout(() => get().removeDamagePopup(id), 1000)
      },

      removeDamagePopup: (id) => {
        set(s => ({
          damagePopups: s.damagePopups.filter(p => p.id !== id),
        }))
      },

      toggleAutoBattle: () => set(s => ({ autoBattle: !s.autoBattle })),

      // ╔══════════════════════════════════════════════════════╗
      // ║  BATTLE STATE MACHINE — NEW CORE ACTIONS             ║
      // ╚══════════════════════════════════════════════════════╝

      // ─── 1. startBattle ───────────────────────────────────
      startBattle: (stageId) => {
        const s = get()
        // Guard: already in battle
        if (s.battleState !== 'NOT_IN_BATTLE') return false

        const stage = stages.find(st => st.id === stageId)
        if (!stage) return false
        if (s.energy < stage.energy) return false

        // Build battleSquadState from currentSquad + squadInstances
        const battleSquad: BattleSquadMember[] = []
        for (const instId of s.currentSquad) {
          if (!instId) {
            battleSquad.push({
              instanceId: '',
              unitId: 0,
              name: '—',
              element: 'fire',
              hp: 0, maxHp: 0, atk: 0, def: 0,
              bbGauge: 0, bbName: '', isAlive: false,
            })
            continue
          }
          const inst = s.squadInstances[instId]
          if (!inst || !inst.isAlive) {
            battleSquad.push({
              instanceId: instId,
              unitId: 0,
              name: '—',
              element: 'fire',
              hp: 0, maxHp: 0, atk: 0, def: 0,
              bbGauge: 0, bbName: '', isAlive: false,
            })
            continue
          }
          const def = findUnit(inst.unitId)
          if (!def) continue
          battleSquad.push({
            instanceId: instId,
            unitId: def.id,
            name: def.name,
            element: def.element,
            hp: inst.hp,
            maxHp: inst.maxHp,
            atk: def.atk,
            def: def.def,
            bbGauge: inst.bbGauge,
            bbName: def.bb.name,
            isAlive: inst.isAlive,
          })
        }

        // Ensure exactly 6 slots
        while (battleSquad.length < 6) {
          battleSquad.push({
            instanceId: '', unitId: 0, name: '—', element: 'fire',
            hp: 0, maxHp: 0, atk: 0, def: 0, bbGauge: 0, bbName: '', isAlive: false,
          })
        }

        // Check at least 1 alive
        if (battleSquad.every(m => !m.isAlive)) return false

        // Load wave 1 enemies
        const wave1 = buildWaveEnemies(1, stage.waves, stage)

        set({
          energy: s.energy - stage.energy,
          screen: 'battle',
          battleState: 'PLAYER_TURN',
          currentStage: stageId,
          currentWave: 1,
          totalWaves: stage.waves,
          battleSquadState: battleSquad,
          enemyWave: wave1,
          battleLog: [`⚔️ Stage ${stageId}: ${stage.name}`, `🌊 Wave 1/${stage.waves}: ${wave1.length} enemy(ies)`],
          damagePopups: [],
          autoBattle: false,
          gameOver: null,
          showResult: null,
        })

        return true
      },

      // ─── 2. triggerUnitAttack ──────────────────────────────
      triggerUnitAttack: (instanceId) => {
        const s = get()
        // CRITICAL: only allow in PLAYER_TURN
        if (s.battleState !== 'PLAYER_TURN') return

        const heroIdx = s.battleSquadState.findIndex(m => m.instanceId === instanceId)
        if (heroIdx === -1) return
        const hero = s.battleSquadState[heroIdx]
        if (!hero.isAlive) return

        // Find first alive enemy
        const enemyIdx = s.enemyWave.findIndex(e => e.isAlive)
        if (enemyIdx === -1) return
        const enemy = s.enemyWave[enemyIdx]

        set({ battleState: 'ANIMATION_PLAYING' })

        // Damage formula: Max(1, (Atk - Def*0.5) * ElementMult * Variance)
        const variance = 0.9 + Math.random() * 0.2
        const elemDmgMult = elemMult(hero.element, enemy.element)
        const isCrit = Math.random() < 0.15
        const critMult = isCrit ? 1.5 : 1.0
        const rawDmg = Math.max(1, Math.floor((hero.atk - enemy.def * 0.5) * variance * elemDmgMult * critMult))
        const newEnemyHp = Math.max(0, enemy.hp - rawDmg)
        const dmgDealt = enemy.hp - newEnemyHp

        // BC drop roll
        let bcDrop = false
        const newSquad = [...s.battleSquadState]
        if (Math.random() < BC_DROP_CHANCE) {
          bcDrop = true
          // BC fills ALL other alive heroes' BB by BC_BB_FILL
          for (let i = 0; i < newSquad.length; i++) {
            if (i !== heroIdx && newSquad[i].isAlive) {
              newSquad[i] = {
                ...newSquad[i],
                bbGauge: Math.min(100, newSquad[i].bbGauge + BC_BB_FILL),
              }
            }
          }
        }

        // Attacker's BB also fills by 20
        newSquad[heroIdx] = {
          ...newSquad[heroIdx],
          bbGauge: Math.min(100, newSquad[heroIdx].bbGauge + 20),
        }

        const newEnemyWave = [...s.enemyWave]
        newEnemyWave[enemyIdx] = {
          ...enemy,
          hp: newEnemyHp,
          isAlive: newEnemyHp > 0,
        }

        // Build log
        const critTag = isCrit ? ' CRIT!' : ''
        const elemTag = elemDmgMult > 1 ? ' ✦WEAK' : elemDmgMult < 1 ? ' (resist)' : ''
        const bcTag = bcDrop ? ' [BC!]' : ''
        const logMsg = `${hero.name} → ${enemy.name}: ${rawDmg}${critTag}${elemTag}${bcTag}`

        set({
          battleSquadState: newSquad,
          enemyWave: newEnemyWave,
          battleLog: [...s.battleLog.slice(-14), logMsg],
        })

        // Damage popup
        get().addDamagePopup({
          amount: rawDmg,
          type: isCrit ? 'crit' : elemDmgMult > 1 ? 'element' : 'normal',
          targetIdx: enemyIdx,
          targetSide: 'enemy',
        })

        // After animation → check wave end → then enemy turn
        setTimeout(() => {
          get().checkWaveCompletion()
        }, ANIM_DELAY)
      },

      // Brave burst variant (called from UI when BB full)
      braveBurst: (squadIdx, enemyIdx) => {
        const s = get()
        if (s.battleState !== 'PLAYER_TURN') return

        const hero = s.battleSquadState[squadIdx]
        if (!hero || !hero.isAlive || hero.bbGauge < 100) return

        const enemy = s.enemyWave[enemyIdx]
        if (!enemy || !enemy.isAlive) return

        set({ battleState: 'ANIMATION_PLAYING' })

        const def = findUnit(hero.unitId)
        if (!def) return

        // Multi-hit BB
        let totalDmg = 0
        let newEnemyHp = enemy.hp
        for (let i = 0; i < def.bb.hits; i++) {
          const hitDmg = Math.floor(def.atk * def.bb.mult * (0.9 + Math.random() * 0.2))
          totalDmg += hitDmg
          newEnemyHp = Math.max(0, newEnemyHp - hitDmg)
        }
        const actualDmg = enemy.hp - newEnemyHp

        const newEnemyWave = [...s.enemyWave]
        newEnemyWave[enemyIdx] = { ...enemy, hp: newEnemyHp, isAlive: newEnemyHp > 0 }

        const newSquad = [...s.battleSquadState]
        newSquad[squadIdx] = { ...newSquad[squadIdx], bbGauge: 0 }

        set({
          battleSquadState: newSquad,
          enemyWave: newEnemyWave,
          battleLog: [...s.battleLog.slice(-14), `💥 ${def.bb.name}! ${actualDmg} dmg to ${enemy.name}`],
        })

        get().addDamagePopup({
          amount: actualDmg,
          type: 'crit',
          targetIdx: enemyIdx,
          targetSide: 'enemy',
        })

        setTimeout(() => {
          get().checkWaveCompletion()
        }, ANIM_DELAY)
      },

      // ─── 3. executeEnemyTurn ───────────────────────────────
      executeEnemyTurn: () => {
        const s = get()
        if (s.battleState !== 'ENEMY_TURN') return

        const aliveEnemies = s.enemyWave.filter(e => e.isAlive)
        const newSquad = [...s.battleSquadState]
        let totalDmg = 0
        const popups: Array<Omit<DamagePopup, 'id' | 'ts'>> = []

        // Each alive enemy picks a random alive hero and attacks
        for (const enemy of aliveEnemies) {
          const aliveHeroIndices = newSquad
            .map((m, i) => (m.isAlive ? i : -1))
            .filter(i => i !== -1)
          if (aliveHeroIndices.length === 0) break

          const targetIdx = aliveHeroIndices[Math.floor(Math.random() * aliveHeroIndices.length)]
          const target = newSquad[targetIdx]

          const variance = 0.85 + Math.random() * 0.3
          const elemDmgMult = elemMult(enemy.element, target.element)
          const rawDmg = Math.max(1, Math.floor((enemy.atk * variance - target.def * 0.3) * elemDmgMult))
          const newHp = Math.max(0, target.hp - rawDmg)
          totalDmg += rawDmg

          newSquad[targetIdx] = { ...target, hp: newHp, isAlive: newHp > 0 }

          popups.push({
            amount: rawDmg,
            type: 'enemy',
            targetIdx,
            targetSide: 'hero',
          } as Omit<DamagePopup, 'id' | 'ts'>)
        }

        // Apply damage popups
        for (const p of popups) {
          get().addDamagePopup(p as Omit<DamagePopup, 'id' | 'ts'>)
        }

        const logMsg = aliveEnemies.length > 0
          ? `👹 Enemies attack! ${totalDmg} total dmg`
          : ''

        set({
          battleSquadState: newSquad,
          battleLog: logMsg ? [...s.battleLog.slice(-14), logMsg] : s.battleLog,
        })

        // Check squad wipe
        const anyAlive = newSquad.some(m => m.isAlive)
        if (!anyAlive) {
          setTimeout(() => {
            set({
              battleState: 'GAME_OVER',
              gameOver: { won: false, wave: get().currentWave },
            })
          }, ENEMY_TURN_DELAY)
          return
        }

        // Back to player turn
        setTimeout(() => {
          set({ battleState: 'PLAYER_TURN' })
        }, ENEMY_TURN_DELAY)
      },

      // ─── 4. checkWaveCompletion ────────────────────────────
      checkWaveCompletion: () => {
        const s = get()
        if (s.battleState !== 'ANIMATION_PLAYING') {
          // Called after animation delay — if we're still in animation, proceed
          // If state already moved on (e.g. enemy killed trigger), do nothing
          if (s.battleState !== 'PLAYER_TURN' && s.battleState !== 'ENEMY_TURN') return
        }

        const allDead = s.enemyWave.every(e => !e.isAlive)

        if (!allDead) {
          // Enemies still alive → enemy turn
          set({ battleState: 'ENEMY_TURN' })
          setTimeout(() => get().executeEnemyTurn(), 300)
          return
        }

        // Wave cleared!
        if (s.currentWave >= s.totalWaves) {
          // === STAGE COMPLETE → REWARD_SCREEN ===
          const stage = stages.find(st => st.id === s.currentStage)
          const baseGold = (stage ? stage.id * 100 : 100) + 500
          const baseGems = 5
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

          // Sync battleSquadState HP back to squadInstances
          const newInstances = { ...s.squadInstances }
          for (const member of s.battleSquadState) {
            if (!member.instanceId) continue
            if (newInstances[member.instanceId]) {
              newInstances[member.instanceId] = {
                ...newInstances[member.instanceId],
                hp: member.hp,
                bbGauge: member.bbGauge,
                isAlive: member.isAlive,
              }
            }
          }

          set({
            battleState: 'REWARD_SCREEN',
            screen: 'result',
            showResult: { won: true, rewards: { gold: baseGold, gems: baseGems, exp: baseExp } },
            gold: s.gold + baseGold,
            gems: s.gems + baseGems,
            exp: newExp,
            level: newLevel,
            expToNext: newExpToNext,
            squadInstances: newInstances,
            battleLog: [...s.battleLog, `🏆 Victory! +${baseGold}g +${baseGems}💎 +${baseExp}exp`],
          })
          return
        }

        // === NEXT WAVE ===
        const nextWaveNum = s.currentWave + 1
        const stageDef = stages.find(st => st.id === s.currentStage)
        if (!stageDef) return

        const nextEnemies = buildWaveEnemies(nextWaveNum, s.totalWaves, stageDef)

        set({
          battleState: 'ANIMATION_PLAYING',
          currentWave: nextWaveNum,
          enemyWave: nextEnemies,
          battleLog: [...s.battleLog, `🌊 Wave ${nextWaveNum}/${s.totalWaves}: ${nextEnemies.length} enemy(ies)`],
        })

        // Brief pause then back to player
        setTimeout(() => {
          set({ battleState: 'PLAYER_TURN' })
        }, WAVE_DELAY)
      },

      // ─── 5. resetBattleForRetry ────────────────────────────
      resetBattleForRetry: () => {
        const s = get()
        const stage = stages.find(st => st.id === s.currentStage)
        if (!stage) return

        // Reset all squad members to full HP, 0 BB — NO energy cost
        const freshSquad: BattleSquadMember[] = s.battleSquadState.map(m => {
          if (!m.isAlive || m.hp <= 0) {
            const def = findUnit(m.unitId)
            if (def) {
              return {
                ...m,
                hp: def.hp,
                maxHp: def.hp,
                bbGauge: 0,
                isAlive: true,
              }
            }
          }
          // Also reset alive ones to full HP for retry fairness
          const def = findUnit(m.unitId)
          return {
            ...m,
            hp: def ? def.hp : m.maxHp,
            maxHp: def ? def.hp : m.maxHp,
            bbGauge: 0,
            isAlive: true,
          }
        })

        // Wave 1 fresh
        const wave1 = buildWaveEnemies(1, stage.waves, stage)

        set({
          battleState: 'PLAYER_TURN',
          currentWave: 1,
          battleSquadState: freshSquad,
          enemyWave: wave1,
          battleLog: [`🔄 Retry Stage ${s.currentStage}`, `🌊 Wave 1/${stage.waves}: ${wave1.length} enemy(ies)`],
          damagePopups: [],
          gameOver: null,
          showResult: null,
        })
      },

      // ╚══════════════════════════════════════════════════════╝

      // ===== NAVIGATION =====
      returnToTown: () => {
        // Sync battleSquadState HP back to persistent instances FIRST
        const s = get()
        const newInstances = { ...s.squadInstances }
        let synced = false
        for (const member of s.battleSquadState) {
          if (!member.instanceId) continue
          if (newInstances[member.instanceId]) {
            newInstances[member.instanceId] = {
              ...newInstances[member.instanceId],
              hp: member.hp,
              bbGauge: member.bbGauge,
              isAlive: member.isAlive,
            }
            synced = true
          }
        }

        set({
          screen: 'town',
          battleState: 'NOT_IN_BATTLE',
          currentStage: null,
          currentWave: 1,
          battleSquadState: [],
          enemyWave: [],
          battleLog: [],
          damagePopups: [],
          autoBattle: false,
          gameOver: null,
          showResult: null,
          ...(synced ? { squadInstances: newInstances } : {}),
        })
      },

      setScreen: (screen) => set({ screen }),
      resetGame: () => set({ ...defaultState }),

      // ╔══════════════════════════════════════════════════════╗
      // ║  LEGACY COMPAT — Bridge old actions to new SM        ║
      // ╚══════════════════════════════════════════════════════╝

      attackUnit: (squadIdx, _enemyIdx) => {
        // Bridge: find the squad member and delegate to triggerUnitAttack
        const s = get()
        if (s.battleState !== 'PLAYER_TURN') return
        const member = s.battleSquadState[squadIdx]
        if (!member || !member.isAlive) return
        get().triggerUnitAttack(member.instanceId)
      },

      enemyTurn: () => {
        const s = get()
        if (s.battleState !== 'ENEMY_TURN') return
        get().executeEnemyTurn()
      },

      checkWaveEnd: () => {
        get().checkWaveCompletion()
      },

      nextWave: () => {
        get().checkWaveCompletion()
      },

      retryBattle: () => {
        const s = get()
        if (s.battleState === 'GAME_OVER') {
          get().resetBattleForRetry()
        }
      },
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
  return state.battleSquadState.every(m => !m.isAlive)
}
