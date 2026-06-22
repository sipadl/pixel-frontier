'use client'
import { useGameStore } from '@/store/gameStore'
import TapGame from '@/components/TapGame'
import Inventory from '@/components/Inventory'
import GachaPopup from '@/components/GachaPopup'
import GameOver from '@/components/GameOver'
import MainMenu from '@/components/MainMenu'
import QuestLog from '@/components/QuestLog'
import Shop from '@/components/Shop'
import StoryIntro from '@/components/StoryIntro'
import StatsPanel from '@/components/StatsPanel'

export default function Home() {
  const screen = useGameStore(s => s.screen)
  const showInventory = useGameStore(s => s.showInventory)
  const showShop = useGameStore(s => s.showShop)
  const showQuests = useGameStore(s => s.showQuests)
  const showStats = useGameStore(s => s.showStats)

  if (screen === 'menu') return <MainMenu />
  if (screen === 'intro') return <StoryIntro />
  if (screen === 'gameover') return <GameOver />
  if (screen === 'gacha') return <GachaPopup />

  return (
    <div className="fixed inset-0 bg-gray-950 overflow-hidden">
      <TapGame />
      {showInventory && <Inventory />}
      {showStats && <StatsPanel />}
      {showQuests && <QuestLog />}
      {showShop && <Shop />}
    </div>
  )
}
