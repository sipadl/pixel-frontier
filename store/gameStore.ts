import { create } from 'zustand'
import { SoundSystem } from '@/game/systems/SoundSystem'

export interface Weapon {
  id: number
  name: string
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'
  atk: number
  skills: { name: string; damage: number; mpCost: number; type: string; level?: number; maxLevel?: number }[]
}

export interface Monster {
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
  phase?: number
  totalPhases?: number
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

export interface Stats {
  str: number  // ATK bonus
  def: number  // DEF bonus
  spd: number  // Turn order / flee chance
}

export interface GameState {
  // Player
  playerName: string
  level: number
  exp: number
  expToNext: number
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  gold: number
  skillPoints: number  // SP for upgrading skills
  stats: Stats
  statPoints: number  // Points to spend on STR/DEF/SPD

  // Equipment
  equippedWeapon: Weapon | null
  inventory: Weapon[]
  items: Item[]

  // Map
  currentMap: string
  playerPos: { x: number; y: number }
  facing: 'up' | 'down' | 'left' | 'right'

  // Battle
  inBattle: boolean
  currentMonster: Monster | null
  battleLog: string[]
  isPlayerTurn: boolean
  battleWon: boolean
  monstersKilled: number

  // Quest
  quests: Quest[]
  showQuests: boolean
  questNotification: string | null

  // UI
  screen: 'menu' | 'game' | 'battle' | 'gameover' | 'intro' | 'credits'
  showInventory: boolean
  showGacha: boolean
  showShop: boolean
  showDialogue: boolean
  showStats: boolean
  dialogueText: string
  dialogueName: string
  gachaResult: Weapon | null
  shakeScreen: boolean
  damageNumbers: { id: number; value: number; x: number; y: number; type: string }[]
  soundEnabled: boolean
  bossBattle: boolean

  // Actions
  setPlayerName: (name: string) => void
  setScreen: (screen: any) => void
  setPlayerPos: (x: number, y: number) => void
  setFacing: (dir: 'up' | 'down' | 'left' | 'right') => void
  setCurrentMap: (map: string) => void
  startBattle: (monster: Monster) => void
  endBattle: (won: boolean) => void
  playerAttack: () => void
  playerSkill: (skillIndex: number) => void
  playerUseItem: (itemId: number) => void
  playerFlee: () => void
  monsterTurn: () => void
  addBattleLog: (msg: string) => void
  equipWeapon: (weapon: Weapon) => void
  addWeapon: (weapon: Weapon) => void
  upgradeSkill: (weaponId: number, skillIndex: number) => void
  spendStatPoint: (stat: 'str' | 'def' | 'spd') => void
  toggleStats: () => void
  addItem: (item: Item) => void
  removeItem: (itemId: number) => void
  toggleInventory: () => void
  toggleShop: () => void
  toggleQuests: () => void
  openGacha: (result: Weapon) => void
  closeGacha: () => void
  openDialogue: (name: string, text: string) => void
  closeDialogue: () => void
  gainExp: (amount: number) => void
  gainGold: (amount: number) => void
  takeDamage: (amount: number) => void
  addDamageNumber: (value: number, x: number, y: number, type: string) => void
  clearDamageNumbers: () => void
  setShake: (v: boolean) => void
  initNewGame: () => void
  loadGame: () => boolean
  saveGame: () => void
  levelUp: () => void
  updateQuest: (type: string, value: any) => void
  toggleSound: () => void
}

const defaultState = {
  playerName: 'Hero',
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
  stats: { str: 5, def: 3, spd: 5 } as Stats,
  equippedWeapon: null as Weapon | null,
  inventory: [] as Weapon[],
  items: [
    { id: 1, name: 'Potion', type: 'heal', value: 30, quantity: 3 },
    { id: 3, name: 'Ether', type: 'mp_heal', value: 20, quantity: 2 },
  ] as Item[],
  currentMap: 'village',
  playerPos: { x: 10, y: 7 },
  facing: 'down' as 'up' | 'down' | 'left' | 'right',
  inBattle: false,
  currentMonster: null as Monster | null,
  battleLog: [] as string[],
  isPlayerTurn: true,
  battleWon: false,
  monstersKilled: 0,
  quests: [] as Quest[],
  showQuests: false,
  questNotification: null as string | null,
  screen: 'menu' as any,
  showInventory: false,
  showGacha: false,
  showShop: false,
  showDialogue: false,
  showStats: false,
  dialogueText: '',
  dialogueName: '',
  gachaResult: null as Weapon | null,
  shakeScreen: false,
  damageNumbers: [] as { id: number; value: number; x: number; y: number; type: string }[],
  soundEnabled: true,
  bossBattle: false,
}

let dmgId = 0
let questNotifTimer: NodeJS.Timeout | null = null

export const useGameStore = create<GameState>((set, get) => ({
  ...defaultState,

  setPlayerName: (name) => set({ playerName: name }),
  setScreen: (screen) => set({ screen }),
  setPlayerPos: (x, y) => set({ playerPos: { x, y } }),
  setFacing: (dir) => set({ facing: dir }),
  setCurrentMap: (map) => {
    set({ currentMap: map })
    get().updateQuest('map', map)
    get().saveGame()
  },

  startBattle: (monster) => {
    const isBoss = monster.boss
    const cloned = {
      ...monster,
      hp: monster.hp,
      maxHp: monster.hp,
      phase: isBoss ? 1 : undefined,
      totalPhases: isBoss ? 2 : undefined,
    }
    set({
      inBattle: true,
      currentMonster: cloned,
      isPlayerTurn: true,
      battleLog: [`${cloned.name} appeared!`],
      battleWon: false,
      screen: 'battle',
      bossBattle: isBoss,
    })
    if (get().soundEnabled) {
      SoundSystem.play(isBoss ? 'boss' : 'hit')
    }
  },

  endBattle: (won) => {
    const state = get()
    if (won && state.currentMonster) {
      const expGain = state.currentMonster.exp
      const goldGain = state.currentMonster.gold
      set({
        inBattle: false,
        currentMonster: null,
        battleWon: true,
        screen: 'game',
        monstersKilled: state.monstersKilled + 1,
        bossBattle: false,
      })
      get().gainExp(expGain)
      get().gainGold(goldGain)
      get().updateQuest('kill', state.monstersKilled + 1)
      if (state.currentMonster.boss) {
        get().updateQuest('boss', state.currentMonster.id)
      }
      if (state.soundEnabled) SoundSystem.play('victory')
      get().saveGame()
    } else {
      set({ inBattle: false, currentMonster: null, battleWon: false, screen: 'gameover', bossBattle: false })
      if (state.soundEnabled) SoundSystem.play('defeat')
    }
  },

  playerAttack: () => {
    const state = get()
    if (!state.currentMonster || !state.isPlayerTurn) return
    const weapon = state.equippedWeapon
    const baseAtk = state.stats.str + (weapon ? weapon.atk : 0)
    const damage = Math.max(1, baseAtk - state.currentMonster.def + Math.floor(Math.random() * 5))
    const newHp = Math.max(0, state.currentMonster.hp - damage)
    set({
      currentMonster: { ...state.currentMonster, hp: newHp },
      isPlayerTurn: false,
      battleLog: [...state.battleLog, `You dealt ${damage} damage!`],
    })
    get().addDamageNumber(damage, 600, 150, 'physical')
    if (state.soundEnabled) SoundSystem.play('attack')
    if (newHp <= 0) {
      get().addBattleLog(`${state.currentMonster.name} defeated!`)
      setTimeout(() => get().endBattle(true), 1000)
    } else {
      // Check boss phase transition
      if (state.currentMonster.boss && state.currentMonster.totalPhases) {
        const hpPercent = newHp / state.currentMonster.maxHp
        const currentPhase = state.currentMonster.phase || 1
        if (currentPhase < state.currentMonster.totalPhases && hpPercent <= 0.5) {
          setTimeout(() => {
            get().addBattleLog(`⚠️ ${state.currentMonster!.name} ENRAGED!`)
            get().addDamageNumber(0, 600, 100, 'magic')
            if (state.soundEnabled) SoundSystem.play('boss')
            set({
              currentMonster: {
                ...state.currentMonster!,
                phase: currentPhase + 1,
                atk: Math.floor(state.currentMonster!.atk * 1.3),
              }
            })
          }, 500)
        }
      }
      setTimeout(() => get().monsterTurn(), 1500)
    }
  },

  playerSkill: (skillIndex) => {
    const state = get()
    if (!state.currentMonster || !state.isPlayerTurn) return
    const weapon = state.equippedWeapon
    if (!weapon || !weapon.skills[skillIndex]) return
    const skill = weapon.skills[skillIndex]
    if (state.mp < skill.mpCost) {
      get().addBattleLog('Not enough MP!')
      if (state.soundEnabled) SoundSystem.play('error')
      return
    }
    const baseAtk = state.stats.str + weapon.atk
    let damage = 0
    if (skill.type === 'heal') {
      const healAmount = Math.abs(skill.damage)
      const newHp = Math.min(state.maxHp, state.hp + healAmount)
      set({ mp: state.mp - skill.mpCost, hp: newHp })
      get().addBattleLog(`Used ${skill.name}! Healed ${healAmount} HP!`)
      get().addDamageNumber(-healAmount, 200, 150, 'heal')
      if (state.soundEnabled) SoundSystem.play('heal')
      setTimeout(() => set({ isPlayerTurn: false }), 400)
      setTimeout(() => get().monsterTurn(), 1200)
      return
    }
    if (skill.type === 'buff') {
      set({ mp: state.mp - skill.mpCost })
      get().addBattleLog(`Used ${skill.name}! Power up!`)
      if (state.soundEnabled) SoundSystem.play('skill')
      setTimeout(() => set({ isPlayerTurn: false }), 400)
      setTimeout(() => get().monsterTurn(), 1200)
      return
    }
    // Apply skill level multiplier (each level = +20% damage)
    const skillLevel = skill.level || 1
    const skillMultiplier = 1 + (skillLevel - 1) * 0.2
    const skillDmg = Math.floor(skill.damage * skillMultiplier)
    damage = Math.max(1, skillDmg + Math.floor(baseAtk * 0.5) - state.currentMonster.def + Math.floor(Math.random() * 5))
    const newHp = Math.max(0, state.currentMonster.hp - damage)
    set({
      currentMonster: { ...state.currentMonster, hp: newHp },
      mp: state.mp - skill.mpCost,
      isPlayerTurn: false,
      battleLog: [...state.battleLog, `Used ${skill.name} Lv.${skillLevel}! ${damage} damage!`],
    })
    get().addDamageNumber(damage, 600, 150, skill.type)
    if (state.soundEnabled) SoundSystem.play('skill')
    if (newHp <= 0) {
      get().addBattleLog(`${state.currentMonster.name} defeated!`)
      setTimeout(() => get().endBattle(true), 1000)
    } else {
      // Boss phase check
      if (state.currentMonster.boss && state.currentMonster.totalPhases) {
        const hpPercent = newHp / state.currentMonster.maxHp
        const currentPhase = state.currentMonster.phase || 1
        if (currentPhase < state.currentMonster.totalPhases && hpPercent <= 0.5) {
          setTimeout(() => {
            get().addBattleLog(`⚠️ ${state.currentMonster!.name} ENRAGED! Phase ${currentPhase + 1}!`)
            get().addDamageNumber(0, 600, 100, 'magic')
            if (state.soundEnabled) SoundSystem.play('boss')
            set({
              currentMonster: {
                ...state.currentMonster!,
                phase: currentPhase + 1,
                atk: Math.floor(state.currentMonster!.atk * 1.3),
              }
            })
          }, 500)
        }
      }
      setTimeout(() => get().monsterTurn(), 1500)
    }
  },

  playerUseItem: (itemId) => {
    const state = get()
    const item = state.items.find(i => i.id === itemId)
    if (!item || item.quantity <= 0) return
    const newItems = state.items.map(i =>
      i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
    ).filter(i => i.quantity > 0)
    if (item.type === 'heal') {
      const heal = Math.min(item.value, state.maxHp - state.hp)
      set({ hp: state.hp + heal, items: newItems })
      get().addBattleLog(`Used ${item.name}! Healed ${heal} HP!`)
      get().addDamageNumber(-heal, 200, 150, 'heal')
    } else if (item.type === 'mp_heal') {
      const heal = Math.min(item.value, state.maxMp - state.mp)
      set({ mp: state.mp + heal, items: newItems })
      get().addBattleLog(`Used ${item.name}! Restored ${heal} MP!`)
    }
    if (state.soundEnabled) SoundSystem.play('heal')
    setTimeout(() => set({ isPlayerTurn: false }), 400)
    setTimeout(() => get().monsterTurn(), 1200)
  },

  playerFlee: () => {
    const state = get()
    if (state.currentMonster?.boss) {
      get().addBattleLog("Can't flee from a boss!")
      if (state.soundEnabled) SoundSystem.play('error')
      return
    }
    const chance = 0.5 + (state.stats.spd * 0.02)
    if (Math.random() < chance) {
      get().addBattleLog('Fled successfully!')
      if (state.soundEnabled) SoundSystem.play('escape')
      setTimeout(() => {
        set({ inBattle: false, currentMonster: null, screen: 'game' })
        get().saveGame()
      }, 800)
    } else {
      get().addBattleLog('Failed to flee!')
      set({ isPlayerTurn: false })
      setTimeout(() => get().monsterTurn(), 800)
    }
  },

  monsterTurn: () => {
    const state = get()
    if (!state.currentMonster || state.currentMonster.hp <= 0) return
    const monster = state.currentMonster
    // Boss phase bonus damage
    const phaseBonus = monster.phase && monster.phase > 1 ? (1 + (monster.phase - 1) * 0.3) : 1
    const skillIdx = Math.floor(Math.random() * monster.skills.length)
    const skill = monster.skills[skillIdx]
    const damage = Math.max(1, Math.floor(skill.damage * phaseBonus) - state.stats.def + Math.floor(Math.random() * 3))
    const newHp = Math.max(0, state.hp - damage)
    set({
      hp: newHp,
      isPlayerTurn: true,
      battleLog: [...state.battleLog, `${monster.name} uses ${skill.name}! ${damage} damage!`],
    })
    get().addDamageNumber(damage, 200, 300, 'physical')
    get().setShake(true)
    if (state.soundEnabled) SoundSystem.play('hit')
    setTimeout(() => get().setShake(false), 300)
    if (newHp <= 0) {
      get().addBattleLog('You were defeated...')
      setTimeout(() => get().endBattle(false), 1000)
    }
  },

  addBattleLog: (msg) => set(s => ({ battleLog: [...s.battleLog, msg] })),

  equipWeapon: (weapon) => {
    set({ equippedWeapon: weapon })
    get().saveGame()
  },

  addWeapon: (weapon) => {
    // Initialize skill levels
    const weaponWithLevels = {
      ...weapon,
      skills: weapon.skills.map(s => ({ ...s, level: 1, maxLevel: 5 }))
    }
    set(s => ({ inventory: [...s.inventory, weaponWithLevels] }))
    get().updateQuest('weapon_rarity', weapon.rarity)
    get().saveGame()
  },

  upgradeSkill: (weaponId, skillIndex) => {
    const state = get()
    if (state.skillPoints <= 0) return

    // Find weapon in inventory OR equipped
    let weapon = state.equippedWeapon
    if (!weapon || weapon.id !== weaponId) {
      weapon = state.inventory.find(w => w.id === weaponId) || null
    }
    if (!weapon || !weapon.skills[skillIndex]) return

    const skill = weapon.skills[skillIndex]
    const currentLevel = skill.level || 1
    const maxLevel = skill.maxLevel || 5
    if (currentLevel >= maxLevel) return

    // Upgrade skill
    const newSkills = [...weapon.skills]
    newSkills[skillIndex] = {
      ...skill,
      level: currentLevel + 1,
      damage: skill.type === 'heal' ? skill.damage - 5 : skill.damage + 5, // +5 damage per level, heal also +5
    }
    const newWeapon = { ...weapon, skills: newSkills }

    // Update in inventory
    if (state.equippedWeapon?.id === weaponId) {
      set({ equippedWeapon: newWeapon, skillPoints: state.skillPoints - 1 })
    } else {
      const newInv = state.inventory.map(w => w.id === weaponId ? newWeapon : w)
      set({ inventory: newInv, skillPoints: state.skillPoints - 1 })
    }
    if (state.soundEnabled) SoundSystem.play('menu_click')
  },

  spendStatPoint: (stat) => {
    const state = get()
    if (state.statPoints <= 0) return
    const newStats = { ...state.stats }
    newStats[stat] = (newStats[stat] || 0) + 1
    // Stats affect max HP/MP
    const hpBonus = stat === 'def' ? 5 : 0
    const mpBonus = 0
    set({
      stats: newStats,
      statPoints: state.statPoints - 1,
      maxHp: state.maxHp + hpBonus,
      hp: state.hp + hpBonus,
    })
    if (state.soundEnabled) SoundSystem.play('menu_click')
  },

  toggleStats: () => set(s => ({ showStats: !s.showStats })),

  addItem: (item) => set(s => {
    const existing = s.items.find(i => i.id === item.id)
    if (existing) {
      return { items: s.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) }
    }
    return { items: [...s.items, { ...item, quantity: 1 }] }
  }),

  removeItem: (itemId) => set(s => ({
    items: s.items.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0)
  })),

  toggleInventory: () => set(s => ({ showInventory: !s.showInventory })),
  toggleShop: () => set(s => ({ showShop: !s.showShop })),
  toggleQuests: () => set(s => ({ showQuests: !s.showQuests })),

  openGacha: (result) => {
    set({ showGacha: true, gachaResult: result })
  },
  closeGacha: () => set({ showGacha: false, gachaResult: null }),

  openDialogue: (name, text) => set({ showDialogue: true, dialogueName: name, dialogueText: text }),
  closeDialogue: () => set({ showDialogue: false }),

  gainExp: (amount) => {
    const state = get()
    let newExp = state.exp + amount
    let newLevel = state.level
    let newExpToNext = state.expToNext
    let newMaxHp = state.maxHp
    let newMaxMp = state.maxMp
    let newStats = { ...state.stats }
    let statPoints = state.statPoints
    let skillPoints = state.skillPoints
    let leveled = false
    while (newExp >= newExpToNext) {
      newExp -= newExpToNext
      newLevel++
      newExpToNext = Math.floor(newExpToNext * 1.5)
      newMaxHp += 12
      newMaxMp += 6
      newStats.str += 1
      newStats.def += 1
      newStats.spd += 1
      statPoints += 2  // 2 stat points per level
      skillPoints += 1  // 1 skill point per level
      leveled = true
    }
    set({
      exp: newExp, level: newLevel, expToNext: newExpToNext,
      maxHp: newMaxHp, maxMp: newMaxMp, stats: newStats,
      statPoints, skillPoints,
      hp: newMaxHp, mp: newMaxMp,
    })
    if (leveled && state.soundEnabled) SoundSystem.play('level_up')
  },

  gainGold: (amount) => {
    set(s => ({ gold: s.gold + amount }))
    get().updateQuest('gold', get().gold + amount)
  },

  takeDamage: (amount) => set(s => ({ hp: Math.max(0, s.hp - amount) })),

  addDamageNumber: (value, x, y, type) => set(s => ({
    damageNumbers: [...s.damageNumbers, { id: dmgId++, value, x, y, type }]
  })),

  clearDamageNumbers: () => set({ damageNumbers: [] }),
  setShake: (v) => set({ shakeScreen: v }),

  initNewGame: () => {
    set({
      ...defaultState,
      screen: 'intro',
      inventory: [],
      items: [
        { id: 1, name: 'Potion', type: 'heal', value: 30, quantity: 3 },
        { id: 3, name: 'Ether', type: 'mp_heal', value: 20, quantity: 2 },
      ],
    })
    fetch('/data/quests.json').then(r => r.json()).then(quests => {
      set({ quests })
      if (get().soundEnabled) SoundSystem.play('menu_click')
      get().saveGame()
    })
  },

  loadGame: () => {
    try {
      const data = localStorage.getItem('pixel-saga-save')
      if (data) {
        const parsed = JSON.parse(data)
        set({ ...parsed, screen: 'game', inBattle: false, currentMonster: null })
        if (get().soundEnabled) SoundSystem.play('menu_click')
        return true
      }
    } catch (e) {
      console.error('Failed to load save', e)
    }
    return false
  },

  saveGame: () => {
    const state = get()
    const saveData = {
      playerName: state.playerName,
      level: state.level,
      exp: state.exp,
      expToNext: state.expToNext,
      hp: state.hp,
      maxHp: state.maxHp,
      mp: state.mp,
      maxMp: state.maxMp,
      gold: state.gold,
      skillPoints: state.skillPoints,
      statPoints: state.statPoints,
      stats: state.stats,
      equippedWeapon: state.equippedWeapon,
      inventory: state.inventory,
      items: state.items,
      currentMap: state.currentMap,
      playerPos: state.playerPos,
      facing: state.facing,
      monstersKilled: state.monstersKilled,
      quests: state.quests,
      soundEnabled: state.soundEnabled,
    }
    try {
      localStorage.setItem('pixel-saga-save', JSON.stringify(saveData))
    } catch (e) {
      console.error('Failed to save', e)
    }
  },

  levelUp: () => {
    const state = get()
    set({
      level: state.level + 1,
      expToNext: Math.floor(state.expToNext * 1.5),
      maxHp: state.maxHp + 12,
      maxMp: state.maxMp + 6,
      stats: { ...state.stats, str: state.stats.str + 1, def: state.stats.def + 1, spd: state.stats.spd + 1 },
      statPoints: state.statPoints + 2,
      skillPoints: state.skillPoints + 1,
      hp: state.maxHp + 12,
      mp: state.maxMp + 6,
    })
  },

  updateQuest: (type, value) => {
    const state = get()
    const newQuests = state.quests.map(q => {
      if (q.completed) return q
      if (q.type !== type) return q

      let newCurrent = q.current
      let completed = false

      switch (type) {
        case 'chest':
          newCurrent = (value || q.current + 1)
          if (newCurrent >= q.target) completed = true
          break
        case 'kill':
          newCurrent = value || q.current + 1
          if (newCurrent >= q.target) completed = true
          break
        case 'map':
          if (value === q.target) { completed = true; newCurrent = 1 }
          break
        case 'boss':
          if (value === q.target) { completed = true; newCurrent = 1 }
          break
        case 'weapon_rarity':
          if (value === q.target) { completed = true; newCurrent = 1 }
          break
        case 'gold':
          newCurrent = value || state.gold
          if (newCurrent >= q.target) completed = true
          break
      }

      if (completed && !q.completed) {
        if (q.reward.gold) get().gainGold(q.reward.gold)
        if (q.reward.exp) get().gainExp(q.reward.exp)
        if (q.reward.item) get().addItem(q.reward.item)
        set({ questNotification: `🏆 Quest Complete: ${q.title}!` })
        if (questNotifTimer) clearTimeout(questNotifTimer)
        questNotifTimer = setTimeout(() => set({ questNotification: null }), 3000)
        if (get().soundEnabled) SoundSystem.play('level_up')
      }

      return { ...q, current: newCurrent, completed }
    })
    set({ quests: newQuests })
  },

  toggleSound: () => {
    const enabled = !get().soundEnabled
    set({ soundEnabled: enabled })
    if (!enabled) SoundSystem.stopBgm()
  },
}))
