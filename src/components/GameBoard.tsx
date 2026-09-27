import React from 'react';
import { Tile, TileColor, BoosterType } from '../types/game';

interface GameBoardProps {
  grid: Tile[][];
  onTileClick: (row: number, col: number) => void;
  disabled?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({ grid, onTileClick, disabled = false }) => {
  const rows = grid.length;
  const cols = grid[0]?.length || 8;

  const getColorClasses = (color?: TileColor) => {
    switch (color) {
      case 'pink':
        return 'bg-gradient-to-b from-[#FF65A3] to-[#E11D48] border-[#FDA4AF] shadow-[#9F1239]';
      case 'blue':
        return 'bg-gradient-to-b from-[#60A5FA] to-[#0284C7] border-[#BAE6FD] shadow-[#075985]';
      case 'yellow':
        return 'bg-gradient-to-b from-[#FDE047] to-[#D97706] border-[#FEF08A] shadow-[#92400E]';
      case 'green':
        return 'bg-gradient-to-b from-[#4ADE80] to-[#059669] border-[#BBF7D0] shadow-[#065F46]';
      case 'purple':
        return 'bg-gradient-to-b from-[#C084FC] to-[#7E22CE] border-[#E9D5FF] shadow-[#581C87]';
      default:
        return 'bg-slate-700 border-slate-500 shadow-slate-900';
    }
  };

  const getColorIcon = (color?: TileColor) => {
    switch (color) {
      case 'pink': return '💄';
      case 'blue': return '💎';
      case 'yellow': return '⭐';
      case 'green': return '🍀';
      case 'purple': return '🔮';
      default: return '';
    }
  };

  const getBoosterBadge = (boosterType: BoosterType) => {
    switch (boosterType) {
      case 'rocket_h':
      case 'rocket_v':
        return (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-slate-900 text-[11px] font-black flex items-center justify-center shadow-lg border border-white animate-bounce z-20">
            🚀
          </span>
        );
      case 'bomb':
        return (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-black flex items-center justify-center shadow-lg border border-white animate-bounce z-20">
            💣
          </span>
        );
      case 'disco':
        return (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-purple-500 text-white text-[11px] font-black flex items-center justify-center shadow-lg border border-white animate-bounce z-20">
            🪩
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex-1 flex items-center justify-center p-2 select-none">
      <div
        className="w-full max-w-[480px] aspect-square bg-slate-950/80 p-2.5 rounded-3xl border-4 border-slate-700/80 shadow-2xl relative flex items-center justify-center backdrop-blur-sm"
        style={{
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.7), inset 0 2px 4px rgba(255,255,255,0.1)',
        }}
      >
        <div
          className="w-full h-full grid gap-1.5 sm:gap-2"
          style={{
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((rowTiles, r) =>
            rowTiles.map((tile, c) => {
              if (tile.kind === 'empty') {
                return (
                  <div
                    key={tile.id || `${r}-${c}`}
                    className="w-full h-full rounded-xl bg-slate-900/30 border border-slate-800/40"
                  />
                );
              }

              // Obstacle: Crate
              if (tile.kind === 'obstacle' && tile.obstacle === 'crate') {
                const isReinforced = (tile.hitPoints || 1) > 1;
                return (
                  <div
                    key={tile.id}
                    onClick={() => !disabled && onTileClick(r, c)}
                    className={`w-full h-full rounded-2xl flex flex-col items-center justify-center relative cursor-pointer shadow-md select-none transition-transform active:scale-95 border-2 ${
                      isReinforced
                        ? 'bg-gradient-to-br from-amber-800 to-amber-950 border-amber-600/70 shadow-amber-950'
                        : 'bg-gradient-to-br from-amber-600 to-amber-800 border-amber-400/50 shadow-amber-900'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl filter drop-shadow">📦</span>
                    {isReinforced && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded-md bg-amber-950/90 text-[10px] font-bold text-amber-200 border border-amber-600">
                        x2
                      </span>
                    )}
                  </div>
                );
              }

              // Obstacle: Drop Item (Lipstick/Perfume)
              if (tile.kind === 'obstacle' && tile.obstacle === 'drop_item') {
                return (
                  <div
                    key={tile.id}
                    onClick={() => !disabled && onTileClick(r, c)}
                    className="w-full h-full rounded-2xl bg-gradient-to-b from-rose-500/30 to-pink-600/20 border-2 border-rose-400/60 shadow-lg flex items-center justify-center relative transition-transform active:scale-95 animate-pulse"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-2xl sm:text-3xl filter drop-shadow-lg">💄</span>
                      <span className="text-[9px] font-black uppercase text-pink-300 tracking-tighter leading-none mt-0.5">
                        DROP ↓
                      </span>
                    </div>
                  </div>
                );
              }

              // Booster: Rocket H/V
              if (tile.kind === 'booster' && (tile.booster === 'rocket_h' || tile.booster === 'rocket_v')) {
                const isHoriz = tile.booster === 'rocket_h';
                return (
                  <button
                    key={tile.id}
                    disabled={disabled}
                    onClick={() => onTileClick(r, c)}
                    className="w-full h-full rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 border-2 border-amber-200 shadow-lg shadow-orange-950/50 flex items-center justify-center relative cursor-pointer transition-all hover:scale-105 active:scale-90 animate-pulseGlow"
                  >
                    <span className={`text-2xl sm:text-3xl filter drop-shadow-md transform ${isHoriz ? 'rotate-90' : 'rotate-0'}`}>
                      🚀
                    </span>
                    <span className="absolute bottom-0.5 text-[8px] font-black uppercase tracking-wider text-amber-100 drop-shadow">
                      {isHoriz ? 'ROW' : 'COL'}
                    </span>
                  </button>
                );
              }

              // Booster: Bomb
              if (tile.kind === 'booster' && tile.booster === 'bomb') {
                return (
                  <button
                    key={tile.id}
                    disabled={disabled}
                    onClick={() => onTileClick(r, c)}
                    className="w-full h-full rounded-2xl bg-gradient-to-br from-zinc-700 via-zinc-900 to-black border-2 border-rose-500/80 shadow-lg shadow-rose-950/60 flex items-center justify-center relative cursor-pointer transition-all hover:scale-105 active:scale-90 animate-pulseGlow"
                  >
                    <span className="text-2xl sm:text-3xl filter drop-shadow-md">💣</span>
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  </button>
                );
              }

              // Booster: Disco Ball / Magic Mirror
              if (tile.kind === 'booster' && tile.booster === 'disco') {
                return (
                  <button
                    key={tile.id}
                    disabled={disabled}
                    onClick={() => onTileClick(r, c)}
                    className="w-full h-full rounded-2xl bg-gradient-to-tr from-pink-500 via-indigo-500 to-amber-400 border-2 border-white shadow-xl shadow-purple-900/60 flex items-center justify-center relative cursor-pointer transition-all hover:scale-105 active:scale-90 animate-pulseGlow"
                  >
                    <span className="text-2xl sm:text-3xl filter drop-shadow-lg">🪩</span>
                    <span className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse" />
                  </button>
                );
              }

              // Normal Colored Cube
              const colorClasses = getColorClasses(tile.color);
              const colorIcon = getColorIcon(tile.color);

              return (
                <button
                  key={tile.id}
                  disabled={disabled}
                  onClick={() => onTileClick(r, c)}
                  className={`w-full h-full rounded-2xl border-t-2 border-l-2 border-b-4 border-r-2 ${colorClasses} flex items-center justify-center relative cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95 active:border-b-2 shadow-inner`}
                  style={{
                    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -3px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  {/* Subtle glossy 3D shine */}
                  <div className="absolute top-1 left-1.5 right-1.5 h-1/3 bg-white/25 rounded-t-xl pointer-events-none" />

                  {/* Icon */}
                  <span className="text-sm sm:text-base filter drop-shadow-sm opacity-90 transition-transform">
                    {colorIcon}
                  </span>

                  {/* Preview Badge for 5+, 7+, 9+ cluster rewards */}
                  {tile.highlightBooster && getBoosterBadge(tile.highlightBooster)}

                  {/* Ice Coating */}
                  {tile.iceCover && (
                    <div className="absolute inset-0 rounded-2xl bg-cyan-200/50 backdrop-blur-[1px] border-2 border-cyan-300 flex items-center justify-center shadow-inner pointer-events-none">
                      <span className="text-xs sm:text-sm drop-shadow">❄️</span>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
