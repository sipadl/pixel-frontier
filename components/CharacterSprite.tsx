'use client'

/**
 * Inline SVG pixel-art RPG characters.
 * 16×16 grid scaled via viewBox → crisp at any size. No external deps.
 */

interface SpriteProps {
  size?: number
  className?: string
  type?: string
}

const P = {
  knight: {
    skin: '#f5c49c', hair: '#8b5e3c', armor: '#4a7ab5', armorHi: '#6ba3d6',
    armorLo: '#2d5a8a', sword: '#c0c0c0', swordHi: '#d4a017', eye: '#222', cape: '#c0392b',
  },
  mage: {
    skin: '#fdd9b5', hair: '#9b59b6', robe: '#6c3483', robeHi: '#8e44ad',
    robeLo: '#4a235a', staff: '#8b6914', orb: '#00ffff', eye: '#222', cape: '#2e86c1',
  },
  archer: {
    skin: '#f5c49c', hair: '#27ae60', tunic: '#27ae60', tunicHi: '#2ecc71',
    tunicLo: '#1e8449', bow: '#8b6914', eye: '#222', cape: '#145a32',
  },
  healer: {
    skin: '#fdd9b5', hair: '#f1c40f', robe: '#ecf0f1', robeHi: '#ffffff',
    robeLo: '#bdc3c7', staff: '#d4a017', orb: '#f1c40f', eye: '#222', cape: '#f39c12',
  },
  guardian: {
    skin: '#e8b88a', hair: '#922b21', armor: '#7d6608', armorHi: '#b7950b',
    armorLo: '#6e5b07', shield: '#b8860b', sword: '#a0a0a0', eye: '#222', cape: '#1a5276',
  },
  rogue: {
    skin: '#d4a574', hair: '#1a1a2e', tunic: '#2c3e50', tunicHi: '#34495e',
    tunicLo: '#1a252f', dagger: '#c0c0c0', daggerHi: '#922b21', eye: '#e74c3c', cape: '#1c2833',
  },
}
type Palette = typeof P.knight

function R({ x, y, w = 1, h = 1, fill }: { x: number; y: number; w?: number; h?: number; fill: string }) {
  return <rect x={x} y={y} width={w} height={h} fill={fill} />
}

function Knight({ c }: { c: Palette }) {
  return (<g>
    <R x={6} y={0} w={4} h={1} fill={c.armorLo} />
    <R x={5} y={1} w={6} h={1} fill={c.armor} />
    <R x={6} y={2} w={4} h={3} fill={c.skin} />
    <R x={5} y={2} w={1} h={3} fill={c.hair} />
    <R x={10} y={2} w={1} h={3} fill={c.hair} />
    <R x={7} y={3} w={1} h={1} fill={c.eye} />
    <R x={9} y={3} w={1} h={1} fill={c.eye} />
    <R x={5} y={5} w={6} h={4} fill={c.armor} />
    <R x={5} y={5} w={1} h={4} fill={c.armorLo} />
    <R x={10} y={5} w={1} h={4} fill={c.armorLo} />
    <R x={6} y={5} w={4} h={1} fill={c.armorHi} />
    <R x={4} y={5} w={1} h={5} fill={c.cape} />
    <R x={3} y={6} w={2} h={2} fill={c.armor} />
    <R x={11} y={6} w={2} h={1} fill={c.armor} />
    <R x={12} y={2} w={1} h={7} fill={c.swordHi} />
    <R x={6} y={9} w={2} h={3} fill={c.armorLo} />
    <R x={8} y={9} w={2} h={3} fill={c.armorLo} />
    <R x={5} y={12} w={3} h={1} fill="#333" />
    <R x={8} y={12} w={3} h={1} fill="#333" />
  </g>)
}

function Mage({ c }: { c: Palette }) {
  return (<g>
    <R x={7} y={0} w={2} h={1} fill={c.robeLo} />
    <R x={6} y={1} w={4} h={1} fill={c.robe} />
    <R x={6} y={2} w={4} h={3} fill={c.skin} />
    <R x={5} y={2} w={1} h={2} fill={c.hair} />
    <R x={10} y={2} w={1} h={2} fill={c.hair} />
    <R x={7} y={3} w={1} h={1} fill={c.eye} />
    <R x={9} y={3} w={1} h={1} fill={c.eye} />
    <R x={5} y={5} w={6} h={5} fill={c.robe} />
    <R x={5} y={5} w={1} h={5} fill={c.robeLo} />
    <R x={10} y={5} w={1} h={5} fill={c.robeLo} />
    <R x={7} y={5} w={2} h={1} fill={c.robeHi} />
    <R x={4} y={5} w={1} h={6} fill={c.cape} />
    <R x={12} y={2} w={1} h={9} fill={c.staff} />
    <R x={12} y={1} w={1} h={1} fill={c.orb} />
    <R x={5} y={10} w={6} h={1} fill={c.robeLo} />
    <R x={5} y={11} w={6} h={1} fill={c.robeLo} />
  </g>)
}

function Archer({ c }: { c: Palette }) {
  return (<g>
    <R x={6} y={0} w={4} h={1} fill={c.tunic} />
    <R x={5} y={1} w={6} h={1} fill={c.tunic} />
    <R x={6} y={2} w={4} h={3} fill={c.skin} />
    <R x={5} y={2} w={1} h={3} fill={c.hair} />
    <R x={10} y={2} w={1} h={2} fill={c.hair} />
    <R x={7} y={3} w={1} h={1} fill={c.eye} />
    <R x={9} y={3} w={1} h={1} fill={c.eye} />
    <R x={5} y={5} w={6} h={4} fill={c.tunic} />
    <R x={5} y={5} w={1} h={4} fill={c.tunicLo} />
    <R x={10} y={5} w={1} h={4} fill={c.tunicLo} />
    <R x={7} y={5} w={2} h={1} fill={c.tunicHi} />
    <R x={4} y={5} w={1} h={5} fill={c.cape} />
    <R x={12} y={2} w={1} h={7} fill={c.bow} />
    <R x={11} y={2} w={1} h={1} fill={c.bow} />
    <R x={11} y={8} w={1} h={1} fill={c.bow} />
    <R x={6} y={9} w={2} h={3} fill={c.tunicLo} />
    <R x={8} y={9} w={2} h={3} fill={c.tunicLo} />
    <R x={5} y={12} w={3} h={1} fill="#554433" />
    <R x={8} y={12} w={3} h={1} fill="#554433" />
  </g>)
}

function Healer({ c }: { c: Palette }) {
  return (<g>
    <R x={6} y={0} w={4} h={1} fill={c.hair} />
    <R x={5} y={1} w={6} h={1} fill={c.hair} />
    <R x={6} y={2} w={4} h={3} fill={c.skin} />
    <R x={5} y={3} w={1} h={2} fill={c.hair} />
    <R x={10} y={3} w={1} h={2} fill={c.hair} />
    <R x={7} y={3} w={1} h={1} fill={c.eye} />
    <R x={9} y={3} w={1} h={1} fill={c.eye} />
    <R x={5} y={5} w={6} h={5} fill={c.robe} />
    <R x={5} y={5} w={1} h={5} fill={c.robeLo} />
    <R x={10} y={5} w={1} h={5} fill={c.robeLo} />
    <R x={7} y={6} w={2} h={2} fill={c.orb} />
    <R x={8} y={5} w={1} h={1} fill={c.orb} />
    <R x={12} y={3} w={1} h={8} fill={c.staff} />
    <R x={12} y={1} w={1} h={2} fill={c.orb} />
    <R x={5} y={10} w={6} h={2} fill={c.robeLo} />
  </g>)
}

function Guardian({ c }: { c: Palette }) {
  return (<g>
    <R x={6} y={0} w={4} h={1} fill={c.armorLo} />
    <R x={5} y={1} w={6} h={2} fill={c.armor} />
    <R x={6} y={3} w={4} h={2} fill={c.skin} />
    <R x={7} y={3} w={1} h={1} fill={c.eye} />
    <R x={9} y={3} w={1} h={1} fill={c.eye} />
    <R x={4} y={5} w={8} h={4} fill={c.armor} />
    <R x={4} y={5} w={1} h={4} fill={c.armorLo} />
    <R x={11} y={5} w={1} h={4} fill={c.armorLo} />
    <R x={6} y={5} w={4} h={1} fill={c.armorHi} />
    <R x={3} y={5} w={2} h={5} fill={c.shield} />
    <R x={3} y={7} w={2} h={1} fill="#d4a017" />
    <R x={12} y={3} w={1} h={7} fill={c.sword} />
    <R x={12} y={2} w={1} h={1} fill="#fff" />
    <R x={12} y={5} w={1} h={5} fill={c.cape} />
    <R x={6} y={9} w={2} h={3} fill={c.armorLo} />
    <R x={8} y={9} w={2} h={3} fill={c.armorLo} />
    <R x={5} y={12} w={3} h={1} fill="#444" />
    <R x={8} y={12} w={3} h={1} fill="#444" />
  </g>)
}

function Rogue({ c }: { c: Palette }) {
  return (<g>
    <R x={6} y={0} w={4} h={1} fill={c.hair} />
    <R x={5} y={1} w={6} h={1} fill={c.hair} />
    <R x={6} y={2} w={4} h={3} fill={c.skin} />
    <R x={5} y={2} w={1} h={2} fill={c.hair} />
    <R x={10} y={2} w={1} h={2} fill={c.hair} />
    <R x={7} y={3} w={1} h={1} fill={c.eye} />
    <R x={9} y={3} w={1} h={1} fill={c.eye} />
    <R x={6} y={3} w={1} h={1} fill={c.tunicLo} />
    <R x={10} y={3} w={1} h={1} fill={c.tunicLo} />
    <R x={5} y={5} w={6} h={4} fill={c.tunic} />
    <R x={5} y={5} w={1} h={4} fill={c.tunicLo} />
    <R x={10} y={5} w={1} h={4} fill={c.tunicLo} />
    <R x={5} y={7} w={6} h={1} fill="#922b21" />
    <R x={4} y={5} w={1} h={6} fill={c.cape} />
    <R x={2} y={6} w={1} h={4} fill={c.dagger} />
    <R x={12} y={6} w={1} h={4} fill={c.dagger} />
    <R x={6} y={9} w={2} h={3} fill={c.tunicLo} />
    <R x={8} y={9} w={2} h={3} fill={c.tunicLo} />
    <R x={5} y={12} w={3} h={1} fill="#222" />
    <R x={8} y={12} w={3} h={1} fill="#222" />
  </g>)
}

const SPRITES: Record<string, React.FC<{ c: Palette }>> = {
  warrior: Knight, knight: Knight, mage, archer, cleric: Healer, healer: Healer, guardian, rogue,
}

export const CHARACTER_TYPES = ['knight', 'mage', 'archer', 'healer', 'guardian', 'rogue'] as const

export default function CharacterSprite({ type = 'knight', size = 96, className = '' }: SpriteProps) {
  const palette = P[type as keyof typeof P] || P.knight
  const SpriteFn = SPRITES[type] || Knight

  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg viewBox="0 0 16 16" width={size} height={size} style={{ imageRendering: 'pixelated' }} xmlns="http://www.w3.org/2000/svg">
        <SpriteFn c={palette} />
      </svg>
    </div>
  )
}
