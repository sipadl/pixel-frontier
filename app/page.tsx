'use client'
import { useGameStore } from '@/store/gameStore'
import GameMap from '@/components/GameMap'
import HUD from '@/components/HUD'
import BattleUI from '@/components/BattleUI'
import Inventory from '@/components/Inventory'
import GachaPopup from '@/components/GachaPopup'
import DialogueBox from '@/components/DialogueBox'
import GameOver from '@/components/GameOver'
import MainMenu from '@/components/MainMenu'
import GameOverScreen from '@/components/GameOver'
import { useEffect } from 'react'

export default function Home() {
  const { screen, showInventory, showGacha, showDialogue, inBattle } = useGameStore()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'i' || e.key === 'I') {
        useGameStore.getState().toggleInventory()
      }
      if (e.key === 'Escape') {
        const s = useGameStore.getState()
        if (s.showInventory) s.toggleInventory()
        if (s.showGacha) s.closeGacha()
        if (s.showDialogue) s.closeDialogue()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  if (screen === 'menu') return <MainMenu />
  if (screen === 'gameover') return <GameOverScreen />

  return (
    <div className="fixed inset-0 bg-gray-950 overflow-hidden">
      {/* Game Map */}
      <GameMap />

      {/* HUD Overlay */}
      <HUD />

      {/* Battle Screen */}
      {inBattle && <BattleUI />}

      {/* Inventory */}
      {showInventory && <Inventory />}

      {/* Gacha Popup */}
      {showGacha && <GachaPopup />}

      {/* Dialogue Box */}
      <DialogueBox />
    </div>
  )
}
