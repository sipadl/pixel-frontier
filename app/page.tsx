'use client'
import { useGameStore } from '@/store/gameStore'
import TownMenu from '@/components/TownMenu'
import SquadManager from '@/components/SquadManager'
import SummonGate from '@/components/SummonGate'
import DungeonSelect from '@/components/DungeonSelect'
import BattleScreen from '@/components/BattleScreen'
import GameOverModal from '@/components/GameOverModal'
import ResultScreen from '@/components/ResultScreen'

export default function Page() {
  const screen = useGameStore(s => s.screen)
  const gameOver = useGameStore(s => s.gameOver)

  return (
    <div className="max-w-md h-screen mx-auto relative overflow-hidden border-x border-gray-800 bg-gray-950 text-white">
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