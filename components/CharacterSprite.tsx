'use client'
import React from 'react'

const SPRITE_MAP: Record<string, string> = {
  knight:   '/assets/chars/knight.svg',
  mage:     '/assets/chars/mage.svg',
  archer:   '/assets/chars/archer.svg',
  healer:   '/assets/chars/healer.svg',
  guardian: '/assets/chars/guardian.svg',
  rogue:    '/assets/chars/rogue.svg',
}

export default function CharacterSprite({
  type,
  size = 48,
  className = '',
}: {
  type: string
  size?: number
  className?: string
}) {
  const src = SPRITE_MAP[type] || SPRITE_MAP.knight

  return (
    <img
      src={src}
      alt={type}
      width={size}
      height={size}
      className={`pointer-events-none select-none ${className}`}
      style={{
        imageRendering: 'pixelated',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
      }}
    />
  )
}