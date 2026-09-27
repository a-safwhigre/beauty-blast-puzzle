export type TileColor = 'red' | 'yellow' | 'blue' | 'green' | 'cyan';

export type BoosterType = 'firecracker_h' | 'firecracker_v' | 'bomb' | 'disco';

export type ObstacleType = 'armchair' | 'crate' | 'drop_item';

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
  iceCover?: boolean;
  isFalling?: boolean;
  isBlasting?: boolean;
  highlightBooster?: BoosterType | null;
}

export type ObjectiveType = TileColor | 'armchair' | 'crate' | 'drop_item' | 'ice';

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
