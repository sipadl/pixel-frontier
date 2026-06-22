'use client'
import { useGameStore } from '@/store/gameStore'

const RARITY_COLORS: Record<string, string> = {
  Common: 'border-gray-500 bg-gray-800/80',
  Rare: 'border-blue-500 bg-blue-900/80',
  Epic: 'border-purple-500 bg-purple-900/80',
  Legendary: 'border-yellow-400 bg-yellow-900/80',
}

const RARITY_TEXT: Record<string, string> = {
  Common: 'text-gray-300',
  Rare: 'text-blue-400',
  Epic: 'text-purple-400',
  Legendary: 'text-yellow-400',
}

export default function Inventory() {
  const {
    inventory, equippedWeapon, equipWeapon, upgradeSkill, items,
    toggleInventory, skillPoints, hp, maxHp, mp, maxMp
  } = useGameStore()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border-2 border-gray-600 rounded-xl w-full max-w-lg mx-4 max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
          <h2 className="font-pixel text-sm text-yellow-400">📦 INVENTORY</h2>
          <div className="flex items-center gap-3">
            {skillPoints > 0 && (
              <span className="font-pixel text-[9px] text-purple-400 animate-pulse">✨ {skillPoints} SP</span>
            )}
            <button onClick={toggleInventory} className="text-gray-400 hover:text-white text-xl">&times;</button>
          </div>
        </div>

        {/* Player Stats Mini */}
        <div className="px-4 py-2 border-b border-gray-800">
          <div className="flex gap-4 text-center">
            <div><p className="font-pixel text-[8px] text-gray-400">HP</p><p className="font-pixel text-[10px] text-green-400">{hp}/{maxHp}</p></div>
            <div><p className="font-pixel text-[8px] text-gray-400">MP</p><p className="font-pixel text-[10px] text-blue-400">{mp}/{maxMp}</p></div>
            <div><p className="font-pixel text-[8px] text-gray-400">WEAPONS</p><p className="font-pixel text-[10px] text-yellow-400">{inventory.length}</p></div>
            <div><p className="font-pixel text-[8px] text-gray-400">SP</p><p className="font-pixel text-[10px] text-purple-400">{skillPoints}</p></div>
          </div>
        </div>

        {/* Currently Equipped */}
        {equippedWeapon && (
          <div className="px-4 py-2 border-b border-gray-800 bg-gray-800/50">
            <p className="font-pixel text-[9px] text-gray-400 mb-1">EQUIPPED</p>
            <div className={`border rounded-lg p-2 ${RARITY_COLORS[equippedWeapon.rarity]}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className={`font-pixel text-xs ${RARITY_TEXT[equippedWeapon.rarity]}`}>⚔️ {equippedWeapon.name}</p>
                  <p className="font-pixel text-[9px] text-gray-400">ATK +{equippedWeapon.atk}</p>
                </div>
                <span className="font-pixel text-[8px] text-green-400">✓ EQUIPPED</span>
              </div>
            </div>
          </div>
        )}

        {/* Weapon list */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <p className="font-pixel text-[9px] text-gray-400 mb-2">WEAPONS ({inventory.length})</p>
          {inventory.length === 0 ? (
            <p className="font-pixel text-[10px] text-gray-500 text-center py-6">No weapons yet. Open chests!</p>
          ) : (
            <div className="space-y-2">
              {inventory.map((weapon, i) => (
                <div
                  key={`${weapon.id}-${i}`}
                  className={`border rounded-lg p-2 ${RARITY_COLORS[weapon.rarity]} ${equippedWeapon?.id === weapon.id ? 'ring-2 ring-green-500' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className={`font-pixel text-xs ${RARITY_TEXT[weapon.rarity]}`}>⚔️ {weapon.name}</p>
                      <p className="font-pixel text-[9px] text-gray-400">ATK +{weapon.atk}</p>
                    </div>
                    <button
                      onClick={() => equipWeapon(weapon)}
                      className={`font-pixel text-[8px] px-2 py-1 rounded ${equippedWeapon?.id === weapon.id ? 'bg-green-800 text-green-300 border border-green-600' : 'bg-gray-700 text-gray-300 border border-gray-500 hover:bg-gray-600'}`}
                    >
                      {equippedWeapon?.id === weapon.id ? '✓ ON' : 'EQUIP'}
                    </button>
                  </div>
                  {/* Skills with upgrade */}
                  <div className="mt-2 space-y-1">
                    {weapon.skills.map((skill, j) => {
                      const skillLv = skill.level || 1
                      const maxLv = skill.maxLevel || 5
                      const canUpgrade = skillPoints > 0 && skillLv < maxLv
                      return (
                        <div key={j} className="flex items-center justify-between bg-black/30 rounded px-2 py-1">
                          <div className="flex items-center gap-1">
                            <span className="font-pixel text-[8px] text-gray-300">
                              {skill.type === 'physical' ? '⚔️' : skill.type === 'magic' ? '✨' : skill.type === 'heal' ? '💚' : '🛡️'} {skill.name}
                            </span>
                            <span className="font-pixel text-[8px] text-purple-400">Lv.{skillLv}</span>
                            <span className="font-pixel text-[7px] text-gray-500">({skill.type === 'heal' ? `Heal ${Math.abs(skill.damage)}` : `${skill.damage} DMG`})</span>
                          </div>
                          {canUpgrade && (
                            <button
                              onClick={(e) => { e.stopPropagation(); upgradeSkill(weapon.id, j) }}
                              className="font-pixel text-[7px] bg-purple-800 hover:bg-purple-700 text-purple-200 px-1.5 py-0.5 rounded border border-purple-600 transition-colors"
                            >
                              ⬆ UP (-1SP)
                            </button>
                          )}
                          {skillLv >= maxLv && (
                            <span className="font-pixel text-[7px] text-yellow-500">MAX</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Items */}
          <p className="font-pixel text-[9px] text-gray-400 mb-2 mt-4">ITEMS</p>
          {items.length === 0 ? (
            <p className="font-pixel text-[10px] text-gray-500 text-center py-4">No items.</p>
          ) : (
            <div className="space-y-1">
              {items.map(item => (
                <div key={item.id} className="flex justify-between bg-gray-800 rounded px-3 py-1.5">
                  <span className="font-pixel text-[10px] text-gray-300">
                    {item.type === 'heal' ? '🧪' : '💎'} {item.name}
                  </span>
                  <span className="font-pixel text-[10px] text-yellow-400">×{item.quantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-700 text-center">
          <p className="font-pixel text-[8px] text-gray-500">
            [ESC] Close • Upgrade skills to deal more damage!
          </p>
        </div>
      </div>
    </div>
  )
}
