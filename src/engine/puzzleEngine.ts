import { Tile, TileColor, BoosterType, LevelConfig, Position, Objective, BoosterMergeAnimation, FoamSpreadAnimation } from '../types/game';
import { sound } from './soundEngine';

export interface BlastResult {
  newGrid: Tile[][];
  blastedPositions: Position[];
  damagedObstacles: Position[];
  rocketBeams?: { orientation: 'h' | 'v'; index: number }[];
  bombShockwaves?: Position[];
  mergeAnimation?: BoosterMergeAnimation;
  comboPopupText?: string;
  screenShake?: boolean;
  foamSpreadAnimation?: FoamSpreadAnimation;
  foamSpreadOccurred?: boolean;
  blastedCount: number;
  clearedObjectives: { [key: string]: number };
  scoreGained: number;
  spawnedBooster?: { row: number; col: number; type: BoosterType };
}

export function checkTileCanPop(grid: Tile[][], row: number, col: number): boolean {
  if (!grid || !grid[row] || !grid[row][col]) return false;
  const tile = grid[row][col];
  if (tile.kind === 'empty' || tile.kind === 'obstacle') return false;
  if (tile.kind === 'booster') return true;
  if (tile.kind === 'color' && !tile.iceCover) {
    const cluster = findConnectedCluster(grid, row, col);
    return cluster.length >= 2;
  }
  return false;
}

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
          row.push(createRandomTile(r, c, colors));
        } else if (code === 'A' || code === 'armchair') {
          // Signature Pink Armchair Obstacle
          row.push({
            id: createTileId(),
            row: r,
            col: c,
            kind: 'obstacle',
            obstacle: 'armchair',
            hitPoints: 1,
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
        } else if (code.startsWith('W:') || code === 'W') {
          const parts = code.split(':');
          const groupId = parts[1] || 'wardrobe_1';
          const part = (parts[2] as 'tl' | 'tr' | 'bl' | 'br') || 'single';
          row.push({
            id: createTileId(),
            row: r,
            col: c,
            kind: 'obstacle',
            obstacle: 'wardrobe',
            groupId,
            part,
            hitPoints: 3,
            maxHitPoints: 3,
          });
        } else if (code.startsWith('S') || code === 'safe') {
          const hp = code === 'S3' ? 3 : (code === 'S1' ? 1 : 2);
          row.push({
            id: createTileId(),
            row: r,
            col: c,
            kind: 'obstacle',
            obstacle: 'safe',
            hitPoints: hp,
            maxHitPoints: hp,
          });
        } else if (code === 'F' || code === 'FOAM') {
          row.push({
            id: createTileId(),
            row: r,
            col: c,
            kind: 'obstacle',
            obstacle: 'foam',
            hitPoints: 1,
            maxHitPoints: 1,
          });
        } else if (code === 'FH' || code === 'RH') {
          row.push({
            id: createTileId(),
            row: r,
            col: c,
            kind: 'booster',
            booster: 'firecracker_h',
          });
        } else if (code === 'FV' || code === 'RV') {
          row.push({
            id: createTileId(),
            row: r,
            col: c,
            kind: 'booster',
            booster: 'firecracker_v',
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

// Update highlight badges on tiles indicating booster threshold (5+ firecracker, 7+ bomb, 9+ disco)
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
          let boosterType: BoosterType = 'firecracker_h';
          if (cluster.length >= 9) {
            boosterType = 'disco';
          } else if (cluster.length >= 7) {
            boosterType = 'bomb';
          } else {
            boosterType = Math.random() > 0.5 ? 'firecracker_h' : 'firecracker_v';
          }

          cluster.forEach(p => {
            newGrid[p.row][p.col].highlightBooster = boosterType;
          });
        }
      }
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newGrid[r][c].kind === 'booster') {
        const hasAdj = findAdjacentBooster(newGrid, r, c) !== null;
        newGrid[r][c].hasAdjacentBooster = hasAdj;
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
  const rocketBeams: { orientation: 'h' | 'v'; index: number }[] = [];
  const bombShockwaves: Position[] = [];
  let mergeAnimation: BoosterMergeAnimation | undefined = undefined;
  let comboPopupText: string | undefined = undefined;
  let screenShake = false;

  // Case 1: Tapping a Booster
  if (clicked.kind === 'booster' && clicked.booster) {
    const adjacent = findAdjacentBooster(grid, row, col);

    if (adjacent) {
      // Booster COMBO!
      const otherBooster = grid[adjacent.row][adjacent.col].booster!;
      tilesToBlast = executeBoosterCombo(grid, clicked.booster, otherBooster, row, col, adjacent);

      const comboKey = [clicked.booster, otherBooster].sort().join('+');
      mergeAnimation = {
        id: `merge-${Date.now()}`,
        fromRow: adjacent.row,
        fromCol: adjacent.col,
        toRow: row,
        toCol: col,
        boosterType: otherBooster,
        comboType: comboKey,
      };
      screenShake = true;

      if (comboKey === 'disco+disco') {
        comboPopupText = '🌟 SUPERNOVA CLEAR!';
        sound.playMegaBoom();
      } else if (comboKey.includes('disco')) {
        comboPopupText = '🪩 DISCO STORM!';
        sound.playDisco();
      } else if (comboKey === 'bomb+bomb') {
        comboPopupText = '💥 MEGA BOMB 5x5!';
        sound.playMegaBoom();
        bombShockwaves.push({ row, col }, { row: adjacent.row, col: adjacent.col });
      } else if (comboKey.includes('bomb') && (comboKey.includes('firecracker') || comboKey.includes('rocket'))) {
        comboPopupText = '🚀 ROCKET BARRAGE!';
        sound.playMegaBoom();
        for (let ro = Math.max(0, row - 1); ro <= Math.min(rows - 1, row + 1); ro++) {
          rocketBeams.push({ orientation: 'h', index: ro });
        }
        for (let co = Math.max(0, col - 1); co <= Math.min(cols - 1, col + 1); co++) {
          rocketBeams.push({ orientation: 'v', index: co });
        }
        bombShockwaves.push({ row, col });
      } else {
        comboPopupText = '⚡ CROSS LASER!';
        sound.playRocket();
        rocketBeams.push({ orientation: 'h', index: row });
        rocketBeams.push({ orientation: 'v', index: col });
      }
    } else {
      // Single Booster
      tilesToBlast = executeSingleBooster(grid, clicked.booster, row, col);
      if (clicked.booster === 'firecracker_h') {
        rocketBeams.push({ orientation: 'h', index: row });
      } else if (clicked.booster === 'firecracker_v') {
        rocketBeams.push({ orientation: 'v', index: col });
      } else if (clicked.booster === 'bomb') {
        bombShockwaves.push({ row, col });
        screenShake = true;
      }
    }
  }
  // Case 2: Tapping a Color Cluster
  else if (clicked.kind === 'color' && !clicked.iceCover) {
    const cluster = findConnectedCluster(grid, row, col);
    if (cluster.length < 2) {
      return null;
    }

    tilesToBlast = cluster;

    // Check if cluster earns a booster
    if (cluster.length >= 9) {
      spawnedBooster = { row, col, type: 'disco' };
      comboPopupText = '🪩 DISCO UNLOCKED!';
      sound.playDisco();
    } else if (cluster.length >= 7) {
      spawnedBooster = { row, col, type: 'bomb' };
      comboPopupText = '💣 BOMB CRAFTED!';
      sound.playBomb();
    } else if (cluster.length >= 5) {
      const type: BoosterType = Math.random() > 0.5 ? 'firecracker_h' : 'firecracker_v';
      spawnedBooster = { row, col, type };
      comboPopupText = '🧨 ROCKET CRAFTED!';
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

  // Check adjacent obstacles to blast (Armchairs, Crates, Ice, Wardrobes, Safes)
  const directions = [
    { r: -1, c: 0 },
    { r: 1, c: 0 },
    { r: 0, c: -1 },
    { r: 0, c: 1 },
  ];

  const damagedObstacles = new Set<string>();
  const damagedObstaclePositions: Position[] = [];

  tilesToBlast.forEach(p => {
    const t = newGrid[p.row][p.col];
    if (t.kind === 'color' && t.color) {
      clearedObjectives[t.color] = (clearedObjectives[t.color] || 0) + 1;
    }

    if (t.iceCover) {
      clearedObjectives['ice'] = (clearedObjectives['ice'] || 0) + 1;
      t.iceCover = false;
    }

    // Check if the directly blasted tile itself is an obstacle
    if (t.kind === 'obstacle') {
      if (t.groupId) {
        if (!damagedObstacles.has(t.groupId)) {
          damagedObstacles.add(t.groupId);
          const groupCells: Position[] = [];
          for (let gr = 0; gr < rows; gr++) {
            for (let gc = 0; gc < cols; gc++) {
              if (newGrid[gr][gc].groupId === t.groupId) {
                groupCells.push({ row: gr, col: gc });
              }
            }
          }
          const newHp = (t.hitPoints || 3) - 1;
          groupCells.forEach(cell => {
            newGrid[cell.row][cell.col].hitPoints = newHp;
            damagedObstaclePositions.push({ row: cell.row, col: cell.col });
          });
          sound.playCrateHit();

          if (newHp <= 0) {
            groupCells.forEach(cell => {
              blastSet.add(`${cell.row},${cell.col}`);
            });
            clearedObjectives[t.obstacle || 'wardrobe'] = (clearedObjectives[t.obstacle || 'wardrobe'] || 0) + 1;
            sound.playBomb();
          }
        }
      } else if (t.obstacle === 'armchair') {
        clearedObjectives['armchair'] = (clearedObjectives['armchair'] || 0) + 1;
        damagedObstaclePositions.push({ row: p.row, col: p.col });
        sound.playCrateHit();
      } else if (t.obstacle === 'crate') {
        t.hitPoints = (t.hitPoints || 1) - 1;
        damagedObstaclePositions.push({ row: p.row, col: p.col });
        sound.playCrateHit();
        if (t.hitPoints <= 0) {
          clearedObjectives['crate'] = (clearedObjectives['crate'] || 0) + 1;
        }
      } else if (t.obstacle === 'safe') {
        t.hitPoints = (t.hitPoints || 2) - 1;
        damagedObstaclePositions.push({ row: p.row, col: p.col });
        sound.playCrateHit();
        if (t.hitPoints <= 0) {
          clearedObjectives['safe'] = (clearedObjectives['safe'] || 0) + 1;
          sound.playBomb();
        }
      } else if (t.obstacle === 'foam') {
        clearedObjectives['foam'] = (clearedObjectives['foam'] || 0) + 1;
        damagedObstaclePositions.push({ row: p.row, col: p.col });
        blastSet.add(`${p.row},${p.col}`);
        sound.playPop(3);
      }
    }

    // Check adjacent armchairs and crates
    directions.forEach(d => {
      const nr = p.row + d.r;
      const nc = p.col + d.c;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const key = `${nr},${nc}`;
        if (!damagedObstacles.has(key) && !blastSet.has(key)) {
          const adjTile = newGrid[nr][nc];
          if (adjTile.kind === 'obstacle') {
            if (adjTile.groupId) {
              if (!damagedObstacles.has(adjTile.groupId)) {
                damagedObstacles.add(adjTile.groupId);
                const groupCells: Position[] = [];
                for (let gr = 0; gr < rows; gr++) {
                  for (let gc = 0; gc < cols; gc++) {
                    if (newGrid[gr][gc].groupId === adjTile.groupId) {
                      groupCells.push({ row: gr, col: gc });
                    }
                  }
                }
                const newHp = (adjTile.hitPoints || 3) - 1;
                groupCells.forEach(cell => {
                  newGrid[cell.row][cell.col].hitPoints = newHp;
                  damagedObstaclePositions.push({ row: cell.row, col: cell.col });
                });
                sound.playCrateHit();

                if (newHp <= 0) {
                  groupCells.forEach(cell => {
                    blastSet.add(`${cell.row},${cell.col}`);
                  });
                  clearedObjectives[adjTile.obstacle || 'wardrobe'] = (clearedObjectives[adjTile.obstacle || 'wardrobe'] || 0) + 1;
                  sound.playBomb();
                }
              }
            } else if (adjTile.obstacle === 'armchair') {
              damagedObstacles.add(key);
              damagedObstaclePositions.push({ row: nr, col: nc });
              blastSet.add(key);
              clearedObjectives['armchair'] = (clearedObjectives['armchair'] || 0) + 1;
              sound.playCrateHit();
            } else if (adjTile.obstacle === 'crate') {
              damagedObstacles.add(key);
              damagedObstaclePositions.push({ row: nr, col: nc });
              adjTile.hitPoints = (adjTile.hitPoints || 1) - 1;
              sound.playCrateHit();
              if (adjTile.hitPoints <= 0) {
                blastSet.add(key);
                clearedObjectives['crate'] = (clearedObjectives['crate'] || 0) + 1;
              }
            } else if (adjTile.obstacle === 'safe') {
              damagedObstacles.add(key);
              damagedObstaclePositions.push({ row: nr, col: nc });
              adjTile.hitPoints = (adjTile.hitPoints || 2) - 1;
              sound.playCrateHit();
              if (adjTile.hitPoints <= 0) {
                blastSet.add(key);
                clearedObjectives['safe'] = (clearedObjectives['safe'] || 0) + 1;
                sound.playBomb();
              }
            } else if (adjTile.obstacle === 'foam') {
              damagedObstacles.add(key);
              damagedObstaclePositions.push({ row: nr, col: nc });
              blastSet.add(key);
              clearedObjectives['foam'] = (clearedObjectives['foam'] || 0) + 1;
              sound.playPop(3);
            }
          } else if (adjTile.iceCover) {
            damagedObstacles.add(key);
            damagedObstaclePositions.push({ row: nr, col: nc });
            adjTile.iceCover = false;
            clearedObjectives['ice'] = (clearedObjectives['ice'] || 0) + 1;
          }
        }
      }
    });
  });

  // Mark blasted tiles as empty
  blastSet.forEach(key => {
    const [r, c] = key.split(',').map(Number);
    if (spawnedBooster && r === spawnedBooster.row && c === spawnedBooster.col) {
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

  // Apply Gravity and Refill Columns
  applyGravityAndRefill(newGrid, allowedColors, clearedObjectives);

  // Spreading Hazard Logic: Bubble Foam
  // If foam was NOT damaged on this turn, check if any foam tiles exist and have room to spread
  let foamSpreadAnimation: FoamSpreadAnimation | undefined = undefined;
  let foamSpreadOccurred = false;

  const foamDamagedThisTurn = (clearedObjectives['foam'] || 0) > 0;
  if (!foamDamagedThisTurn) {
    const foamTiles: Position[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (newGrid[r][c].kind === 'obstacle' && newGrid[r][c].obstacle === 'foam') {
          foamTiles.push({ row: r, col: c });
        }
      }
    }

    if (foamTiles.length > 0) {
      // Find candidate neighbors with room (color cubes, not ice-covered)
      const spreadCandidates: { from: Position; to: Position }[] = [];
      foamTiles.forEach(ft => {
        directions.forEach(d => {
          const nr = ft.row + d.r;
          const nc = ft.col + d.c;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            const neighbor = newGrid[nr][nc];
            // Room to spread: standard color cube
            if (neighbor.kind === 'color' && !neighbor.iceCover) {
              spreadCandidates.push({ from: ft, to: { row: nr, col: nc } });
            }
          }
        });
      });

      if (spreadCandidates.length > 0) {
        const chosen = spreadCandidates[Math.floor(Math.random() * spreadCandidates.length)];
        newGrid[chosen.to.row][chosen.to.col] = {
          id: createTileId(),
          row: chosen.to.row,
          col: chosen.to.col,
          kind: 'obstacle',
          obstacle: 'foam',
          hitPoints: 1,
          maxHitPoints: 1,
        };
        foamSpreadAnimation = {
          id: `foam-${Date.now()}`,
          fromRow: chosen.from.row,
          fromCol: chosen.from.col,
          toRow: chosen.to.row,
          toCol: chosen.to.col,
        };
        foamSpreadOccurred = true;
      }
    }
  }

  // Update booster indicators
  const finalGrid = updateBoosterHighlights(newGrid);

  const scoreGained = blastSet.size * 60 + (spawnedBooster ? 250 : 0);

  return {
    newGrid: finalGrid,
    blastedPositions: Array.from(blastSet).map(k => {
      const [r, c] = k.split(',').map(Number);
      return { row: r, col: c };
    }),
    damagedObstacles: damagedObstaclePositions,
    rocketBeams: rocketBeams.length > 0 ? rocketBeams : undefined,
    bombShockwaves: bombShockwaves.length > 0 ? bombShockwaves : undefined,
    mergeAnimation,
    comboPopupText,
    screenShake: screenShake || undefined,
    foamSpreadAnimation,
    foamSpreadOccurred,
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

  if (type === 'firecracker_h') {
    sound.playRocket();
    for (let c = 0; c < cols; c++) {
      if (grid[row][c].kind !== 'empty') results.push({ row, col: c });
    }
  } else if (type === 'firecracker_v') {
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
    const colorCounts: { [key: string]: number } = {};
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const t = grid[r][c];
        if (t.kind === 'color' && t.color) {
          colorCounts[t.color] = (colorCounts[t.color] || 0) + 1;
        }
      }
    }
    const targetColor = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a])[0] || 'red';
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

// Booster Combos
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

  if (b1 === 'disco' && b2 === 'disco') {
    sound.playVictory();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c].kind !== 'empty') results.push({ row: r, col: c });
      }
    }
    return results;
  }

  if (b1 === 'disco' || b2 === 'disco') {
    sound.playDisco();
    const otherType = b1 === 'disco' ? b2 : b1;
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
          results.push(...executeSingleBooster(grid, otherType, r, c));
        }
      }
    }
    return results;
  }

  if (b1 === 'bomb' && b2 === 'bomb') {
    sound.playBomb();
    for (let r = Math.max(0, r1 - 2); r <= Math.min(rows - 1, r1 + 2); r++) {
      for (let c = Math.max(0, c1 - 2); c <= Math.min(cols - 1, c1 + 2); c++) {
        if (grid[r][c].kind !== 'empty') results.push({ row: r, col: c });
      }
    }
    return results;
  }

  if (comboKey.includes('bomb') && (comboKey.includes('firecracker') || comboKey.includes('rocket'))) {
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

  if (comboKey.includes('firecracker') || comboKey.includes('rocket')) {
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

// Gravity fall and refill
export function applyGravityAndRefill(
  grid: Tile[][],
  allowedColors: TileColor[],
  clearedObjectives: { [key: string]: number }
) {
  const rows = grid.length;
  const cols = grid[0].length;

  for (let c = 0; c < cols; c++) {
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

    let spawnOffset = 1;
    while (writeRow >= 0) {
      grid[writeRow][c] = {
        ...createRandomTile(writeRow, c, allowedColors),
        spawnRow: -spawnOffset,
        isFalling: true,
      };
      spawnOffset++;
      writeRow--;
    }

    for (let r = rows - 1; r >= 0; r--) {
      const tile = grid[r][c];
      if (tile.kind === 'obstacle' && tile.obstacle === 'drop_item') {
        if (r === rows - 1) {
          clearedObjectives['drop_item'] = (clearedObjectives['drop_item'] || 0) + 1;
          sound.playCollect();
          grid[r][c] = {
            id: createTileId(),
            row: r,
            col: c,
            kind: 'empty',
          };
          for (let above = r - 1; above >= 0; above--) {
            grid[above + 1][c] = { ...grid[above][c], row: above + 1 };
          }
          grid[0][c] = createRandomTile(0, c, allowedColors);
        }
      }
    }
  }
}

// In-game power-up: Hammer tool (destroys any tile/obstacle directly)
export function applyHammerTool(
  grid: Tile[][],
  row: number,
  col: number,
  allowedColors: TileColor[],
  clearedObjectives: { [key: string]: number }
): Tile[][] {
  const newGrid = grid.map(r => r.map(c => ({ ...c })));
  const target = newGrid[row][col];
  if (!target || target.kind === 'empty') return grid;

  sound.playBomb();
  if (target.kind === 'obstacle') {
    if (target.groupId) {
      clearedObjectives[target.obstacle || 'wardrobe'] = (clearedObjectives[target.obstacle || 'wardrobe'] || 0) + 1;
      for (let r = 0; r < newGrid.length; r++) {
        for (let c = 0; c < newGrid[r].length; c++) {
          if (newGrid[r][c].groupId === target.groupId) {
            newGrid[r][c] = {
              id: createTileId(),
              row: r,
              col: c,
              kind: 'empty',
            };
          }
        }
      }
    } else if (target.obstacle === 'armchair') {
      clearedObjectives['armchair'] = (clearedObjectives['armchair'] || 0) + 1;
    } else if (target.obstacle === 'crate') {
      clearedObjectives['crate'] = (clearedObjectives['crate'] || 0) + 1;
    } else if (target.obstacle === 'safe') {
      clearedObjectives['safe'] = (clearedObjectives['safe'] || 0) + 1;
    } else if (target.obstacle === 'foam') {
      clearedObjectives['foam'] = (clearedObjectives['foam'] || 0) + 1;
    }
  } else if (target.kind === 'color' && target.color) {
    clearedObjectives[target.color] = (clearedObjectives[target.color] || 0) + 1;
  }

  newGrid[row][col] = {
    id: createTileId(),
    row,
    col,
    kind: 'empty',
  };

  applyGravityAndRefill(newGrid, allowedColors, clearedObjectives);
  return updateBoosterHighlights(newGrid);
}

// In-game power-up: Swap tool (swaps two tiles directly)
export function applySwapTool(grid: Tile[][], r1: number, c1: number, r2: number, c2: number): Tile[][] {
  const newGrid = grid.map(r => r.map(c => ({ ...c })));
  const t1 = newGrid[r1][c1];
  const t2 = newGrid[r2][c2];

  newGrid[r1][c1] = { ...t2, row: r1, col: c1 };
  newGrid[r2][c2] = { ...t1, row: r2, col: c2 };

  sound.playPop(1);
  return updateBoosterHighlights(newGrid);
}

// Check valid moves
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

// Shuffle board
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

// Check objectives
export function checkObjectivesMet(objectives: Objective[]): boolean {
  return objectives.every(obj => obj.current >= obj.target);
}
