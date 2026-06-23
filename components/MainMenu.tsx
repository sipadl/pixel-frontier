'use client'
import { useGameStore } from '@/store/gameStore'
import { useEffect, useState } from 'react'
import PixelArt, { HERO_DOWN_1, PALETTE_DEFAULT } from '@/components/PixelArt'

export default function MainMenu() {
  const { startNewGame, loadGame } = useGameStore()
  const [hasSave, setHasSave] = useState(false)

  useEffect(() => {
    setHasSave(!!localStorage.getItem('pixel-saga-save'))
  }, [])

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0a0a2e] via-[#1a1a4e] to-[#0d0d1a] flex flex-col items-center justify-center z-50">
      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
            style={{ left: `${Math.random() * 100}%`, top: `${(i * 17) % 100}%`, animationDelay: `${i * 0.2}s`, opacity: 0.3 + Math.random() * 0.7 }}
          />
        ))}
      </div>

      {/* Title: Final Fantasy style */}
      <div className="relative mb-10 text-center">
        <div className="relative">
          <h1 className="font-pixel text-6xl md:text-8xl text-[#f0d050] drop-shadow-[0_4px_0_#8b6914] tracking-wider leading-tight">
            PIXEL
          </h1>
          <h1 className="font-pixel text-6xl md:text-8xl text-[#e04040] drop-shadow-[0_4px_0_#8b1a1a] tracking-wider leading-tight">
            FRONTIER
          </h1>
        </div>
        <p className="font-pixel text-xs text-[#8888cc] mt-4 tracking-[0.3em]">
          ★ TURN-BASED RPG ★
        </p>
      </div>

      {/* Hero sprite */}
      <div className="mb-10 relative">
        <PixelArt data={HERO_DOWN_1} palette={PALETTE_DEFAULT} pixelSize={8} />
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-14 h-3 bg-black/30 rounded-full blur-sm" />
      </div>

      {/* Menu */}
      {/* Dungeon list */}
      <ul className="flex flex-col gap-2 w-64 max-h-[40vh] overflow-y-auto">
        {Array.from({ length: 5 }).map((_, i) => {
          const stage = i + 1;
          const completed = false; // placeholder, could be from state
          return (
            <li key={stage}
              className="flex items-center py-2 px-3 cursor-pointer hover:bg-gray-800 rounded"
              onClick={() => {
                // start selected dungeon stage
                startNewGame();
                // set stage in store (will be overridden by startNewGame default 1, then set proper stage)
                const { set } = useGameStore.getState();
                set({ stage, zone: 'dungeon', remainingWaves: get().stageMap[stage].waves, screen: 'intro' });
              }}
            >
              <span className="font-pixel text-xl mr-2">⚔️</span>
              <span className="font-pixel">Stage {stage}</span>
              <span className="ml-auto font-pixel text-sm text-green-400">
                {completed ? '✓' : '—'}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="absolute bottom-6 font-pixel text-[9px] text-gray-600">v1.0 — by Fadel</p>
    </div>
  )
}
