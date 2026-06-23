'use client'
import React from 'react'

// ===== PIXEL ART RENDERER =====
// Takes a 2D array of color codes (0 = transparent) and renders as SVG
// Example: [[0,1,1,1,0], [1,2,2,2,1], ...]
// Use palette: { 0: 'transparent', 1: '#ff0000', 2: '#00ff00', ... }

export interface PixelArtProps {
  data: number[][]
  palette: Record<number, string>
  pixelSize?: number
  className?: string
  animated?: boolean
}

export default function PixelArt({ data, palette, pixelSize = 4, className = '', animated = false }: PixelArtProps) {
  const height = data.length
  const width = data[0]?.length || 0
  const viewSize = pixelSize

  // Build merged SVG (one rect per color region for performance)
  const rects: React.ReactElement[] = []

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = data[y][x]
      if (color === 0 || !palette[color]) continue

      // Check if next pixel same color → merge horizontally
      let w = 1
      while (x + w < width && data[y][x + w] === color) w++

      rects.push(
        <rect
          key={`${x}-${y}`}
          x={x * viewSize}
          y={y * viewSize}
          width={w * viewSize}
          height={viewSize}
          fill={palette[color]}
        />
      )

      x += w - 1
    }
  }

  return (
    <svg
      width={width * viewSize}
      height={height * viewSize}
      viewBox={`0 0 ${width * viewSize} ${height * viewSize}`}
      shapeRendering="crispEdges"
      className={className}
      style={{ imageRendering: 'pixelated', display: 'block', overflow: 'visible' }}
    >
      {rects}
    </svg>
  )
}

// ===== SPRITE FACTORY =====
// Helper to create pixel art data quickly
export function makeSprite(rows: string[], colorMap: Record<string, number>): { data: number[][]; palette: Record<number, string> } {
  const data = rows.map(row => row.split('').map(ch => colorMap[ch] ?? 0))
  return { data, palette: PALETTE_DEFAULT }
}

// Hero facing down (idle + walk frames) - using HERO_DOWN_1/HERO_DOWN_2 below


function encode(rows: string[], palette: Record<string, number>): number[][] {
  return rows.map(row => {
    const out: number[] = []
    for (const ch of row) out.push(palette[ch] ?? 0)
    return out
  })
}

const P: Record<string, number> = {
  '.': 0, 'o': 1, 'b': 2, 'y': 3, 's': 4, 'r': 5, 'S': 6, 'e': 7, 'w': 8, 'g': 9, 'G': 10, 'B': 11, 'p': 12, 'P': 13, 'k': 14, 'm': 15, 'd': 16, 't': 17, 'l': 18, 'L': 19, 'o2': 20, 'o3': 21, 'o4': 22, 's2': 23,
  // digit aliases (so sprites can use '1' for dark outline etc.)
  '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '0': 0,
}

const PALETTE_DEFAULT: Record<number, string> = {
  0: 'transparent',
  1: '#0f172a', // dark outline
  2: '#3b82f6', // blue
  3: '#fbbf24', // yellow
  4: '#fde68a', // skin
  5: '#dc2626', // red
  6: '#fed7aa', // skin shadow
  7: '#1e293b', // eyes
  8: '#ffffff', // white
  9: '#22c55e', // green
  10: '#15803d', // dark green
  11: '#7c3aed', // purple
  12: '#ec4899', // pink
  13: '#a855f7', // violet
  14: '#525252', // dark grey
  15: '#92400e', // brown
  16: '#b91c1c', // dark red
  17: '#0e7490', // cyan dark
  18: '#65a30d', // lime
  19: '#a3e635', // bright lime
  20: '#7f1d1d', // blood
  21: '#991b1b', // darker red
  22: '#450a0a', // very dark red
  23: '#fcd34d', // light yellow
}

// ===== HERO =====
export const HERO_DOWN_1 = encode([
  '....11111111....',
  '...133333331....',
  '..13333433431...',
  '.1333446644331..',
  '.1344666644331..',
  '.1344664466431..',
  '.1344444444431..',
  '..15555555551...',
  '.1222222222221..',
  '12221222221221..',
  '12221222221221..',
  '12211222221221..',
  '12211222211221..',
  '.111111111111...',
  '..11......11....',
  '..1........1....',
], P)

export const HERO_DOWN_2 = encode([
  '....11111111....',
  '...133333331....',
  '..13333433431...',
  '.1333446644331..',
  '.1344666644331..',
  '.1344664466431..',
  '.1344444444431..',
  '..15555555551...',
  '.1222222222221..',
  '12221222221221..',
  '12221222221221..',
  '12211222211221..',
  '12211222221221..',
  '.111111111111...',
  '..11.....11.....',
  '..1......1......',
], P)

// ===== MONSTER SPRITES (16x16) =====
export const SPRITE_GREEN_SLIME = encode([
  '................',
  '................',
  '................',
  '................',
  '....11111111....',
  '..11888881181...',
  '.118eee88818ee..',
  '.18ee7e8888eee1.',
  '.18eee88888eee1.',
  '.18888888888881.',
  '.18888888888881.',
  '.18888888888881.',
  '..188888888881..',
  '...1111111111...',
  '................',
  '................',
], P)

export const SPRITE_ANGRY_CHICK = encode([
  '................',
  '................',
  '....11111111....',
  '...1yyyyyyyy1...',
  '..1yyyyyyyyyy1..',
  '..1yy5y55y5yy1..',
  '..1yyyy1y1yyy1..',
  '..1yyyy1y1yyy1..',
  '..1yyyyy11yyy1..',
  '..1yyyyyyyyyy1..',
  '...1yyyyyyyy1...',
  '....11111111....',
  '....11....11....',
  '...1.1....1.1...',
  '................',
  '................',
], P)

export const SPRITE_MUSHROOM = encode([
  '................',
  '....1111111111..',
  '...1rrrrrrrrrr1.',
  '..1rrwwrwwwwrrr1',
  '.1rrrwwrwwwwrrrr',
  '.1rrrrrrrrrrrrr1',
  '.1rrrrr1111rrrr1',
  '.1rrrr1....1rrr1',
  '..111.1..1.111..',
  '....1111111.....',
  '....1888881.....',
  '...188888881....',
  '...188888881....',
  '...1.11111.1....',
  '..1..1...1..1...',
  '................',
], P)

export const SPRITE_DARK_WOLF = encode([
  '................',
  '....11.....11...',
  '...1111...1111..',
  '..1111111111111.',
  '..1eeeeeeeeeee1.',
  '..1e7eeeeee7ee1.',
  '..1eeeeeeeeeee1.',
  '..1888888888881.',
  '..1888888888881.',
  '..1888811888811.',
  '...188881188881.',
  '...1111...1111..',
  '....11.....11...',
  '....11.....11...',
  '...1.1.....1.1..',
  '................',
], P)

export const SPRITE_VINE_CRAWLER = encode([
  '................',
  '................',
  '..1gggggggg1....',
  '.1gGGGGGGGG1....',
  '.1gGwwGwwGg1....',
  '..1gGGGGGG1.....',
  '...1gggggg1.....',
  '..1gggggggg1....',
  '.1gGgggGGgGg1...',
  '1gGGGGGGGGGGg1..',
  '1gGGGGGGGGGGg1..',
  '1gGGGGGGGGGGg1..',
  '.1gggggggggg1...',
  '..1gggggggg1....',
  '...11....11.....',
  '................',
], P)

export const SPRITE_FOREST_SPIRIT = encode([
  '................',
  '....88888888....',
  '...8eeeeeeee8...',
  '..8ee7eeee7ee8..',
  '..8eeeeeeeeee8..',
  '..8eeee88eeee8..',
  '..8eeee88eeee8..',
  '..8eeeeeeeeee8..',
  '..8eee8ee8eee8..',
  '..8eeeeeeeeee8..',
  '...8eeeeeeee8...',
  '...88eee8ee88...',
  '...88.ee8ee88...',
  '...88.888.88....',
  '...88.888.88....',
  '...11.111.11....',
], P)

export const SPRITE_CAVE_BAT = encode([
  '................',
  '...11.......11..',
  '..1ww11....11w1.',
  '.1wwww111111ww1.',
  '.1wwwwwwwwwwww1.',
  '.1www7wwww7www1.',
  '.1wwwewwwwewww1.',
  '..1wwwwwwwwww1..',
  '...1eeeeeeee1...',
  '...1rrrrrrrr1...',
  '....1rrrrrr1....',
  '.....1rrrr1.....',
  '......1111......',
  '.....11..11.....',
  '....1......1....',
  '................',
], P)

export const SPRITE_ROCK_GOLEM = encode([
  '....1111111111..',
  '...1kkkkkkkkk1..',
  '..1kkkkkkkkkkk1.',
  '..1kkkk7kkk7kk1.',
  '..1kkkkkkkkkkk1.',
  '..1kkkkkkkkkkk1.',
  '..1kkkkkkkkkkk1.',
  '..1kkkkkkkkkkk1.',
  '...1kkkkkkkkk1..',
  '...1kkkkkkkkk1..',
  '...1kkkkkkkkk1..',
  '...1kkkkkkkkk1..',
  '....1kkkkkkk1...',
  '.....1kkkkk1....',
  '......1kk1......',
  '.......11.......',
], P)

export const SPRITE_SHADOW_SERPENT = encode([
  '................',
  '................',
  '....11111111111.',
  '...1GGGGGGGGGG1.',
  '..1GGGwwGGGwwGG1',
  '.1GGGw7GGG7wGGG1',
  '.1GGGwwGGGwwGGG1',
  '..1GGGGGGGGGGG1.',
  '..1GGGGGGGGGGG1.',
  '..1GGG11111111..',
  '..1GGG1.........',
  '..1GGG1.........',
  '..1GGG1.........',
  '..1GGG1.........',
  '..11111.........',
  '................',
], P)

export const SPRITE_GOBLIN_KING = encode([
  '................',
  '....1111111.....',
  '...1yyyyyyy1....',
  '..1yyy5yy5yy1...',
  '.1yyy7yyy7yyy1..',
  '.1yyyyyyyyyyyy1.',
  '.1yy1yyyyyy1yy1.',
  '.1yy1yyyyyy1yy1.',
  '.1yyyyyyyyyyyyy1',
  '..1yyyyyyyyyyy1.',
  '...1ggggggggg1..',
  '...1GGgggGGGg1..',
  '....1GGGGGGG1...',
  '....1GGGGGGG1...',
  '....11..11..11..',
  '................',
], P)

export const SPRITE_SHADOW_LORD = encode([
  '................',
  '....88888888....',
  '...8pppppppp8...',
  '..8ppeepeeppp8..',
  '..8ppppepepppp8.',
  '..8ppppppppppp8.',
  '..8pprrrppprrp8.',
  '..8ppppppppppp8.',
  '...8ppppppppp8..',
  '....811181111...',
  '...8111PPP1111..',
  '...8111PPPPP1...',
  '....811PPPPP1...',
  '.....111PPP1....',
  '......111P1.....',
  '.......111......',
], P)

export const SPRITE_CAVE_KING = encode([
  '....1111111111..',
  '...1rrrrrrrrr1..',
  '..1rrrrrrrrrr1..',
  '..1rr5rrr5rrr1..',
  '.1rrrrrrrrrrrr1.',
  '.1rrr7rrrrr7rr1.',
  '.1rrrrrrrrrrrr1.',
  '.1rrrrrrrrrrrr1.',
  '..1rrrrrrrrrr1..',
  '..1rrrr111rrr1..',
  '...1GGrrrrrG1...',
  '...1GGrrrrrG1...',
  '....1GGGGG1.....',
  '....11...11.....',
  '...1......1.....',
  '................',
], P)

// ===== TILE SPRITES (32x32) =====
export const TILE_GRASS_1 = encode([
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GgggggggggGGgGgggggggggggggGGgg',
  'GggggggGGgGgggGGgGgggGggggggggg',
  'GgGgggggggggggggGGgggggggggGGGG',
  'GgggggggGgggGggggggggggGggggGGG',
  'GgggggGGgggGGgGgggggggGgggggGGG',
  'GgggggggggggggggGGgGgggggGggggG',
  'GGgggggGGggggggggggggGgggggggGG',
  'GgggggGGgggGGgggGgggggggGgggggG',
  'GgggggggggggggggGGgGgggggggGggG',
  'GgggGGgggGgggggggggggGGgGgggggG',
  'GgggggggggGGgGggggggggggggggGgG',
  'GggggggGGgggGGgGgggggggGggggggG',
  'GgggggggggggggggGgggGGgggGggGgG',
  'GggGGgggGggggGggggggggggggggggG',
  'GggggggggggGGgGgggggggGgggggGGG',
  'GGgggggggGgggGggggggggggggggGGG',
  'GgggggGGgGgggGGgGgggggggGgggggG',
  'GgggggggggggggggGGggggggggGgggG',
  'GgGgggggGGggggggggggggggggggGGG',
  'GgggggggGggggGgggggGGgggggggGGG',
  'GggggggggggggGGgGgggggggggggGGG',
  'GggGGgGgggggggggggggGGgggGggGGG',
  'GgggggggggGGgGggggggggggggggggG',
  'GggggggGGgggGGgGgggggGggggggggG',
  'GgggggggggggggggGGgGgggggGgggGG',
  'GggggGGgggggggggggGgggggggggggG',
  'GgggggggGGgggGGgggGgggGgggggggG',
  'GgggggggggggggggGGgGgggggggGggG',
  'GgGGgggGggggGgggggggggggggGGGGG',
  'GggggggggggGGgGgggggggGgggggGGgG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
], P)

export const TILE_DIRT_1 = encode([
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKkKkKkKkKkKkKkKkKkKkKkKkKkKkKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKkKkKkKkKkKkKkKkKkKkKkKkKkKkKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKkKkKkKkKkKkKkKkKkKkKkKkKkKkKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKkKkKkKkKkKkKkKkKkKkKkKkKkKkKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
], P)

export const TILE_STONE_1 = encode([
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKkKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kKkKkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKkKkKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kKkKkKkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKkKkKkKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kKkKkKkKkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKkKkKkKkKKKKKKKKKKKKKKKKKKKKKKk',
  'kKkKkKkKkKkkkkkkkkkkkkkkkkkkkkKk',
  'kKkKkKkKkKkKKKKKKKKKKKKKKKKKKKKk',
  'kKkKkKkKkKkKkkkkkkkkkkkkkkkkkkKk',
  'kKkKkKkKkKkKkKKKKKKKKKKKKKKKKKKk',
  'kKkKkKkKkKkKkKkkkkkkkkkkkkkkkkKk',
  'kKkKkKkKkKkKkKkKKKKKKKKKKKKKKKKk',
  'kKkKkKkKkKkKkKkKkkkkkkkkkkkkkkKk',
  'kKkKkKkKkKkKkKkKkKKKKKKKKKKKKKKk',
  'kKkKkKkKkKkKkKkKkKkkkkkkkkkkkkKk',
  'kKkKkKkKkKkKkKkKkKkKKKKKKKKKKKKk',
  'kKkKkKkKkKkKkKkKkKkKkkkkkkkkkkKk',
  'kKkKkKkKkKkKkKkKkKkKkKKKKKKKKKKk',
  'kKkKkKkKkKkKkKkKkKkKkKkkkkkkkkKk',
  'kKkKkKkKkKkKkKkKkKkKkKkKKKKKKKKk',
  'kKkKkKkKkKkKkKkKkKkKkKkKkkkkkkKk',
  'kKkKkKkKkKkKkKkKkKkKkKkKkKKKKKKk',
  'kKkKkKkKkKkKkKkKkKkKkKkKkKkkkkKk',
  'kKkKkKkKkKkKkKkKkKkKkKkKkKkKKKKk',
  'kKkKkKkKkKkKkKkKkKkKkKkKkKkKkkkKk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
], P)

// Map sprites to monsters
export const MONSTER_SPRITES: Record<string, number[][]> = {
  'Green Slime': SPRITE_GREEN_SLIME,
  'Angry Chick': SPRITE_ANGRY_CHICK,
  'Mushroom': SPRITE_MUSHROOM,
  'Dark Wolf': SPRITE_DARK_WOLF,
  'Vine Crawler': SPRITE_VINE_CRAWLER,
  'Forest Spirit': SPRITE_FOREST_SPIRIT,
  'Cave Bat': SPRITE_CAVE_BAT,
  'Rock Golem': SPRITE_ROCK_GOLEM,
  'Shadow Serpent': SPRITE_SHADOW_SERPENT,
  'Goblin King': SPRITE_GOBLIN_KING,
  'Shadow Lord': SPRITE_SHADOW_LORD,
  'Cave King': SPRITE_CAVE_KING,
}

export { PALETTE_DEFAULT, P }