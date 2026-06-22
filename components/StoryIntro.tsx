'use client'
import { useGameStore } from '@/store/gameStore'
import { useState, useEffect } from 'react'

const STORY_LINES = [
  { text: "⚔️ PIXEL SAGA ⚔️", delay: 0, style: 'text-2xl text-yellow-400 mb-4' },
  { text: "", delay: 800, style: '' },
  { text: "In a realm of endless battles...", delay: 1200, style: 'text-sm text-gray-300' },
  { text: "monsters roam three dangerous lands.", delay: 2800, style: 'text-sm text-gray-300' },
  { text: "", delay: 4000, style: '' },
  { text: "🏘️ Village — Easy enemies", delay: 4500, style: 'text-[10px] text-green-400' },
  { text: "🌲 Forest — Tough beasts", delay: 5800, style: 'text-[10px] text-emerald-400' },
  { text: "⛰️ Cave — Boss territory", delay: 7100, style: 'text-[10px] text-purple-400' },
  { text: "", delay: 8500, style: '' },
  { text: "Tap to attack. Combo for bonus damage!", delay: 9000, style: 'text-[10px] text-yellow-300' },
  { text: "Open chests for legendary weapons!", delay: 10800, style: 'text-[10px] text-yellow-300' },
  { text: "Upgrade skills. Become the strongest!", delay: 12600, style: 'text-[10px] text-yellow-300' },
]

export default function StoryIntro() {
  const { startGame, soundEnabled } = useGameStore()
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    const timers = STORY_LINES.map((line, i) =>
      setTimeout(() => setVisibleLines(i + 1), line.delay)
    )
    const endTimer = setTimeout(() => startGame(), 15000)
    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(endTimer)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-gray-950 via-indigo-950 to-black">
      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{ left: `${(i * 13) % 100}%`, top: `${(i * 7) % 100}%`, animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>

      <div className="relative max-w-lg w-full px-8 text-center">
        {STORY_LINES.slice(0, visibleLines).map((line, i) => (
          <p key={i} className={`font-pixel leading-loose ${line.style}`}
            style={{ animation: 'slide-up 0.5s ease-out', marginTop: line.text === '' ? '12px' : '0' }}>
            {line.text}
          </p>
        ))}
        {visibleLines > 0 && visibleLines <= STORY_LINES.length && (
          <span className="inline-block w-2 h-3 bg-yellow-400 animate-pulse ml-1" />
        )}
      </div>

      <button
        onClick={startGame}
        className="absolute bottom-8 font-pixel text-[11px] text-yellow-400 hover:text-yellow-300 transition-colors animate-pulse"
      >
        [TAP TO START ▸]
      </button>
    </div>
  )
}
