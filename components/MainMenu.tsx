'use client'
import { useGameStore } from '@/store/gameStore'

export default function MainMenu() {
  const { setScreen, loadGame, initNewGame } = useGameStore()
  const hasSave = typeof window !== 'undefined' && localStorage.getItem('pixel-saga-save') !== null

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-black flex flex-col items-center justify-center z-50">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Title */}
      <div className="relative mb-12 text-center">
        <h1 className="font-pixel text-5xl md:text-7xl text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] mb-2 tracking-wider">
          PIXEL
        </h1>
        <h1 className="font-pixel text-6xl md:text-8xl text-red-400 drop-shadow-[0_0_20px_rgba(248,113,113,0.5)] tracking-wider">
          SAGA
        </h1>
        <p className="font-pixel text-xs text-purple-300 mt-4 tracking-widest">
          ✦ TURN-BASED RPG ✦
        </p>
      </div>

      {/* Character preview */}
      <div className="mb-10 relative">
        <div className="w-16 h-16 mx-auto mb-2">
          <div className="pixel-char-idle" />
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/30 rounded-full blur-sm" />
      </div>

      {/* Menu buttons */}
      <div className="flex flex-col gap-4 w-64">
        <button
          onClick={() => initNewGame()}
          className="game-btn text-lg"
        >
          ⚔️ New Game
        </button>

        {hasSave && (
          <button
            onClick={() => {
              loadGame()
              setScreen('game')
            }}
            className="game-btn-secondary text-lg"
          >
            📂 Continue
          </button>
        )}

        <button
          onClick={() => alert('📖 Story:\n\nIn the realm of Pixel Saga,\nmonsters roam free.\n\nAs a brave adventurer,\nyou must explore three lands:\n\n🏘️ Peaceful Village\n🌲 Dark Forest\n⛰️ Shadow Cave\n\nDefeat bosses!\nCollect legendary weapons!\nBecome the strongest!')}
          className="game-btn-secondary text-lg"
        >
          📖 Story
        </button>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 font-pixel text-[10px] text-gray-500">
        v1.0 — by Fadel Muhammad
      </p>
    </div>
  )
}
