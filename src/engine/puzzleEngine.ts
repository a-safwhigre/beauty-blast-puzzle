import { Tile, TileColor, BoosterType, LevelConfig, Position, Objective } from '../types/game';
import { sound } from './soundEngine';

export interface BlastResult {
  newGrid: Tile[][];
  blastedCount: number;
  clearedObjectives: { [key: string]: number };
  scoreGained: number;
  spawnedBooster?: { row: number; col: number; type: BoosterType };
}

// Generate unique ID
let idCounter = 0;
export function createTileId(): string {
  return `tile-${++idCounter}-${Date.now().toString(36)}`;
}

export function createRandomTile(row: number, col: number, allowedColors: TileColor[]): Tile {
  const color = allowedColors[Math.floor(Math.random() * allowedColors.length)];
  return {
    id: createTileId(),
    row,
    col,
    kind: 'color',
    color,
    isFalling: false,
    isBlasting: false,
    highlightBooster: null,
  };
}

export function initializeBoard(level: LevelConfig): Tile[][] {
  const { rows, cols, colors, layout } = level;
  const grid: Tile[][] = [];

  for (let r = 0; r < rows; r++) {
    const row: Tile[] = [];
    for (let c = 0; c < cols; c++) {
      if (layout && layout[r] && layout[r][c] !== undefined) {
        const code = layout[r][c];
        if (code === '.' || code === null) {
          row.push({
            id: createTileId(),
            row: r,
            col: c,
            kind: 'empty',
          });
        } else if (code === 'C' || code === 'C1') {
          row.push({
            id: createTileId(),
            row: r,
            col: c,
            kind: 'obstacle',
            obstacle: 'crate',
            hitPoints: 1,
          });
        } else if (code === 'C2') {
          row.push({
            id: createTileId(),
            row: r,
            col: c,
            kind: 'obstacle',
            obstacle: 'crate',
            hitPoints: 2,
          });
        } else if (code === 'D') {
          row.push({
            id: createTileId(),
            row: r,
            col: c,
            kind: 'obstacle',
            obstacle: 'drop_item',
          });
        } else if (code === 'RH') {
          row.push({
            id: createTileId(),
            row: r,
            col: c,
            kind: 'booster',
            booster: 'rocket_h',
          });
        } else if (code === 'RV') {
          row.push({
            id: createTileId(),
            row: r,
            col: c,
            kind: 'booster',
            booster: 'rocket_v',
          });
        } else if (code === 'B') {
          row.push({
            id: createTileId(),
            row: r,
            col: c,
            kind: 'booster',
            booster: 'bomb',
          });
        } else if (code === 'DISCO') {
          row.push({
            id: createTileId(),
            row: r,
            col: c,
            kind: 'booster',
            booster: 'disco',
          });
        } else if (code.startsWith('I:')) {
          // Ice covering color e.g. "I:pink"
          const colCode = code.split(':')[1] as TileColor;
          row.push({
            id: createTileId(),
            row: r,
            col: c,
            kind: 'color',
            color: colCode,
            iceCover: true,
          });
        } else {
          // Specific or random color
          const color = colors.includes(code as TileColor) ? (code as TileColor) : colors[Math.floor(Math.random() * colors.length)];
          row.push({
            id: createTileId(),
            row: r,
            col: c,
            kind: 'color',
            color,
          });
        }
      } else {
        row.push(createRandomTile(r, c, colors));
      }
    }
    grid.push(row);
  }

  // Ensure initial board has at least some valid matches
  return updateBoosterHighlights(grid);
}

// Find connected cluster of same color using Breadth-First Search
export function findConnectedCluster(grid: Tile[][], startRow: number, startCol: number): Position[] {
  const rows = grid.length;
  const cols = grid[0].length;
  const startTile = grid[startRow][startCol];

  if (!startTile || startTile.kind !== 'color' || !startTile.color || startTile.iceCover) {
    return [];
  }

  const targetColor = startTile.color;
  const visited = new Set<string>();
  const queue: Position[] = [{ row: startRow, col: startCol }];
  const cluster: Position[] = [];

  visited.add(`${startRow},${startCol}`);

  const directions = [
    { r: -1, c: 0 },
    { r: 1, c: 0 },
    { r: 0, c: -1 },
    { r: 0, c: 1 },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    cluster.push(current);

    for (const d of directions) {
      const nr = current.row + d.r;
      const nc = current.col + d.c;

      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const neighbor = grid[nr][nc];
        const key = `${nr},${nc}`;
        if (
          !visited.has(key) &&
          neighbor &&
          neighbor.kind === 'color' &&
          neighbor.color === targetColor &&
          !neighbor.iceCover
        ) {
          visited.add(key);
          queue.push({ row: nr, col: nc });
        }
      }
    }
  }

  return cluster;
}

// Update highlight badges on tiles indicating booster threshold (5+ rocket, 7+ bomb, 9+ disco)
export function updateBoosterHighlights(grid: Tile[][]): Tile[][] {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = new Set<string>();
  const newGrid: Tile[][] = grid.map(row => row.map(tile => ({ ...tile, highlightBooster: null })));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = `${r},${c}`;
      if (!visited.has(key) && newGrid[r][c].kind === 'color' && !newGrid[r][c].iceCover) {
        const cluster = findConnectedCluster(newGrid, r, c);
        cluster.forEach(p => visited.add(`${p.row},${p.col}`));

        if (cluster.length >= 5) {
          let boosterType: BoosterType = 'rocket_h';
          if (cluster.length >= 9) {
            boosterType = 'disco';
          } else if (cluster.length >= 7) {
            boosterType = 'bomb';
          } else {
            boosterType = Math.random() > 0.5 ? 'rocket_h' : 'rocket_v';
          }

          cluster.forEach(p => {
            newGrid[p.row][p.col].highlightBooster = boosterType;
          });
        }
      }
    }
  }

  return newGrid;
}

// Find adjacent booster to clicked booster for combo
export function findAdjacentBooster(grid: Tile[][], row: number, col: number): Position | null {
  const rows = grid.length;
  const cols = grid[0].length;
  const directions = [
    { r: -1, c: 0 },
    { r: 1, c: 0 },
    { r: 0, c: -1 },
    { r: 0, c: 1 },
  ];

  for (const d of directions) {
    const nr = row + d.r;
    const nc = col + d.c;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      const neighbor = grid[nr][nc];
      if (neighbor && neighbor.kind === 'booster') {
        return { row: nr, col: nc };
      }
    }
  }
  return null;
}

// Execute tap action on a tile
export function handleTileClick(
  grid: Tile[][],
  row: number,
  col: number,
  allowedColors: TileColor[]
): BlastResult | null {
  const rows = grid.length;
  const cols = grid[0].length;
  const clicked = grid[row][col];

  if (!clicked || clicked.kind === 'empty' || clicked.kind === 'obstacle') {
    return null;
  }

  let tilesToBlast: Position[] = [];
  let spawnedBooster: { row: number; col: number; type: BoosterType } | undefined = undefined;
  const clearedObjectives: { [key: string]: number } = {};

  // Case 1: Tapping a Booster
  if (clicked.kind === 'booster' && clicked.booster) {
    const adjacent = findAdjacentBooster(grid, row, col);

    if (adjacent) {
      // Booster COMBO!
      const otherBooster = grid[adjacent.row][adjacent.col].booster!;
      tilesToBlast = executeBoosterCombo(grid, clicked.booster, otherBooster, row, col, adjacent);
    } else {
      // Single Booster
      tilesToBlast = executeSingleBooster(grid, clicked.booster, row, col);
    }
  }
  // Case 2: Tapping a Color Cluster
  else if (clicked.kind === 'color' && !clicked.iceCover) {
    const cluster = findConnectedCluster(grid, row, col);
    if (cluster.length < 2) {
      // Cannot blast single cube
      return null;
    }

    tilesToBlast = cluster;

    // Check if cluster earns a booster
    if (cluster.length >= 9) {
      spawnedBooster = { row, col, type: 'disco' };
      sound.playDisco();
    } else if (cluster.length >= 7) {
      spawnedBooster = { row, col, type: 'bomb' };
      sound.playBomb();
    } else if (cluster.length >= 5) {
      const type: BoosterType = Math.random() > 0.5 ? 'rocket_h' : 'rocket_v';
      spawnedBooster = { row, col, type };
      sound.playRocket();
    } else {
      sound.playPop(Math.floor(cluster.length / 2));
    }
  } else {
    return null;
  }

  // Deep clone grid
  const newGrid: Tile[][] = grid.map(r => r.map(c => ({ ...c })));
  const blastSet = new Set(tilesToBlast.map(p => `${p.row},${p.col}`));

  // 1. Check adjacent obstacles to blast (crates and ice)
  const directions = [
    { r: -1, c: 0 },
    { r: 1, c: 0 },
    { r: 0, c: -1 },
    { r: 0, c: 1 },
  ];

  const damagedObstacles = new Set<string>();

  tilesToBlast.forEach(p => {
    // Collect color stats
    const t = newGrid[p.row][p.col];
    if (t.kind === 'color' && t.color) {
      clearedObjectives[t.color] = (clearedObjectives[t.color] || 0) + 1;
    }

    // Direct hit on ice
    if (t.iceCover) {
      clearedObjectives['ice'] = (clearedObjectives['ice'] || 0) + 1;
      t.iceCover = false;
    }

    // Check adjacent crates for damage
    directions.forEach(d => {
      const nr = p.row + d.r;
      const nc = p.col + d.c;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const key = `${nr},${nc}`;
        if (!damagedObstacles.has(key) && !blastSet.has(key)) {
          const adjTile = newGrid[nr][nc];
          if (adjTile.kind === 'obstacle' && adjTile.obstacle === 'crate') {
            damagedObstacles.add(key);
            adjTile.hitPoints = (adjTile.hitPoints || 1) - 1;
            sound.playCrateHit();
            if (adjTile.hitPoints <= 0) {
              blastSet.add(key);
              clearedObjectives['crate'] = (clearedObjectives['crate'] || 0) + 1;
            }
          } else if (adjTile.iceCover) {
            damagedObstacles.add(key);
            adjTile.iceCover = false;
            clearedObjectives['ice'] = (clearedObjectives['ice'] || 0) + 1;
          }
        }
      }
    });
  });

  // 2. Mark blasted tiles as empty (nullify content)
  blastSet.forEach(key => {
    const [r, c] = key.split(',').map(Number);
    if (spawnedBooster && r === spawnedBooster.row && c === spawnedBooster.col) {
      // Spawn booster in place
      newGrid[r][c] = {
        id: createTileId(),
        row: r,
        col: c,
        kind: 'booster',
        booster: spawnedBooster.type,
      };
    } else {
      newGrid[r][c] = {
        id: createTileId(),
        row: r,
        col: c,
        kind: 'empty',
      };
    }
  });

  // 3. Apply Gravity and Refill Columns
  applyGravityAndRefill(newGrid, allowedColors, clearedObjectives);

  // 4. Update booster indicators
  const finalGrid = updateBoosterHighlights(newGrid);

  const scoreGained = blastSet.size * 50 + (spawnedBooster ? 200 : 0);

  return {
    newGrid: finalGrid,
    blastedCount: blastSet.size,
    clearedObjectives,
    scoreGained,
    spawnedBooster,
  };
}

// Single Booster Explosions
function executeSingleBooster(grid: Tile[][], type: BoosterType, row: number, col: number): Position[] {
  const rows = grid.length;
  const cols = grid[0].length;
  const results: Position[] = [];

  if (type === 'rocket_h') {
    sound.playRocket();
    for (let c = 0; c < cols; c++) {
      if (grid[row][c].kind !== 'empty') results.push({ row, col: c });
    }
  } else if (type === 'rocket_v') {
    sound.playRocket();
    for (let r = 0; r < rows; r++) {
      if (grid[r][col].kind !== 'empty') results.push({ row: r, col });
    }
  } else if (type === 'bomb') {
    sound.playBomb();
    for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
      for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
        if (grid[r][c].kind !== 'empty') results.push({ row: r, col: c });
      }
    }
  } else if (type === 'disco') {
    sound.playDisco();
    // Find most abundant color on the board
    const colorCounts: { [key: string]: number } = {};
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const t = grid[r][c];
        if (t.kind === 'color' && t.color) {
          colorCounts[t.color] = (colorCounts[t.color] || 0) + 1;
        }
      }
    }
    const targetColor = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a])[0] || 'pink';
    results.push({ row, col });
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c].kind === 'color' && grid[r][c].color === targetColor) {
          results.push({ row: r, col: c });
        }
      }
    }
  }

  return results;
}

// Booster Combos!
function executeBoosterCombo(
  grid: Tile[][],
  b1: BoosterType,
  b2: BoosterType,
  r1: number,
  c1: number,
  p2: Position
): Position[] {
  const rows = grid.length;
  const cols = grid[0].length;
  const results: Position[] = [];

  const comboKey = [b1, b2].sort().join('+');

  // Combo 1: Disco + Disco = Board Wipe!
  if (b1 === 'disco' && b2 === 'disco') {
    sound.playVictory();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c].kind !== 'empty') results.push({ row: r, col: c });
      }
    }
    return results;
  }

  // Combo 2: Disco + Rocket / Disco + Bomb = Convert all color tiles to boosters!
  if (b1 === 'disco' || b2 === 'disco') {
    sound.playDisco();
    const otherType = b1 === 'disco' ? b2 : b1;
    // Find most abundant color
    const colorCounts: { [key: string]: number } = {};
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const t = grid[r][c];
        if (t.kind === 'color' && t.color) {
          colorCounts[t.color] = (colorCounts[t.color] || 0) + 1;
        }
      }
    }
    const targetColor = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a])[0];
    results.push({ row: r1, col: c1 }, p2);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c].kind === 'color' && grid[r][c].color === targetColor) {
          // Detonate as that booster
          results.push(...executeSingleBooster(grid, otherType, r, c));
        }
      }
    }
    return results;
  }

  // Combo 3: Bomb + Bomb = Mega 5x5 explosion
  if (b1 === 'bomb' && b2 === 'bomb') {
    sound.playBomb();
    for (let r = Math.max(0, r1 - 2); r <= Math.min(rows - 1, r1 + 2); r++) {
      for (let c = Math.max(0, c1 - 2); c <= Math.min(cols - 1, c1 + 2); c++) {
        if (grid[r][c].kind !== 'empty') results.push({ row: r, col: c });
      }
    }
    return results;
  }

  // Combo 4: Rocket + Bomb = 3 Rows + 3 Columns
  if (comboKey.includes('bomb') && comboKey.includes('rocket')) {
    sound.playBomb();
    sound.playRocket();
    for (let r = Math.max(0, r1 - 1); r <= Math.min(rows - 1, r1 + 1); r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c].kind !== 'empty') results.push({ row: r, col: c });
      }
    }
    for (let c = Math.max(0, c1 - 1); c <= Math.min(cols - 1, c1 + 1); c++) {
      for (let r = 0; r < rows; r++) {
        if (grid[r][c].kind !== 'empty') results.push({ row: r, col: c });
      }
    }
    return results;
  }

  // Combo 5: Rocket + Rocket = Row + Column Cross
  if (comboKey.includes('rocket')) {
    sound.playRocket();
    for (let c = 0; c < cols; c++) {
      if (grid[r1][c].kind !== 'empty') results.push({ row: r1, col: c });
    }
    for (let r = 0; r < rows; r++) {
      if (grid[r][c1].kind !== 'empty') results.push({ row: r, col: c1 });
    }
    return results;
  }

  return results;
}

// Gravity fall and refill from the top
export function applyGravityAndRefill(
  grid: Tile[][],
  allowedColors: TileColor[],
  clearedObjectives: { [key: string]: number }
) {
  const rows = grid.length;
  const cols = grid[0].length;

  // Process column by column
  for (let c = 0; c < cols; c++) {
    // 1. Shift existing tiles down
    let writeRow = rows - 1;
    for (let r = rows - 1; r >= 0; r--) {
      const tile = grid[r][c];
      if (tile.kind !== 'empty') {
        if (writeRow !== r) {
          grid[writeRow][c] = { ...tile, row: writeRow, isFalling: true };
          grid[r][c] = {
            id: createTileId(),
            row: r,
            col: c,
            kind: 'empty',
          };
        }
        writeRow--;
      }
    }

    // 2. Fill empty top slots with fresh tiles
    while (writeRow >= 0) {
      grid[writeRow][c] = {
        ...createRandomTile(writeRow, c, allowedColors),
        isFalling: true,
      };
      writeRow--;
    }

    // 3. Check if any drop_item reached the bottom row
    for (let r = rows - 1; r >= 0; r--) {
      const tile = grid[r][c];
      if (tile.kind === 'obstacle' && tile.obstacle === 'drop_item') {
        // If it's on the bottom row, or all cells below it are non-empty obstacles
        if (r === rows - 1) {
          clearedObjectives['drop_item'] = (clearedObjectives['drop_item'] || 0) + 1;
          sound.playCollect();
          grid[r][c] = {
            id: createTileId(),
            row: r,
            col: c,
            kind: 'empty',
          };
          // Re-drop this column
          for (let above = r - 1; above >= 0; above--) {
            grid[above + 1][c] = { ...grid[above][c], row: above + 1 };
          }
          grid[0][c] = createRandomTile(0, c, allowedColors);
        }
      }
    }
  }
}

// Check if player has any valid moves
export function checkHasValidMoves(grid: Tile[][]): boolean {
  const rows = grid.length;
  const cols = grid[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tile = grid[r][c];
      if (tile.kind === 'booster') return true;
      if (tile.kind === 'color' && !tile.iceCover) {
        const cluster = findConnectedCluster(grid, r, c);
        if (cluster.length >= 2) return true;
      }
    }
  }
  return false;
}

// Auto-shuffle board when no moves exist
export function shuffleBoard(grid: Tile[][], allowedColors: TileColor[]): Tile[][] {
  const colors: TileColor[] = [];
  const coords: Position[] = [];

  grid.forEach((row, r) => {
    row.forEach((tile, c) => {
      if (tile.kind === 'color' && !tile.iceCover) {
        colors.push(tile.color || allowedColors[0]);
        coords.push({ row: r, col: c });
      }
    });
  });

  // Fisher-Yates shuffle
  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [colors[i], colors[j]] = [colors[j], colors[i]];
  }

  const newGrid = grid.map(r => r.map(c => ({ ...c })));
  coords.forEach((p, idx) => {
    newGrid[p.row][p.col].color = colors[idx];
  });

  return updateBoosterHighlights(newGrid);
}

// Check objective completion
export function checkObjectivesMet(objectives: Objective[]): boolean {
  return objectives.every(obj => obj.current >= obj.target);
}
