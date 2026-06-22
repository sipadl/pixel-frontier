'use client'
import { useGameStore } from '@/store/gameStore'

const SHOP_ITEMS = [
  { id: 1, name: 'Potion', type: 'heal', value: 30, price: 15, icon: '🧪', desc: 'Heal 30 HP' },
  { id: 2, name: 'Hi-Potion', type: 'heal', value: 80, price: 40, icon: '🧪', desc: 'Heal 80 HP' },
  { id: 3, name: 'Ether', type: 'mp_heal', value: 20, price: 20, icon: '💎', desc: 'Restore 20 MP' },
  { id: 4, name: 'Mega Ether', type: 'mp_heal', value: 50, price: 60, icon: '💎', desc: 'Restore 50 MP' },
]

export default function Shop() {
  const { showShop, toggleShop, gold, addItem, gainGold } = useGameStore()

  if (!showShop) return null

  const buyItem = (item: typeof SHOP_ITEMS[0]) => {
    if (gold < item.price) return
    gainGold(-item.price)
    addItem({ id: item.id, name: item.name, type: item.type, value: item.value, quantity: 1 })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border-2 border-green-700 rounded-xl w-full max-w-lg mx-4 max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-green-800 bg-gradient-to-r from-green-900/50 to-transparent">
          <div>
            <h2 className="font-pixel text-sm text-green-400">🏪 SHOP</h2>
            <p className="font-pixel text-[9px] text-yellow-400">💰 {gold} Gold</p>
          </div>
          <button onClick={toggleShop} className="text-gray-400 hover:text-white text-xl">&times;</button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="space-y-2">
            {SHOP_ITEMS.map(item => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  gold >= item.price
                    ? 'bg-gray-800 border-gray-600 hover:border-green-500 cursor-pointer'
                    : 'bg-gray-800/50 border-gray-700 opacity-50'
                }`}
                onClick={() => buyItem(item)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-pixel text-xs text-white">{item.name}</p>
                    <p className="font-pixel text-[9px] text-gray-400">{item.desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-pixel text-xs ${gold >= item.price ? 'text-yellow-400' : 'text-gray-500'}`}>
                    💰 {item.price}
                  </p>
                  {gold >= item.price && (
                    <p className="font-pixel text-[8px] text-green-400">TAP TO BUY</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
