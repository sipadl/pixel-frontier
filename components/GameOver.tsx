'use client'
import { useGameStore } from '@/store/gameStore'

export default function GameOver() {
  const { setScreen, loadGame } = useGameStore()

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95">
      {/* Animated blood drip */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-red-900/40 to-transparent" />

      <div className="text-center">
        <h1 className="font-pixel text-5xl text-red-500 mb-4 animate-pulse">
          GAME OVER
        </h1>
        <p className="font-pixel text-sm text-gray-400 mb-8">
          You have been defeated...
        </p>

        <div className="flex flex-col gap-3 w-56 mx-auto">
          <button
            onClick={() => {
              loadGame()
              setScreen('game')
            }}
            className="game-btn"
          >
            📂 Load Save
          </button>
          <button
            onClick={() => setScreen('menu')}
            className="game-btn-secondary"
          >
            🏠 Main Menu
          </button>
        </div>
      </div>

      {/* Skull decorations */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 opacity-20">
        <span className="text-3xl">💀</span>
        <span className="text-3xl">💀</span>
        <span className="text-3xl">💀</span>
      </div>
    </div>
  )
}
