import { useGameStore } from '@/store/gameStore'

const SAVE_KEY = 'pixel-saga-save'

export function saveGame() {
  const state = useGameStore.getState()
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
  }
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData))
    return true
  } catch {
    return false
  }
}

export function loadGame() {
  try {
    const data = localStorage.getItem(SAVE_KEY)
    if (data) return JSON.parse(data)
  } catch {}
  return null
}

export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null
}

export function deleteSave() {
  localStorage.removeItem(SAVE_KEY)
}
