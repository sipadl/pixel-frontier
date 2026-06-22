import { create } from 'zustand'
import { SoundSystem } from '@/game/systems/SoundSystem'

export interface Weapon {
  id: number
  name: string
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'
  atk: number
  skills: { name: string; damage: number; mpCost: number; type: string }[]
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
  atk: number
  def: number

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
  screen: 'menu' | 'game' | 'battle' | 'gameover'
  showInventory: boolean
  showGacha: boolean
  showShop: boolean
  showDialogue: boolean
  dialogueText: string
  dialogueName: string
  gachaResult: Weapon | null
  shakeScreen: boolean
  damageNumbers: { id: number; value: number; x: number; y: number; type: string }[]
  soundEnabled: boolean

  // Actions
  setPlayerName: (name: string) => void
  setScreen: (screen: 'menu' | 'game' | 'battle' | 'gameover') => void
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
  atk: 5,
  def: 3,
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
  screen: 'menu' as 'menu' | 'game' | 'battle' | 'gameover',
  showInventory: false,
  showGacha: false,
  showShop: false,
  showDialogue: false,
  dialogueText: '',
  dialogueName: '',
  gachaResult: null as Weapon | null,
  shakeScreen: false,
  damageNumbers: [] as { id: number; value: number; x: number; y: number; type: string }[],
  soundEnabled: true,
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
    const cloned = { ...monster, hp: monster.hp, maxHp: monster.hp }
    set({
      inBattle: true,
      currentMonster: cloned,
      isPlayerTurn: true,
      battleLog: [`${cloned.name} appeared!`],
      battleWon: false,
      screen: 'battle',
    })
    if (get().soundEnabled) {
      SoundSystem.play(cloned.boss ? 'boss' : 'hit')
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
      set({ inBattle: false, currentMonster: null, battleWon: false, screen: 'gameover' })
      if (state.soundEnabled) SoundSystem.play('defeat')
    }
  },

  playerAttack: () => {
    const state = get()
    if (!state.currentMonster || !state.isPlayerTurn) return
    const weapon = state.equippedWeapon
    const baseAtk = state.atk + (weapon ? weapon.atk : 0)
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
      setTimeout(() => get().monsterTurn(), 800)
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
    const baseAtk = state.atk + weapon.atk
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
    damage = Math.max(1, skill.damage + Math.floor(baseAtk * 0.5) - state.currentMonster.def + Math.floor(Math.random() * 5))
    const newHp = Math.max(0, state.currentMonster.hp - damage)
    set({
      currentMonster: { ...state.currentMonster, hp: newHp },
      mp: state.mp - skill.mpCost,
      isPlayerTurn: false,
      battleLog: [...state.battleLog, `Used ${skill.name}! ${damage} damage!`],
    })
    get().addDamageNumber(damage, 600, 150, skill.type)
    if (state.soundEnabled) SoundSystem.play('skill')
    if (newHp <= 0) {
      get().addBattleLog(`${state.currentMonster.name} defeated!`)
      setTimeout(() => get().endBattle(true), 1000)
    } else {
      setTimeout(() => get().monsterTurn(), 800)
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
    const chance = 0.5 + (state.level * 0.05)
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
    const skillIdx = Math.floor(Math.random() * monster.skills.length)
    const skill = monster.skills[skillIdx]
    const damage = Math.max(1, skill.damage - state.def + Math.floor(Math.random() * 3))
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
    set(s => ({ inventory: [...s.inventory, weapon] }))
    get().updateQuest('weapon_rarity', weapon.rarity)
    get().saveGame()
  },

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
    get().updateQuest('chest', get().quests.find(q => q.type === 'chest')?.current || 0)
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
    let newAtk = state.atk
    let newDef = state.def
    let leveled = false
    while (newExp >= newExpToNext) {
      newExp -= newExpToNext
      newLevel++
      newExpToNext = Math.floor(newExpToNext * 1.5)
      newMaxHp += 15
      newMaxMp += 8
      newAtk += 2
      newDef += 1
      leveled = true
    }
    set({
      exp: newExp, level: newLevel, expToNext: newExpToNext,
      maxHp: newMaxHp, maxMp: newMaxMp, atk: newAtk, def: newDef,
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
      screen: 'game',
      inventory: [],
      items: [
        { id: 1, name: 'Potion', type: 'heal', value: 30, quantity: 3 },
        { id: 3, name: 'Ether', type: 'mp_heal', value: 20, quantity: 2 },
      ],
    })
    // Load quests
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
      atk: state.atk,
      def: state.def,
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
      maxHp: state.maxHp + 15,
      maxMp: state.maxMp + 8,
      atk: state.atk + 2,
      def: state.def + 1,
      hp: state.maxHp + 15,
      mp: state.maxMp + 8,
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
        // Give rewards
        if (q.reward.gold) get().gainGold(q.reward.gold)
        if (q.reward.exp) get().gainExp(q.reward.exp)
        if (q.reward.item) get().addItem(q.reward.item)
        // Show notification
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
