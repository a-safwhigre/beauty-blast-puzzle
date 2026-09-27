import React, { useState } from 'react';
import { Tile, TileColor, BoosterType, ActiveTool } from '../types/game';

interface GameBoardProps {
  grid: Tile[][];
  onTileClick: (row: number, col: number) => void;
  disabled?: boolean;
  activeTool: ActiveTool;
  onSelectTool: (tool: ActiveTool) => void;
  onOpenSettings: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  grid,
  onTileClick,
  disabled = false,
  activeTool,
  onSelectTool,
  onOpenSettings,
}) => {
  const rows = grid.length;
  const cols = grid[0]?.length || 6;
  const [selectedSwapTile, setSelectedSwapTile] = useState<{ row: number; col: number } | null>(null);

  const handleTileClickInternal = (r: number, c: number) => {
    if (disabled) return;

    if (activeTool === 'swap') {
      if (!selectedSwapTile) {
        setSelectedSwapTile({ row: r, col: c });
      } else {
        // Swap executed
        onTileClick(r, c);
        setSelectedSwapTile(null);
      }
      return;
    }

    onTileClick(r, c);
  };

  const getColorClasses = (color?: TileColor) => {
    switch (color) {
      case 'red':
        return 'bg-gradient-to-b from-[#FF4365] via-[#E11D48] to-[#9F1239] border-[#FDA4AF]';
      case 'yellow':
        return 'bg-gradient-to-b from-[#FDE047] via-[#F59E0B] to-[#B45309] border-[#FEF08A]';
      case 'blue':
        return 'bg-gradient-to-b from-[#38BDF8] via-[#0284C7] to-[#075985] border-[#BAE6FD]';
      case 'green':
        return 'bg-gradient-to-b from-[#4ADE80] via-[#10B981] to-[#065F46] border-[#BBF7D0]';
      case 'cyan':
        return 'bg-gradient-to-b from-[#67E8F9] via-[#06B6D4] to-[#0E7490] border-[#CFFAFE]';
      default:
        return 'bg-slate-700 border-slate-500';
    }
  };

  const getColorIcon = (color?: TileColor) => {
    switch (color) {
      case 'red': return '❤️';
      case 'yellow': return '⭐';
      case 'blue': return '👗';
      case 'green': return '🎀';
      case 'cyan': return '✨';
      default: return '';
    }
  };

  const getBoosterBadge = (boosterType: BoosterType) => {
    switch (boosterType) {
      case 'firecracker_h':
      case 'firecracker_v':
        return (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black flex items-center justify-center shadow-lg border border-white animate-bounce z-20">
            🧨
          </span>
        );
      case 'bomb':
        return (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-lg border border-white animate-bounce z-20">
            💣
          </span>
        );
      case 'disco':
        return (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg border border-white animate-bounce z-20">
            🪩
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-between p-2 select-none relative overflow-hidden">
      {/* Background Rustic Attic Scene Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-25 z-0 flex flex-col justify-between">
        {/* Wall cracks & rustic clock */}
        <div className="flex justify-between p-6">
          <div className="w-14 h-14 rounded-full border-4 border-amber-900/60 bg-amber-950/40 flex items-center justify-center text-xs font-mono font-bold text-amber-200">
            🕒
          </div>
          <div className="text-4xl opacity-50">🕸️</div>
        </div>
        {/* Puddle / floor rug */}
        <div className="w-80 h-28 mx-auto rounded-full bg-sky-950/40 blur-md -mb-6" />
      </div>

      {/* Active Tool Notification */}
      {activeTool && (
        <div className="z-30 -mt-1 mb-1">
          <div className="bg-amber-400 text-slate-950 font-black text-xs px-4 py-1 rounded-full shadow-lg border border-white animate-bounce flex items-center gap-1.5">
            <span>Tap any tile to use {activeTool.toUpperCase()}!</span>
            <button
              onClick={() => onSelectTool(null)}
              className="ml-1 w-4 h-4 rounded-full bg-black/30 text-white text-[10px] flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Board Container */}
      <div className="w-full flex-1 flex items-center justify-center z-10 p-1">
        <div
          className="w-full max-w-[440px] aspect-square bg-[#221f26]/90 p-2 sm:p-2.5 rounded-3xl border-4 border-white shadow-2xl relative flex items-center justify-center"
          style={{
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.4)',
          }}
        >
          <div
            className="w-full h-full grid gap-1 sm:gap-1.5"
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
                      className="w-full h-full rounded-xl bg-black/25 border border-white/5"
                    />
                  );
                }

                // SIGNATURE OBSTACLE: Pink Armchair (沙发)
                if (tile.kind === 'obstacle' && tile.obstacle === 'armchair') {
                  return (
                    <div
                      key={tile.id}
                      onClick={() => handleTileClickInternal(r, c)}
                      className="w-full h-full rounded-2xl bg-gradient-to-b from-[#F472B6] via-[#EC4899] to-[#BE185D] border-t-2 border-l-2 border-b-3 border-r-2 border-[#FBCFE8] shadow-md flex flex-col items-center justify-center relative cursor-pointer active:scale-95 transition-all overflow-hidden"
                      style={{
                        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.6), 0 4px 6px rgba(0,0,0,0.3)',
                      }}
                    >
                      {/* 3D Tufted Pink Armchair Visual */}
                      <div className="w-full h-full flex flex-col items-center justify-center relative">
                        {/* Chair back cushion */}
                        <div className="w-4/5 h-2/5 rounded-t-lg bg-pink-300/40 border border-white/40 flex items-center justify-center">
                          <span className="text-xs filter drop-shadow">🛋️</span>
                        </div>
                        {/* Chair seat pillow */}
                        <div className="w-5/6 h-2/5 rounded-md bg-white/90 border border-pink-200 shadow-inner flex items-center justify-center -mt-0.5">
                          <span className="w-2.5 h-1 bg-pink-400/40 rounded-full" />
                        </div>
                      </div>
                    </div>
                  );
                }

                // Crate Obstacle
                if (tile.kind === 'obstacle' && tile.obstacle === 'crate') {
                  const isReinforced = (tile.hitPoints || 1) > 1;
                  return (
                    <div
                      key={tile.id}
                      onClick={() => handleTileClickInternal(r, c)}
                      className={`w-full h-full rounded-2xl flex flex-col items-center justify-center relative cursor-pointer shadow-md border-2 transition-all active:scale-95 ${
                        isReinforced
                          ? 'bg-gradient-to-br from-amber-800 to-amber-950 border-amber-600 shadow-amber-950'
                          : 'bg-gradient-to-br from-amber-600 to-amber-800 border-amber-400 shadow-amber-900'
                      }`}
                    >
                      <span className="text-xl sm:text-2xl filter drop-shadow">📦</span>
                      {isReinforced && (
                        <span className="absolute bottom-1 right-1 px-1 rounded bg-black/70 text-[9px] font-black text-amber-300">
                          x2
                        </span>
                      )}
                    </div>
                  );
                }

                // Drop Item (Lipstick)
                if (tile.kind === 'obstacle' && tile.obstacle === 'drop_item') {
                  return (
                    <div
                      key={tile.id}
                      onClick={() => handleTileClickInternal(r, c)}
                      className="w-full h-full rounded-2xl bg-rose-500/20 border-2 border-rose-400/60 shadow-lg flex items-center justify-center relative animate-pulse"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-2xl sm:text-3xl filter drop-shadow">💄</span>
                        <span className="text-[8px] font-black uppercase text-pink-300">DROP ↓</span>
                      </div>
                    </div>
                  );
                }

                // BOOSTER: Barber-Pole Firecracker (Row or Col Rocket)
                if (tile.kind === 'booster' && (tile.booster === 'firecracker_h' || tile.booster === 'firecracker_v')) {
                  const isHoriz = tile.booster === 'firecracker_h';
                  return (
                    <button
                      key={tile.id}
                      disabled={disabled}
                      onClick={() => handleTileClickInternal(r, c)}
                      className="w-full h-full rounded-2xl border-2 border-amber-200 shadow-xl flex items-center justify-center relative cursor-pointer hover:scale-105 active:scale-90 transition-all overflow-hidden"
                      style={{
                        background: 'repeating-linear-gradient(45deg, #EF4444, #EF4444 6px, #FBBF24 6px, #FBBF24 12px, #3B82F6 12px, #3B82F6 18px)',
                        boxShadow: '0 0 15px rgba(251, 191, 36, 0.8), inset 0 2px 4px rgba(255,255,255,0.7)',
                      }}
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-950/80 border border-white flex items-center justify-center shadow-lg">
                        <span className={`text-sm transform ${isHoriz ? 'rotate-90' : 'rotate-0'}`}>
                          🧨
                        </span>
                      </div>
                      <span className="absolute bottom-0.5 px-1 rounded bg-black/80 text-[8px] font-black text-amber-300 uppercase">
                        {isHoriz ? 'ROW' : 'COL'}
                      </span>
                    </button>
                  );
                }

                // BOOSTER: Cartoon Star Bomb
                if (tile.kind === 'booster' && tile.booster === 'bomb') {
                  return (
                    <button
                      key={tile.id}
                      disabled={disabled}
                      onClick={() => handleTileClickInternal(r, c)}
                      className="w-full h-full rounded-2xl bg-gradient-to-br from-zinc-800 via-zinc-950 to-black border-2 border-amber-400 shadow-xl flex items-center justify-center relative cursor-pointer hover:scale-105 active:scale-90 transition-all animate-pulse"
                      style={{
                        boxShadow: '0 0 16px rgba(239, 68, 68, 0.8), inset 0 2px 4px rgba(255,255,255,0.4)',
                      }}
                    >
                      <span className="text-2xl sm:text-3xl filter drop-shadow">💣</span>
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                    </button>
                  );
                }

                // BOOSTER: Disco Propeller
                if (tile.kind === 'booster' && tile.booster === 'disco') {
                  return (
                    <button
                      key={tile.id}
                      disabled={disabled}
                      onClick={() => handleTileClickInternal(r, c)}
                      className="w-full h-full rounded-2xl bg-gradient-to-tr from-pink-500 via-indigo-500 to-amber-300 border-2 border-white shadow-xl flex items-center justify-center relative cursor-pointer hover:scale-105 active:scale-90 transition-all"
                    >
                      <span className="text-2xl sm:text-3xl filter drop-shadow">🪩</span>
                    </button>
                  );
                }

                // NORMAL COLORED CUBE
                const colorClasses = getColorClasses(tile.color);
                const colorIcon = getColorIcon(tile.color);
                const isSelectedForSwap = selectedSwapTile && selectedSwapTile.row === r && selectedSwapTile.col === c;

                return (
                  <button
                    key={tile.id}
                    disabled={disabled}
                    onClick={() => handleTileClickInternal(r, c)}
                    className={`w-full h-full rounded-2xl border-t-2 border-l-2 border-b-4 border-r-2 ${colorClasses} flex items-center justify-center relative cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95 active:border-b-2 shadow-inner ${
                      isSelectedForSwap ? 'ring-4 ring-yellow-400 animate-bounce' : ''
                    }`}
                    style={{
                      boxShadow: 'inset 0 3px 4px rgba(255,255,255,0.5), inset 0 -3px 4px rgba(0,0,0,0.3)',
                    }}
                  >
                    {/* Glossy highlight */}
                    <div className="absolute top-1 left-1.5 right-1.5 h-1/3 bg-white/30 rounded-t-xl pointer-events-none" />

                    {/* Embossed icon (Heart, Star, Dress, Ribbon, Starburst) */}
                    <span className="text-base sm:text-lg filter drop-shadow select-none">
                      {colorIcon}
                    </span>

                    {/* Preview Badge for 5+, 7+, 9+ cluster rewards */}
                    {tile.highlightBooster && getBoosterBadge(tile.highlightBooster)}

                    {/* Ice Coating */}
                    {tile.iceCover && (
                      <div className="absolute inset-0 rounded-2xl bg-cyan-200/60 backdrop-blur-[1px] border-2 border-cyan-300 flex items-center justify-center pointer-events-none">
                        <span className="text-xs sm:text-sm">❄️</span>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Authentic Beauty Blast Bottom Power-Up Bar */}
      <footer className="w-full max-w-sm mx-auto flex items-center justify-between px-2 py-2 z-20">
        {/* Hammer Tool (Lv.7) */}
        <button
          onClick={() => onSelectTool(activeTool === 'hammer' ? null : 'hammer')}
          className={`flex flex-col items-center gap-0.5 p-1 transition-transform active:scale-90 ${
            activeTool === 'hammer' ? 'scale-110' : ''
          }`}
        >
          <div className={`w-12 h-12 rounded-full border-2 border-white flex items-center justify-center shadow-lg ${
            activeTool === 'hammer' ? 'bg-amber-400 text-slate-900 ring-2 ring-white' : 'bg-gradient-to-b from-sky-400 to-blue-600 text-white'
          }`}>
            <span className="text-xl">🔨</span>
          </div>
          <span className="text-[10px] font-black text-sky-200">Hammer</span>
        </button>

        {/* Swap Hand Tool (Lv.8) */}
        <button
          onClick={() => {
            setSelectedSwapTile(null);
            onSelectTool(activeTool === 'swap' ? null : 'swap');
          }}
          className={`flex flex-col items-center gap-0.5 p-1 transition-transform active:scale-90 ${
            activeTool === 'swap' ? 'scale-110' : ''
          }`}
        >
          <div className={`w-12 h-12 rounded-full border-2 border-white flex items-center justify-center shadow-lg ${
            activeTool === 'swap' ? 'bg-amber-400 text-slate-900 ring-2 ring-white' : 'bg-gradient-to-b from-sky-400 to-blue-600 text-white'
          }`}>
            <span className="text-xl">👋</span>
          </div>
          <span className="text-[10px] font-black text-sky-200">Swap</span>
        </button>

        {/* Bomb Tool (Lv.9) */}
        <button
          onClick={() => onSelectTool(activeTool === 'bomb' ? null : 'bomb')}
          className={`flex flex-col items-center gap-0.5 p-1 transition-transform active:scale-90 ${
            activeTool === 'bomb' ? 'scale-110' : ''
          }`}
        >
          <div className={`w-12 h-12 rounded-full border-2 border-white flex items-center justify-center shadow-lg ${
            activeTool === 'bomb' ? 'bg-amber-400 text-slate-900 ring-2 ring-white' : 'bg-gradient-to-b from-sky-400 to-blue-600 text-white'
          }`}>
            <span className="text-xl">💣</span>
          </div>
          <span className="text-[10px] font-black text-sky-200">Bomb</span>
        </button>

        {/* Firecracker Tool (Lv.14) */}
        <button
          onClick={() => onSelectTool(activeTool === 'firecracker' ? null : 'firecracker')}
          className={`flex flex-col items-center gap-0.5 p-1 transition-transform active:scale-90 ${
            activeTool === 'firecracker' ? 'scale-110' : ''
          }`}
        >
          <div className={`w-12 h-12 rounded-full border-2 border-white flex items-center justify-center shadow-lg ${
            activeTool === 'firecracker' ? 'bg-amber-400 text-slate-900 ring-2 ring-white' : 'bg-gradient-to-b from-sky-400 to-blue-600 text-white'
          }`}>
            <span className="text-xl">🧨</span>
          </div>
          <span className="text-[10px] font-black text-sky-200">Rocket</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center gap-0.5 p-1 transition-transform active:scale-90"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-b from-sky-400 to-blue-600 border-2 border-white flex items-center justify-center text-white shadow-lg">
            <span className="text-lg">⚙️</span>
          </div>
          <span className="text-[10px] font-black text-sky-200">Menu</span>
        </button>
      </footer>
    </div>
  );
};
