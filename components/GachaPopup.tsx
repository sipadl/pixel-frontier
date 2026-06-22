'use client'
import { useGameStore } from '@/store/gameStore'
import { useState, useEffect } from 'react'
import { SoundSystem } from '@/game/systems/SoundSystem'

const RARITY_COLORS: Record<string, string> = {
  Common: 'from-gray-600 to-gray-700 border-gray-400 text-gray-200',
  Rare: 'from-blue-600 to-blue-700 border-blue-400 text-blue-200',
  Epic: 'from-purple-600 to-purple-700 border-purple-400 text-purple-200',
  Legendary: 'from-yellow-500 to-amber-600 border-yellow-300 text-yellow-100',
}

const RARITY_LABEL: Record<string, string> = {
  Common: '⬜ Common',
  Rare: '🟦 Rare',
  Epic: '🟪 Epic',
  Legendary: '🌟 LEGENDARY!',
}

const RARITY_SHADOW: Record<string, string> = {
  Common: '',
  Rare: '0 0 20px rgba(59,130,246,0.5)',
  Epic: '0 0 30px rgba(168,85,247,0.5)',
  Legendary: '0 0 40px rgba(250,204,21,0.7)',
}

const RARITY_BG: Record<string, string> = {
  Common: '',
  Rare: 'from-blue-900/30',
  Epic: 'from-purple-900/30',
  Legendary: 'from-yellow-900/50',
}

export default function GachaPopup() {
  const { gachaResult, closeGacha, addWeapon, equipWeapon, inventory, soundEnabled } = useGameStore()
  const [phase, setPhase] = useState<'rolling' | 'reveal' | 'done'>('rolling')
  const [rollText, setRollText] = useState('')
  const [particles, setParticles] = useState<{ x: number; y: number; delay: number }[]>([])

  useEffect(() => {
    if (!gachaResult) return
    setPhase('rolling')
    const texts = ['✦ Opening chest...', '✦ Energy swirling...', '✦ Finding weapon...']
    let idx = 0
    const interval = setInterval(() => {
      setRollText(texts[idx % texts.length])
      idx++
    }, 400)

    // Generate particles for legendary
    if (gachaResult.rarity === 'Legendary') {
      const newParticles = Array.from({ length: 30 }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
      }))
      setParticles(newParticles)
    }

    const timeout = setTimeout(() => {
      clearInterval(interval)
      setPhase('reveal')
      if (soundEnabled) {
        if (gachaResult.rarity === 'Legendary') SoundSystem.play('gacha_legendary')
        else SoundSystem.play('gacha')
      }
    }, 2000)
    return () => { clearInterval(interval); clearTimeout(timeout) }
  }, [gachaResult, soundEnabled])

  if (!gachaResult) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative max-w-sm w-full mx-4">
        {/* Glow background */}
        {gachaResult.rarity !== 'Common' && (
          <div
            className="absolute inset-0 rounded-2xl opacity-30 blur-xl"
            style={{ background: gachaResult.rarity === 'Legendary' ? '#facc15' : gachaResult.rarity === 'Epic' ? '#a855f7' : '#3b82f6' }}
          />
        )}

        {/* Legendary particles */}
        {gachaResult.rarity === 'Legendary' && phase === 'reveal' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: '1.5s',
                }}
              />
            ))}
          </div>
        )}

        <div className={`relative bg-gradient-to-b ${RARITY_COLORS[gachaResult.rarity]} border-2 rounded-2xl p-6 text-center`}
          style={{ boxShadow: RARITY_SHADOW[gachaResult.rarity] }}>

          {phase === 'rolling' ? (
            <div className="py-8">
              <div className="text-5xl animate-spin mb-4">🎁</div>
              <p className="font-pixel text-sm text-white animate-pulse">{rollText}</p>
            </div>
          ) : (
            <>
              {/* Rarity banner */}
              {gachaResult.rarity === 'Legendary' && (
                <div className="mb-3 animate-bounce">
                  <p className="font-pixel text-xs text-yellow-300 tracking-widest">★ ★ ★ ★</p>
                </div>
              )}
              {gachaResult.rarity === 'Epic' && (
                <div className="mb-2">
                  <p className="font-pixel text-[10px] text-purple-300 tracking-widest">★ ★ ★</p>
                </div>
              )}

              {/* Weapon icon */}
              <div className={`text-5xl mb-3 ${phase === 'reveal' ? 'animate-bounce' : ''}`}>
                {gachaResult.rarity === 'Legendary' ? '⚔️' :
                  gachaResult.rarity === 'Epic' ? '🗡️' :
                    gachaResult.rarity === 'Rare' ? '🔪' : '🗡️'}
              </div>

              {/* Weapon name */}
              <h2 className="font-pixel text-xl text-white mb-1">{gachaResult.name}</h2>
              <p className="font-pixel text-xs mb-3 opacity-80">{RARITY_LABEL[gachaResult.rarity]}</p>

              {/* Stats */}
              <div className="bg-black/30 rounded-lg p-3 mb-4">
                <div className="flex justify-center gap-4 mb-2">
                  <span className="font-pixel text-[10px] text-white">⚔️ ATK +{gachaResult.atk}</span>
                  <span className="font-pixel text-[10px] text-white">✨ {gachaResult.skills.length} Skills</span>
                </div>
                <div className="space-y-1">
                  {gachaResult.skills.map((skill: any, i: number) => (
                    <p key={i} className="font-pixel text-[9px] text-gray-300">
                      {skill.type === 'physical' ? '⚔️' : skill.type === 'magic' ? '✨' : skill.type === 'heal' ? '💚' : '🛡️'} {skill.name} — {skill.type === 'heal' ? `Heal ${Math.abs(skill.damage)}` : skill.type === 'buff' ? 'Buff' : `${skill.damage} DMG`}
                      {skill.mpCost > 0 && <span className="text-cyan-300"> ({skill.mpCost} MP)</span>}
                    </p>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => { addWeapon(gachaResult); equipWeapon(gachaResult); closeGacha(); if (soundEnabled) SoundSystem.play('menu_click') }}
                  className="flex-1 font-pixel text-xs bg-green-700 hover:bg-green-600 text-white py-2 px-3 rounded-lg border border-green-500 transition-colors"
                >
                  ⚔️ Equip
                </button>
                <button
                  onClick={() => { addWeapon(gachaResult); closeGacha(); if (soundEnabled) SoundSystem.play('menu_click') }}
                  className="flex-1 font-pixel text-xs bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg border border-gray-500 transition-colors"
                >
                  📦 Keep
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
