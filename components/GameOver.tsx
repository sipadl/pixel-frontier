'use client'
import { useGameStore } from '@/store/gameStore'

export default function GameOver() {
  const { loadGame, startNewGame } = useGameStore()

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-red-950 to-black">
      {/* Blood splatter effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="absolute w-2 h-2 bg-red-900/40 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }} />
        ))}
      </div>

      <div className="relative text-center">
        <h1 className="font-pixel text-4xl md:text-6xl text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)] mb-4 animate-pulse">
          GAME OVER
        </h1>
        <p className="font-pixel text-xs text-gray-400 mb-8">You were defeated by the monsters...</p>

        <div className="flex flex-col gap-3 w-56 mx-auto">
          <button
            onClick={() => loadGame()}
            className="font-pixel text-xs bg-green-800 hover:bg-green-700 text-white py-3 px-4 rounded-lg border border-green-500 transition-all hover:scale-105"
          >
            📂 Load Save
          </button>
          <button
            onClick={() => startNewGame()}
            className="font-pixel text-xs bg-blue-800 hover:bg-blue-700 text-white py-3 px-4 rounded-lg border border-blue-500 transition-all hover:scale-105"
          >
            🆕 New Game
          </button>
        </div>
      </div>
    </div>
  )
}
