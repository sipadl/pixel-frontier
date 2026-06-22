'use client'
import { useGameStore } from '@/store/gameStore'
import { useEffect, useRef, useCallback } from 'react'

const ZONE_CONFIG = {
  village: { bg: 'from-sky-400 via-sky-300 to-green-400', ground: 'from-green-700 to-green-600', label: '🏘️ Village', icon: '🏡' },
  forest: { bg: 'from-green-900 via-green-800 to-emerald-900', ground: 'from-green-900 to-green-800', label: '🌲 Forest', icon: '🌳' },
  cave: { bg: 'from-gray-900 via-purple-950 to-gray-900', ground: 'from-gray-800 to-gray-700', label: '⛰️ Cave', icon: '🪨' },
}

const MONSTER_EMOJI: Record<string, string> = {
  'Green Slime': '🟢', 'Angry Chick': '🐤', 'Mushroom': '🍄',
  'Dark Wolf': '🐺', 'Vine Crawler': '🌿', 'Forest Spirit': '👻',
  'Cave Bat': '🦇', 'Rock Golem': '🗿', 'Shadow Serpent': '🐍',
  'Goblin King': '👑', 'Shadow Lord': '💀', 'Cave King': '🐉',
}

export default function TapGame() {
  const {
    screen, walkPhase, monster, hp, maxHp, mp, maxMp, level, exp, expToNext,
    gold, stats, equippedWeapon, combo, damageNumbers, kills, distance, zone,
    battleLog, showVictory, victoryRewards, shakeScreen, items, showInventory,
    showShop, showQuests, showStats, statPoints, skillPoints,
    tapAttack, startEncounter, startWalking, clearDamageNumbers,
    toggleInventory, toggleShop, toggleQuests, toggleStats, toggleSound,
    soundEnabled, questNotification, useItem, saveGame, checkEnrage,
  } = useGameStore()

  const tapAreaRef = useRef<HTMLDivElement>(null)
  const lastKillRef = useRef(kills)

  // Check enrage on monster HP change
  useEffect(() => {
    if (monster && monster.boss && monster.hp / monster.maxHp <= 0.5 && monster.phase === 1) {
      checkEnrage()
    }
  }, [monster?.hp])

  // Clear old damage numbers
  useEffect(() => {
    if (damageNumbers.length > 0) {
      const t = setTimeout(clearDamageNumbers, 800)
      return () => clearTimeout(t)
    }
  }, [damageNumbers])

  // Auto-save periodically
  useEffect(() => {
    const t = setInterval(saveGame, 30000)
    return () => clearInterval(t)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const s = useGameStore.getState()
      if (e.key === 'i') s.toggleInventory()
      if (e.key === 'q') s.toggleQuests()
      if (e.key === 'k') s.toggleShop()
      if (e.key === 'c') s.toggleStats()
      if (e.key === 'm') s.toggleSound()
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
  const bgLayers = Array.from({ length: 6 }).map((_, i) => ({
    emoji: i % 3 === 0 ? cfg.icon : i % 3 === 1 ? '🌲' : '🪨',
    x: (i * 18 + (walkPhase ? (distance * 2) % 18 : 0)) % 100,
    y: 55 + (i % 2) * 8,
    size: 1.2 + (i % 3) * 0.3,
    opacity: 0.3 + (i % 3) * 0.1,
  }))

  return (
    <div className="fixed inset-0 overflow-hidden select-none" style={{ touchAction: 'manipulation' }}>
      {/* SKY */}
      <div className={`absolute inset-0 bg-gradient-to-b ${cfg.bg} transition-all duration-1000`} />

      {/* STARS (cave zone) */}
      {zone === 'cave' && (
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{ left: `${(i * 13) % 100}%`, top: `${(i * 7) % 50}%`, animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>
      )}

      {/* BG DECORATIONS */}
      <div className="absolute inset-0 pointer-events-none">
        {bgLayers.map((b, i) => (
          <div key={i} className="absolute transition-all duration-500" style={{
            left: `${b.x}%`, top: `${b.y}%`, fontSize: `${b.size}rem`, opacity: b.opacity,
          }}>
            {b.emoji}
          </div>
        ))}
      </div>

      {/* GROUND */}
      <div className={`absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-b ${cfg.ground} border-t-4 border-green-900/50 transition-all duration-1000`}>
        {/* Grass/detail dots */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute w-2 h-2 bg-white/30 rounded-full"
              style={{ left: `${(i * 5) % 100}%`, top: `${(i * 11) % 80 + 10}%` }} />
          ))}
        </div>
      </div>

      {/* ===== CHARACTER (CENTER) ===== */}
      <div className={`absolute left-1/2 -translate-x-1/2 bottom-[42%] z-20 transition-transform duration-100 ${shakeScreen ? 'animate-shake' : ''}`}>
        <div className={`relative ${walkPhase ? 'animate-walk' : ''}`}>
          {/* Shadow */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-black/30 rounded-full blur-sm" />
          {/* Body */}
          <div className="w-14 h-16 bg-gradient-to-b from-blue-400 to-indigo-600 border-2 border-blue-300 rounded-lg flex flex-col items-center justify-center relative">
            {/* Face */}
            <div className="text-2xl mb-0.5">🧙</div>
            {/* Weapon glow */}
            {equippedWeapon && (
              <div className="absolute -top-1 -right-1 text-sm animate-pulse">⚔️</div>
            )}
          </div>
          {/* HP bar under character */}
          <div className="w-16 mx-auto mt-1">
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
              <div className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${Math.max(0, (hp / maxHp) * 100)}%`,
                  background: hp > maxHp * 0.5 ? '#22c55e' : hp > maxHp * 0.25 ? '#eab308' : '#ef4444',
                }} />
            </div>
          </div>
        </div>
      </div>

      {/* ===== ENEMY (RIGHT SIDE) ===== */}
      {monster && (
        <div className="absolute right-[15%] bottom-[44%] z-20 animate-slide-in-right">
          <div className={`relative ${monster.hp <= 0 ? 'animate-die' : 'animate-enemy-idle'}`}>
            {/* Boss glow */}
            {monster.boss && (
              <div className="absolute -inset-4 bg-yellow-500/20 rounded-2xl animate-pulse blur-md" />
            )}
            {/* Monster body */}
            <div className={`w-16 h-16 ${monster.boss ? 'w-20 h-20' : ''} ${monster.hp <= 0 ? 'opacity-0 scale-0' : 'opacity-100 scale-100'} transition-all duration-300 rounded-xl flex items-center justify-center border-2 ${
              monster.boss ? 'bg-red-900/80 border-red-400' : 'bg-gray-800/80 border-gray-500'
            }`}>
              <span className={`${monster.boss ? 'text-3xl' : 'text-2xl'}`}>
                {MONSTER_EMOJI[monster.name] || '👾'}
              </span>
            </div>
            {/* Enemy HP bar */}
            {monster.hp > 0 && (
              <div className="mt-2 w-20">
                <div className="flex justify-between mb-0.5">
                  <span className="font-pixel text-[8px] text-red-300">{monster.name}</span>
                  <span className="font-pixel text-[8px] text-red-400">
                    {monster.boss && <span className="text-yellow-400">P{monster.phase} </span>}
                    {monster.hp}/{monster.maxHp}
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                  <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-200"
                    style={{ width: `${(monster.hp / monster.maxHp) * 100}%` }} />
                </div>
                {monster.boss && (
                  <p className="font-pixel text-[7px] text-yellow-400 text-center mt-0.5 animate-pulse">★ BOSS ★</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== DAMAGE NUMBERS ===== */}
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

      {/* ===== TAP AREA (whole screen during battle) ===== */}
      <div ref={tapAreaRef} className="absolute inset-0 z-10"
        onClick={(e) => {
          if (screen === 'battle' && monster && monster.hp > 0) {
            tapAttack()
          }
        }}
        onTouchStart={(e) => {
          if (screen === 'battle' && monster && monster.hp > 0) {
            tapAttack()
          }
        }}
      />

      {/* ===== TOP HUD ===== */}
      <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-3">
        <div className="flex justify-between items-start">
          {/* Player stats (left) */}
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-2.5 border border-gray-700 pointer-events-auto">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-700 border border-blue-300 rounded flex items-center justify-center text-xs cursor-pointer hover:border-yellow-400 transition-colors" onClick={toggleStats}>🧙</div>
              <div>
                <p className="font-pixel text-[9px] text-yellow-400">LV.{level}</p>
                <p className="font-pixel text-[7px] text-gray-400">{stats.str}ATK {stats.def}DEF {stats.spd}SPD</p>
              </div>
            </div>
            {/* HP */}
            <div className="mb-0.5">
              <div className="flex justify-between"><span className="font-pixel text-[7px] text-red-400">HP</span><span className="font-pixel text-[7px] text-red-300">{Math.max(0, hp)}/{maxHp}</span></div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                <div className="h-full transition-all duration-200 rounded-full"
                  style={{ width: `${Math.max(0, (hp / maxHp) * 100)}%`, background: hp > maxHp * 0.5 ? '#22c55e' : hp > maxHp * 0.25 ? '#eab308' : '#ef4444' }} />
              </div>
            </div>
            {/* MP */}
            <div className="mb-0.5">
              <div className="flex justify-between"><span className="font-pixel text-[7px] text-blue-400">MP</span><span className="font-pixel text-[7px] text-blue-300">{mp}/{maxMp}</span></div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-200"
                  style={{ width: `${Math.max(0, (mp / maxMp) * 100)}%` }} />
              </div>
            </div>
            {/* EXP */}
            <div>
              <div className="flex justify-between"><span className="font-pixel text-[7px] text-purple-400">EXP</span><span className="font-pixel text-[7px] text-purple-300">{exp}/{expToNext}</span></div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-200"
                  style={{ width: `${Math.max(0, (exp / expToNext) * 100)}%` }} />
              </div>
            </div>
            {/* Points */}
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
            {/* Zone + kills */}
            <div className="bg-black/70 backdrop-blur-sm rounded-lg p-2 border border-gray-700 text-right pointer-events-auto">
              <p className="font-pixel text-[9px] text-green-400">{cfg.label}</p>
              <p className="font-pixel text-[7px] text-gray-400">⚔️ {kills} kills • 📏 {distance}m</p>
              {equippedWeapon && (
                <p className="font-pixel text-[7px] text-yellow-400">🗡️ {equippedWeapon.name}</p>
              )}
            </div>
            {/* Buttons */}
            <div className="flex gap-1 justify-end pointer-events-auto">
              <button onClick={toggleStats} className="px-1.5 py-1 bg-gray-800/90 hover:bg-gray-700 rounded border border-gray-600 text-[10px]">📊</button>
              <button onClick={toggleInventory} className="px-1.5 py-1 bg-gray-800/90 hover:bg-gray-700 rounded border border-gray-600 text-[10px]">📦</button>
              <button onClick={toggleQuests} className="px-1.5 py-1 bg-gray-800/90 hover:bg-gray-700 rounded border border-gray-600 text-[10px]">📜</button>
              <button onClick={toggleShop} className="px-1.5 py-1 bg-gray-800/90 hover:bg-gray-700 rounded border border-gray-600 text-[10px]">🏪</button>
              <button onClick={toggleSound} className="px-1.5 py-1 bg-gray-800/90 hover:bg-gray-700 rounded border border-gray-600 text-[10px]">{soundEnabled ? '🔊' : '🔇'}</button>
            </div>
          </div>
        </div>

        {/* Quest notification */}
        {questNotification && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="bg-amber-900/90 px-3 py-1.5 rounded-lg border border-amber-500">
              <p className="font-pixel text-[9px] text-amber-200">{questNotification}</p>
            </div>
          </div>
        )}
      </div>

      {/* ===== BOTTOM: COMBO + BATTLE LOG ===== */}
      <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none p-3">
        {/* Combo */}
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

        {/* Battle log */}
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 border border-gray-700/50 max-h-20 overflow-y-auto">
          {battleLog.slice(-4).map((msg, i) => (
            <p key={i} className={`font-pixel text-[8px] ${i === battleLog.slice(-4).length - 1 ? 'text-white' : 'text-gray-500'}`}>
              {msg}
            </p>
          ))}
        </div>

        {/* Tap hint */}
        {screen === 'battle' && monster && monster.hp > 0 && (
          <p className="font-pixel text-[10px] text-white/60 text-center mt-2 animate-pulse">
            👆 TAP ANYWHERE TO ATTACK!
          </p>
        )}
        {walkPhase && screen === 'game' && (
          <p className="font-pixel text-[10px] text-white/60 text-center mt-2 animate-pulse">
            🚶 Walking forward...
          </p>
        )}
      </div>

      {/* ===== VICTORY OVERLAY ===== */}
      {showVictory && victoryRewards && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 pointer-events-none">
          <div className="bg-yellow-900/90 border-2 border-yellow-400 rounded-xl p-6 text-center animate-bounce">
            <p className="font-pixel text-lg text-yellow-300 mb-2">🏆 VICTORY!</p>
            <p className="font-pixel text-xs text-yellow-200">+{victoryRewards.exp} EXP</p>
            <p className="font-pixel text-xs text-yellow-200">+{victoryRewards.gold} Gold</p>
          </div>
        </div>
      )}

      {/* ===== WALK PHASE INDICATOR ===== */}
      {walkPhase && screen === 'game' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-15 pointer-events-none">
          <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/10">
            <p className="font-pixel text-[10px] text-white/70 text-center animate-pulse">
              ⏳ Walking to next encounter...
            </p>
          </div>
        </div>
      )}

      {/* Items quick-bar during battle */}
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
