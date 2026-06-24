import React from 'react'

export type CardVariant = 'gold' | 'crystal' | 'rainbow'

export interface GachaBorderProps {
  variant?: CardVariant
  className?: string
  children: React.ReactNode
}

const GRADIENT_MAP: Record<CardVariant, { border: string; inner: string; glow: string }> = {
  gold: {
    border: 'from-yellow-600 via-amber-400 to-yellow-600',
    inner: 'shadow-[inset_0_0_15px_rgba(217,161,50,0.15)]',
    glow: 'drop-shadow-[0_0_8px_rgba(217,161,50,0.4)]',
  },
  crystal: {
    border: 'from-cyan-600 via-blue-400 to-cyan-600',
    inner: 'shadow-[inset_0_0_15px_rgba(59,130,246,0.15)]',
    glow: 'drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]',
  },
  rainbow: {
    border: 'from-purple-500 via-pink-400 to-blue-500',
    inner: 'shadow-[inset_0_0_15px_rgba(168,85,247,0.15)]',
    glow: 'drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]',
  },
}

export default function GachaBorder({ variant = 'gold', className = '', children }: GachaBorderProps) {
  const v = GRADIENT_MAP[variant]

  return (
    <div className={`relative ${v.glow} ${className}`}>
      {/* Outer glow ring */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-b ${v.border} opacity-60 blur-[2px] pointer-events-none`} />

      {/* SVG ornamental frame */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
      >
        {/* Top-left corner ornament */}
        <path d="M4 20 L4 8 Q4 4 8 4 L20 4" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-500" />
        <circle cx="4" cy="4" r="3" fill="currentColor" className="text-yellow-400" />
        {/* Top-right corner ornament */}
        <path d="M100%20-20 L100%20-8 Q100%20-4 -20 4" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-500" />

        {/* Bottom decorative diamonds */}
        <polygon points="4,100% 8,calc(100%-6) 12,100%" fill="currentColor" className="text-yellow-400" opacity="0.6" />
        <polygon points="calc(50%-4),100% 50%,calc(100%-8) calc(50%+4),100%" fill="currentColor" className="text-yellow-400" opacity="0.6" />
        <polygon points="calc(100%-12),100% calc(100%-8),calc(100%-6) calc(100%-4),100%" fill="currentColor" className="text-yellow-400" opacity="0.6" />
      </svg>

      {/* Border frame — gradient border trick */}
      <div className={`relative rounded-xl border-2 border-transparent bg-clip-padding`}
        style={{
          borderImage: `linear-gradient(135deg, #d9a132, #f5d478, #d9a132, #b8860b) 1`,
          borderWidth: '2px',
          borderStyle: 'solid',
        }}
      >
        {/* Inner content area */}
        <div className={`relative rounded-xl bg-slate-900/95 backdrop-blur-sm ${v.inner}`}>
          {children}
        </div>
      </div>

      {/* Corner rivet dots */}
      {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
        <div key={i} className={`absolute ${pos} w-2 h-2 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-[0_0_4px_rgba(217,161,50,0.6)]`} />
      ))}
    </div>
  )
}
