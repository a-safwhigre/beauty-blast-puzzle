import { LevelConfig, TileColor } from '../types/game';

const ALL_COLORS: TileColor[] = ['pink', 'blue', 'yellow', 'green', 'purple'];

export const HANDCRAFTED_LEVELS: LevelConfig[] = [
  // Level 1: Basics - Tap groups of 2+
  {
    id: 1,
    name: "Level 1: Tap to Blast",
    description: "Tap any group of 2 or more matching cubes to clear them!",
    rows: 8,
    cols: 8,
    moves: 20,
    colors: ['pink', 'blue', 'yellow', 'green'],
    objectives: [
      { type: 'pink', target: 15, current: 0 },
      { type: 'blue', target: 15, current: 0 },
    ],
  },

  // Level 2: Rocket Creation (Match 5-6)
  {
    id: 2,
    name: "Level 2: Rocket Power",
    description: "Match 5 or 6 cubes to create a Rocket that clears a whole row or column!",
    rows: 8,
    cols: 8,
    moves: 22,
    colors: ['pink', 'blue', 'yellow', 'green'],
    objectives: [
      { type: 'yellow', target: 20, current: 0 },
      { type: 'green', target: 20, current: 0 },
    ],
    layout: [
      [null, null, null, 'RH', null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, 'RV', null, null, null],
    ]
  },

  // Level 3: Bomb Creation (Match 7-8)
  {
    id: 3,
    name: "Level 3: Bombastic Blasts",
    description: "Match 7 or 8 cubes to craft a Bomb! Bombs blow up a 3x3 radius.",
    rows: 8,
    cols: 8,
    moves: 22,
    colors: ALL_COLORS,
    objectives: [
      { type: 'purple', target: 20, current: 0 },
      { type: 'pink', target: 20, current: 0 },
    ],
    layout: [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, 'B', null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, 'B', null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ]
  },

  // Level 4: Introduction to Crates
  {
    id: 4,
    name: "Level 4: Cracking Crates",
    description: "Blast cubes next to wooden crates to smash them open!",
    rows: 8,
    cols: 8,
    moves: 20,
    colors: ['pink', 'blue', 'yellow', 'green'],
    objectives: [
      { type: 'crate', target: 8, current: 0 },
      { type: 'blue', target: 20, current: 0 },
    ],
    layout: [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ['C', 'C', 'C', 'C', 'C', 'C', 'C', 'C'],
      [null, null, null, null, null, null, null, null],
    ]
  },

  // Level 5: Booster Combos & Disco Balls (Match 9+)
  {
    id: 5,
    name: "Level 5: The Magic Mirror",
    description: "Match 9+ cubes to create a Magic Mirror (Disco Ball)! Try tapping adjacent boosters for crazy combos.",
    rows: 9,
    cols: 9,
    moves: 25,
    colors: ALL_COLORS,
    objectives: [
      { type: 'crate', target: 12, current: 0 },
      { type: 'yellow', target: 25, current: 0 },
    ],
    layout: [
      [null, null, null, null, null, null, null, null, null],
      [null, null, 'RH', 'RV', null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, 'C', 'C', 'C', 'DISCO', 'C', 'C', 'C', null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, 'B', 'B', null, null, null, null, null],
      [null, 'C', 'C', 'C', null, 'C', 'C', 'C', null],
      [null, null, null, null, null, null, null, null, null],
    ]
  },

  // Level 6: Drop-down Collectibles (Lipsticks)
  {
    id: 6,
    name: "Level 6: Lipstick Drops",
    description: "Clear cubes beneath the lipsticks so gravity carries them down to the bottom row!",
    rows: 8,
    cols: 8,
    moves: 22,
    colors: ALL_COLORS,
    objectives: [
      { type: 'drop_item', target: 2, current: 0 },
      { type: 'pink', target: 25, current: 0 },
    ],
    layout: [
      [null, 'D', null, null, null, 'D', null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, 'C', null, null, null, 'C', null, null],
      [null, null, null, null, null, null, null, null],
      [null, 'C', null, null, null, 'C', null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ]
  },

  // Level 7: Ice & Frost
  {
    id: 7,
    name: "Level 7: Frozen Beauty",
    description: "Cubes trapped in ice need to be blasted to shatter the frost!",
    rows: 8,
    cols: 8,
    moves: 22,
    colors: ALL_COLORS,
    objectives: [
      { type: 'ice', target: 12, current: 0 },
      { type: 'green', target: 25, current: 0 },
    ],
    layout: [
      [null, null, null, null, null, null, null, null],
      [null, 'I:pink', 'I:pink', null, null, 'I:blue', 'I:blue', null],
      [null, 'I:pink', 'I:pink', null, null, 'I:blue', 'I:blue', null],
      [null, null, null, 'RH', 'RV', null, null, null],
      [null, null, null, 'RV', 'RH', null, null, null],
      [null, 'I:green', 'I:green', null, null, 'I:yellow', 'I:yellow', null],
      [null, 'I:green', 'I:green', null, null, 'I:yellow', 'I:yellow', null],
      [null, null, null, null, null, null, null, null],
    ]
  },

  // Level 8: Reinforced 2-Hit Crates
  {
    id: 8,
    name: "Level 8: Reinforced Boxes",
    description: "Dark reinforced crates take 2 hits to break! Use bombs or rockets to smash through them.",
    rows: 9,
    cols: 9,
    moves: 26,
    colors: ALL_COLORS,
    objectives: [
      { type: 'crate', target: 16, current: 0 },
      { type: 'drop_item', target: 3, current: 0 },
    ],
    layout: [
      [null, 'D', null, null, 'D', null, null, 'D', null],
      [null, null, null, null, null, null, null, null, null],
      ['C2', 'C2', 'C2', null, null, null, 'C2', 'C2', 'C2'],
      [null, null, null, null, 'B', null, null, null, null],
      [null, null, null, 'C1', 'C2', 'C1', null, null, null],
      [null, null, null, null, 'B', null, null, null, null],
      ['C2', 'C2', 'C2', null, null, null, 'C2', 'C2', 'C2'],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
    ]
  },

  // Level 9: Hourglass Funnel
  {
    id: 9,
    name: "Level 9: The Hourglass Pass",
    description: "Navigate a narrow bottleneck board. Keep an eye on your remaining moves!",
    rows: 9,
    cols: 9,
    moves: 25,
    colors: ALL_COLORS,
    objectives: [
      { type: 'crate', target: 12, current: 0 },
      { type: 'ice', target: 8, current: 0 },
      { type: 'purple', target: 25, current: 0 },
    ],
    layout: [
      [null, null, null, null, null, null, null, null, null],
      ['.', null, null, null, null, null, null, null, '.'],
      ['.', '.', null, 'I:pink', null, 'I:blue', null, '.', '.'],
      ['.', '.', '.', 'C1', 'C2', 'C1', '.', '.', '.'],
      ['.', '.', '.', null, 'DISCO', null, '.', '.', '.'],
      ['.', '.', '.', 'C1', 'C2', 'C1', '.', '.', '.'],
      ['.', '.', null, 'I:yellow', null, 'I:green', null, '.', '.'],
      ['.', null, null, null, null, null, null, null, '.'],
      [null, null, null, null, null, null, null, null, null],
    ]
  },

  // Level 10: Master Blast (Hard Challenge)
  {
    id: 10,
    name: "Level 10: Master Makeover (HARD)",
    description: "A premier challenge combining 2-hit crates, ice barriers, and 4 precious drop items. Plan every move!",
    rows: 9,
    cols: 9,
    moves: 28,
    colors: ALL_COLORS,
    objectives: [
      { type: 'drop_item', target: 4, current: 0 },
      { type: 'crate', target: 18, current: 0 },
      { type: 'ice', target: 12, current: 0 },
    ],
    layout: [
      ['D', null, 'D', null, null, null, 'D', null, 'D'],
      ['I:pink', null, 'I:blue', null, 'RH', null, 'I:green', null, 'I:yellow'],
      ['C2', 'C1', 'C2', null, null, null, 'C2', 'C1', 'C2'],
      [null, null, null, 'C2', 'C2', 'C2', null, null, null],
      [null, 'B', null, 'C2', 'DISCO', 'C2', null, 'B', null],
      [null, null, null, 'C2', 'C2', 'C2', null, null, null],
      ['C2', 'C1', 'C2', null, null, null, 'C2', 'C1', 'C2'],
      ['I:yellow', null, 'I:green', null, 'RV', null, 'I:blue', null, 'I:pink'],
      [null, null, null, null, null, null, null, null, null],
    ]
  },

  // Levels 11 to 20: Progressive Challenges
  {
    id: 11,
    name: "Level 11: Twin Columns",
    description: "Two mirrored chambers separated by a column of crates.",
    rows: 9,
    cols: 9,
    moves: 24,
    colors: ALL_COLORS,
    objectives: [
      { type: 'crate', target: 9, current: 0 },
      { type: 'pink', target: 30, current: 0 },
      { type: 'blue', target: 30, current: 0 },
    ],
    layout: [
      [null, null, null, null, 'C1', null, null, null, null],
      [null, null, null, null, 'C2', null, null, null, null],
      [null, null, null, null, 'C2', null, null, null, null],
      [null, null, null, null, 'C2', null, null, null, null],
      [null, null, 'RH', null, 'DISCO', null, 'RH', null, null],
      [null, null, null, null, 'C2', null, null, null, null],
      [null, null, null, null, 'C2', null, null, null, null],
      [null, null, null, null, 'C2', null, null, null, null],
      [null, null, null, null, 'C1', null, null, null, null],
    ]
  },
  {
    id: 12,
    name: "Level 12: Diamond Rush",
    description: "Corner barriers guide cubes into a diamond frenzy.",
    rows: 9,
    cols: 9,
    moves: 25,
    colors: ALL_COLORS,
    objectives: [
      { type: 'drop_item', target: 3, current: 0 },
      { type: 'ice', target: 16, current: 0 },
    ],
    layout: [
      ['.', '.', 'D', null, 'D', null, 'D', '.', '.'],
      ['.', 'I:pink', 'I:pink', null, null, null, 'I:blue', 'I:blue', '.'],
      ['I:pink', 'I:pink', null, null, null, null, null, 'I:blue', 'I:blue'],
      [null, null, null, 'B', null, 'B', null, null, null],
      [null, null, null, null, 'DISCO', null, null, null, null],
      [null, null, null, 'B', null, 'B', null, null, null],
      ['I:yellow', 'I:yellow', null, null, null, null, null, 'I:green', 'I:green'],
      ['.', 'I:yellow', 'I:yellow', null, null, null, 'I:green', 'I:green', '.'],
      ['.', '.', null, null, null, null, null, '.', '.'],
    ]
  },
  {
    id: 13,
    name: "Level 13: Pyramid Peak",
    description: "Tiered obstacles create cascades of falling cubes.",
    rows: 9,
    cols: 9,
    moves: 24,
    colors: ALL_COLORS,
    objectives: [
      { type: 'crate', target: 15, current: 0 },
      { type: 'yellow', target: 35, current: 0 },
    ],
  },
  {
    id: 14,
    name: "Level 14: Perfume Garden",
    description: "Four drop collectibles nestled among sturdy crates.",
    rows: 9,
    cols: 9,
    moves: 26,
    colors: ALL_COLORS,
    objectives: [
      { type: 'drop_item', target: 4, current: 0 },
      { type: 'crate', target: 12, current: 0 },
      { type: 'green', target: 30, current: 0 },
    ],
  },
  {
    id: 15,
    name: "Level 15: Glamour Citadel",
    description: "A fortified wall of double crates protecting the heart of the board.",
    rows: 9,
    cols: 9,
    moves: 27,
    colors: ALL_COLORS,
    objectives: [
      { type: 'crate', target: 20, current: 0 },
      { type: 'ice', target: 14, current: 0 },
    ],
  },
  {
    id: 16,
    name: "Level 16: Cosmic Blast",
    description: "Unleash super combos across open terrain.",
    rows: 9,
    cols: 9,
    moves: 25,
    colors: ALL_COLORS,
    objectives: [
      { type: 'purple', target: 40, current: 0 },
      { type: 'pink', target: 40, current: 0 },
    ],
  },
  {
    id: 17,
    name: "Level 17: Ice Castle",
    description: "Thick sheets of frost coat the board.",
    rows: 9,
    cols: 9,
    moves: 26,
    colors: ALL_COLORS,
    objectives: [
      { type: 'ice', target: 24, current: 0 },
      { type: 'drop_item', target: 3, current: 0 },
    ],
  },
  {
    id: 18,
    name: "Level 18: The Fortress",
    description: "Overcome stacked multi-hit obstacles with strategic rocket lines.",
    rows: 9,
    cols: 9,
    moves: 28,
    colors: ALL_COLORS,
    objectives: [
      { type: 'crate', target: 22, current: 0 },
      { type: 'blue', target: 35, current: 0 },
    ],
  },
  {
    id: 19,
    name: "Level 19: Cascade Cascade",
    description: "High-paced falling drops requiring quick reactions.",
    rows: 9,
    cols: 9,
    moves: 26,
    colors: ALL_COLORS,
    objectives: [
      { type: 'drop_item', target: 5, current: 0 },
      { type: 'crate', target: 16, current: 0 },
    ],
  },
  {
    id: 20,
    name: "Level 20: Royal Coronation (Grand Finale)",
    description: "The ultimate Beauty Blast puzzle test! 5 drops, reinforced crates, and frozen columns.",
    rows: 9,
    cols: 9,
    moves: 30,
    colors: ALL_COLORS,
    objectives: [
      { type: 'drop_item', target: 5, current: 0 },
      { type: 'crate', target: 24, current: 0 },
      { type: 'ice', target: 16, current: 0 },
    ],
  }
];

// Procedural level generator for endless ad-free play
export function generateProceduralLevel(levelNum: number, difficulty: 'easy' | 'medium' | 'hard' | 'insane' = 'medium'): LevelConfig {
  const rows = 9;
  const cols = 9;
  const colorPool: TileColor[] = difficulty === 'easy' ? ['pink', 'blue', 'yellow', 'green'] : ALL_COLORS;

  let moves = 25;
  let crateCount = 10;
  let dropCount = 2;
  let iceCount = 8;

  if (difficulty === 'easy') {
    moves = 28;
    crateCount = 6;
    dropCount = 1;
    iceCount = 4;
  } else if (difficulty === 'hard') {
    moves = 24;
    crateCount = 16;
    dropCount = 3;
    iceCount = 12;
  } else if (difficulty === 'insane') {
    moves = 20;
    crateCount = 22;
    dropCount = 4;
    iceCount = 16;
  }

  // Generate layout
  const layout: (string | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));

  // Place drop items at row 0
  const dropCols = new Set<number>();
  while (dropCols.size < dropCount) {
    dropCols.add(Math.floor(Math.random() * (cols - 2)) + 1);
  }
  dropCols.forEach(c => {
    layout[0][c] = 'D';
  });

  // Place crates in middle-lower rows
  let placedCrates = 0;
  while (placedCrates < crateCount) {
    const r = Math.floor(Math.random() * (rows - 3)) + 2;
    const c = Math.floor(Math.random() * cols);
    if (!layout[r][c]) {
      layout[r][c] = difficulty === 'hard' || difficulty === 'insane' ? (Math.random() > 0.4 ? 'C2' : 'C1') : 'C1';
      placedCrates++;
    }
  }

  // Place ice on color cubes
  let placedIce = 0;
  while (placedIce < iceCount) {
    const r = Math.floor(Math.random() * (rows - 2)) + 1;
    const c = Math.floor(Math.random() * cols);
    if (!layout[r][c]) {
      const col = colorPool[Math.floor(Math.random() * colorPool.length)];
      layout[r][c] = `I:${col}`;
      placedIce++;
    }
  }

  // Pre-seed a friendly booster in easy/medium
  if (difficulty === 'easy' || difficulty === 'medium') {
    layout[4][4] = Math.random() > 0.5 ? 'B' : 'RH';
  }

  const objectives = [
    { type: 'crate' as const, target: crateCount, current: 0 },
    { type: 'drop_item' as const, target: dropCount, current: 0 },
    ...(placedIce > 0 ? [{ type: 'ice' as const, target: placedIce, current: 0 }] : []),
  ];

  return {
    id: levelNum,
    name: `Puzzle #${levelNum} (${difficulty.toUpperCase()})`,
    description: `Procedural ${difficulty} puzzle with ${crateCount} crates and ${dropCount} lipstick drops.`,
    rows,
    cols,
    moves,
    colors: colorPool,
    objectives,
    layout,
  };
}
