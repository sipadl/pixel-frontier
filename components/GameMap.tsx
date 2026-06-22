'use client'
import { useGameStore } from '@/store/gameStore'
import { useEffect, useRef, useCallback, useState } from 'react'
import { getMonstersForMap, getBossForMap, rollGacha, rollMonsterDrop } from '@/game/systems/GameSystems'
import mapsData from '../game/data/maps.json'

const TILE_SIZE = 40
const VIEWPORT_TILES_X = 17
const VIEWPORT_TILES_Y = 13

const TILE_COLORS: Record<number, { bg: string; border?: string; icon?: string; label?: string }> = {
  1: { bg: 'bg-gray-800', border: 'border-gray-700', label: '🧱' },    // Wall
  2: { bg: 'bg-green-800/80', label: '🌿' },                         // Grass
  3: { bg: 'bg-amber-700', label: '🏠' },                            // House
  4: { bg: 'bg-blue-600', label: '💧' },                             // Water
  5: { bg: 'bg-amber-600', label: '🪵' },                            // Wood floor
  6: { bg: 'bg-green-900', label: '🌲' },                            // Tree
  7: { bg: 'bg-green-700', label: '🌳' },                            // Tree2
  8: { bg: 'bg-emerald-900', label: '🍃' },                          // Bush
  9: { bg: 'bg-gray-600', label: '🚪' },                             // Cave entrance
  10: { bg: 'bg-gray-700', label: '🪨' },                            // Cave wall
  11: { bg: 'bg-amber-800', label: '💎' },                           // Gem
  12: { bg: 'bg-gray-900', label: '🕳️' },                            // Dark
  13: { bg: 'bg-yellow-600', label: '⭐' },                           // Star/boss
  14: { bg: 'bg-purple-800', label: '🚪' },                          // Exit
}

const WALKABLE = [2, 5, 8, 13, 14]

const MONSTER_ICONS: Record<number, string> = {
  1: '🟢', // Green Slime
  2: '🐔', // Angry Chicken
  3: '🐺', // Wild Wolf
  4: '🌳', // Treant
  5: '🦇', // Dark Bat
  6: '🗿', // Stone Golem
  10: '🐲', // Forest Guardian (boss)
  11: '👹', // Cave King (boss)
}

export default function GameMap() {
  const {
    currentMap, playerPos, facing, setPlayerPos, setFacing, setCurrentMap,
    startBattle, openGacha, openDialogue, showDialogue,
    level, equippedWeapon, inventory, shakeScreen
  } = useGameStore()

  const [mapData, setMapData] = useState<any>(null)
  const [chests, setChests] = useState<any[]>([])
  const [npcs, setNpcs] = useState<any[]>([])
  const [encounterCount, setEncounterCount] = useState(0)
  const [animFrame, setAnimFrame] = useState(0)
  const [isMoving, setIsMoving] = useState(false)
  const [showBossIcon, setShowBossIcon] = useState(false)
  const moveTimer = useRef<NodeJS.Timeout | null>(null)

  // Load map data
  useEffect(() => {
    const m = (mapsData as any)[currentMap]
    if (m) {
      setMapData(m)
      setChests(JSON.parse(JSON.stringify(m.chests || [])))
      setNpcs(m.npcs || [])
    }
  }, [currentMap])

  // Check for boss
  useEffect(() => {
    const boss = getBossForMap(currentMap)
    setShowBossIcon(!!boss)
  }, [currentMap])

  // Animation ticker
  useEffect(() => {
    const interval = setInterval(() => setAnimFrame(f => (f + 1) % 4), 400)
    return () => clearInterval(interval)
  }, [])

  const isWalkable = useCallback((x: number, y: number) => {
    if (!mapData) return false
    if (x < 0 || x >= mapData.width || y < 0 || y >= mapData.height) return false
    const tile = mapData.tiles[y]?.[x]
    if (!WALKABLE.includes(tile)) return false
    // Check NPC collision
    if (npcs.some(n => n.x === x && n.y === y)) return false
    // Check chest collision
    if (chests.some(c => c.x === x && c.y === y && !c.opened)) return false
    return true
  }, [mapData, npcs, chests])

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (isMoving || showDialogue) return
    const newX = playerPos.x + dx
    const newY = playerPos.y + dy

    // Set facing
    if (dx === 0 && dy === -1) setFacing('up')
    else if (dx === 0 && dy === 1) setFacing('down')
    else if (dx === -1) setFacing('left')
    else if (dx === 1) setFacing('right')

    if (!isWalkable(newX, newY)) return

    setIsMoving(true)
    setPlayerPos(newX, newY)

    // Check NPC interaction
    const npc = npcs.find(n => n.x === newX && n.y === newY)
    if (npc) {
      openDialogue(npc.name, npc.dialog)
      setIsMoving(false)
      return
    }

    // Check chest interaction
    const chestIdx = chests.findIndex(c => c.x === newX && c.y === newY && !c.opened)
    if (chestIdx !== -1) {
      const newChests = [...chests]
      newChests[chestIdx] = { ...newChests[chestIdx], opened: true }
      setChests(newChests)
      const weapon = rollGacha()
      openGacha(weapon)
      setIsMoving(false)
      return
    }

    // Check map transition
    const tile = mapData?.tiles[newY]?.[newX]
    if (tile === 14 || tile === 9) {
      const nextMap = mapData.nextMap
      if (nextMap) {
        setCurrentMap(nextMap)
        setIsMoving(false)
        return
      }
    }

    // Random encounter check
    const encounterRate = mapData?.encounterRate || 0.1
    setEncounterCount(c => c + 1)
    if (encounterCount > 3 && Math.random() < encounterRate) {
      const monsters = getMonstersForMap(currentMap)
      if (monsters.length > 0) {
        const monster = monsters[Math.floor(Math.random() * monsters.length)]
        startBattle({ ...monster, hp: monster.hp, maxHp: monster.hp })
        setEncounterCount(0)
      }
    }

    setTimeout(() => setIsMoving(false), 120)
  }, [playerPos, isWalkable, isMoving, showDialogue, mapData, chests, npcs, currentMap, encounterCount])

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (showDialogue) {
        if (e.key === ' ' || e.key === 'Enter') openDialogue('', '')
        return
      }
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': movePlayer(0, -1); break
        case 'ArrowDown': case 's': case 'S': movePlayer(0, 1); break
        case 'ArrowLeft': case 'a': case 'A': movePlayer(-1, 0); break
        case 'ArrowRight': case 'd': case 'D': movePlayer(1, 0); break
        case 'e': case 'E':
          // Interact with facing direction
          const fx = playerPos.x + (facing === 'left' ? -1 : facing === 'right' ? 1 : 0)
          const fy = playerPos.y + (facing === 'up' ? -1 : facing === 'down' ? 1 : 0)
          const npc = npcs.find(n => n.x === fx && n.y === fy)
          if (npc) openDialogue(npc.name, npc.dialog)
          break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [movePlayer, facing, playerPos, npcs, showDialogue])

  if (!mapData) return <div className="flex items-center justify-center h-full"><p className="font-pixel text-white">Loading map...</p></div>

  // Calculate viewport offset (center on player)
  const offsetX = Math.max(0, Math.min(
    playerPos.x - Math.floor(VIEWPORT_TILES_X / 2),
    mapData.width - VIEWPORT_TILES_X
  ))
  const offsetY = Math.max(0, Math.min(
    playerPos.y - Math.floor(VIEWPORT_TILES_Y / 2),
    mapData.height - VIEWPORT_TILES_Y
  ))

  const facingEmoji = facing === 'up' ? '↑' : facing === 'down' ? '↓' : facing === 'left' ? '←' : '→'

  // Render visible tiles
  const tiles = []
  for (let vy = 0; vy < VIEWPORT_TILES_Y; vy++) {
    for (let vx = 0; vx < VIEWPORT_TILES_X; vx++) {
      const mx = offsetX + vx
      const my = offsetY + vy
      const tileId = mapData.tiles[my]?.[mx] ?? 1
      const tile = TILE_COLORS[tileId] || TILE_COLORS[1]
      const isPlayer = mx === playerPos.x && my === playerPos.y
      const chest = chests.find(c => c.x === mx && c.y === my)
      const npc = npcs.find(n => n.x === mx && n.y === my)

      tiles.push(
        <div
          key={`${vx}-${vy}`}
          className={`${tile.bg} border ${tile.border || 'border-transparent'} flex items-center justify-center relative transition-colors duration-150`}
          style={{ width: TILE_SIZE, height: TILE_SIZE }}
        >
          {/* Tile icon */}
          {!isPlayer && tile.icon && <span className="text-xs opacity-60">{tile.icon}</span>}
          {!isPlayer && !tile.icon && tile.label && <span className="text-sm opacity-40">{tile.label}</span>}

          {/* Unopened chest */}
          {chest && !chest.opened && !isPlayer && (
            <span className="text-lg animate-bounce">📦</span>
          )}

          {/* NPC */}
          {npc && !isPlayer && (
            <div className="text-lg animate-pulse">👴</div>
          )}

          {/* Player */}
          {isPlayer && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className={`w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-700 border-2 border-blue-300 rounded-lg flex items-center justify-center text-sm font-bold shadow-lg ${isMoving ? 'scale-110' : ''} transition-transform duration-100`}>
                🧙
              </div>
              {/* Facing indicator */}
              <span className="absolute -top-2 text-[8px] text-blue-300 font-bold">{facingEmoji}</span>
            </div>
          )}
        </div>
      )
    }
  }

  return (
    <div className={`relative flex-1 flex flex-col items-center justify-center bg-gray-950 ${shakeScreen ? 'animate-shake' : ''}`}>
      {/* Map name banner */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-black/70 px-4 py-1 rounded-full border border-gray-600">
          <p className="font-pixel text-[10px] text-green-400">
            {mapData.name}
          </p>
        </div>
      </div>

      {/* Boss indicator */}
      {showBossIcon && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-red-900/70 px-3 py-1 rounded-full border border-red-500 animate-pulse">
            <p className="font-pixel text-[9px] text-red-300">⚠️ BOSS AHEAD</p>
          </div>
        </div>
      )}

      {/* Tile Grid */}
      <div
        className="inline-grid gap-0 border-2 border-gray-700 rounded-lg overflow-hidden shadow-2xl"
        style={{
          gridTemplateColumns: `repeat(${VIEWPORT_TILES_X}, ${TILE_SIZE}px)`,
          gridTemplateRows: `repeat(${VIEWPORT_TILES_Y}, ${TILE_SIZE}px)`,
        }}
      >
        {tiles}
      </div>

      {/* Mobile controls */}
      <div className="md:hidden mt-4 grid grid-cols-3 gap-1 w-40">
        <div />
        <button onClick={() => movePlayer(0, -1)} className="game-btn-sm">▲</button>
        <div />
        <button onClick={() => movePlayer(-1, 0)} className="game-btn-sm">◄</button>
        <button onClick={() => movePlayer(0, 1)} className="game-btn-sm">▼</button>
        <button onClick={() => movePlayer(1, 0)} className="game-btn-sm">►</button>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20">
        <p className="font-pixel text-[8px] text-gray-500 text-center">
          WASD / Arrow Keys to move • E to interact
        </p>
      </div>
    </div>
  )
}
