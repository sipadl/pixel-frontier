import { create } from 'zustand'
import { SoundSystem } from '@/game/systems/SoundSystem'

// ===== DATA =====
import monstersRaw from '@/game/data/monsters.json'
import weaponsRaw from '@/game/data/weapons.json'
import gachaRates from '@/game/data/gacha_rates.json'

const monsters = monstersRaw as any[]
const weapons = weaponsRaw as any[]
const rates = gachaRates as any

// ===== TYPES =====
export interface Weapon {
  id: number
  name: string
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'
  atk: number
  skills: Skill[]
}

export interface Skill {
  name: string
  damage: number
  mpCost: number
  type: string
  level: number
  maxLevel: number
}

export interface ActiveMonster {
  id: number
  name: string
  hp: number
  maxHp: number
  atk: number
  def: number
  exp: number
  gold: number
  skills: { name: string; damage: number }[]
  boss: boolean
  emoji: string
  phase: number
  zone: string
}

export interface Item {
  id: number
  name: string
  type: string
  value: number
  quantity: number
}

export interface Quest {
  id: number
  title: string
  description: string
  type: string
  target: any
  reward: { gold?: number; exp?: number; item?: any }
  completed: boolean
  current: number
}

// ===== GAME STATE =====
export interface GameState {
  // Player
  level: number
  exp: number
  expToNext: number
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  gold: number
  skillPoints: number
  statPoints: number
  stats: { str: number; def: number; spd: number }

  // Equipment
  equippedWeapon: Weapon | null
  inventory: Weapon[]
  items: Item[]

  // Progress
  kills: number
  distance: number
  zone: 'village' | 'forest' | 'cave' | 'dungeon'
  bossKills: number
  totalDamage: number
  highestCombo: number

  // Battle
  screen: 'menu' | 'intro' | 'game' | 'battle' | 'gacha' | 'gameover'
  monster: ActiveMonster | null
  isPlayerTurn: boolean
  combo: number
  lastTapTime: number
  damageNumbers: { id: number; value: number; x: number; y: number; type: string }[]
  shakeScreen: boolean
  battleLog: string[]
  showVictory: boolean
  victoryRewards: { exp: number; gold: number } | null

  // Auto-attack timer
  monsterAttackTimer: NodeJS.Timeout | null

  // Walking
  walkPhase: boolean
  walkFrame: number
  bgOffset: number

  // Dungeon Stages (BF-style linear progression)
  stage: number
  currentWave: number
  totalWaves: number
  stageMap: Record<number, { waves: number; boss: boolean; name: string; bg: string }>
  autoBattle: boolean

  // UI
  showInventory: boolean
  showShop: boolean
  showQuests: boolean
  showStats: boolean
  showDialogue: boolean
  dialogueText: string
  dialogueName: string
  gachaResult: Weapon | null
  soundEnabled: boolean
  questNotification: string | null
  quests: Quest[]

  // Actions
  tapAttack: () => void
  onMonsterKill: () => void
  startEncounter: () => void
  checkEnrage: () => void
  startWalking: () => void
  clearDamageNumbers: () => void
  setShake: (v: boolean) => void
  gainExp: (amount: number) => void
  gainGold: (amount: number) => void
  spendStatPoint: (stat: 'str' | 'def' | 'spd') => void
  upgradeSkill: (weaponId: number, skillIndex: number) => void
  equipWeapon: (weapon: Weapon) => void
  addWeapon: (weapon: Weapon) => void
  addItem: (item: Item) => void
  removeItem: (itemId: number) => void
  toggleInventory: () => void
  toggleShop: () => void
  toggleQuests: () => void
  toggleStats: () => void
  toggleSound: () => void
  openDialogue: (name: string, text: string) => void
  closeDialogue: () => void
  setScreen: (screen: any) => void
  startNewGame: () => void
  startGame: () => void
  loadGame: () => boolean
  saveGame: () => void
  updateQuest: (type: string, value: any) => void
  useItem: (itemId: number) => void
  // Stage actions
  advanceWave: () => void
  nextStage: () => void
  setAutoBattle: (v: boolean) => void
  startStage: (stageNum: number) => void
}

let dmgId = 0
let questNotifTimer: NodeJS.Timeout | null = null

function rollGacha(): Weapon {
  const rand = Math.random()
  let rarity = 'Common'
  if (rand < rates.Legendary) rarity = 'Legendary'
  else if (rand < rates.Legendary + rates.Epic) rarity = 'Epic'
  else if (rand < rates.Legendary + rates.Epic + rates.Rare) rarity = 'Rare'
  const pool = weapons.filter((w: any) => w.rarity === rarity)
  const pick = pool[Math.floor(Math.random() * pool.length)]
  return {
    ...pick,
    skills: pick.skills.map((s: any) => ({ ...s, level: 1, maxLevel: 5 }))
  }
}

function spawnMonster(kills: number, zone: string): ActiveMonster {
  const zoneMonsters = monsters.filter((m: any) => m.map === zone && !m.boss)
  const pick = zoneMonsters[Math.floor(Math.random() * zoneMonsters.length)]
  const scaling = 1 + kills * 0.08
  return {
    ...pick,
    hp: Math.floor(pick.hp * scaling),
    maxHp: Math.floor(pick.hp * scaling),
    atk: Math.floor(pick.atk * scaling),
    def: Math.floor(pick.def * scaling),
    exp: Math.floor(pick.exp * scaling),
    gold: Math.floor(pick.gold * scaling),
    phase: 1,
    zone,
  }
}

function spawnBoss(kills: number, zone: string): ActiveMonster {
  const boss = monsters.find((m: any) => m.boss && m.map === zone)
  if (!boss) return spawnMonster(kills, zone)
  const scaling = 1 + kills * 0.05
  return {
    ...boss,
    hp: Math.floor(boss.hp * scaling),
    maxHp: Math.floor(boss.hp * scaling),
    atk: Math.floor(boss.atk * scaling),
    def: Math.floor(boss.def * scaling),
    exp: Math.floor(boss.exp * scaling),
    gold: Math.floor(boss.gold * scaling),
    phase: 1,
    zone,
  }
}

function getZone(kills: number): 'village' | 'forest' | 'cave' {
  if (kills >= 25) return 'cave'
  if (kills >= 10) return 'forest'
  return 'village'
}

const defaultState = {
  level: 1,
  exp: 0,
  expToNext: 30,
  hp: 100,
  maxHp: 100,
  mp: 50,
  maxMp: 50,
  gold: 20,
  skillPoints: 0,
  statPoints: 0,
  stats: { str: 5, def: 3, spd: 5 },
  equippedWeapon: null as Weapon | null,
  inventory: [] as Weapon[],
  items: [
    { id: 1, name: 'Potion', type: 'heal', value: 30, quantity: 3 },
    { id: 3, name: 'Ether', type: 'mp_heal', value: 20, quantity: 2 },
  ] as Item[],
  kills: 0,
  distance: 0,
  zone: 'village' as const,
  bossKills: 0,
  totalDamage: 0,
  highestCombo: 0,
  screen: 'menu' as any,
  monster: null as ActiveMonster | null,
  isPlayerTurn: true,
  combo: 0,
  lastTapTime: 0,
  damageNumbers: [] as { id: number; value: number; x: number; y: number; type: string }[],
  shakeScreen: false,
  battleLog: [] as string[],
  showVictory: false,
  victoryRewards: null as { exp: number; gold: number } | null,
  monsterAttackTimer: null as NodeJS.Timeout | null,
  walkPhase: true,
  walkFrame: 0,
  bgOffset: 0,

  // Dungeon Stages
  stage: 1,
  currentWave: 1,
  totalWaves: 5,
  stageMap: {
    1: { waves: 5, boss: false, name: '🏘️ Slime Fields', bg: 'from-green-700 via-emerald-800 to-green-900' },
    2: { waves: 6, boss: false, name: '🌲 Mushroom Grove', bg: 'from-emerald-800 via-green-900 to-emerald-950' },
    3: { waves: 7, boss: true,  name: '🐺 Dark Forest',   bg: 'from-green-900 via-gray-900 to-emerald-950' },
    4: { waves: 7, boss: false, name: '🦇 Bat Cave',      bg: 'from-gray-800 via-gray-900 to-purple-950' },
    5: { waves: 8, boss: true,  name: '🐲 Dragon Lair',   bg: 'from-purple-900 via-red-950 to-gray-950' },
    6: { waves: 8, boss: false, name: '❄️ Frozen Peaks',  bg: 'from-blue-900 via-cyan-950 to-gray-900' },
    7: { waves: 9, boss: false, name: '🌋 Volcano Core',  bg: 'from-red-900 via-orange-950 to-gray-950' },
    8: { waves: 9, boss: true,  name: '👹 Demon Realm',   bg: 'from-red-950 via-purple-950 to-black' },
    9: { waves: 10, boss: false, name: '⚡ Storm Spire',   bg: 'from-yellow-900 via-gray-900 to-blue-950' },
    10:{ waves: 10, boss: true,  name: '👑 Shadow Citadel', bg: 'from-purple-950 via-black to-red-950' },
  },
  autoBattle: false,
  showInventory: false,
  showShop: false,
  showQuests: false,
  showStats: false,
  showDialogue: false,
  dialogueText: '',
  dialogueName: '',
  gachaResult: null as Weapon | null,
  soundEnabled: true,
  questNotification: null as string | null,
  quests: [] as Quest[],
}

export const useGameStore = create<GameState>((set, get) => ({
  ...defaultState,

  // ===== TAP ATTACK =====
  tapAttack: () => {
    const s = get()
    if (s.screen !== 'battle' || !s.monster) return
    if (s.monster.hp <= 0) return

    const now = Date.now()
    const timeSinceLastTap = now - s.lastTapTime
    const isCombo = timeSinceLastTap < 600
    const newCombo = isCombo ? s.combo + 1 : 1
    const comboMultiplier = 1 + Math.min(newCombo, 20) * 0.05

    const weapon = s.equippedWeapon
    const baseAtk = s.stats.str + (weapon ? weapon.atk : 0)
    const damage = Math.max(1, Math.floor((baseAtk - s.monster.def + Math.floor(Math.random() * 4)) * comboMultiplier))

    const newHp = Math.max(0, s.monster.hp - damage)

    if (s.soundEnabled) SoundSystem.play('attack')

    set({
      monster: { ...s.monster, hp: newHp },
      combo: newCombo,
      lastTapTime: now,
      totalDamage: s.totalDamage + damage,
      highestCombo: Math.max(s.highestCombo, newCombo),
      damageNumbers: [...s.damageNumbers, {
        id: dmgId++,
        value: damage,
        x: 50 + (Math.random() - 0.5) * 20,
        y: 30 + Math.random() * 10,
        type: newCombo >= 10 ? 'legendary' : newCombo >= 5 ? 'magic' : 'physical',
      }],
      battleLog: [...s.battleLog.slice(-4), `⚔️ ${damage} dmg (${newCombo}x combo)`],
    })

    if (newHp <= 0) {
      get().onMonsterKill()
    }
  },

  // ===== MONSTER KILL =====
  onMonsterKill: () => {
    const s = get()
    if (!s.monster) return
    if (s.monsterAttackTimer) clearInterval(s.monsterAttackTimer)

    const expGain = s.monster.exp
    const goldGain = s.monster.gold
    const newKills = s.kills + 1
    const newBossKills = s.bossKills + (s.monster.boss ? 1 : 0)
    const newZone = getZone(newKills)

    if (s.soundEnabled) SoundSystem.play('victory')

    set({
      showVictory: true,
      victoryRewards: { exp: expGain, gold: goldGain },
      kills: newKills,
      bossKills: newBossKills,
      distance: s.distance + 100,
      zone: newZone,
      combo: 0,
      battleLog: [...s.battleLog, `🏆 ${s.monster.name} defeated! +${expGain} EXP +${goldGain} Gold`],
    })

    get().gainExp(expGain)
    get().gainGold(goldGain)
    get().updateQuest('kill', newKills)

    // After delay, either gacha (if boss) or advance wave
    setTimeout(() => {
      set({ showVictory: false, victoryRewards: null })
      if (s.monster?.boss) {
        // Boss defeated — gacha + advance to next stage
        const result = rollGacha()
        set({ screen: 'gacha', gachaResult: result })
        get().updateQuest('chest', get().quests.find(q => q.type === 'chest')?.current || 0 + 1)
        get().saveGame()
        // After gacha closes, advance to next stage
        setTimeout(() => { get().nextStage() }, 1500)
      } else {
        // Regular wave — advance to next wave
        get().advanceWave()
        get().saveGame()
      }
    }, 1500)
  },

  // ===== ENCOUNTER =====
  startEncounter: () => {
    const s = get()
    if (s.screen !== 'game' && s.screen !== 'battle') return

    const newZone = getZone(s.kills)
    const isBoss = s.kills > 0 && s.kills % 10 === 0
    const monster = isBoss ? spawnBoss(s.kills, newZone) : spawnMonster(s.kills, newZone)

    set({
      screen: 'battle',
      monster,
      walkPhase: false,
      battleLog: [isBoss ? `💀 BOSS: ${monster.name} appeared!` : `👾 ${monster.name} appeared!`],
      combo: 0,
      showVictory: false,
      victoryRewards: null,
    })

    if (get().soundEnabled) SoundSystem.play(isBoss ? 'boss' : 'hit')

    // Monster auto-attacks
    const interval = setInterval(() => {
      const state = get()
      if (state.screen !== 'battle' || !state.monster || state.monster.hp <= 0) {
        clearInterval(interval)
        return
      }
      const phaseBonus = state.monster.phase > 1 ? 1.3 : 1
      const dmg = Math.max(1, Math.floor(state.monster.atk * phaseBonus * 0.6 - state.stats.def * 0.3 + Math.random() * 3))
      const newHp = Math.max(0, state.hp - dmg)
      set({
        hp: newHp,
        battleLog: [...state.battleLog.slice(-4), `${state.monster.name} attacks! -${dmg} HP`],
        damageNumbers: [...state.damageNumbers, {
          id: dmgId++,
          value: dmg,
          x: 50 + (Math.random() - 0.5) * 20,
          y: 60 + Math.random() * 10,
          type: 'physical',
        }],
      })
      if (newHp <= 0) {
        clearInterval(interval)
        set({ screen: 'gameover', monster: null })
        if (state.soundEnabled) SoundSystem.play('defeat')
      }
    }, 2000 - Math.min(s.stats.spd * 20, 800))

    set({ monsterAttackTimer: interval })
  },

  // ===== ENRAGE (Boss Phase 2) =====
  checkEnrage: () => {
    const s = get()
    if (!s.monster?.boss) return
    const hpPercent = s.monster.hp / s.monster.maxHp
    if (hpPercent <= 0.5 && s.monster.phase === 1) {
      set({
        monster: { ...s.monster, phase: 2, atk: Math.floor(s.monster.atk * 1.3) },
      })
      if (s.soundEnabled) SoundSystem.play('boss')
      set({ battleLog: [...s.battleLog, `⚠️ ${s.monster.name} ENRAGED! Phase 2!`] })
    }
  },

  // ===== WALKING =====
  startWalking: () => {
    set({ walkPhase: true })
    setTimeout(() => get().startEncounter(), 3000)
  },

  // ===== DAMAGE NUMBERS =====
  clearDamageNumbers: () => set({ damageNumbers: [] }),
  setShake: (v: boolean) => set({ shakeScreen: v }),

  // ===== STATS =====
  gainExp: (amount) => {
    const s = get()
    let exp = s.exp + amount
    let lvl = s.level
    let next = s.expToNext
    let maxHp = s.maxHp
    let maxMp = s.maxMp
    let stats = { ...s.stats }
    let sp = s.statPoints
    let skp = s.skillPoints
    let leveled = false
    while (exp >= next) {
      exp -= next
      lvl++
      next = Math.floor(next * 1.4)
      maxHp += 10
      maxMp += 5
      stats.str += 1
      stats.def += 1
      stats.spd += 1
      sp += 2
      skp += 1
      leveled = true
    }
    set({ exp, level: lvl, expToNext: next, maxHp, maxMp, stats, statPoints: sp, skillPoints: skp, hp: maxHp, mp: maxMp })
    if (leveled && get().soundEnabled) SoundSystem.play('level_up')
  },

  gainGold: (amount) => set(s => ({ gold: s.gold + amount })),

  spendStatPoint: (stat: 'str' | 'def' | 'spd') => {
    const s = get()
    if (s.statPoints <= 0) return
    const newStats = { ...s.stats, [stat]: s.stats[stat] + 1 }
    const hpBonus = stat === 'def' ? 5 : 0
    set({ stats: newStats, statPoints: s.statPoints - 1, maxHp: s.maxHp + hpBonus, hp: Math.min(s.hp + hpBonus, s.maxHp + hpBonus) })
    if (s.soundEnabled) SoundSystem.play('menu_click')
  },

  upgradeSkill: (weaponId: number, skillIndex: number) => {
    const s = get()
    if (s.skillPoints <= 0) return
    let weapon = s.equippedWeapon
    if (!weapon || weapon.id !== weaponId) weapon = s.inventory.find(w => w.id === weaponId) || null
    if (!weapon || !weapon.skills[skillIndex]) return
    const skill = weapon.skills[skillIndex]
    if (skill.level >= skill.maxLevel) return
    const newSkills = [...weapon.skills]
    newSkills[skillIndex] = { ...skill, level: skill.level + 1, damage: skill.damage + 5 }
    const newWeapon = { ...weapon, skills: newSkills }
    if (s.equippedWeapon?.id === weaponId) set({ equippedWeapon: newWeapon, skillPoints: s.skillPoints - 1 })
    else set({ inventory: s.inventory.map(w => w.id === weaponId ? newWeapon : w), skillPoints: s.skillPoints - 1 })
    if (s.soundEnabled) SoundSystem.play('menu_click')
  },

  equipWeapon: (weapon) => { set({ equippedWeapon: weapon }); get().saveGame() },
  addWeapon: (weapon) => {
    const w = { ...weapon, skills: weapon.skills.map(s => ({ ...s, level: 1, maxLevel: 5 })) }
    set(s => ({ inventory: [...s.inventory, w] }))
    get().updateQuest('weapon_rarity', weapon.rarity)
    get().saveGame()
  },

  addItem: (item) => set(s => {
    const ex = s.items.find(i => i.id === item.id)
    if (ex) return { items: s.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) }
    return { items: [...s.items, { ...item, quantity: 1 }] }
  }),
  removeItem: (itemId) => set(s => ({
    items: s.items.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0)
  })),

  // ===== UI TOGGLES =====
  toggleInventory: () => set(s => ({ showInventory: !s.showInventory })),
  toggleShop: () => set(s => ({ showShop: !s.showShop })),
  toggleQuests: () => set(s => ({ showQuests: !s.showQuests })),
  toggleStats: () => set(s => ({ showStats: !s.showStats })),
  toggleSound: () => { const e = !get().soundEnabled; set({ soundEnabled: e }); if (!e) SoundSystem.stopBgm() },
  openDialogue: (name, text) => set({ showDialogue: true, dialogueName: name, dialogueText: text }),
  closeDialogue: () => set({ showDialogue: false }),

  // ===== SCREEN =====
  setScreen: (screen) => set({ screen }),
  startNewGame: () => {
    fetch('/data/quests.json').then(r => r.json()).then(quests => {
      set({ ...defaultState, screen: 'intro', quests })
      get().saveGame()
    })
  },
  startGame: () => {
    set({ screen: 'game', walkPhase: true, monster: null })
    setTimeout(() => get().startEncounter(), 3000)
  },
  loadGame: () => {
    try {
      const data = localStorage.getItem('pixel-frontier-save')
      if (data) {
        const p = JSON.parse(data)
        set({ ...p, screen: 'game', walkPhase: true, monster: null })
        setTimeout(() => get().startEncounter(), 2000)
        return true
      }
    } catch (e) { console.error(e) }
    return false
  },
  saveGame: () => {
    const s = get()
    try {
      localStorage.setItem('pixel-frontier-save', JSON.stringify({
        level: s.level, exp: s.exp, expToNext: s.expToNext,
        hp: s.hp, maxHp: s.maxHp, mp: s.mp, maxMp: s.maxMp,
        gold: s.gold, skillPoints: s.skillPoints, statPoints: s.statPoints,
        stats: s.stats, equippedWeapon: s.equippedWeapon,
        inventory: s.inventory, items: s.items,
        kills: s.kills, distance: s.distance, zone: s.zone,
        bossKills: s.bossKills, totalDamage: s.totalDamage,
        highestCombo: s.highestCombo, quests: s.quests,
        soundEnabled: s.soundEnabled,
      }))
    } catch (e) { console.error(e) }
  },

  updateQuest: (type, value) => {
    const s = get()
    const newQuests = s.quests.map(q => {
      if (q.completed || q.type !== type) return q
      let cur = q.current, done = false
      if (type === 'kill') { cur = value; if (cur >= q.target) done = true }
      else if (type === 'chest') { cur = (value || q.current + 1); if (cur >= q.target) done = true }
      else if (type === 'map') { if (value === q.target) { done = true; cur = 1 } }
      else if (type === 'boss') { if (value === q.target) { done = true; cur = 1 } }
      else if (type === 'weapon_rarity') { if (value === q.target) { done = true; cur = 1 } }
      else if (type === 'gold') { cur = value; if (cur >= q.target) done = true }
      if (done && !q.completed) {
        if (q.reward.gold) get().gainGold(q.reward.gold)
        if (q.reward.exp) get().gainExp(q.reward.exp)
        set({ questNotification: `🏆 ${q.title}!` })
        if (questNotifTimer) clearTimeout(questNotifTimer)
        questNotifTimer = setTimeout(() => set({ questNotification: null }), 3000)
        if (get().soundEnabled) SoundSystem.play('level_up')
      }
      return { ...q, current: cur, completed: done }
    })
    set({ quests: newQuests })
  },

  // ===== USE ITEM IN BATTLE =====
  useItem: (itemId: number) => {
    const s = get()
    const item = s.items.find(i => i.id === itemId)
    if (!item || item.quantity <= 0) return
    const newItems = s.items.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0)
    if (item.type === 'heal') {
      const heal = Math.min(item.value, s.maxHp - s.hp)
      set({ hp: s.hp + heal, items: newItems })
    } else if (item.type === 'mp_heal') {
      const heal = Math.min(item.value, s.maxMp - s.mp)
      set({ mp: s.mp + heal, items: newItems })
    }
    if (s.soundEnabled) SoundSystem.play('heal')
  },

  // ===== STAGE / WAVE PROGRESSION (BF-style) =====
  startStage: (stageNum: number) => {
    const s = get()
    const stageInfo = s.stageMap[stageNum]
    if (!stageInfo) return
    set({
      stage: stageNum,
      currentWave: 1,
      totalWaves: stageInfo.waves,
      screen: 'game',
      walkPhase: false,
      monster: null,
      zone: 'dungeon',
    })
    get().startEncounter()
  },

  advanceWave: () => {
    const s = get()
    const stageInfo = s.stageMap[s.stage]
    if (!stageInfo) return
    const nextWave = s.currentWave + 1
    if (nextWave > stageInfo.waves) {
      // Stage complete — boss already defeated in onMonsterKill flow
      return
    }
    set({ currentWave: nextWave })
    setTimeout(() => get().startEncounter(), 800)
  },

  nextStage: () => {
    const s = get()
    const maxStage = Object.keys(s.stageMap).length
    const next = s.stage + 1
    if (next > maxStage) {
      set({ screen: 'gameover' })
      return
    }
    set({
      stage: next,
      currentWave: 1,
      totalWaves: s.stageMap[next].waves,
      monster: null,
    })
    setTimeout(() => get().startEncounter(), 1000)
  },

  setAutoBattle: (v: boolean) => set({ autoBattle: v }),
}))
