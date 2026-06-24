'use client'
import { useGameStore } from '@/store/gameStore'

export default function ResultScreen() {
  const showResult = useGameStore((s) => s.showResult)
  const returnToTown = useGameStore((s) => s.returnToTown)

  if (!showResult) return null

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-yellow-950 via-slate-900 to-slate-950 p-6">
      <h1 className="font-pixel text-xl text-yellow-300 mb-6 animate-pulse-glow">
        {showResult.won ? '🏆 VICTORY!' : '💀 DEFEAT'}
      </h1>

      {showResult.won && (
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3 font-pixel text-sm">
            <span className="text-yellow-400">🪙 +{showResult.rewards.gold}</span>
          </div>
          <div className="flex items-center gap-3 font-pixel text-sm">
            <span className="text-purple-400">💎 +{showResult.rewards.gems}</span>
          </div>
          <div className="flex items-center gap-3 font-pixel text-sm">
            <span className="text-green-400">✨ +{showResult.rewards.exp} EXP</span>
          </div>
        </div>
      )}

      <button
        onClick={returnToTown}
        className="font-pixel text-xs px-6 py-3 bg-gradient-to-b from-green-600 to-green-800 border-2 border-green-400 rounded-lg text-white active:scale-95 transition-all"
      >
        🏠 RETURN TO TOWN
      </button>
    </div>
  )
}
