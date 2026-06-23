'use client'
import React from 'react'

export interface PixelArtProps {
  data: number[][]
  palette: Record<number, string>
  pixelSize?: number
  className?: string
}

export default function PixelArt({ data, palette, pixelSize = 4, className = '' }: PixelArtProps) {
  const height = data.length
  const width = data[0]?.length || 0
  const viewSize = pixelSize
  const rects: React.ReactElement[] = []

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = data[y][x]
      if (color === 0 || !palette[color]) continue
      let w = 1
      while (x + w < width && data[y][x + w] === color) w++
      rects.push(
        <rect key={`${x}-${y}`} x={x * viewSize} y={y * viewSize} width={w * viewSize} height={viewSize} fill={palette[color]} />
      )
      x += w - 1
    }
  }

  return (
    <svg width={width * viewSize} height={height * viewSize} viewBox={`0 0 ${width * viewSize} ${height * viewSize}`}
      shapeRendering="crispEdges" className={className}
      style={{ imageRendering: 'pixelated', display: 'block', overflow: 'visible' }}>
      {rects}
    </svg>
  )
}

function encode(rows: string[], palette: Record<string, number>): number[][] {
  return rows.map(row => {
    const out: number[] = []
    for (const ch of row) out.push(palette[ch] ?? 0)
    return out
  })
}

const P: Record<string, number> = {
  '.': 0, 'o': 1, 'b': 2, 'y': 3, 's': 4, 'r': 5, 'S': 6, 'e': 7, 'w': 8, 'g': 9, 'G': 10, 'B': 11, 'p': 12, 'P': 13, 'k': 14, 'm': 15, 'd': 16, 't': 17, 'l': 18, 'L': 19,
  '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '0': 0,
  'a': 24, 'c': 25, 'f': 26, 'h': 27, 'n': 28, 'q': 29, 'u': 30, 'v': 31, 'x': 32, 'z': 33,
  'A': 34, 'C': 35, 'D': 36, 'E': 37, 'F': 38, 'H': 39, 'I': 40, 'J': 41, 'K': 42, 'M': 43,
  'N': 44, 'O': 45, 'Q': 46, 'R': 47, 'T': 48, 'U': 49, 'V': 50, 'W': 51, 'X': 52, 'Y': 53, 'Z': 54,
}

export const PALETTE_DEFAULT: Record<number, string> = {
  0: 'transparent',
  1: '#0f172a',  // dark outline
  2: '#3b82f6',  // blue
  3: '#fbbf24',  // yellow
  4: '#fde68a',  // skin light
  5: '#dc2626',  // red
  6: '#fed7aa',  // skin
  7: '#1e293b',  // dark eyes
  8: '#ffffff',  // white
  9: '#22c55e',  // green
  10: '#15803d', // dark green
  11: '#7c3aed', // purple
  12: '#ec4899', // pink
  13: '#a855f7', // violet
  14: '#525252', // grey
  15: '#92400e', // brown
  16: '#b91c1c', // dark red
  17: '#0e7490', // teal
  18: '#65a30d', // lime
  19: '#a3e635', // bright lime
  // Extended palette for 24x24 sprites
  24: '#f97316', // orange
  25: '#a8a29e', // light grey
  26: '#f59e0b', // amber
  27: '#d4d4d4', // light silver
  28: '#78716c', // warm grey
  29: '#166534', // forest green
  30: '#e11d48', // rose
  31: '#06b6d4', // cyan
  32: '#8b5cf6', // indigo
  33: '#292524', // dark brown
  34: '#fcd34d', // bright yellow
  35: '#67e8f9', // light cyan
  36: '#fb923c', // light orange
  37: '#fca5a5', // light red
  38: '#86efac', // light green
  39: '#fef08a', // light yellow
  40: '#818cf8', // light indigo
  41: '#fda4af', // light pink
  42: '#c084fc', // light purple
  43: '#6ee7b7', // mint
  44: '#a7f3d0', // emerald light
  45: '#fdba74', // peach
  46: '#5eead4', // teal light
  47: '#f87171', // coral
  48: '#34d399', // emerald
  49: '#fbbf24', // gold
  50: '#38bdf8', // sky blue
  51: '#818cf8', // periwinkle
  52: '#c4b5fd', // lavender
  53: '#fde047', // lemon
  54: '#d1d5db', // silver
}

// ===== HERO (chibi style, 20x20) =====
export const HERO_DOWN_1 = encode([
  '......1111......',
  '.....133331.....',
  '....13344431....',
  '...1333444331...',
  '...1344664431...',
  '...1344664431...',
  '...1333333331...',
  '....15555551....',
  '...15222251.....',
  '..1522222251....',
  '..1522222251....',
  '..1521222151....',
  '..1521222151....',
  '..1121111121....',
  '...111..111.....',
  '...11....11.....',
], P)

export const HERO_DOWN_2 = encode([
  '......1111......',
  '.....133331.....',
  '....13344431....',
  '...1333444331...',
  '...1344664431...',
  '...1344664431...',
  '...1333333331...',
  '....15555551....',
  '...15222251.....',
  '..1522222251....',
  '..1522222251....',
  '..1521122151....',
  '..1521122151....',
  '..1121111121....',
  '...111..111.....',
  '..1......1......',
], P)

// ===== 24x24 MONSTER SPRITES (BF-style, detailed chibi) =====

export const SPRITE_GREEN_SLIME = encode([
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........111111..........',
  '......119999911.........',
  '.....1999999991.........',
  '....19998e998991........',
  '....199999999991........',
  '...1999999999991........',
  '...1999999999991........',
  '...1999999999991........',
  '...1999999999991........',
  '....19999999991.........',
  '.....199999991..........',
  '......19999911..........',
  '.......19991............',
  '........111.............',
  '........................',
], P)

export const SPRITE_ANGRY_CHICK = encode([
  '........................',
  '........................',
  '..........11............',
  '.........1331...........',
  '........133331..........',
  '.......13333331.........',
  '......1333333331........',
  '......1337e73e31........',
  '......1333333331........',
  '.......133353331........',
  '........13333331........',
  '........13555331........',
  '.......1135553311.......',
  '......111355533111......',
  '.....1..1133311..1......',
  '....1....11111...1......',
  '...1......11.....1.....',
  '.......................',
], P)

export const SPRITE_MUSHROOM = encode([
  '........................',
  '........................',
  '........................',
  '........111111..........',
  '......11rrrrrrr11.......',
  '.....1rrrrrrrrrrr1......',
  '....1rrw88rrw88rr1.....',
  '....1rrw88rrw88rr1.....',
  '....1rrrrrrrrrrr1......',
  '.....1rrrr11rrrr1.......',
  '......1111..1111........',
  '.......18888881.........',
  '......1888888881........',
  '......1888888881........',
  '......1188888111........',
  '.......1188811..........',
  '.......11....11.........',
  '........................',
], P)

export const SPRITE_DARK_WOLF = encode([
  '........................',
  '....11.........11......',
  '...1111.......1111.....',
  '..111111111111111......',
  '..1eeeeeeeeeeeeee1.....',
  '..1e7eeeee7eeee7e1.....',
  '..1eeeeeeeeeeeeee1.....',
  '..188888888888881......',
  '..188888888888881......',
  '..188881118881181......',
  '...18881111888111......',
  '...1111.1111.1111......',
  '....11...11...11.......',
  '....11...11...11.......',
  '...1.1...11..1.1.......',
  '........................',
], P)

export const SPRITE_VINE_CRAWLER = encode([
  '........................',
  '........................',
  '........................',
  '..1gggggggggggg1.......',
  '.1gGGGGGGGGGGGG1.......',
  '.1gGwwGwwGwwGGg1.......',
  '..1gGGGGGGGGGg1........',
  '...1ggggggggg1.........',
  '..1gggGggGGggg1........',
  '.1gGGGGGGGGGGGg1.......',
  '1gGGGGGGGGGGGGGg1......',
  '1gGGGGGGGGGGGGGg1......',
  '1gGGGGGGGGGGGGGg1......',
  '.1ggggggggggggg1.......',
  '..1ggggggggggg1........',
  '...111....111..........',
  '....11....11...........',
  '........................',
], P)

export const SPRITE_FOREST_SPIRIT = encode([
  '........................',
  '........111111..........',
  '......1188888811........',
  '.....18eeeeeeee81.......',
  '....18e7eeeeee7e81......',
  '....8eeeeeeeeeeee81.....',
  '...8eeee8888eeeeee81....',
  '...8eee888888eeee81.....',
  '...8eeeeeeeeeeee81......',
  '...8eeee8ee8eeee81......',
  '....8eeeeeeeeee81.......',
  '....888eee8ee8881.......',
  '....88.8ee8ee.881.......',
  '....88.888.88.88........',
  '.....11.111.11.1........',
  '........................',
], P)

export const SPRITE_CAVE_BAT = encode([
  '........................',
  '....11..........11.....',
  '...1ww1........1ww1....',
  '..1wwww11111111ww1.....',
  '..1wwwwwwwwwwwwww1.....',
  '..1www7wwwwww7www1.....',
  '..1wwwwwewwwwewww1.....',
  '...1wwwwwwwwwwww1......',
  '...1eeeeeeeeeee1.......',
  '...1rrrrrrrrrrr1.......',
  '....1rrrrrrrrrr1.......',
  '.....1rrrrrrrr1........',
  '......11rrrr11.........',
  '.......11..11..........',
  '......11....11.........',
  '........................',
], P)

export const SPRITE_ROCK_GOLEM = encode([
  '.......1111111111......',
  '......1kkkkkkkkk1......',
  '.....1kkkkkkkkkkk1.....',
  '....1kkkkk7kk7kkk1.....',
  '....1kkkkkkkkkkkkk1....',
  '...1kkkkkkkkkkkkkk1....',
  '...1kkkkkkkkkkkkkk1....',
  '...1kkkkkkkkkkkkkk1....',
  '...1kkkkkkkkkkkkkk1....',
  '....1kkkkkkkkkkk1......',
  '....1kkkkkkkkkkk1......',
  '....1kkkkkkkkkkk1......',
  '.....1kkkkkkkkk1.......',
  '.....1kkkkkkkkk1.......',
  '......1kkkkkkk1........',
  '.......1111111.........',
], P)

export const SPRITE_SHADOW_SERPENT = encode([
  '........................',
  '........................',
  '........11111111111.....',
  '.......1GGGGGGGGGG1....',
  '......1GGGwwGGGwwGG1...',
  '.....1GGGw7GGG7wGGG1...',
  '.....1GGGwwGGGwwGGG1...',
  '......1GGGGGGGGGGG1....',
  '......1GGGGGGGGGGG1....',
  '......1GGG11111111.....',
  '......1GGG1............',
  '......1GGG1............',
  '......1GGG1............',
  '......1GGG1............',
  '......11111............',
  '........................',
], P)

export const SPRITE_SHADOW_LORD = encode([
  '.......11111111.........',
  '......1888888881........',
  '.....18ppppppppp81......',
  '....18ppeepeepppp1.....',
  '...18pppepepeppppp1....',
  '...18ppppppppppppp1....',
  '...18pprrrppprrpp1.....',
  '...18ppppppppppppp1....',
  '....18pppppppppp81......',
  '.....18111811111........',
  '....18111PPP11111.......',
  '....18111PPPPP11........',
  '.....1811PPPPP1.........',
  '......111PPP1...........',
  '.......111P1............',
  '........111.............',
], P)

export const SPRITE_CAVE_KING = encode([
  '.......1111111111.......',
  '......1rrrrrrrrrr1......',
  '.....1rrrrrrrrrrrr1.....',
  '....1rrr5rrr5rrr1.......',
  '...1rrrrrrrrrrrrrr1....',
  '...1rrr7rrrrr7rrrr1....',
  '...1rrrrrrrrrrrrr1......',
  '...1rrrrrrrrrrrrr1......',
  '....1rrrrrrrrrrr1.......',
  '....1rrrr111rrrr1.......',
  '.....1GGrrrrrrrG1.......',
  '.....1GGrrrrrrrG1.......',
  '......1GGGGGGG1.........',
  '......11....11..........',
  '.....1......1...........',
  '........................',
], P)

export const SPRITE_GOBLIN_KING = encode([
  '........................',
  '.......1111111..........',
  '......1yyyyyyy1.........',
  '.....1yyy5yy5yyy1.......',
  '....1yyy7yyy7yyy1.......',
  '....1yyyyyyyyyyyyy1.....',
  '...1yy1yyyyyyyyy1yy1....',
  '...1yyyyyyyyyyyyyyy1....',
  '...1yyyyyyyyyyyyyyy1....',
  '....1yyyyyyyyyyyyy1.....',
  '.....1ggggggggg1........',
  '.....1GGggggGGGg1.......',
  '......1GGGGGGG1.........',
  '......1GGGGGGG1.........',
  '......11..11..11........',
  '........................',
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
  'GgggggggggggGGgGgggggggGgggggGGG',
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
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKkKkKkKkKkKkKkKkKkKkKkKkKkKkKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKkKkKkKkKkKkKkKkKkKkKkKkKkKkKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKkKkKkKkKkKkKkKkKkKkKkKkKkKkKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKkKkKkKkKkKkKkKkKkKkKkKkKkKkKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
], P)

export const TILE_STONE_1 = encode([
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kKkkkkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKkKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kKkKkkkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKkKkKKKKKKKKKKKKKKKKKKKKKKKk',
  'kKkKkKkkkkkkkkkkkkkkkkkkkkkkKk',
  'kKkKkKkKKKKKKKKKKKKKKKKKKKKk',
  'kKkKkKkKkkkkkkkkkkkkkkkkkkkKk',
  'kKkKkKkKkKKKKKKKKKKKKKKKKKKK',
  'kKkKkKkKkKkkkkkkkkkkkkkkkkkKk',
  'kKkKkKkKkKkKKKKKKKKKKKKKKKKk',
  'kKkKkKkKkKkKkkkkkkkkkkkkkkkKk',
  'kKkKkKkKkKkKkKKKKKKKKKKKKKKk',
  'kKkKkKkKkKkKkKkkkkkkkkkkkkkKk',
  'kKkKkKkKkKkKkKkKKKKKKKKKKKKk',
  'kKkKkKkKkKkKkKkKkkkkkkkkkkkKk',
  'kKkKkKkKkKkKkKkKkKKKKKKKKKKk',
  'kKkKkKkKkKkKkKkKkKkkkkkkkkkKk',
  'kKkKkKkKkKkKkKkKkKkKKKKKKKKk',
  'kKkKkKkKkKkKkKkKkKkKkkkkkkkKk',
  'kKkKkKkKkKkKkKkKkKkKkKKKKKKk',
  'kKkKkKkKkKkKkKkKkKkKkKkkkkkKk',
  'kKkKkKkKkKkKkKkKkKkKkKkKKKKk',
  'kKkKkKkKkKkKkKkKkKkKkKkKkkkKk',
  'kKkKkKkKkKkKkKkKkKkKkKkKkKKKk',
  'kKkKkKkKkKkKkKkKkKkKkKkKkKkkk',
  'kKkKkKkKkKkKkKkKkKkKkKkKkKkKK',
  'kKkKkKkKkKkKkKkKkKkKkKkKkKkKk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kKKKKKKKKKKKKKKKKKKKKKKKKKKKk',
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
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
