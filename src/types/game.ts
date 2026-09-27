export type TileColor = 'pink' | 'blue' | 'yellow' | 'green' | 'purple';

export type BoosterType = 'rocket_h' | 'rocket_v' | 'bomb' | 'disco';

export type ObstacleType = 'crate' | 'drop_item';

export type TileKind = 'color' | 'booster' | 'obstacle' | 'empty';

export interface Tile {
  id: string;
  row: number;
  col: number;
  kind: TileKind;
  color?: TileColor;
  booster?: BoosterType;
  obstacle?: ObstacleType;
  hitPoints?: number; // For crates (e.g. 1 or 2 hits)
  iceCover?: boolean; // Ice coating on top of cube
  isFalling?: boolean;
  isBlasting?: boolean;
  highlightBooster?: BoosterType | null; // Preview indicator if part of 5+, 7+, 9+ cluster
}

export type ObjectiveType = TileColor | 'crate' | 'drop_item' | 'ice';

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
  layout?: (string | null)[][]; // Custom starting layout (e.g. 'P'=pink, 'C'=crate, 'C2'=reinforced crate, 'D'=drop item, 'I:B'=ice on blue, '.'=empty)
}

export type GameStatus = 'playing' | 'fever' | 'won' | 'lost' | 'paused';

export interface Position {
  row: number;
  col: number;
}
