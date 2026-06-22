'use client'
import { useGameStore } from '@/store/gameStore'

export default function StatsPanel() {
  const { showStats, toggleStats, level, stats, statPoints, skillPoints, equippedWeapon, maxHp, maxMp, gold, kills } = useGameStore()

  if (!showStats) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border-2 border-indigo-700 rounded-xl w-full max-w-md mx-4 max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-indigo-800 bg-gradient-to-r from-indigo-900/50 to-transparent">
          <h2 className="font-pixel text-sm text-indigo-400">📊 CHARACTER STATS</h2>
          <button onClick={toggleStats} className="text-gray-400 hover:text-white text-xl">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Level + Class */}
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-indigo-700 border-2 border-blue-300 rounded-lg flex items-center justify-center text-2xl">
              🧙
            </div>
            <p className="font-pixel text-sm text-yellow-400">LV.{level}</p>
            <p className="font-pixel text-[10px] text-gray-400">Adventurer</p>
          </div>

          {/* Base Stats */}
          <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
            <p className="font-pixel text-[9px] text-gray-400 mb-2">BASE STATS</p>

            {/* STR */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[10px] text-red-400">⚔️ STR</span>
                <span className="font-pixel text-xs text-white">{stats.str}</span>
              </div>
              {statPoints > 0 && (
                <button
                  onClick={() => useGameStore.getState().spendStatPoint('str')}
                  className="font-pixel text-[8px] bg-green-800 hover:bg-green-700 text-white px-2 py-0.5 rounded border border-green-600"
                >
                  +1
                </button>
              )}
            </div>

            {/* DEF */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[10px] text-blue-400">🛡️ DEF</span>
                <span className="font-pixel text-xs text-white">{stats.def}</span>
              </div>
              {statPoints > 0 && (
                <button
                  onClick={() => useGameStore.getState().spendStatPoint('def')}
                  className="font-pixel text-[8px] bg-green-800 hover:bg-green-700 text-white px-2 py-0.5 rounded border border-green-600"
                >
                  +1
                </button>
              )}
            </div>

            {/* SPD */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[10px] text-green-400">💨 SPD</span>
                <span className="font-pixel text-xs text-white">{stats.spd}</span>
              </div>
              {statPoints > 0 && (
                <button
                  onClick={() => useGameStore.getState().spendStatPoint('spd')}
                  className="font-pixel text-[8px] bg-green-800 hover:bg-green-700 text-white px-2 py-0.5 rounded border border-green-600"
                >
                  +1
                </button>
              )}
            </div>

            {/* Points available */}
            {statPoints > 0 && (
              <div className="mt-2 p-2 bg-green-900/30 border border-green-700 rounded text-center">
                <p className="font-pixel text-[9px] text-green-400">⬆️ {statPoints} Stat Points Available</p>
              </div>
            )}
          </div>

          {/* Derived Stats */}
          <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
            <p className="font-pixel text-[9px] text-gray-400 mb-2">COMBAT STATS</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="font-pixel text-[8px] text-gray-400">Total ATK</p>
                <p className="font-pixel text-[10px] text-red-300">{stats.str + (equippedWeapon?.atk || 0)}</p>
              </div>
              <div>
                <p className="font-pixel text-[8px] text-gray-400">Total DEF</p>
                <p className="font-pixel text-[10px] text-blue-300">{stats.def}</p>
              </div>
              <div>
                <p className="font-pixel text-[8px] text-gray-400">Flee Chance</p>
                <p className="font-pixel text-[10px] text-green-300">{Math.min(95, 50 + stats.spd * 2)}%</p>
              </div>
              <div>
                <p className="font-pixel text-[8px] text-gray-400">Max HP/MP</p>
                <p className="font-pixel text-[10px] text-white">{maxHp}/{maxMp}</p>
              </div>
            </div>
          </div>

          {/* Skill Points */}
          {skillPoints > 0 && (
            <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-3 mb-3">
              <p className="font-pixel text-[9px] text-purple-300 text-center">✨ {skillPoints} Skill Points Available</p>
              <p className="font-pixel text-[8px] text-gray-400 text-center mt-1">Open Inventory to upgrade weapon skills</p>
            </div>
          )}

          {/* Summary */}
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="font-pixel text-[9px] text-gray-400 mb-2">SUMMARY</p>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-pixel text-[9px] text-gray-400">💰 Gold</span>
                <span className="font-pixel text-[9px] text-yellow-400">{gold}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-pixel text-[9px] text-gray-400">👾 Monsters Killed</span>
                <span className="font-pixel text-[9px] text-red-400">{kills}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-pixel text-[9px] text-gray-400">⚔️ Weapon</span>
                <span className="font-pixel text-[9px] text-white">{equippedWeapon?.name || 'None'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
