'use client'
import { useState, useEffect, useCallback } from 'react'
import { useGameStore } from '@/store/gameStore'
import TownMenu from '@/components/TownMenu'
import SquadManager from '@/components/SquadManager'
import SummonGate from '@/components/SummonGate'
import DungeonSelect from '@/components/DungeonSelect'
import BattleScreen from '@/components/BattleScreen'
import GameOverModal from '@/components/GameOverModal'
import ResultScreen from '@/components/ResultScreen'

/* ── asset URLs to preload (dungeon BGs + sprite sheet placeholders) ── */
const ASSET_URLS = [
  '/assets/bg-forest.svg',
  '/assets/bg-cave.svg',
  '/assets/bg-volcano.svg',
  '/assets/bg-ice.svg',
  '/assets/sprites/hero-sheet.png',
  '/assets/sprites/monster-sheet.png',
]

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve() // don't block on missing assets
    img.src = url
  })
}

export default function Page() {
  const screen = useGameStore((s) => s.screen)
  const gameOver = useGameStore((s) => s.gameOver)
  const refreshEnergy = useGameStore((s) => s.refreshEnergy)

  const [loading, setLoading] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)

  /* ── preloader ── */
  const runPreloader = useCallback(async () => {
    const total = ASSET_URLS.length
    let done = 0
    await Promise.all(
      ASSET_URLS.map(async (url) => {
        await preloadImage(url)
        done++
        setLoadProgress(Math.round((done / total) * 100))
      }),
    )
    // sync time-based energy regen
    refreshEnergy()
    // tiny delay so the 100% bar is visible
    await new Promise((r) => setTimeout(r, 400))
    setLoading(false)
  }, [refreshEnergy])

  useEffect(() => {
    runPreloader()
  }, [runPreloader])

  /* ── splash / loading screen ── */
  if (loading) {
    return (
      <div className="max-w-md w-full h-screen mx-auto flex flex-col items-center justify-center bg-black text-white border-x border-slate-800">
        {/* pixel logo */}
        <h1 className="font-pixel text-2xl tracking-widest text-yellow-400 drop-shadow-[0_2px_0_#000] mb-8 animate-pulse-glow">
          PIXEL FRONTIER
        </h1>
        <p className="font-pixel text-[8px] text-slate-400 mb-6">Loading assets...</p>
        {/* progress bar */}
        <div className="w-56 h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-600">
          <div
            className="h-full transition-all duration-300 rounded-full bg-gradient-to-r from-cyan-500 via-yellow-400 to-yellow-500"
            style={{ width: `${loadProgress}%` }}
          />
        </div>
        <p className="font-pixel text-[8px] text-slate-500 mt-3">{loadProgress}%</p>
      </div>
    )
  }

  /* ── main game router ── */
  return (
    <div className="max-w-md w-full h-screen mx-auto relative overflow-hidden border-x border-slate-800 bg-slate-950 text-white">
      {screen === 'town' && <TownMenu />}
      {screen === 'squad' && <SquadManager />}
      {screen === 'summon' && <SummonGate />}
      {screen === 'dungeon' && <DungeonSelect />}
      {screen === 'battle' && <BattleScreen />}
      {screen === 'result' && <ResultScreen />}
      {gameOver && <GameOverModal />}
    </div>
  )
}
