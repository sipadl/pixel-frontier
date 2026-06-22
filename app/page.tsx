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
import QuestLog from '@/components/QuestLog'
import Shop from '@/components/Shop'
import { useEffect } from 'react'

export default function Home() {
  const { screen, showInventory, showGacha, showDialogue, showQuests, showShop, inBattle, toggleSound } = useGameStore()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const s = useGameStore.getState()
      if (e.key === 'i' || e.key === 'I') s.toggleInventory()
      if (e.key === 'q' || e.key === 'Q') s.toggleQuests()
      if (e.key === 'k' || e.key === 'K') s.toggleShop()
      if (e.key === 'm' || e.key === 'M') s.toggleSound()
      if (e.key === 'Escape') {
        if (s.showInventory) s.toggleInventory()
        else if (s.showQuests) s.toggleQuests()
        else if (s.showShop) s.toggleShop()
        else if (s.showGacha) s.closeGacha()
        else if (s.showDialogue) s.closeDialogue()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  if (screen === 'menu') return <MainMenu />
  if (screen === 'gameover') return <GameOver />

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

      {/* Quest Log */}
      {showQuests && <QuestLog />}

      {/* Shop */}
      {showShop && <Shop />}

      {/* Gacha Popup */}
      {showGacha && <GachaPopup />}

      {/* Dialogue Box */}
      <DialogueBox />
    </div>
  )
}
