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
            SAGA
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
      <div className="flex flex-col gap-3 w-64">
        <button onClick={startNewGame}
          className="font-pixel text-base text-[#f0d050] bg-[#1a1a5e] border-2 border-[#f0d050]/50 hover:bg-[#2a2a7e] hover:border-[#f0d050] rounded-lg px-6 py-3 transition-all shadow-lg shadow-[#f0d050]/10"
        >
          ⚔️  New Game
        </button>
        {hasSave && (
          <button onClick={loadGame}
            className="font-pixel text-base text-[#88ccff] bg-[#1a1a5e] border-2 border-[#88ccff]/50 hover:bg-[#2a2a7e] hover:border-[#88ccff] rounded-lg px-6 py-3 transition-all"
          >
            📂  Continue
          </button>
        )}
        <button onClick={() => alert('📖 STORY\n\nIn the realm of Pixel Saga, monsters roam free.\n\nAs a brave adventurer, you must explore three lands:\n\n🏘️ Peaceful Village\n🌲 Dark Forest\n⛰️ Shadow Cave\n\nDefeat bosses! Collect legendary weapons!\nBecome the strongest!')}
          className="font-pixel text-base text-[#aabbcc] bg-[#1a1a5e] border-2 border-[#aabbcc]/30 hover:bg-[#2a2a7e] hover:border-[#aabbcc] rounded-lg px-6 py-3 transition-all"
        >
          📖  Story
        </button>
      </div>

      <p className="absolute bottom-6 font-pixel text-[9px] text-gray-600">v1.0 — by Fadel</p>
    </div>
  )
}
