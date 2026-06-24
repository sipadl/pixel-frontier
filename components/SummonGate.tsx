'use client'
import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'

export default function SummonGate() {
  const gems = useGameStore((s) => s.gems)
  const pullGacha = useGameStore((s) => s.pullGacha)
  const setScreen = useGameStore((s) => s.setScreen)
  const [results, setResults] = useState<{ name: string; rarity: number; element: string; isNew: boolean; shards: number }[]>([])
  const [summoning, setSummoning] = useState(false)

  const doPull = (count: 1 | 10) => {
    setSummoning(true)
    setResults([])
    setTimeout(() => {
      const raw = pullGacha(count)
      setResults(
        raw.map((r) => ({
          name: r.unit.name,
          rarity: r.unit.rarity,
          element: r.unit.element,
          isNew: r.isNew,
          shards: r.shardsGained,
        })),
      )
      setSummoning(false)
    }, 600)
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-purple-950 via-slate-900 to-slate-950 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-pixel text-sm text-purple-300">🎰 SUMMON GATE</h2>
        <button
          onClick={() => setScreen('town')}
          className="font-pixel text-[8px] px-3 py-1 bg-red-900 border border-red-500 rounded text-red-300"
        >
          ✖ BACK
        </button>
      </div>

      {/* Gate visual */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-6xl mb-4 animate-bob">🏛️</div>
        <p className="font-pixel text-[9px] text-purple-300 mb-6">Mystic Summon Gate</p>

        {/* Pull buttons */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => doPull(1)}
            disabled={gems < 5 || summoning}
            className="font-pixel text-[10px] px-5 py-3 bg-gradient-to-b from-purple-600 to-purple-800 border-2 border-purple-400 rounded-lg text-white disabled:opacity-40 active:scale-95 transition-all"
          >
            ⚡ x1 (5💎)
          </button>
          <button
            onClick={() => doPull(10)}
            disabled={gems < 50 || summoning}
            className="font-pixel text-[10px] px-5 py-3 bg-gradient-to-b from-yellow-600 to-orange-700 border-2 border-yellow-400 rounded-lg text-white disabled:opacity-40 active:scale-95 transition-all"
          >
            ⚡ x10 (50💎)
          </button>
        </div>

        <p className="font-pixel text-[7px] text-slate-400">💎 {gems} gems available</p>
        <p className="font-pixel text-[6px] text-slate-500 mt-1">3★ 70% · 4★ 25% · 5★ 5%</p>

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-2 w-full max-w-sm">
            {results.map((r, i) => (
              <div
                key={i}
                className={`flex flex-col items-center p-2 rounded border-2 ${
                  r.rarity === 5
                    ? 'border-yellow-400 bg-yellow-900/40 animate-pulse-glow'
                    : r.rarity === 4
                      ? 'border-blue-400 bg-blue-900/40'
                      : 'border-gray-500 bg-gray-800/40'
                }`}
              >
                <span className="font-pixel text-[8px] text-white">{r.name}</span>
                <span className="font-pixel text-[6px]">{'★'.repeat(r.rarity)}</span>
                {r.isNew && <span className="font-pixel text-[5px] text-green-400">NEW!</span>}
                {r.shards > 0 && <span className="font-pixel text-[5px] text-amber-400">+{r.shards} shards</span>}
              </div>
            ))}
          </div>
        )}

        {summoning && (
          <p className="font-pixel text-[8px] text-purple-400 mt-4 animate-pulse">Summoning...</p>
        )}
      </div>
    </div>
  )
}
