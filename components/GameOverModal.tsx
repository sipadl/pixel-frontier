'use client'
import { useGameStore } from '@/store/gameStore'

export default function GameOverModal() {
  const gameOver = useGameStore((s) => s.gameOver)
  const retryBattle = useGameStore((s) => s.retryBattle)
  const returnToTown = useGameStore((s) => s.returnToTown)

  if (!gameOver) return null

  return (
    <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6">
      <h1 className="font-pixel text-xl text-red-400 mb-2 animate-shake">💀 GAME OVER</h1>
      <p className="font-pixel text-[8px] text-slate-400 mb-6">
        {gameOver.won ? 'Victory!' : `Defeated at wave ${gameOver.wave}`}
      </p>

      <div className="space-y-3 w-full max-w-xs">
        <button
          onClick={retryBattle}
          className="w-full font-pixel text-xs py-3 bg-gradient-to-b from-yellow-600 to-yellow-800 border-2 border-yellow-400 rounded-lg text-white active:scale-95 transition-all"
        >
          🔄 RETRY (Free)
        </button>
        <button
          onClick={returnToTown}
          className="w-full font-pixel text-xs py-3 bg-gradient-to-b from-gray-600 to-gray-800 border-2 border-gray-400 rounded-lg text-white active:scale-95 transition-all"
        >
          🏠 RETURN TO TOWN
        </button>
      </div>
    </div>
  )
}
