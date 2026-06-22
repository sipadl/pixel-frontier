'use client'
import { useGameStore } from '@/store/gameStore'

export default function DialogueBox() {
  const { showDialogue, dialogueName, dialogueText, closeDialogue } = useGameStore()

  if (!showDialogue) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4" onClick={closeDialogue}>
      <div className="max-w-2xl mx-auto bg-gray-900/95 border-2 border-gray-600 rounded-xl p-4 backdrop-blur-sm cursor-pointer">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg border border-amber-400 flex items-center justify-center text-lg shrink-0">
            👴
          </div>
          <div className="flex-1">
            <p className="font-pixel text-xs text-yellow-400 mb-1">{dialogueName}</p>
            <p className="font-pixel text-[11px] text-gray-200 leading-relaxed">{dialogueText}</p>
            <p className="font-pixel text-[9px] text-gray-500 mt-2 text-right">tap to close ▸</p>
          </div>
        </div>
      </div>
    </div>
  )
}
