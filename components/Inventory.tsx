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
    inventory, equippedWeapon, equipWeapon, items, toggleInventory,
    hp, maxHp, mp, maxMp
  } = useGameStore()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border-2 border-gray-600 rounded-xl w-full max-w-lg mx-4 max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
          <h2 className="font-pixel text-sm text-yellow-400">📦 INVENTORY</h2>
          <button onClick={toggleInventory} className="text-gray-400 hover:text-white text-xl">&times;</button>
        </div>

        {/* Player Stats */}
        <div className="px-4 py-3 border-b border-gray-800">
          <div className="flex gap-4">
            <div className="text-center">
              <p className="font-pixel text-[9px] text-gray-400">HP</p>
              <p className="font-pixel text-xs text-green-400">{hp}/{maxHp}</p>
            </div>
            <div className="text-center">
              <p className="font-pixel text-[9px] text-gray-400">MP</p>
              <p className="font-pixel text-xs text-blue-400">{mp}/{maxMp}</p>
            </div>
            <div className="text-center">
              <p className="font-pixel text-[9px] text-gray-400">WEAPONS</p>
              <p className="font-pixel text-xs text-yellow-400">{inventory.length}</p>
            </div>
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
                  <p className="font-pixel text-[9px] text-gray-400">ATK +{equippedWeapon.atk} • {equippedWeapon.skills.length} skills</p>
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
            <p className="font-pixel text-[10px] text-gray-500 text-center py-6">
              No weapons yet. Open chests to get some!
            </p>
          ) : (
            <div className="space-y-2">
              {inventory.map((weapon, i) => (
                <div
                  key={`${weapon.id}-${i}`}
                  className={`border rounded-lg p-2 ${RARITY_COLORS[weapon.rarity]} ${equippedWeapon?.id === weapon.id ? 'ring-2 ring-green-500' : ''} cursor-pointer hover:opacity-90 transition-opacity`}
                  onClick={() => equipWeapon(weapon)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className={`font-pixel text-xs ${RARITY_TEXT[weapon.rarity]}`}>⚔️ {weapon.name}</p>
                      <p className="font-pixel text-[9px] text-gray-400">ATK +{weapon.atk} • {weapon.skills.length} skills</p>
                    </div>
                    <span className={`font-pixel text-[8px] ${equippedWeapon?.id === weapon.id ? 'text-green-400' : 'text-gray-500'}`}>
                      {equippedWeapon?.id === weapon.id ? '✓ ON' : 'TAP TO EQUIP'}
                    </span>
                  </div>
                  {/* Skills preview */}
                  <div className="mt-1 flex flex-wrap gap-1">
                    {weapon.skills.map((skill, j) => (
                      <span key={j} className="font-pixel text-[8px] bg-black/30 px-1.5 py-0.5 rounded text-gray-300">
                        {skill.name}
                      </span>
                    ))}
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
          <button onClick={toggleInventory} className="font-pixel text-[10px] text-gray-400 hover:text-white transition-colors">
            [ESC] Close
          </button>
        </div>
      </div>
    </div>
  )
}
