import monstersData from './monsters.json'
import weaponsData from './weapons.json'

export function getMonster(id: number) {
  return monstersData.find((m: any) => m.id === id) || null
}

export function getMonstersForMap(mapName: string) {
  return monstersData.filter((m: any) => m.map === mapName && !m.boss)
}

export function getBossForMap(mapName: string) {
  return monstersData.find((m: any) => m.map === mapName && m.boss) || null
}

export function getWeapon(id: number) {
  return weaponsData.find((w: any) => w.id === id) || null
}

export function getAllWeapons() {
  return weaponsData
}
