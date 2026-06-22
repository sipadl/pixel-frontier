import { useGameStore } from '@/store/gameStore'
import monstersData from '@/game/data/monsters.json'
import weaponsData from '@/game/data/weapons.json'
import gachaRates from '@/game/data/gacha_rates.json'

export function getMonstersForMap(mapName: string) {
  return monstersData.filter((m: any) => m.map === mapName && !m.boss)
}

export function getBossForMap(mapName: string) {
  return monstersData.find((m: any) => m.map === mapName && m.boss) || null
}

export function rollGacha(): any {
  const roll = Math.random()
  let cumulative = 0
  let selectedRarity = 'Common'
  for (const [rarity, rate] of Object.entries(gachaRates)) {
    cumulative += rate as number
    if (roll < cumulative) {
      selectedRarity = rarity
      break
    }
  }
  const pool = weaponsData.filter((w: any) => w.rarity === selectedRarity)
  if (pool.length === 0) {
    return weaponsData[0]
  }
  return pool[Math.floor(Math.random() * pool.length)]
}

export function rollMonsterDrop(monster: any) {
  const dropChance = monster.boss ? 0.8 : 0.2
  if (Math.random() < dropChance) {
    return rollGacha()
  }
  return null
}

export function calcDamage(atk: number, def: number, skillDamage: number) {
  const base = skillDamage + Math.floor(atk * 0.5)
  const variance = Math.floor(Math.random() * 5) - 2
  return Math.max(1, base - def + variance)
}
