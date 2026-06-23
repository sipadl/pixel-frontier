'use client'
import { useGameStore } from '@/store/gameStore'
import { useEffect, useState, useCallback, useRef } from 'react'
import PixelArt, {
  HERO_DOWN_1, HERO_DOWN_2,
  MONSTER_SPRITES, PALETTE_DEFAULT,
  TILE_GRASS_1, TILE_DIRT_1, TILE_STONE_1,
} from '@/components/PixelArt'

type ZoneKey = 'village' | 'forest' | 'cave'
type TileKey = 'grass' | 'dirt' | 'stone'

const ZONE_CONFIG: Record<ZoneKey, { bg: string; tile: TileKey; label: string; trees: string[] }> = {
  village: { bg: 'from-sky-400 via-sky-300 to-green-300', tile: 'grass', label: '🏘️ Village', trees: ['🌳','🌲','🏡','🌻','🪨'] },
  forest: { bg: 'from-green-700 via-emerald-800 to-green-900', tile: 'dirt', label: '🌲 Forest', trees: ['🌲','🌳','🍄','🌿','🌾'] },
  cave: { bg: 'from-gray-900 via-purple-950 to-gray-900', tile: 'stone', label: '⛰️ Cave', trees: ['🪨','💎','🦇','⛓️','🕯️'] },
}

const TILE_MAP: Record<TileKey, number[][]> = { grass: TILE_GRASS_1, dirt: TILE_DIRT_1, stone: TILE_STONE_1 }
const MAP_W = 8, MAP_H = 8

// Element colors for skill effects
const ELEMENT_COLORS: Record<string, { color: string; icon: string }> = {
  fire: { color: '#ef4444', icon: '🔥' },
  ice: { color: '#38bdf8', icon: '❄️' },
  lightning: { color: '#facc15', icon: '⚡' },
  earth: { color: '#a3e635', icon: '🪨' },
  dark: { color: '#a855f7', icon: '🌑' },
  physical: { color: '#f97316', icon: '⚔️' },
}

export default function TapGame() {
  const screen = useGameStore(s => s.screen)
  const monster = useGameStore(s => s.monster)
  const hp = useGameStore(s => s.hp)
  const maxHp = useGameStore(s => s.maxHp)
  const mp = useGameStore(s => s.mp)
  const maxMp = useGameStore(s => s.maxMp)
  const level = useGameStore(s => s.level)
  const gold = useGameStore(s => s.gold)
  const stats = useGameStore(s => s.stats)
  const equippedWeapon = useGameStore(s => s.equippedWeapon)
  const combo = useGameStore(s => s.combo)
  const damageNumbers = useGameStore(s => s.damageNumbers)
  const kills = useGameStore(s => s.kills)
  const distance = useGameStore(s => s.distance)
  const zone = useGameStore(s => s.zone)
  const battleLog = useGameStore(s => s.battleLog)
  const showVictory = useGameStore(s => s.showVictory)
  const victoryRewards = useGameStore(s => s.victoryRewards)
  const items = useGameStore(s => s.items)
  const questNotification = useGameStore(s => s.questNotification)
  const tapAttack = useGameStore(s => s.tapAttack)
  const clearDamageNumbers = useGameStore(s => s.clearDamageNumbers)
  const toggleInventory = useGameStore(s => s.toggleInventory)
  const toggleQuests = useGameStore(s => s.toggleQuests)
  const toggleStats = useGameStore(s => s.toggleStats)
  const useItem = useGameStore(s => s.useItem)
  const saveGame = useGameStore(s => s.saveGame)
  const checkEnrage = useGameStore(s => s.checkEnrage)
  const startEncounter = useGameStore(s => s.startEncounter)

  // Local state
  const [px, setPx] = useState(2)
  const [py, setPy] = useState(2)
  const [walkFrame, setWalkFrame] = useState(0)
  const [isMoving, setIsMoving] = useState(false)
  const [steps, setSteps] = useState(0)
  const [battleMenu, setBattleMenu] = useState<'attack'|'skill'|'item'|'run'>('attack')
  const [showItems, setShowItems] = useState(false)
  // BF-style attack animation
  const [heroAttacking, setHeroAttacking] = useState(false)
  const [heroLungeX, setHeroLungeX] = useState(0)
  const [skillEffect, setSkillEffect] = useState<{ type: string; color: string; icon: string } | null>(null)
  const [enemyHit, setEnemyHit] = useState(false)

  // Decor
  const decorPositions = useRef<{ x: number; y: number; emoji: string }[]>([])
  if (decorPositions.current.length === 0) {
    const cfg = ZONE_CONFIG[zone]
    for (let i = 0; i < 6; i++) {
      decorPositions.current.push({
        x: (i * 3 + 1) % MAP_W,
        y: ((i * 5 + 2) % (MAP_H - 2)) + 1,
        emoji: cfg.trees[i % cfg.trees.length],
      })
    }
  }

  // Effects
  useEffect(() => {
    if (screen !== 'game' || isMoving) return
    const i = setInterval(() => setWalkFrame(f => (f + 1) % 2), 400)
    return () => clearInterval(i)
  }, [screen, isMoving])
  useEffect(() => { const t = setInterval(saveGame, 30000); return () => clearInterval(t) }, [])
  useEffect(() => {
    if (damageNumbers.length > 0) { const t = setTimeout(clearDamageNumbers, 800); return () => clearTimeout(t) }
  }, [damageNumbers])
  useEffect(() => {
    if (monster && monster.boss && monster.hp / monster.maxHp <= 0.5 && monster.phase === 1) checkEnrage()
  }, [monster?.hp])

  // Movement
  const movePlayer = useCallback((dir: 'up'|'down'|'left'|'right') => {
    if (isMoving || screen !== 'game') return
    setIsMoving(true)
    setWalkFrame(f => (f + 1) % 2)
    let nx = px, ny = py
    if (dir === 'up') ny = Math.max(0, py - 1)
    if (dir === 'down') ny = Math.min(MAP_H - 1, py + 1)
    if (dir === 'left') nx = Math.max(0, px - 1)
    if (dir === 'right') nx = Math.min(MAP_W - 1, px + 1)
    setPx(nx); setPy(ny)
    setTimeout(() => {
      setIsMoving(false)
      setSteps(s => s + 1)
      useGameStore.setState({ distance: useGameStore.getState().distance + 1 })
      if (Math.random() < 0.12 || steps % 20 === 19) startEncounter()
    }, 220)
  }, [px, py, isMoving, screen, steps, startEncounter])

  // BF-style attack with lunge animation
  const doAttack = useCallback((isSkill = false) => {
    if (heroAttacking || !monster || monster.hp <= 0) return
    setHeroAttacking(true)
    // Hero lunges forward
    setHeroLungeX(60)
    setEnemyHit(false)
    // Hit enemy after lunge
    setTimeout(() => {
      setEnemyHit(true)
      tapAttack()
      // Show skill effect if skill
      if (isSkill && equippedWeapon) {
        const el = ELEMENT_COLORS[equippedWeapon.rarity.toLowerCase()] || ELEMENT_COLORS.physical
        setSkillEffect({ type: equippedWeapon.rarity, color: el.color, icon: el.icon })
        setTimeout(() => setSkillEffect(null), 600)
      }
      // Hero returns
      setTimeout(() => { setHeroLungeX(0); setEnemyHit(false) }, 300)
    }, 250)
    setTimeout(() => setHeroAttacking(false), 600)
  }, [heroAttacking, monster, tapAttack, equippedWeapon])

  // Tap quadrant
  const handleTapMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (screen !== 'game') return
    const rect = e.currentTarget.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    if (Math.abs(dx) > Math.abs(dy)) movePlayer(dx < 0 ? 'left' : 'right')
    else movePlayer(dy < 0 ? 'up' : 'down')
  }

  if (screen !== 'game' && screen !== 'battle') return null

  const cfg = ZONE_CONFIG[zone]
  const tileData = TILE_MAP[cfg.tile]
  const heroSprite = walkFrame === 0 ? HERO_DOWN_1 : HERO_DOWN_2
  const monsterSprite = monster ? (MONSTER_SPRITES[monster.name] || null) : null
  const tileSize = 48
  const halfW = 4, halfH = 4
  const camX = Math.max(0, Math.min(MAP_W - halfW * 2, px - halfW))
  const camY = Math.max(0, Math.min(MAP_H - halfH * 2, py - halfH))

  const renderTiles: { x: number; y: number; tx: number; ty: number }[] = []
  for (let ty = 0; ty < halfH * 2 + 1; ty++) {
    for (let tx = 0; tx < halfW * 2 + 1; tx++) {
      const mx = camX + tx, my = camY + ty
      if (mx >= 0 && mx < MAP_W && my >= 0 && my < MAP_H)
        renderTiles.push({ x: tx, y: ty, tx: mx, ty: my })
    }
  }

  return (
    <div className="fixed inset-0 overflow-hidden select-none bg-black" style={{ touchAction: 'manipulation' }} onClick={handleTapMove}>

      {/* ===== EXPLORATION (top-down) ===== */}
      {screen === 'game' && (
        <>
          <div className={`absolute inset-0 bg-gradient-to-b ${cfg.bg} transition-all duration-500`} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative" style={{ width: (halfW * 2 + 1) * tileSize, height: (halfH * 2 + 1) * tileSize }}>
              {renderTiles.map(({ x, y, tx, ty }) => (
                <div key={`${tx}-${ty}`} className="absolute" style={{ left: x * tileSize, top: y * tileSize, width: tileSize, height: tileSize }}>
                  <PixelArt data={tileData} palette={PALETTE_DEFAULT} pixelSize={tileSize / 32} />
                  {decorPositions.current.filter(d => d.x === tx && d.y === ty).map((d, i) => (
                    <div key={i} className="absolute inset-0 flex items-center justify-center text-xl opacity-80">{d.emoji}</div>
                  ))}
                  {tx === px && ty === py && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="relative" style={{ transform: isMoving ? 'translateY(-3px)' : 'translateY(0)' }}>
                        <div className="absolute inset-[-6px] bg-yellow-400/40 rounded-full blur-sm" />
                        <div className="absolute inset-[-2px] bg-blue-500/30 rounded-full" />
                        <PixelArt data={heroSprite} palette={PALETTE_DEFAULT} pixelSize={4} />
                        {equippedWeapon && <div className="absolute -top-2 -right-2 text-sm animate-pulse">⚔️</div>}
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                          <span className="font-pixel text-[7px] text-white bg-black/60 px-1 rounded">Hero</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <p className="font-pixel text-[8px] text-white/40 text-center">Tap kiri/kanan/atas/bawah untuk jalan</p>
          </div>
        </>
      )}

      {/* ===== BATTLE (BF-style side-view) ===== */}
      {screen === 'battle' && (
        <>
          {/* Layered BG */}
          <div className={`absolute inset-0 bg-gradient-to-b ${cfg.bg}`} />
          <div className="absolute bottom-0 left-0 right-0 h-[50%] pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/50" />
            <div className="absolute bottom-0 left-0 right-0 flex justify-center opacity-70">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i}><PixelArt data={tileData} palette={PALETTE_DEFAULT} pixelSize={4} /></div>
              ))}
            </div>
          </div>

          {/* Hero (LEFT side — BF style) */}
          <div className="absolute left-[8%] bottom-[30%] z-20 pointer-events-none transition-transform duration-200"
            style={{ transform: `translateX(${heroLungeX}px)` }}>
            <div className="relative flex flex-col items-center">
              <div className="mb-1 bg-black/60 px-1.5 py-0.5 rounded">
                <span className="font-pixel text-[8px] text-white">Lv.{level}</span>
                <span className="font-pixel text-[7px] text-green-400 ml-1">Hero</span>
              </div>
              <PixelArt data={heroSprite} palette={PALETTE_DEFAULT} pixelSize={6} />
              {/* Weapon glow */}
              {equippedWeapon && (
                <div className="absolute top-1 -right-3 text-sm animate-pulse">
                  {equippedWeapon.rarity === 'Legendary' ? '🌟' : equippedWeapon.rarity === 'Epic' ? '💎' : '⚔️'}
                </div>
              )}
              {/* Hero HP bar */}
              <div className="mt-1 w-20">
                <div className="flex justify-between"><span className="font-pixel text-[6px] text-green-400">HP</span><span className="font-pixel text-[6px] text-green-300">{Math.max(0, hp)}/{maxHp}</span></div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                  <div className="h-full transition-all duration-200 rounded-full" style={{ width: `${Math.max(0, (hp / maxHp) * 100)}%`, background: hp > maxHp * 0.5 ? '#22c55e' : '#ef4444' }} />
                </div>
                <div className="flex justify-between mt-0.5"><span className="font-pixel text-[5px] text-blue-400">MP</span><span className="font-pixel text-[5px] text-blue-300">{mp}/{maxMp}</span></div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-200" style={{ width: `${Math.max(0, (mp / maxMp) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Monster (RIGHT side — BF style) */}
          {monster && (
            <div className={`absolute right-[8%] bottom-[30%] z-20 pointer-events-none transition-all duration-200 ${enemyHit ? 'animate-shake' : ''}`}>
              <div className="relative flex flex-col items-center">
                {/* Monster HP bar */}
                <div className="mb-1 w-24">
                  <div className="flex justify-between">
                    <span className="font-pixel text-[8px] text-red-300">{monster.name}</span>
                    <span className="font-pixel text-[7px] text-red-400">{monster.hp}/{monster.maxHp}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                    <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-200" style={{ width: `${(monster.hp / monster.maxHp) * 100}%` }} />
                  </div>
                  {monster.boss && <p className="font-pixel text-[6px] text-yellow-400 text-center mt-0.5 animate-pulse">★ BOSS {monster.phase}/2 ★</p>}
                </div>
                {/* Monster sprite */}
                <div className={`transition-all duration-300 ${monster.hp <= 0 ? 'opacity-0 scale-0 rotate-120' : ''}`}>
                  {monster.boss && (
                    <div className="absolute -inset-4 bg-yellow-500/20 rounded-xl animate-pulse blur-md" />
                  )}
                  {monsterSprite ? (
                    <PixelArt data={monsterSprite} palette={PALETTE_DEFAULT} pixelSize={monster.boss ? 9 : 7} />
                  ) : (
                    <div className={`${monster.boss ? 'w-24 h-24 text-5xl' : 'w-16 h-16 text-3xl'} bg-gray-800/80 border-2 border-gray-500 rounded-xl flex items-center justify-center`}>👾</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Skill effect overlay */}
          {skillEffect && (
            <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
              <div className="text-6xl animate-bounce" style={{ filter: `drop-shadow(0 0 20px ${skillEffect.color})` }}>{skillEffect.icon}</div>
              <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 70% 40%, ${skillEffect.color}33 0%, transparent 60%)` }} />
            </div>
          )}

          {/* Damage numbers */}
          {damageNumbers.map(d => (
            <div key={d.id} className="absolute z-30 pointer-events-none animate-float-up" style={{ left: `${d.x}%`, top: `${d.y}%` }}>
              <span className={`font-pixel text-base font-bold drop-shadow-lg ${d.type === 'legendary' ? 'text-yellow-300 text-xl' : d.type === 'magic' ? 'text-purple-400' : d.type === 'heal' ? 'text-green-400' : 'text-red-400'}`}>
                {d.type === 'heal' ? '+' : '-'}{d.value}{d.type === 'legendary' && ' 💥'}
              </span>
            </div>
          ))}

          {/* Battle menu */}
          {monster && monster.hp > 0 && (
            <div className="absolute bottom-12 left-2 right-2 z-30 pointer-events-auto">
              {!showItems ? (
                <div className="bg-[#0c1445]/95 border-2 border-[#3b4cca] rounded-lg p-2 shadow-lg shadow-blue-900/50 backdrop-blur-sm">
                  <div className="grid grid-cols-2 gap-1">
                    <button onClick={(e) => { e.stopPropagation(); doAttack(false) }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded bg-[#141b5c] hover:bg-[#1e2a8a] transition-all active:scale-95">
                      <span className="text-sm">⚔️</span>
                      <span className="font-pixel text-[11px] text-white">Attack</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); if (mp >= 5) doAttack(true) }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded transition-all active:scale-95 ${mp < 5 ? 'bg-[#141b5c] opacity-50' : 'bg-[#141b5c] hover:bg-[#1e2a8a]'}`}>
                      <span className="text-sm">🔮</span>
                      <span className="font-pixel text-[11px] text-white">Skill</span>
                      <span className="font-pixel text-[7px] text-blue-300 ml-auto">{mp}MP</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setShowItems(true) }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded bg-[#141b5c] hover:bg-[#1e2a8a] transition-all active:scale-95">
                      <span className="text-sm">🎒</span>
                      <span className="font-pixel text-[11px] text-white">Item</span>
                    </button>
                    <button onClick={(e) => {
                      e.stopPropagation()
                      if (Math.random() < 0.5 + stats.spd * 0.02) useGameStore.setState({ screen: 'game', monster: null })
                      else doAttack(false)
                    }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded bg-[#141b5c] hover:bg-[#1e2a8a] transition-all active:scale-95">
                      <span className="text-sm">🏃</span>
                      <span className="font-pixel text-[11px] text-white">Run</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0c1445]/95 border-2 border-[#3b4cca] rounded-lg p-2 shadow-lg shadow-blue-900/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-pixel text-[10px] text-gray-400">Select Item:</span>
                    <button onClick={(e) => { e.stopPropagation(); setShowItems(false) }} className="font-pixel text-[9px] text-red-400">✕</button>
                  </div>
                  <div className="space-y-0.5 max-h-24 overflow-y-auto">
                    {items.filter(i => i.quantity > 0).map(item => (
                      <button key={item.id} onClick={(e) => { e.stopPropagation(); useItem(item.id); setShowItems(false) }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded bg-[#141b5c] hover:bg-[#1e2a8a] text-left transition-colors">
                        <span className="text-sm">{item.type === 'heal' ? '🧪' : '💎'}</span>
                        <span className="font-pixel text-[9px] text-white">{item.name}</span>
                        <span className="font-pixel text-[8px] text-gray-400 ml-auto">×{item.quantity}</span>
                      </button>
                    ))}
                    {items.filter(i => i.quantity > 0).length === 0 && <p className="font-pixel text-[9px] text-gray-600 text-center py-2">No items</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ===== TOP HUD ===== */}
      <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-2">
        <div className="flex justify-between items-start">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-2 border border-gray-700 pointer-events-auto">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-700 border border-blue-300 rounded flex items-center justify-center text-[10px] cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleStats() }}>🧙</div>
              <div>
                <p className="font-pixel text-[8px] text-yellow-400">LV.{level}</p>
                <p className="font-pixel text-[6px] text-gray-400">{stats.str}ATK {stats.def}DEF {stats.spd}SPD</p>
              </div>
              <p className="font-pixel text-[6px] text-yellow-300">💰{gold}</p>
            </div>
            {screen === 'game' && (
              <>
                <div className="mb-0.5">
                  <div className="flex justify-between"><span className="font-pixel text-[6px] text-red-400">HP</span><span className="font-pixel text-[6px] text-red-300">{Math.max(0, hp)}/{maxHp}</span></div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                    <div className="h-full transition-all duration-200 rounded-full" style={{ width: `${Math.max(0, (hp / maxHp) * 100)}%`, background: hp > maxHp * 0.5 ? '#22c55e' : hp > maxHp * 0.25 ? '#eab308' : '#ef4444' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between"><span className="font-pixel text-[6px] text-blue-400">MP</span><span className="font-pixel text-[6px] text-blue-300">{mp}/{maxMp}</span></div>
                  <div className="h-1 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-200" style={{ width: `${Math.max(0, (mp / maxMp) * 100)}%` }} />
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-1.5 border border-gray-700 text-right pointer-events-auto">
            <p className="font-pixel text-[8px] text-green-400">{cfg.label}</p>
            <p className="font-pixel text-[6px] text-gray-400">⚔️{kills} 📏{distance}m</p>
            {equippedWeapon && <p className="font-pixel text-[6px] text-yellow-400">🗡️{equippedWeapon.name}</p>}
          </div>
        </div>
        {questNotification && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="bg-amber-900/90 px-2 py-1 rounded border border-amber-500"><p className="font-pixel text-[8px] text-amber-200">{questNotification}</p></div>
          </div>
        )}
      </div>

      {/* Battle log */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none p-2">
        {combo > 2 && (
          <div className="text-center mb-1 animate-bounce">
            <span className={`font-pixel text-lg font-bold ${combo >= 10 ? 'text-yellow-300' : combo >= 5 ? 'text-purple-400' : 'text-red-400'}`}>{combo}x COMBO!</span>
          </div>
        )}
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-1.5 border border-gray-700/50 max-h-14 overflow-y-auto">
          {battleLog.slice(-3).map((msg, i) => (
            <p key={i} className={`font-pixel text-[7px] ${i === battleLog.slice(-3).length - 1 ? 'text-white' : 'text-gray-500'}`}>{msg}</p>
          ))}
        </div>
      </div>

      {/* Victory */}
      {showVictory && victoryRewards && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 pointer-events-none">
          <div className="bg-yellow-900/90 border-2 border-yellow-400 rounded-xl p-6 text-center animate-bounce">
            <p className="font-pixel text-lg text-yellow-300 mb-2">🏆 VICTORY!</p>
            <p className="font-pixel text-xs text-yellow-200">+{victoryRewards.exp} EXP</p>
            <p className="font-pixel text-xs text-yellow-200">+{victoryRewards.gold} Gold</p>
          </div>
        </div>
      )}
    </div>
  )
}