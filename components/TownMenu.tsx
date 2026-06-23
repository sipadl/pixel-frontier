'use client'
import { useGameStore } from '@/store/gameStore'
import PixelArt, { HERO_DOWN_1, PALETTE_DEFAULT } from '@/components/PixelArt'

export default function TownMenu() {
  const gems = useGameStore(s => s.gems)
  const gold = useGameStore(s => s.gold)
  const energy = useGameStore(s => s.energy)
  const maxEnergy = useGameStore(s => s.maxEnergy)
  const level = useGameStore(s => s.level)
  const currentSquad = useGameStore(s => s.currentSquad)
  const squadInstances = useGameStore(s => s.squadInstances)
  const unlockedUnits = useGameStore(s => s.unlockedUnits)
  const setScreen = useGameStore(s => s.setScreen)
  const refillEnergy = useGameStore(s => s.refillEnergy)

  const filledSlots = currentSquad.filter(id => id !== null).length
  const totalUnits = Object.keys(unlockedUnits).length
  const energyPct = (energy / maxEnergy) * 100

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-sky-700 via-sky-800 to-gray-900">
      {/* HEADER */}
      <div className="px-3 py-2 bg-gradient-to-b from-gray-900 to-gray-800 border-b-2 border-yellow-500 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-pixel text-[10px] text-yellow-400">★ Lv.{level}</p>
            <p className="font-pixel text-[8px] text-gray-400">Pixel Frontier</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex gap-2 text-[9px] font-pixel">
              <span className="bg-purple-900/60 px-2 py-0.5 rounded border border-purple-400">💎 {gems}</span>
              <span className="bg-yellow-900/60 px-2 py-0.5 rounded border border-yellow-400">🪙 {gold}</span>
            </div>
          </div>
        </div>
        {/* ENERGY BAR */}
        <div className="mt-2">
          <div className="flex justify-between mb-0.5">
            <span className="font-pixel text-[8px] text-cyan-300">⚡ ENERGY</span>
            <span className="font-pixel text-[8px] text-cyan-200">{energy}/{maxEnergy}</span>
          </div>
          <div className="h-3 bg-gray-950 rounded-full overflow-hidden border border-cyan-700">
            <div
              className="h-full transition-all duration-300 rounded-full bg-gradient-to-r from-cyan-500 via-yellow-400 to-yellow-500"
              style={{ width: `${energyPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* HERO PREVIEW */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="mb-4">
          <PixelArt data={HERO_DOWN_1} palette={PALETTE_DEFAULT} pixelSize={6} />
        </div>
        <h1 className="font-pixel text-xl text-yellow-300 drop-shadow-[0_2px_0_#000] tracking-wider">PIXEL FRONTIER</h1>
        <p className="font-pixel text-[9px] text-gray-300 mt-1">⚔️ Squad-Based Pixel RPG ⚔️</p>

        {/* Stats mini */}
        <div className="grid grid-cols-3 gap-2 mt-6 w-full max-w-xs">
          <div className="bg-black/40 border border-gray-600 rounded p-2 text-center">
            <p className="font-pixel text-[7px] text-gray-400">SQUAD</p>
            <p className="font-pixel text-base text-green-400">{filledSlots}/6</p>
          </div>
          <div className="bg-black/40 border border-gray-600 rounded p-2 text-center">
            <p className="font-pixel text-[7px] text-gray-400">UNITS</p>
            <p className="font-pixel text-base text-blue-400">{totalUnits}</p>
          </div>
          <div className="bg-black/40 border border-gray-600 rounded p-2 text-center">
            <p className="font-pixel text-[7px] text-gray-400">ENERGY</p>
            <p className="font-pixel text-base text-cyan-400">{energy}</p>
          </div>
        </div>
      </div>

      {/* SUB-MENU BUTTONS */}
      <div className="p-3 space-y-2 bg-gradient-to-t from-gray-950 to-transparent">
        <button
          onClick={() => setScreen('dungeon')}
          disabled={filledSlots === 0}
          className="w-full font-pixel text-sm py-3 bg-gradient-to-b from-red-600 to-red-800 border-2 border-red-400 rounded-lg text-white shadow-lg shadow-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] transition-all"
        >
          ⚔️ DUNGEON
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setScreen('squad')}
            className="font-pixel text-xs py-3 bg-gradient-to-b from-blue-600 to-blue-800 border-2 border-blue-400 rounded-lg text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all"
          >
            🛡️ SQUAD
          </button>
          <button
            onClick={() => setScreen('summon')}
            className="font-pixel text-xs py-3 bg-gradient-to-b from-purple-600 to-purple-800 border-2 border-purple-400 rounded-lg text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-all"
          >
            🎰 SUMMON
          </button>
        </div>
        <button
          onClick={() => refillEnergy()}
          disabled={energy >= maxEnergy}
          className="w-full font-pixel text-[10px] py-2 bg-gray-800 border border-cyan-600 rounded text-cyan-300 disabled:opacity-40"
        >
          ⚡ REFILL ENERGY (FREE DEMO)
        </button>
      </div>
    </div>
  )
}
