'use client'
import { useGameStore } from '@/store/gameStore'

export default function QuestLog() {
  const { quests, showQuests, toggleQuests } = useGameStore()

  if (!showQuests) return null

  const activeQuests = quests.filter(q => !q.completed)
  const completedQuests = quests.filter(q => q.completed)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border-2 border-amber-700 rounded-xl w-full max-w-lg mx-4 max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-amber-800 bg-gradient-to-r from-amber-900/50 to-transparent">
          <h2 className="font-pixel text-sm text-amber-400">📜 QUESTS ({activeQuests.length} active)</h2>
          <button onClick={toggleQuests} className="text-gray-400 hover:text-white text-xl">&times;</button>
        </div>

        {/* Active Quests */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {activeQuests.length === 0 ? (
            <p className="font-pixel text-[10px] text-gray-500 text-center py-6">All quests completed!</p>
          ) : (
            <div className="space-y-3">
              {activeQuests.map(q => (
                <div key={q.id} className="bg-gray-800/80 border border-gray-700 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-pixel text-[10px] text-amber-300">📌 {q.title}</p>
                    <span className="font-pixel text-[8px] text-gray-400">{q.current}/{q.target}</span>
                  </div>
                  <p className="font-pixel text-[9px] text-gray-400 mb-2">{q.description}</p>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (q.current / q.target) * 100)}%` }}
                    />
                  </div>
                  {/* Rewards */}
                  <div className="flex gap-2 mt-2">
                    {q.reward.gold && <span className="font-pixel text-[8px] text-yellow-400">💰 {q.reward.gold}</span>}
                    {q.reward.exp && <span className="font-pixel text-[8px] text-purple-400">✨ {q.reward.exp} EXP</span>}
                    {q.reward.item && <span className="font-pixel text-[8px] text-green-400">🎁 {q.reward.item.name}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completed Quests */}
          {completedQuests.length > 0 && (
            <div className="mt-4">
              <p className="font-pixel text-[9px] text-gray-500 mb-2">✅ COMPLETED ({completedQuests.length})</p>
              <div className="space-y-1">
                {completedQuests.map(q => (
                  <div key={q.id} className="bg-gray-800/40 border border-gray-700/50 rounded px-3 py-1.5">
                    <p className="font-pixel text-[9px] text-gray-500 line-through">{q.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
