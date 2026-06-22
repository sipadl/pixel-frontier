'use client'
import { useGameStore } from '@/store/gameStore'
import { useState, useEffect } from 'react'

const STORY_LINES = [
  { text: "In the realm of Pixel Saga...", delay: 0 },
  { text: "monsters roam free across three lands.", delay: 1500 },
  { text: "🏘️ The Peaceful Village — where your journey begins.", delay: 3000 },
  { text: "🌲 The Dark Forest — home to fearsome beasts.", delay: 5000 },
  { text: "⛰️ The Shadow Cave — lair of the Cave King.", delay: 7000 },
  { text: "", delay: 9000 },
  { text: "As a brave adventurer,", delay: 9500 },
  { text: "you must explore, fight, and collect legendary weapons.", delay: 11000 },
  { text: "Open chests for gacha weapons!", delay: 12500 },
  { text: "Upgrade your skills with skill points!", delay: 14000 },
  { text: "", delay: 15500 },
  { text: "⚔️ Good luck, Hero!", delay: 16000 },
]

export default function StoryIntro() {
  const { setScreen, soundEnabled } = useGameStore()
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [skip, setSkip] = useState(false)

  useEffect(() => {
    if (skip) return
    const timers = STORY_LINES.map((line, i) =>
      setTimeout(() => setVisibleLines(i + 1), line.delay)
    )
    // Auto-transition after story
    const endTimer = setTimeout(() => setScreen('game'), 18500)
    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(endTimer)
    }
  }, [skip, setScreen])

  const handleSkip = () => {
    setSkip(true)
    setScreen('game')
  }

  if (skip) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-gray-950 via-indigo-950 to-black">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
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

      {/* Story text */}
      <div className="relative max-w-lg w-full px-8 text-center">
        {STORY_LINES.slice(0, visibleLines).map((line, i) => (
          <p
            key={i}
            className="font-pixel text-[11px] text-gray-200 leading-loose animate-slide-up"
            style={{
              animation: 'slide-up 0.5s ease-out',
              opacity: line.text === '' ? 0 : 1,
              marginTop: line.text === '' ? '12px' : '0',
            }}
          >
            {line.text}
          </p>
        ))}

        {/* Cursor blink */}
        {visibleLines > 0 && visibleLines <= STORY_LINES.length && (
          <span className="inline-block w-2 h-3 bg-yellow-400 animate-pulse ml-1" />
        )}
      </div>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute bottom-8 right-8 font-pixel text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
      >
        [SKIP ▸]
      </button>
    </div>
  )
}
