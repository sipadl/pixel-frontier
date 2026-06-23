'use client'
import { useGameStore } from '@/store/gameStore'
import { useState, useEffect } from 'react'

const STORY_LINES = [
  { text: "⚔️ PIXEL SAGA ⚔️", delay: 0, style: 'text-2xl text-yellow-400 mb-4' },
  { text: "", delay: 800, style: '' },
  { text: "Long ago, in a world of endless battles...", delay: 1200, style: 'text-sm text-gray-300 italic' },
  { text: "monsters have invaded three sacred lands.", delay: 2800, style: 'text-sm text-gray-300 italic' },
  { text: "", delay: 4000, style: '' },
  { text: "🏘️ Village — peaceful, but slime lurks nearby", delay: 4500, style: 'text-[10px] text-green-400' },
  { text: "🌲 Forest — dark beasts guard ancient trees", delay: 5800, style: 'text-[10px] text-emerald-400' },
  { text: "⛰️ Cave — home of the terrifying Cave King", delay: 7100, style: 'text-[10px] text-purple-400' },
  { text: "", delay: 8500, style: '' },
  { text: "You are the last hero.", delay: 9000, style: 'text-xs text-white font-bold' },
  { text: "Tap to attack. Combo for power!", delay: 10000, style: 'text-[10px] text-yellow-300' },
  { text: "Collect weapons. Defeat bosses.", delay: 11500, style: 'text-[10px] text-yellow-300' },
  { text: "Become the strongest warrior!", delay: 13000, style: 'text-[10px] text-yellow-300' },
]

export default function StoryIntro() {
  const { startGame } = useGameStore()
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    const timers = STORY_LINES.map((line, i) =>
      setTimeout(() => setVisibleLines(i + 1), line.delay)
    )
    const endTimer = setTimeout(() => startGame(), 16000)
    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(endTimer)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0a2e] via-[#1a1a4e] to-black">
      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
            style={{ left: `${(i * 13) % 100}%`, top: `${(i * 7) % 100}%`, animationDelay: `${i * 0.2}s`, opacity: 0.3 + Math.random() * 0.7 }} />
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
