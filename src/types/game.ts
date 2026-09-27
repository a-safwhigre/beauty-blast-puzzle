export type TileColor = 'red' | 'yellow' | 'blue' | 'green' | 'cyan';

export type BoosterType = 'firecracker_h' | 'firecracker_v' | 'bomb' | 'disco';

export type ObstacleType = 'armchair' | 'crate' | 'drop_item' | 'wardrobe' | 'safe';

export type TileKind = 'color' | 'booster' | 'obstacle' | 'empty';

export interface Tile {
  id: string;
  row: number;
  col: number;
  kind: TileKind;
  color?: TileColor;
  booster?: BoosterType;
  obstacle?: ObstacleType;
  hitPoints?: number;
  maxHitPoints?: number;
  groupId?: string;
  part?: 'tl' | 'tr' | 'bl' | 'br' | 'single';
  iceCover?: boolean;
  isFalling?: boolean;
  isBlasting?: boolean;
  isWiggling?: boolean;
  hasAdjacentBooster?: boolean;
  spawnRow?: number;
  highlightBooster?: BoosterType | null;
}

export type ObjectiveType = TileColor | 'armchair' | 'crate' | 'drop_item' | 'ice' | 'wardrobe' | 'safe';

export interface Objective {
  type: ObjectiveType;
  target: number;
  current: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  rows: number;
  cols: number;
  moves: number;
  colors: TileColor[];
  objectives: Objective[];
  layout?: (string | null)[][];
}

export type GameStatus = 'playing' | 'fever' | 'won' | 'lost' | 'paused';

export type ActiveTool = 'hammer' | 'swap' | 'bomb' | 'firecracker' | null;

export interface Position {
  row: number;
  col: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
}

export interface FlyingCollectible {
  id: string;
  startX: number;
  startY: number;
  icon: string;
  type: ObjectiveType;
}

export interface RocketBeam {
  id: string;
  orientation: 'h' | 'v';
  index: number; // row index for 'h', col index for 'v'
}

export interface Shockwave {
  id: string;
  row: number;
  col: number;
}

export interface BoosterMergeAnimation {
  id: string;
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  boosterType: BoosterType;
  comboType: string;
}

export interface ScorePopup {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}
