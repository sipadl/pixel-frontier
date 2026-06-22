'use client'
import { useGameStore } from '@/store/gameStore'

export default function DialogueBox() {
  const showDialogue = useGameStore(s => s.showDialogue)
  const dialogueName = useGameStore(s => s.dialogueName)
  const dialogueText = useGameStore(s => s.dialogueText)
  const closeDialogue = useGameStore(state => state.closeDialogue)

  if (!showDialogue) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-gray-900 border-2 border-gray-600 rounded-lg p-4 max-w-lg mx-auto pointer-events-auto">
      <p className="font-pixel text-[10px] text-yellow-400 mb-1">{dialogueName}</p>
      <p className="font-pixel text-[10px] text-white leading-relaxed">{dialogueText}</p>
      <button onClick={closeDialogue}
        className="mt-2 font-pixel text-[8px] text-gray-400 hover:text-white">
        [OK]
      </button>
    </div>
  )
}
