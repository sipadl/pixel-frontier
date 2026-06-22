'use client'
import { useGameStore } from '@/store/gameStore'

export default function BattleUI() {
  const {
    currentMonster, hp, maxHp, mp, maxMp, equippedWeapon,
    playerAttack, playerSkill, playerUseItem, playerFlee,
    isPlayerTurn, battleLog, items, battleWon
  } = useGameStore()

  if (!currentMonster) return null

  const monsterHpPercent = (currentMonster.hp / currentMonster.maxHp) * 100
  const playerHpPercent = (hp / maxHp) * 100

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-gradient-to-b from-gray-900 via-indigo-950 to-black">
      {/* Battle Arena */}
      <div className="flex-1 flex flex-col items-center justify-center relative px-4">
        {/* Battle flash effect */}
        {battleWon && (
          <div className="absolute inset-0 bg-yellow-400/20 animate-pulse pointer-events-none" />
        )}

        {/* Monster Section */}
        <div className="mb-6 text-center">
          {/* Monster sprite */}
          <div className={`mx-auto mb-3 ${currentMonster.boss ? 'w-24 h-24' : 'w-16 h-16'} pixel-monster ${!isPlayerTurn ? 'animate-shake' : ''}`}>
            <div className={`w-full h-full rounded-lg ${currentMonster.boss
              ? 'bg-gradient-to-br from-red-600 to-purple-800 border-2 border-red-400'
              : 'bg-gradient-to-br from-green-600 to-emerald-800 border border-green-400'
            } flex items-center justify-center text-2xl`}>
              {currentMonster.boss ? '👹' : '👾'}
            </div>
          </div>
          <p className={`font-pixel ${currentMonster.boss ? 'text-lg text-red-400' : 'text-sm text-green-300'}`}>
            {currentMonster.boss ? '★ ' : ''}{currentMonster.name}{currentMonster.boss ? ' ★' : ''}
          </p>
          {/* Monster HP */}
          <div className="w-48 mx-auto mt-1">
            <div className="flex justify-between mb-0.5">
              <span className="font-pixel text-[9px] text-red-400">HP</span>
              <span className="font-pixel text-[9px] text-red-300">{Math.max(0, currentMonster.hp)}/{currentMonster.maxHp}</span>
            </div>
            <div className="w-full h-3 bg-gray-800 rounded-sm border border-gray-600 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-300 rounded-sm"
                style={{ width: `${Math.max(0, monsterHpPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* VS */}
        <div className="font-pixel text-2xl text-yellow-400 my-2 animate-pulse">⚡ VS ⚡</div>

        {/* Player sprite */}
        <div className="mt-4">
          <div className="w-14 h-14 mx-auto mb-1 pixel-char-battle">
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-700 border-2 border-blue-300 rounded-lg flex items-center justify-center text-xl">
              🧙
            </div>
          </div>
          <p className="font-pixel text-sm text-blue-300 text-center">Hero</p>
        </div>

        {/* Player HP */}
        <div className="w-48 mx-auto mt-2">
          <div className="flex justify-between mb-0.5">
            <span className="font-pixel text-[9px] text-blue-400">HP</span>
            <span className="font-pixel text-[9px] text-blue-300">{hp}/{maxHp}</span>
          </div>
          <div className="w-full h-3 bg-gray-800 rounded-sm border border-gray-600 overflow-hidden">
            <div
              className="h-full transition-all duration-300 rounded-sm"
              style={{
                width: `${playerHpPercent}%`,
                background: playerHpPercent > 50 ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' :
                  playerHpPercent > 25 ? 'linear-gradient(90deg, #eab308, #ca8a04)' :
                    'linear-gradient(90deg, #ef4444, #dc2626)',
              }}
            />
          </div>
          <div className="flex justify-between mb-0.5 mt-1">
            <span className="font-pixel text-[9px] text-blue-400">MP</span>
            <span className="font-pixel text-[9px] text-blue-300">{mp}/{maxMp}</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-sm border border-gray-600 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-300 rounded-sm"
              style={{ width: `${(mp / maxMp) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Battle Log */}
      <div className="bg-black/60 border-t border-gray-700 px-4 py-2 h-20 overflow-y-auto">
        {battleLog.slice(-5).map((log, i) => (
          <p key={i} className="font-pixel text-[10px] text-gray-300 leading-relaxed">
            &gt; {log}
          </p>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-900/95 border-t-2 border-gray-700 p-4">
        {isPlayerTurn && !battleWon ? (
          <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto">
            {/* Attack */}
            <button onClick={playerAttack} className="battle-btn bg-red-900 hover:bg-red-800 border-red-600">
              ⚔️ Attack
            </button>

            {/* Skills */}
            {equippedWeapon?.skills.map((skill, i) => (
              <button
                key={i}
                onClick={() => playerSkill(i)}
                disabled={mp < skill.mpCost}
                className={`battle-btn ${mp < skill.mpCost ? 'bg-gray-800 border-gray-600 opacity-50 cursor-not-allowed' :
                  skill.type === 'heal' ? 'bg-green-900 hover:bg-green-800 border-green-600' :
                    skill.type === 'magic' ? 'bg-purple-900 hover:bg-purple-800 border-purple-600' :
                      'bg-blue-900 hover:bg-blue-800 border-blue-600'
                }`}
              >
                ✨ {skill.name}
                <span className="block text-[8px] opacity-70">{skill.mpCost > 0 ? `${skill.mpCost} MP` : 'Free'}</span>
              </button>
            ))}

            {/* Items */}
            <button
              onClick={() => {
                const healItem = items.find(i => i.type === 'heal' && i.quantity > 0)
                if (healItem) playerUseItem(healItem.id)
              }}
              disabled={!items.some(i => i.type === 'heal' && i.quantity > 0)}
              className={`battle-btn ${!items.some(i => i.type === 'heal' && i.quantity > 0) ? 'bg-gray-800 border-gray-600 opacity-50 cursor-not-allowed' : 'bg-yellow-900 hover:bg-yellow-800 border-yellow-600'}`}
            >
              🧪 Potion
              <span className="block text-[8px] opacity-70">
                {items.find(i => i.type === 'heal')?.quantity || 0} left
              </span>
            </button>

            {/* Flee */}
            <button
              onClick={playerFlee}
              disabled={currentMonster.boss}
              className={`battle-btn ${currentMonster.boss ? 'bg-gray-800 border-gray-600 opacity-50 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600 border-gray-500'}`}
            >
              🏃 Flee
              {currentMonster.boss && <span className="block text-[8px] text-red-400">Boss!</span>}
            </button>
          </div>
        ) : (
          <div className="text-center">
            {battleWon ? (
              <div className="animate-bounce">
                <p className="font-pixel text-yellow-400 text-lg">🎉 VICTORY! 🎉</p>
                <p className="font-pixel text-sm text-gray-300">
                  +{currentMonster?.exp} EXP • +{currentMonster?.gold} Gold
                </p>
              </div>
            ) : (
              <p className="font-pixel text-red-400 animate-pulse">⏳ Enemy turn...</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
