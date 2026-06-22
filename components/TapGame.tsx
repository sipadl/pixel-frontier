'use client'
import { useGameStore } from '@/store/gameStore'
import { useEffect, useRef, useState } from 'react'
import PixelArt, {
  HERO_DOWN_1, HERO_DOWN_2, MONSTER_SPRITES, PALETTE_DEFAULT,
  TILE_GRASS_1, TILE_DIRT_1, TILE_STONE_1,
} from '@/components/PixelArt'

const ZONE_CONFIG = {
  village: {
    bg: 'from-sky-400 via-sky-300 to-green-300',
    tile: 'grass' as const,
    decor: ['🌳', '🌲', '🏡', '🌻', '🪨'],
    label: '🏘️ Village',
  },
  forest: {
    bg: 'from-green-700 via-emerald-800 to-green-900',
    tile: 'dirt' as const,
    decor: ['🌲', '🌳', '🍄', '🌿', '🌾'],
    label: '🌲 Forest',
  },
  cave: {
    bg: 'from-gray-900 via-purple-950 to-gray-900',
    tile: 'stone' as const,
    decor: ['🪨', '💎', '🦇', '⛓️', '🕯️'],
    label: '⛰️ Cave',
  },
}

const TILE_MAP = {
  grass: TILE_GRASS_1,
  dirt: TILE_DIRT_1,
  stone: TILE_STONE_1,
}

export default function TapGame() {
  const screen = useGameStore(s => s.screen)
  const walkPhase = useGameStore(s => s.walkPhase)
  const monster = useGameStore(s => s.monster)
  const hp = useGameStore(s => s.hp)
  const maxHp = useGameStore(s => s.maxHp)
  const mp = useGameStore(s => s.mp)
  const maxMp = useGameStore(s => s.maxMp)
  const level = useGameStore(s => s.level)
  const exp = useGameStore(s => s.exp)
  const expToNext = useGameStore(s => s.expToNext)
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
  const shakeScreen = useGameStore(s => s.shakeScreen)
  const items = useGameStore(s => s.items)
  const statPoints = useGameStore(s => s.statPoints)
  const skillPoints = useGameStore(s => s.skillPoints)
  const soundEnabled = useGameStore(s => s.soundEnabled)
  const questNotification = useGameStore(s => s.questNotification)
  const tapAttack = useGameStore(s => s.tapAttack)
  const clearDamageNumbers = useGameStore(s => s.clearDamageNumbers)
  const toggleInventory = useGameStore(s => s.toggleInventory)
  const toggleShop = useGameStore(s => s.toggleShop)
  const toggleQuests = useGameStore(s => s.toggleQuests)
  const toggleStats = useGameStore(s => s.toggleStats)
  const toggleSound = useGameStore(s => s.toggleSound)
  const useItem = useGameStore(s => s.useItem)
  const saveGame = useGameStore(s => s.saveGame)
  const checkEnrage = useGameStore(s => s.checkEnrage)
  const startEncounter = useGameStore(s => s.startEncounter)

  const tapAreaRef = useRef<HTMLDivElement>(null)
  const [walkFrame, setWalkFrame] = useState(0)
  const [scrollOffset, setScrollOffset] = useState(0)

  // Walking animation frame
  useEffect(() => {
    if (!walkPhase || screen !== 'game') return
    const i = setInterval(() => setWalkFrame(f => (f + 1) % 2), 250)
    return () => clearInterval(i)
  }, [walkPhase, screen])

  // Background scroll
  useEffect(() => {
    if (!walkPhase) return
    const i = setInterval(() => setScrollOffset(o => (o + 2) % 32), 50)
    return () => clearInterval(i)
  }, [walkPhase])

  // Check enrage
  useEffect(() => {
    if (monster && monster.boss && monster.hp / monster.maxHp <= 0.5 && monster.phase === 1) {
      checkEnrage()
    }
  }, [monster?.hp])

  // Clear damage numbers
  useEffect(() => {
    if (damageNumbers.length > 0) {
      const t = setTimeout(clearDamageNumbers, 800)
      return () => clearTimeout(t)
    }
  }, [damageNumbers])

  // Auto-save
  useEffect(() => {
    const t = setInterval(saveGame, 30000)
    return () => clearInterval(t)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const s = useGameStore.getState()
      if (e.key === 'i' || e.key === 'I') s.toggleInventory()
      if (e.key === 'q' || e.key === 'Q') s.toggleQuests()
      if (e.key === 'k' || e.key === 'K') s.toggleShop()
      if (e.key === 'c' || e.key === 'C') s.toggleStats()
      if (e.key === 'm' || e.key === 'M') s.toggleSound()
      if (e.key === 'Escape') {
        if (s.showInventory) s.toggleInventory()
        else if (s.showQuests) s.toggleQuests()
        else if (s.showShop) s.toggleShop()
        else if (s.showStats) s.toggleStats()
      }
      if (s.screen === 'battle' && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault()
        s.tapAttack()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  if (screen !== 'game' && screen !== 'battle') return null

  const cfg = ZONE_CONFIG[zone]
  const tileData = TILE_MAP[cfg.tile]
  const heroSprite = walkFrame === 0 ? HERO_DOWN_1 : HERO_DOWN_2
  const monsterSprite = monster ? (MONSTER_SPRITES[monster.name] || null) : null

  // Generate tile rows for scrolling background
  const tileRows = Array.from({ length: 4 }).map((_, row) => ({
    y: row,
    speed: 0.5 + row * 0.2,
  }))

  return (
    <div className={`fixed inset-0 overflow-hidden select-none ${shakeScreen ? 'animate-shake' : ''}`} style={{ touchAction: 'manipulation' }}>
      {/* SKY */}
      <div className={`absolute inset-0 bg-gradient-to-b ${cfg.bg} transition-all duration-1000`} />

      {/* STARS (cave) */}
      {zone === 'cave' && (
        <div className="absolute inset-0">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{ left: `${(i * 13) % 100}%`, top: `${(i * 7) % 50}%`, animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>
      )}

      {/* TILE BACKGROUND (scrolling) */}
      <div className="absolute bottom-0 left-0 right-0 h-[60%] overflow-hidden">
        <div
          className="absolute bottom-0 left-0"
          style={{
            transform: `translateX(${-scrollOffset * 4}px)`,
            width: '200%',
            height: '100%',
          }}
        >
          {/* Render 3x4 grid of tiles for seamless scroll */}
          {Array.from({ length: 12 }).map((_, col) => (
            <div key={col} className="absolute" style={{ left: `${col * 128}px`, bottom: 0 }}>
              <PixelArt data={tileData} palette={PALETTE_DEFAULT} pixelSize={4} />
            </div>
          ))}
        </div>
      </div>

      {/* DECOR (emoji decorations on top) */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => {
          const xPos = ((i * 12.5 + scrollOffset * 0.5) % 100)
          return (
            <div key={i}
              className="absolute transition-all"
              style={{
                left: `${xPos}%`,
                bottom: `${45 + (i % 3) * 5}%`,
                fontSize: '2rem',
                opacity: 0.7,
              }}
            >
              {cfg.decor[i % cfg.decor.length]}
            </div>
          )
        })}
      </div>

      {/* CHARACTER (CENTER) */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[35%] z-20 transition-transform duration-100">
        <div className="relative">
          {/* Shadow */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/40 rounded-full blur-sm" />
          {/* Hero sprite (32x32 from 16x16 at 2x scale via pixelSize) */}
          <div className="relative transition-transform" style={{ transform: walkPhase ? 'translateY(-2px)' : 'translateY(0)' }}>
            <PixelArt data={heroSprite} palette={PALETTE_DEFAULT} pixelSize={6} />
            {/* Weapon glow */}
            {equippedWeapon && (
              <div className="absolute -top-1 -right-1 text-sm animate-pulse">⚔️</div>
            )}
            {/* Level badge */}
            <div className="absolute -top-3 -left-3 bg-yellow-500 border-2 border-yellow-300 rounded-full w-7 h-7 flex items-center justify-center">
              <span className="font-pixel text-[8px] text-yellow-900">{level}</span>
            </div>
          </div>
          {/* HP bar */}
          <div className="w-20 mx-auto mt-1">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
              <div className="h-full transition-all duration-200 rounded-full"
                style={{
                  width: `${Math.max(0, (hp / maxHp) * 100)}%`,
                  background: hp > maxHp * 0.5 ? '#22c55e' : hp > maxHp * 0.25 ? '#eab308' : '#ef4444',
                }} />
            </div>
          </div>
        </div>
      </div>

      {/* ENEMY (RIGHT SIDE) */}
      {monster && (
        <div className="absolute right-[15%] bottom-[38%] z-20">
          <div className="relative">
            {/* Boss glow */}
            {monster.boss && (
              <>
                <div className="absolute -inset-6 bg-yellow-500/30 rounded-2xl animate-pulse blur-md" />
                <div className="absolute -inset-3 bg-red-500/20 rounded-xl animate-pulse" />
              </>
            )}
            {/* Phase 2 aura */}
            {monster.boss && monster.phase > 1 && (
              <div className="absolute -inset-4 bg-red-500/40 rounded-2xl blur-md animate-pulse" />
            )}
            {/* Monster sprite */}
            <div className={`transition-all duration-500 ${monster.hp <= 0 ? 'opacity-0 scale-0 rotate-180' : 'opacity-100 scale-100 rotate-0'} ${monster.hp > 0 ? 'animate-bob' : ''}`}>
              {monsterSprite ? (
                <PixelArt data={monsterSprite} palette={PALETTE_DEFAULT} pixelSize={monster.boss ? 7 : 6} />
              ) : (
                <div className={`${monster.boss ? 'w-24 h-24 text-5xl' : 'w-20 h-20 text-3xl'} bg-gray-800/80 border-2 ${monster.boss ? 'border-red-400' : 'border-gray-500'} rounded-xl flex items-center justify-center`}>
                  👾
                </div>
              )}
            </div>
            {/* Enemy HP bar */}
            {monster.hp > 0 && (
              <div className="mt-2 w-24">
                <div className="flex justify-between mb-0.5">
                  <span className="font-pixel text-[8px] text-red-300">{monster.name}</span>
                  <span className="font-pixel text-[8px] text-red-400">
                    {monster.boss && monster.phase > 1 && <span className="text-red-300">P{monster.phase} </span>}
                    {monster.hp}/{monster.maxHp}
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                  <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-200"
                    style={{ width: `${(monster.hp / monster.maxHp) * 100}%` }} />
                </div>
                {monster.boss && (
                  <p className="font-pixel text-[7px] text-yellow-400 text-center mt-0.5 animate-pulse">★ BOSS {monster.phase}/2 ★</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DAMAGE NUMBERS */}
      {damageNumbers.map(d => (
        <div key={d.id} className="absolute z-30 pointer-events-none animate-float-up"
          style={{ left: `${d.x}%`, top: `${d.y}%` }}>
          <span className={`font-pixel text-sm font-bold drop-shadow-lg ${
            d.type === 'legendary' ? 'text-yellow-300 text-lg' :
            d.type === 'magic' ? 'text-purple-400' :
            d.type === 'heal' ? 'text-green-400' :
            'text-red-400'
          }`}>
            {d.type === 'heal' ? '+' : '-'}{d.value}
            {d.type === 'legendary' && ' 💥'}
          </span>
        </div>
      ))}

      {/* TAP AREA */}
      <div ref={tapAreaRef} className="absolute inset-0 z-10"
        onClick={() => {
          if (screen === 'battle' && monster && monster.hp > 0) tapAttack()
        }}
        onTouchStart={() => {
          if (screen === 'battle' && monster && monster.hp > 0) tapAttack()
        }}
      />

      {/* TOP HUD */}
      <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-3">
        <div className="flex justify-between items-start">
          {/* Player stats */}
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-2.5 border border-gray-700 pointer-events-auto">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-700 border border-blue-300 rounded flex items-center justify-center text-xs cursor-pointer hover:border-yellow-400 transition-colors" onClick={toggleStats}>🧙</div>
              <div>
                <p className="font-pixel text-[9px] text-yellow-400">LV.{level}</p>
                <p className="font-pixel text-[7px] text-gray-400">{stats.str}ATK {stats.def}DEF {stats.spd}SPD</p>
              </div>
              <div className="ml-2 text-right">
                <p className="font-pixel text-[7px] text-yellow-300">💰{gold}</p>
              </div>
            </div>
            <div className="mb-0.5">
              <div className="flex justify-between"><span className="font-pixel text-[7px] text-red-400">HP</span><span className="font-pixel text-[7px] text-red-300">{Math.max(0, hp)}/{maxHp}</span></div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                <div className="h-full transition-all duration-200 rounded-full"
                  style={{ width: `${Math.max(0, (hp / maxHp) * 100)}%`, background: hp > maxHp * 0.5 ? '#22c55e' : hp > maxHp * 0.25 ? '#eab308' : '#ef4444' }} />
              </div>
            </div>
            <div className="mb-0.5">
              <div className="flex justify-between"><span className="font-pixel text-[7px] text-blue-400">MP</span><span className="font-pixel text-[7px] text-blue-300">{mp}/{maxMp}</span></div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-200"
                  style={{ width: `${Math.max(0, (mp / maxMp) * 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between"><span className="font-pixel text-[7px] text-purple-400">EXP</span><span className="font-pixel text-[7px] text-purple-300">{exp}/{expToNext}</span></div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-200"
                  style={{ width: `${Math.max(0, (exp / expToNext) * 100)}%` }} />
              </div>
            </div>
            {(statPoints > 0 || skillPoints > 0) && (
              <div className="mt-1 p-1 bg-purple-900/50 border border-purple-600 rounded text-center">
                <p className="font-pixel text-[7px] text-purple-300">
                  {statPoints > 0 && `${statPoints}⬆ `}
                  {skillPoints > 0 && `${skillPoints}✨`}
                </p>
              </div>
            )}
          </div>

          {/* Right: info + buttons */}
          <div className="space-y-1.5">
            <div className="bg-black/70 backdrop-blur-sm rounded-lg p-2 border border-gray-700 text-right pointer-events-auto">
              <p className="font-pixel text-[9px] text-green-400">{cfg.label}</p>
              <p className="font-pixel text-[7px] text-gray-400">⚔️ {kills} kills • 📏 {distance}m</p>
              {equippedWeapon && (
                <p className="font-pixel text-[7px] text-yellow-400">🗡️ {equippedWeapon.name}</p>
              )}
            </div>
            <div className="flex gap-1 justify-end pointer-events-auto">
              <button onClick={toggleStats} className="px-1.5 py-1 bg-gray-800/90 hover:bg-gray-700 rounded border border-gray-600 text-[10px]">📊</button>
              <button onClick={toggleInventory} className="px-1.5 py-1 bg-gray-800/90 hover:bg-gray-700 rounded border border-gray-600 text-[10px]">📦</button>
              <button onClick={toggleQuests} className="px-1.5 py-1 bg-gray-800/90 hover:bg-gray-700 rounded border border-gray-600 text-[10px]">📜</button>
              <button onClick={toggleShop} className="px-1.5 py-1 bg-gray-800/90 hover:bg-gray-700 rounded border border-gray-600 text-[10px]">🏪</button>
              <button onClick={toggleSound} className="px-1.5 py-1 bg-gray-800/90 hover:bg-gray-700 rounded border border-gray-600 text-[10px]">{soundEnabled ? '🔊' : '🔇'}</button>
            </div>
          </div>
        </div>

        {questNotification && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="bg-amber-900/90 px-3 py-1.5 rounded-lg border border-amber-500">
              <p className="font-pixel text-[9px] text-amber-200">{questNotification}</p>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM: COMBO + BATTLE LOG */}
      <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none p-3">
        {combo > 2 && (
          <div className="text-center mb-2 animate-bounce">
            <span className={`font-pixel text-lg font-bold ${
              combo >= 10 ? 'text-yellow-300 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]' :
              combo >= 5 ? 'text-purple-400' : 'text-red-400'
            }`}>
              {combo}x COMBO!
            </span>
          </div>
        )}

        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 border border-gray-700/50 max-h-16 overflow-y-auto">
          {battleLog.slice(-3).map((msg, i) => (
            <p key={i} className={`font-pixel text-[8px] ${i === battleLog.slice(-3).length - 1 ? 'text-white' : 'text-gray-500'}`}>
              {msg}
            </p>
          ))}
        </div>

        {screen === 'battle' && monster && monster.hp > 0 && (
          <p className="font-pixel text-[10px] text-white/60 text-center mt-2 animate-pulse">
            👆 TAP TO ATTACK!
          </p>
        )}
        {walkPhase && screen === 'game' && (
          <p className="font-pixel text-[10px] text-white/60 text-center mt-2 animate-pulse">
            🚶 Walking...
          </p>
        )}
      </div>

      {/* VICTORY OVERLAY */}
      {showVictory && victoryRewards && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 pointer-events-none">
          <div className="bg-yellow-900/90 border-2 border-yellow-400 rounded-xl p-6 text-center animate-bounce">
            <p className="font-pixel text-lg text-yellow-300 mb-2">🏆 VICTORY!</p>
            <p className="font-pixel text-xs text-yellow-200">+{victoryRewards.exp} EXP</p>
            <p className="font-pixel text-xs text-yellow-200">+{victoryRewards.gold} Gold</p>
          </div>
        </div>
      )}

      {/* Items quick-bar */}
      {screen === 'battle' && monster && monster.hp > 0 && (
        <div className="absolute bottom-28 left-0 right-0 z-30 flex justify-center gap-2 pointer-events-auto">
          {items.filter(i => i.quantity > 0).slice(0, 3).map(item => (
            <button key={item.id}
              onClick={(e) => { e.stopPropagation(); useItem(item.id) }}
              className="bg-gray-800/90 hover:bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 flex items-center gap-1 transition-colors"
            >
              <span className="text-sm">{item.type === 'heal' ? '🧪' : '💎'}</span>
              <span className="font-pixel text-[8px] text-white">×{item.quantity}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}