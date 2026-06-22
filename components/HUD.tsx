'use client'
import { useGameStore } from '@/store/gameStore'

const RARITY_COLORS: Record<string, string> = {
  Common: 'text-gray-300',
  Rare: 'text-blue-400',
  Epic: 'text-purple-400',
  Legendary: 'text-yellow-400',
}

const RARITY_BG: Record<string, string> = {
  Common: 'from-gray-700 to-gray-800',
  Rare: 'from-blue-800 to-blue-900',
  Epic: 'from-purple-800 to-purple-900',
  Legendary: 'from-yellow-700 to-amber-800',
}

const RARITY_GLOW: Record<string, string> = {
  Common: '',
  Rare: 'shadow-blue-500/30',
  Epic: 'shadow-purple-500/40',
  Legendary: 'shadow-yellow-500/50',
}

export default function HUD() {
  const { level, hp, maxHp, mp, maxMp, exp, expToNext, gold, currentMap, toggleInventory, equippedWeapon } = useGameStore()

  const hpPercent = Math.max(0, (hp / maxHp) * 100)
  const mpPercent = Math.max(0, (mp / maxMp) * 100)
  const expPercent = Math.max(0, (exp / expToNext) * 100)

  return (
    <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
      <div className="flex justify-between items-start p-3">
        {/* Left: Player stats */}
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-gray-700 pointer-events-auto min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 pixel-char-small" />
            <div>
              <p className="font-pixel text-xs text-yellow-400">LV.{level}</p>
              <p className="font-pixel text-[10px] text-gray-400">Hero</p>
            </div>
            <div className="ml-auto text-right">
              <p className="font-pixel text-[10px] text-yellow-300">💰 {gold}</p>
            </div>
          </div>

          {/* HP Bar */}
          <div className="mb-1">
            <div className="flex justify-between mb-0.5">
              <span className="font-pixel text-[9px] text-red-400">HP</span>
              <span className="font-pixel text-[9px] text-red-300">{hp}/{maxHp}</span>
            </div>
            <div className="w-full h-3 bg-gray-800 rounded-sm border border-gray-600 overflow-hidden">
              <div
                className="h-full transition-all duration-300 rounded-sm"
                style={{
                  width: `${hpPercent}%`,
                  background: hpPercent > 50 ? 'linear-gradient(90deg, #22c55e, #16a34a)' :
                    hpPercent > 25 ? 'linear-gradient(90deg, #eab308, #ca8a04)' :
                      'linear-gradient(90deg, #ef4444, #dc2626)',
                }}
              />
            </div>
          </div>

          {/* MP Bar */}
          <div className="mb-1">
            <div className="flex justify-between mb-0.5">
              <span className="font-pixel text-[9px] text-blue-400">MP</span>
              <span className="font-pixel text-[9px] text-blue-300">{mp}/{maxMp}</span>
            </div>
            <div className="w-full h-3 bg-gray-800 rounded-sm border border-gray-600 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300 rounded-sm"
                style={{ width: `${mpPercent}%` }}
              />
            </div>
          </div>

          {/* EXP Bar */}
          <div>
            <div className="flex justify-between mb-0.5">
              <span className="font-pixel text-[9px] text-purple-400">EXP</span>
              <span className="font-pixel text-[9px] text-purple-300">{exp}/{expToNext}</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-sm border border-gray-600 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-300 rounded-sm"
                style={{ width: `${expPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Weapon + Inventory */}
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-gray-700 pointer-events-auto">
          {/* Current weapon */}
          <div className="mb-2">
            <p className="font-pixel text-[9px] text-gray-400 mb-1">WEAPON</p>
            {equippedWeapon ? (
              <div className={`font-pixel text-[10px] ${RARITY_COLORS[equippedWeapon.rarity]}`}>
                ⚔️ {equippedWeapon.name}
                <span className="block text-[8px] opacity-70">ATK +{equippedWeapon.atk}</span>
              </div>
            ) : (
              <p className="font-pixel text-[10px] text-gray-500">None</p>
            )}
          </div>

          {/* Map name */}
          <div className="border-t border-gray-700 pt-2">
            <p className="font-pixel text-[9px] text-gray-400">MAP</p>
            <p className="font-pixel text-[10px] text-green-400">
              {currentMap === 'village' && '🏘️ Village'}
              {currentMap === 'forest' && '🌲 Forest'}
              {currentMap === 'cave' && '⛰️ Cave'}
            </p>
          </div>

          {/* Inventory button */}
          <button
            onClick={toggleInventory}
            className="mt-2 w-full font-pixel text-[10px] bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded border border-gray-600 transition-colors"
          >
            📦 Inventory
          </button>
        </div>
      </div>
    </div>
  )
}
