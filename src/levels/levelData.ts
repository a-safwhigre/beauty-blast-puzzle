import { LevelConfig, TileColor } from '../types/game';

const COLORS_4: TileColor[] = ['red', 'yellow', 'blue', 'green'];
const ALL_COLORS: TileColor[] = ['red', 'yellow', 'blue', 'green', 'cyan'];

export const HANDCRAFTED_LEVELS: LevelConfig[] = [
  // Level 1: Exact recreation from Walkthrough Video (0:55)
  // 6 columns x 7 rows, 30 moves, 24 Pink Armchairs filling the bottom 4 rows!
  {
    id: 1,
    name: "Level 1: Clear the Sofas",
    description: "Tap the cubes next to the pink armchairs to eliminate them!",
    rows: 7,
    cols: 6,
    moves: 30,
    colors: ['red', 'yellow', 'blue'],
    objectives: [
      { type: 'armchair', target: 24, current: 0 },
    ],
    layout: [
      ['red', 'yellow', 'yellow', 'red', 'yellow', 'blue'],
      ['blue', 'yellow', 'blue', 'blue', 'yellow', 'red'],
      ['blue', 'red', 'red', 'red', 'yellow', 'blue'],
      ['A', 'A', 'A', 'A', 'A', 'A'],
      ['A', 'A', 'A', 'A', 'A', 'A'],
      ['A', 'A', 'A', 'A', 'A', 'A'],
      ['A', 'A', 'A', 'A', 'A', 'A'],
    ]
  },

  // Level 2: Firecracker Intro
  // 7x7 board, 16 Armchairs on the bottom 2 rows + Pre-placed Firecracker
  {
    id: 2,
    name: "Level 2: Firecracker Blasts",
    description: "Match 5+ cubes to craft a Firecracker that blasts across an entire row or column!",
    rows: 7,
    cols: 7,
    moves: 28,
    colors: COLORS_4,
    objectives: [
      { type: 'armchair', target: 14, current: 0 },
      { type: 'red', target: 15, current: 0 },
    ],
    layout: [
      [null, null, null, null, null, null, null],
      [null, null, 'FH', null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, 'FV', null, null],
      [null, null, null, null, null, null, null],
      ['A', 'A', 'A', 'A', 'A', 'A', 'A'],
      ['A', 'A', 'A', 'A', 'A', 'A', 'A'],
    ]
  },

  // Level 3: Exact recreation from Walkthrough Video (1:20 / lvl_08.jpg)
  // 8x8 board, 9 Armchairs arranged in bottom-left corner steps + Pre-placed Bomb
  {
    id: 3,
    name: "Level 3: Bombastic Boom",
    description: "Match 7+ cubes to build a Bomb! Detonates in a huge 3x3 explosion.",
    rows: 8,
    cols: 8,
    moves: 28,
    colors: COLORS_4,
    objectives: [
      { type: 'armchair', target: 9, current: 0 },
      { type: 'yellow', target: 20, current: 0 },
    ],
    layout: [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ['A', null, null, 'B', null, null, null, null],
      ['A', 'A', null, null, null, null, null, null],
      ['A', 'A', 'A', 'A', 'A', 'A', null, null],
    ]
  },

  // Level 4: Exact recreation from Walkthrough Video (2:00 / move_05.jpg)
  // 8x8 board, 9 Armchairs (left column stack of 3 + right column pairs) + Pre-placed Firecracker
  {
    id: 4,
    name: "Level 4: Corner Armchairs",
    description: "Fire rockets down columns to wipe out fortified armchairs!",
    rows: 8,
    cols: 8,
    moves: 29,
    colors: ALL_COLORS,
    objectives: [
      { type: 'armchair', target: 9, current: 0 },
      { type: 'blue', target: 25, current: 0 },
    ],
    layout: [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ['A', null, null, null, null, null, null, 'A'],
      ['A', null, null, null, null, null, 'A', 'A'],
      ['A', 'FV', null, null, null, null, 'A', 'A'],
      [null, null, null, null, null, null, 'A', 'A'],
    ]
  },

  // Level 5: Magic Mirror / Propeller Combo
  {
    id: 5,
    name: "Level 5: Magic Propeller",
    description: "Match 9+ cubes to create a Magic Mirror! Try tapping two adjacent boosters for super combos.",
    rows: 8,
    cols: 8,
    moves: 26,
    colors: ALL_COLORS,
    objectives: [
      { type: 'armchair', target: 12, current: 0 },
      { type: 'green', target: 30, current: 0 },
    ],
    layout: [
      [null, null, null, null, null, null, null, null],
      [null, null, 'FH', 'B', null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ['A', 'A', null, 'DISCO', null, null, 'A', 'A'],
      ['A', 'A', null, null, null, null, 'A', 'A'],
      [null, null, null, null, null, null, null, null],
      ['A', 'A', null, null, null, null, 'A', 'A'],
      ['A', 'A', null, null, null, null, 'A', 'A'],
    ]
  },

  // Level 6: Introduction to Wooden Crates
  {
    id: 6,
    name: "Level 6: Cracking Storage",
    description: "Smash through wooden crates and clear all armchairs.",
    rows: 8,
    cols: 8,
    moves: 25,
    colors: COLORS_4,
    objectives: [
      { type: 'crate', target: 8, current: 0 },
      { type: 'armchair', target: 10, current: 0 },
    ],
    layout: [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, 'C', 'C', null, null, 'C', 'C', null],
      [null, 'C', 'C', null, null, 'C', 'C', null],
      ['A', null, null, 'FH', 'FV', null, null, 'A'],
      ['A', 'A', null, null, null, null, 'A', 'A'],
      ['A', 'A', 'A', null, null, 'A', 'A', 'A'],
      [null, null, null, null, null, null, null, null],
    ]
  },

  // Level 7: Ice Layers
  {
    id: 7,
    name: "Level 7: Frosty Parlor",
    description: "Match cubes encased in ice to shatter the frost.",
    rows: 8,
    cols: 8,
    moves: 26,
    colors: ALL_COLORS,
    objectives: [
      { type: 'ice', target: 12, current: 0 },
      { type: 'armchair', target: 8, current: 0 },
    ],
    layout: [
      [null, null, null, null, null, null, null, null],
      [null, 'I:red', 'I:red', null, null, 'I:blue', 'I:blue', null],
      [null, 'I:red', 'I:red', null, null, 'I:blue', 'I:blue', null],
      [null, null, null, 'B', 'B', null, null, null],
      [null, 'I:yellow', 'I:yellow', null, null, 'I:green', 'I:green', null],
      [null, 'I:yellow', 'I:yellow', null, null, 'I:green', 'I:green', null],
      ['A', 'A', null, null, null, null, 'A', 'A'],
      ['A', 'A', null, null, null, null, 'A', 'A'],
    ]
  },

  // Level 8: Lipstick Drop Collectibles
  {
    id: 8,
    name: "Level 8: Lipstick Collection",
    description: "Drop the lipsticks down to the very bottom row to collect them!",
    rows: 8,
    cols: 8,
    moves: 25,
    colors: ALL_COLORS,
    objectives: [
      { type: 'drop_item', target: 3, current: 0 },
      { type: 'armchair', target: 10, current: 0 },
    ],
    layout: [
      [null, 'D', null, 'D', null, 'D', null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ['A', 'A', null, 'C', null, 'C', 'A', 'A'],
      ['A', 'A', null, null, null, null, 'A', 'A'],
      [null, null, null, null, null, null, null, null],
      ['A', null, null, null, null, null, null, 'A'],
      [null, null, null, null, null, null, null, null],
    ]
  },

  // Level 9: Double-layer Fortress
  {
    id: 9,
    name: "Level 9: The Fortified Hall",
    description: "Heavy reinforced crates block access to the bottom sofas.",
    rows: 8,
    cols: 8,
    moves: 26,
    colors: ALL_COLORS,
    objectives: [
      { type: 'crate', target: 12, current: 0 },
      { type: 'armchair', target: 12, current: 0 },
    ],
    layout: [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ['C2', 'C2', null, 'FH', 'FV', null, 'C2', 'C2'],
      ['C2', 'C2', null, null, null, null, 'C2', 'C2'],
      [null, null, null, 'B', null, null, null, null],
      ['A', 'A', 'A', null, null, 'A', 'A', 'A'],
      ['A', 'A', 'A', null, null, 'A', 'A', 'A'],
      [null, null, null, null, null, null, null, null],
    ]
  },

  // Level 10: Master Challenge (Hard Boss Level)
  {
    id: 10,
    name: "Level 10: Grand Attic Renovation",
    description: "A master puzzle combining 16 armchairs, 12 crates, and ice barriers!",
    rows: 9,
    cols: 9,
    moves: 28,
    colors: ALL_COLORS,
    objectives: [
      { type: 'armchair', target: 16, current: 0 },
      { type: 'crate', target: 12, current: 0 },
      { type: 'drop_item', target: 2, current: 0 },
    ],
    layout: [
      [null, 'D', null, null, null, null, null, 'D', null],
      ['I:red', null, 'I:blue', null, 'FH', null, 'I:yellow', null, 'I:green'],
      ['C2', 'C1', 'C2', null, null, null, 'C2', 'C1', 'C2'],
      [null, null, null, 'C2', 'C2', 'C2', null, null, null],
      ['A', 'A', null, 'C2', 'DISCO', 'C2', null, 'A', 'A'],
      ['A', 'A', null, 'C2', 'C2', 'C2', null, 'A', 'A'],
      ['A', 'A', null, null, null, null, null, 'A', 'A'],
      ['A', 'A', 'A', null, 'B', null, 'A', 'A', 'A'],
      [null, null, null, null, null, null, null, null, null],
    ]
  },

  // Levels 11 to 20: Progressive Challenges
  ...Array.from({ length: 10 }, (_, i) => {
    const levelId = i + 11;
    const armchairTarget = 12 + (i % 5) * 3;
    const crateTarget = 8 + (i % 4) * 2;
    return {
      id: levelId,
      name: `Level ${levelId}: Chamber ${levelId}`,
      description: `Clear ${armchairTarget} armchairs and ${crateTarget} crates in ${28 - (i % 4)} moves!`,
      rows: 8,
      cols: 8,
      moves: 26 + (i % 3) * 2,
      colors: ALL_COLORS,
      objectives: [
        { type: 'armchair' as const, target: armchairTarget, current: 0 },
        { type: 'crate' as const, target: crateTarget, current: 0 },
      ],
    };
  })
];

// Procedural level generator for infinite ad-free armchair puzzles
export function generateProceduralLevel(levelNum: number, difficulty: 'easy' | 'medium' | 'hard' | 'insane' = 'medium'): LevelConfig {
  const rows = 8;
  const cols = 8;
  const colorPool: TileColor[] = difficulty === 'easy' ? COLORS_4 : ALL_COLORS;

  let moves = 26;
  let armchairCount = 12;
  let crateCount = 6;
  let dropCount = 1;

  if (difficulty === 'easy') {
    moves = 28;
    armchairCount = 8;
    crateCount = 4;
    dropCount = 0;
  } else if (difficulty === 'hard') {
    moves = 24;
    armchairCount = 16;
    crateCount = 10;
    dropCount = 2;
  } else if (difficulty === 'insane') {
    moves = 20;
    armchairCount = 20;
    crateCount = 14;
    dropCount = 3;
  }

  const layout: (string | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));

  // Place armchairs in lower rows
  let placedArmchairs = 0;
  for (let r = rows - 1; r >= rows - 3 && placedArmchairs < armchairCount; r--) {
    for (let c = 0; c < cols && placedArmchairs < armchairCount; c++) {
      if (Math.random() > 0.2) {
        layout[r][c] = 'A';
        placedArmchairs++;
      }
    }
  }

  // Place crates in middle rows
  let placedCrates = 0;
  while (placedCrates < crateCount) {
    const r = Math.floor(Math.random() * 3) + 2;
    const c = Math.floor(Math.random() * cols);
    if (!layout[r][c]) {
      layout[r][c] = difficulty === 'hard' || difficulty === 'insane' ? 'C2' : 'C1';
      placedCrates++;
    }
  }

  // Pre-seed a helpful firecracker
  layout[1][Math.floor(cols / 2)] = 'FH';

  return {
    id: levelNum,
    name: `Puzzle #${levelNum} (${difficulty.toUpperCase()})`,
    description: `Procedural challenge with ${placedArmchairs} armchairs and ${placedCrates} crates!`,
    rows,
    cols,
    moves,
    colors: colorPool,
    objectives: [
      { type: 'armchair', target: placedArmchairs, current: 0 },
      ...(placedCrates > 0 ? [{ type: 'crate' as const, target: placedCrates, current: 0 }] : []),
      ...(dropCount > 0 ? [{ type: 'drop_item' as const, target: dropCount, current: 0 }] : []),
    ],
    layout,
  };
}
