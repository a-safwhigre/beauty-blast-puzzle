import React, { useState, useEffect, useRef } from 'react';
import { Tile, TileColor, BoosterType, ActiveTool, RocketBeam, Shockwave, BoosterMergeAnimation, ScorePopup, FoamSpreadAnimation } from '../types/game';

interface GameBoardProps {
  grid: Tile[][];
  onTileClick: (row: number, col: number) => void;
  disabled?: boolean;
  activeTool: ActiveTool;
  onSelectTool: (tool: ActiveTool) => void;
  onOpenSettings: () => void;
  blastingCoords?: Set<string>;
  wigglingCoord?: string | null;
  damagedObstacleCoords?: Set<string>;
  rocketBeams?: RocketBeam[];
  bombShockwaves?: Shockwave[];
  isScreenShaking?: boolean;
  activeMerge?: BoosterMergeAnimation | null;
  scorePopups?: ScorePopup[];
  foamSpreadAnimation?: FoamSpreadAnimation | null;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  grid,
  onTileClick,
  disabled = false,
  activeTool,
  onSelectTool,
  onOpenSettings,
  blastingCoords = new Set(),
  wigglingCoord = null,
  damagedObstacleCoords = new Set(),
  rocketBeams = [],
  bombShockwaves = [],
  isScreenShaking = false,
  activeMerge = null,
  scorePopups = [],
  foamSpreadAnimation = null,
}) => {
  const rows = grid.length;
  const cols = grid[0]?.length || 6;
  const [selectedSwapTile, setSelectedSwapTile] = useState<{ row: number; col: number } | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [animatedSpawnOffsets, setAnimatedSpawnOffsets] = useState<{ [id: string]: number }>({});
  const boardRef = useRef<HTMLDivElement>(null);

  // Manage spawn animations for newly falling tiles
  useEffect(() => {
    const pendingOffsets: { [id: string]: number } = {};
    let hasPending = false;

    grid.forEach(row => {
      row.forEach(tile => {
        if (tile.kind !== 'empty' && tile.spawnRow !== undefined) {
          if (animatedSpawnOffsets[tile.id] === undefined) {
            pendingOffsets[tile.id] = tile.spawnRow;
            hasPending = true;
          }
        }
      });
    });

    if (hasPending) {
      setAnimatedSpawnOffsets(prev => ({ ...prev, ...pendingOffsets }));
      const timer = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimatedSpawnOffsets(prev => {
            const next = { ...prev };
            Object.keys(pendingOffsets).forEach(id => {
              delete next[id];
            });
            return next;
          });
        });
      });
      return () => cancelAnimationFrame(timer);
    }
  }, [grid]);

  // Generate particle bursts whenever blastingCoords triggers
  useEffect(() => {
    if (blastingCoords.size === 0) return;

    const newParticles: Particle[] = [];
    blastingCoords.forEach(key => {
      const [r, c] = key.split(',').map(Number);
      const tile = grid[r]?.[c];
      let pColor = '#F59E0B';
      if (tile?.kind === 'color') {
        switch (tile.color) {
          case 'red': pColor = '#FF4365'; break;
          case 'yellow': pColor = '#FBBF24'; break;
          case 'blue': pColor = '#38BDF8'; break;
          case 'green': pColor = '#4ADE80'; break;
          case 'cyan': pColor = '#67E8F9'; break;
        }
      } else if (tile?.kind === 'obstacle' && tile.obstacle === 'armchair') {
        pColor = '#F472B6';
      }

      const centerX = ((c + 0.5) / cols) * 100;
      const centerY = ((r + 0.5) / rows) * 100;

      // 8 particles radiating in a circle
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4 + (Math.random() * 0.3 - 0.15);
        const speed = 25 + Math.random() * 30;
        newParticles.push({
          id: `p-${Date.now()}-${r}-${c}-${i}`,
          x: centerX,
          y: centerY,
          color: pColor,
          size: 6 + Math.random() * 5,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
        });
      }
    });

    setParticles(prev => [...prev, ...newParticles]);
    const timer = setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 450);

    return () => clearTimeout(timer);
  }, [blastingCoords, grid, cols, rows]);

  const handleTileClickInternal = (r: number, c: number) => {
    if (disabled) return;

    if (activeTool === 'swap') {
      if (!selectedSwapTile) {
        setSelectedSwapTile({ row: r, col: c });
      } else {
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

  const getWardrobeRoundedClasses = (part?: string) => {
    switch (part) {
      case 'tl': return 'rounded-tl-2xl rounded-tr-sm rounded-bl-sm rounded-br-none';
      case 'tr': return 'rounded-tr-2xl rounded-tl-sm rounded-br-sm rounded-bl-none';
      case 'bl': return 'rounded-bl-2xl rounded-tl-sm rounded-br-sm rounded-tr-none';
      case 'br': return 'rounded-br-2xl rounded-tr-sm rounded-bl-sm rounded-tl-none';
      default: return 'rounded-2xl';
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

  // Flatten active non-empty tiles for percentage placement
  const allActiveTiles = grid.flatMap(row => row).filter(t => t.kind !== 'empty');

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-between p-2 select-none relative overflow-hidden">
      {/* Background Rustic Attic Scene Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-25 z-0 flex flex-col justify-between">
        <div className="flex justify-between p-6">
          <div className="w-14 h-14 rounded-full border-4 border-amber-900/60 bg-amber-950/40 flex items-center justify-center text-xs font-mono font-bold text-amber-200">
            🕒
          </div>
          <div className="text-4xl opacity-50">🕸️</div>
        </div>
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
          ref={boardRef}
          className={`w-full max-w-[440px] aspect-square bg-[#221f26]/95 p-2 sm:p-2.5 rounded-3xl border-4 border-white shadow-2xl relative flex items-center justify-center overflow-hidden ${
            isScreenShaking ? 'animate-board-rumble' : ''
          }`}
          style={{
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.4)',
          }}
        >
          {/* 1. Stationary Recessed Board Background Slots */}
          <div
            className="absolute inset-2 sm:inset-2.5 grid gap-1 sm:gap-1.5 z-0 pointer-events-none"
            style={{
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: rows * cols }).map((_, i) => (
              <div
                key={i}
                className="w-full h-full rounded-2xl bg-black/45 border border-white/5 shadow-inner"
              />
            ))}
          </div>

          {/* 2. Dynamic Physical Tile Layer */}
          <div className="absolute inset-2 sm:inset-2.5 z-10">
            {allActiveTiles.map(tile => {
              const r = tile.row;
              const c = tile.col;
              const key = `${r},${c}`;
              const isBlasting = blastingCoords.has(key);
              const isWiggling = wigglingCoord === key;
              const isDamagedObstacle = damagedObstacleCoords.has(key);

              // Use animated spawn position if dropping in from above
              const displayRow = animatedSpawnOffsets[tile.id] !== undefined ? animatedSpawnOffsets[tile.id] : r;
              const leftPercent = (c / cols) * 100;
              const topPercent = (displayRow / rows) * 100;
              const widthPercent = 100 / cols;
              const heightPercent = 100 / rows;

              let animClass = '';
              if (isBlasting) {
                animClass = 'animate-pop-blast pointer-events-none';
              } else if (isWiggling) {
                animClass = 'animate-tile-wiggle';
              } else if (isDamagedObstacle) {
                animClass = 'animate-armchair-wobble';
              }

              return (
                <div
                  key={tile.id}
                  id={`tile-${r}-${c}`}
                  style={{
                    position: 'absolute',
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    width: `${widthPercent}%`,
                    height: `${heightPercent}%`,
                    padding: '2px',
                    transition: 'top 320ms cubic-bezier(0.34, 1.56, 0.64, 1), left 300ms ease, transform 180ms ease, opacity 180ms ease',
                    zIndex: isBlasting ? 25 : 10,
                  }}
                >
                  {/* SIGNATURE OBSTACLE: Pink Armchair (沙发) */}
                  {tile.kind === 'obstacle' && tile.obstacle === 'armchair' && (
                    <div
                      onClick={() => handleTileClickInternal(r, c)}
                      className={`w-full h-full rounded-2xl bg-gradient-to-b from-[#F472B6] via-[#EC4899] to-[#BE185D] border-t-2 border-l-2 border-b-3 border-r-2 border-[#FBCFE8] shadow-md flex flex-col items-center justify-center relative cursor-pointer active:scale-95 transition-all overflow-hidden ${animClass}`}
                      style={{
                        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.6), 0 4px 6px rgba(0,0,0,0.3)',
                      }}
                    >
                      <div className="w-full h-full flex flex-col items-center justify-center relative pointer-events-none">
                        <div className="w-4/5 h-2/5 rounded-t-lg bg-pink-300/40 border border-white/40 flex items-center justify-center">
                          <span className="text-xs filter drop-shadow">🛋️</span>
                        </div>
                        <div className="w-5/6 h-2/5 rounded-md bg-white/90 border border-pink-200 shadow-inner flex items-center justify-center -mt-0.5">
                          <span className="w-2.5 h-1 bg-pink-400/40 rounded-full" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Crate Obstacle */}
                  {tile.kind === 'obstacle' && tile.obstacle === 'crate' && (
                    <div
                      onClick={() => handleTileClickInternal(r, c)}
                      className={`w-full h-full rounded-2xl flex flex-col items-center justify-center relative cursor-pointer shadow-md border-2 transition-all active:scale-95 ${animClass} ${
                        (tile.hitPoints || 1) > 1
                          ? 'bg-gradient-to-br from-amber-800 to-amber-950 border-amber-600 shadow-amber-950'
                          : 'bg-gradient-to-br from-amber-600 to-amber-800 border-amber-400 shadow-amber-900'
                      }`}
                    >
                      <span className="text-xl sm:text-2xl filter drop-shadow pointer-events-none">📦</span>
                      {(tile.hitPoints || 1) > 1 && (
                        <span className="absolute bottom-1 right-1 px-1 rounded bg-black/70 text-[9px] font-black text-amber-300">
                          x2
                        </span>
                      )}
                    </div>
                  )}

                  {/* MULTI-TILE 2x2 LUXURY WARDROBE (衣柜) */}
                  {tile.kind === 'obstacle' && tile.obstacle === 'wardrobe' && (
                    <div
                      onClick={() => handleTileClickInternal(r, c)}
                      className={`w-full h-full ${getWardrobeRoundedClasses(tile.part)} bg-gradient-to-br from-amber-900 via-amber-950 to-stone-900 border-2 border-amber-600/90 shadow-2xl flex flex-col items-center justify-center relative cursor-pointer active:scale-95 transition-all overflow-hidden ${animClass}`}
                      style={{
                        boxShadow: 'inset 0 2px 4px rgba(251,191,36,0.3), 0 4px 8px rgba(0,0,0,0.6)',
                      }}
                    >
                      <div className="w-full h-full flex flex-col items-center justify-center relative pointer-events-none p-1">
                        {tile.part === 'tl' && (
                          <div className="flex flex-col items-center">
                            <span className="text-xl filter drop-shadow">👑</span>
                            <span className="text-[8px] font-black text-amber-300 uppercase tracking-tighter">WARDROBE</span>
                          </div>
                        )}
                        {tile.part === 'tr' && (
                          <div className="flex flex-col items-center">
                            <span className="text-2xl filter drop-shadow">🪞</span>
                          </div>
                        )}
                        {tile.part === 'bl' && (
                          <div className="flex flex-col items-center">
                            <span className="text-xl filter drop-shadow">🗄️</span>
                            <span className="text-[7px] font-black text-amber-400">BRASS</span>
                          </div>
                        )}
                        {tile.part === 'br' && (
                          <div className="flex flex-col items-center">
                            <span className="text-xl filter drop-shadow">🗝️</span>
                            <span className="text-[8px] font-black px-1 rounded bg-black/75 text-amber-300">
                              HP {tile.hitPoints || 1}
                            </span>
                          </div>
                        )}
                        {/* Progressive Cracking on Damage */}
                        {tile.hitPoints === 2 && (
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-70">
                            <svg className="w-full h-full stroke-amber-300 fill-none stroke-[2]" viewBox="0 0 100 100">
                              <path d="M 20 10 L 45 40 L 35 60 L 60 90 M 45 40 L 75 30" />
                            </svg>
                          </div>
                        )}
                        {tile.hitPoints === 1 && (
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-90">
                            <svg className="w-full h-full stroke-rose-400 fill-none stroke-[2.5]" viewBox="0 0 100 100">
                              <path d="M 10 20 L 50 50 L 30 75 L 85 95 M 50 50 L 90 25 M 50 50 L 55 90 M 20 80 L 60 70" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* MULTI-HIT STEEL SAFE (保险箱) */}
                  {tile.kind === 'obstacle' && tile.obstacle === 'safe' && (
                    <div
                      onClick={() => handleTileClickInternal(r, c)}
                      className={`w-full h-full rounded-2xl flex flex-col items-center justify-center relative cursor-pointer shadow-xl border-2 border-cyan-400/80 transition-all active:scale-95 bg-gradient-to-br from-slate-700 via-slate-800 to-zinc-950 ${animClass}`}
                      style={{
                        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.4), 0 4px 8px rgba(0,0,0,0.6)',
                      }}
                    >
                      <div className="flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl sm:text-2xl filter drop-shadow">
                          {(tile.hitPoints || 2) > 1 ? '🔐' : '💎'}
                        </span>
                        <span className="text-[9px] font-black uppercase text-cyan-300 -mt-0.5">
                          {(tile.hitPoints || 2) > 1 ? 'SAFE (2)' : 'CRACKED!'}
                        </span>
                      </div>
                      {tile.hitPoints === 1 && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-85">
                          <svg className="w-full h-full stroke-cyan-200 fill-none stroke-[2]" viewBox="0 0 100 100">
                            <path d="M 20 15 L 50 50 L 80 85 M 50 50 L 85 30 M 50 50 L 25 80" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SPREADING HAZARD: Salon Bubble Foam (泡沫) */}
                  {tile.kind === 'obstacle' && tile.obstacle === 'foam' && (
                    <div
                      onClick={() => handleTileClickInternal(r, c)}
                      className={`w-full h-full rounded-2xl bg-gradient-to-tr from-pink-300 via-purple-300 to-indigo-200 border-2 border-white shadow-xl flex flex-col items-center justify-center relative cursor-pointer active:scale-95 transition-all overflow-hidden animate-bubble-glimmer ${animClass}`}
                      style={{
                        boxShadow: '0 4px 12px rgba(236,72,153,0.35), inset 0 2px 5px rgba(255,255,255,0.85)',
                      }}
                    >
                      {/* Bubbly texture & reflections */}
                      <div className="absolute inset-0 bg-white/20 rounded-2xl pointer-events-none" />
                      <div className="absolute top-1 left-2 w-3 h-3 rounded-full bg-white/60 blur-[0.5px] pointer-events-none" />
                      <div className="absolute bottom-1 right-2 w-2 h-2 rounded-full bg-white/50 blur-[0.5px] pointer-events-none" />
                      
                      <div className="flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl sm:text-3xl filter drop-shadow animate-pulse">
                          🫧
                        </span>
                        <span className="text-[8px] font-black uppercase text-purple-950 tracking-wider -mt-1 bg-white/60 px-1 rounded-full">
                          FOAM
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Drop Item (Lipstick) */}
                  {tile.kind === 'obstacle' && tile.obstacle === 'drop_item' && (
                    <div
                      onClick={() => handleTileClickInternal(r, c)}
                      className={`w-full h-full rounded-2xl bg-rose-500/20 border-2 border-rose-400/60 shadow-lg flex items-center justify-center relative animate-pulse cursor-pointer ${animClass}`}
                    >
                      <div className="flex flex-col items-center pointer-events-none">
                        <span className="text-2xl sm:text-3xl filter drop-shadow">💄</span>
                        <span className="text-[8px] font-black uppercase text-pink-300">DROP ↓</span>
                      </div>
                    </div>
                  )}

                  {/* BOOSTER: Barber-Pole Firecracker Rocket */}
                  {tile.kind === 'booster' && (tile.booster === 'firecracker_h' || tile.booster === 'firecracker_v') && (
                    <button
                      disabled={disabled}
                      onClick={() => handleTileClickInternal(r, c)}
                      className={`w-full h-full rounded-2xl border-2 border-amber-200 shadow-xl flex items-center justify-center relative cursor-pointer hover:scale-105 active:scale-90 transition-all overflow-hidden ${animClass} ${
                        tile.hasAdjacentBooster ? 'animate-booster-magnetic ring-4 ring-amber-300/90' : ''
                      }`}
                      style={{
                        background: 'repeating-linear-gradient(45deg, #EF4444, #EF4444 6px, #FBBF24 6px, #FBBF24 12px, #3B82F6 12px, #3B82F6 18px)',
                        boxShadow: '0 0 15px rgba(251, 191, 36, 0.8), inset 0 2px 4px rgba(255,255,255,0.7)',
                      }}
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-950/80 border border-white flex items-center justify-center shadow-lg pointer-events-none">
                        <span className={`text-sm transform ${tile.booster === 'firecracker_h' ? 'rotate-90' : 'rotate-0'}`}>
                          🧨
                        </span>
                      </div>
                      <span className="absolute bottom-0.5 px-1 rounded bg-black/80 text-[8px] font-black text-amber-300 uppercase pointer-events-none">
                        {tile.booster === 'firecracker_h' ? 'ROW' : 'COL'}
                      </span>
                      {tile.hasAdjacentBooster && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black flex items-center justify-center shadow-lg border border-white animate-spin">
                          ⚡
                        </span>
                      )}
                    </button>
                  )}

                  {/* BOOSTER: Cartoon Star Bomb */}
                  {tile.kind === 'booster' && tile.booster === 'bomb' && (
                    <button
                      disabled={disabled}
                      onClick={() => handleTileClickInternal(r, c)}
                      className={`w-full h-full rounded-2xl bg-gradient-to-br from-zinc-800 via-zinc-950 to-black border-2 border-amber-400 shadow-xl flex items-center justify-center relative cursor-pointer hover:scale-105 active:scale-90 transition-all animate-pulse ${animClass} ${
                        tile.hasAdjacentBooster ? 'animate-booster-magnetic ring-4 ring-amber-300/90' : ''
                      }`}
                      style={{
                        boxShadow: '0 0 16px rgba(239, 68, 68, 0.8), inset 0 2px 4px rgba(255,255,255,0.4)',
                      }}
                    >
                      <span className="text-2xl sm:text-3xl filter drop-shadow pointer-events-none">💣</span>
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                      {tile.hasAdjacentBooster && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black flex items-center justify-center shadow-lg border border-white animate-spin">
                          ⚡
                        </span>
                      )}
                    </button>
                  )}

                  {/* BOOSTER: Disco Propeller */}
                  {tile.kind === 'booster' && tile.booster === 'disco' && (
                    <button
                      disabled={disabled}
                      onClick={() => handleTileClickInternal(r, c)}
                      className={`w-full h-full rounded-2xl bg-gradient-to-tr from-pink-500 via-indigo-500 to-amber-300 border-2 border-white shadow-xl flex items-center justify-center relative cursor-pointer hover:scale-105 active:scale-90 transition-all ${animClass} ${
                        tile.hasAdjacentBooster ? 'animate-booster-magnetic ring-4 ring-amber-300/90' : ''
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl filter drop-shadow pointer-events-none">🪩</span>
                      {tile.hasAdjacentBooster && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black flex items-center justify-center shadow-lg border border-white animate-spin">
                          ⚡
                        </span>
                      )}
                    </button>
                  )}

                  {/* NORMAL COLORED CUBE */}
                  {tile.kind === 'color' && (
                    <button
                      disabled={disabled}
                      onClick={() => handleTileClickInternal(r, c)}
                      className={`w-full h-full rounded-2xl border-t-2 border-l-2 border-b-4 border-r-2 ${getColorClasses(tile.color)} flex items-center justify-center relative cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95 active:border-b-2 shadow-inner ${animClass} ${
                        selectedSwapTile && selectedSwapTile.row === r && selectedSwapTile.col === c ? 'ring-4 ring-yellow-400 animate-bounce' : ''
                      }`}
                      style={{
                        boxShadow: 'inset 0 3px 4px rgba(255,255,255,0.5), inset 0 -3px 4px rgba(0,0,0,0.3)',
                      }}
                    >
                      {/* Glossy highlight */}
                      <div className="absolute top-1 left-1.5 right-1.5 h-1/3 bg-white/30 rounded-t-xl pointer-events-none" />

                      {/* Embossed icon */}
                      <span className="text-base sm:text-lg filter drop-shadow select-none pointer-events-none">
                        {getColorIcon(tile.color)}
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
                  )}
                </div>
              );
            })}
          </div>

          {/* 3. Particle Explosion Overlay */}
          {particles.map(p => (
            <div
              key={p.id}
              className="absolute rounded-full pointer-events-none z-30 transition-all duration-300 ease-out"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                boxShadow: `0 0 10px ${p.color}`,
                transform: `translate(${p.vx}px, ${p.vy}px) scale(0)`,
                opacity: 0,
              }}
            />
          ))}

          {/* 4. Barber-Pole Rocket Laser Sweeper Overlay */}
          {rocketBeams.map(beam => {
            if (beam.orientation === 'h') {
              return (
                <div
                  key={beam.id}
                  className="absolute left-0 right-0 z-40 pointer-events-none animate-laser-beam"
                  style={{
                    top: `${(beam.index / rows) * 100}%`,
                    height: `${(1 / rows) * 100}%`,
                    background: 'linear-gradient(90deg, rgba(239,68,68,0.9), rgba(251,191,36,1), rgba(59,130,246,0.9))',
                    boxShadow: '0 0 20px rgba(251,191,36,0.9), 0 0 40px rgba(239,68,68,0.8)',
                  }}
                >
                  {/* Left-flying and Right-flying Rocket Heads */}
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 text-2xl -scale-x-100 filter drop-shadow">
                    🚀
                  </span>
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 text-2xl filter drop-shadow">
                    🚀
                  </span>
                </div>
              );
            } else {
              return (
                <div
                  key={beam.id}
                  className="absolute top-0 bottom-0 z-40 pointer-events-none animate-laser-beam"
                  style={{
                    left: `${(beam.index / cols) * 100}%`,
                    width: `${(1 / cols) * 100}%`,
                    background: 'linear-gradient(180deg, rgba(239,68,68,0.9), rgba(251,191,36,1), rgba(59,130,246,0.9))',
                    boxShadow: '0 0 20px rgba(251,191,36,0.9), 0 0 40px rgba(239,68,68,0.8)',
                  }}
                >
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 text-2xl -rotate-90 filter drop-shadow">
                    🚀
                  </span>
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-2xl rotate-90 filter drop-shadow">
                    🚀
                  </span>
                </div>
              );
            }
          })}

          {/* 5. Cartoon Star Bomb Shockwave Overlay */}
          {bombShockwaves.map(sw => (
            <div
              key={sw.id}
              className="absolute rounded-full border-4 border-amber-400 bg-amber-400/25 pointer-events-none z-40 animate-shockwave"
              style={{
                left: `${((sw.col - 1) / cols) * 100}%`,
                top: `${((sw.row - 1) / rows) * 100}%`,
                width: `${(3 / cols) * 100}%`,
                height: `${(3 / rows) * 100}%`,
              }}
            />
          ))}

          {/* 6. Booster Mega Fusion Orb */}
          {activeMerge && (
            <div
              className="absolute z-50 pointer-events-none flex items-center justify-center animate-mega-fusion"
              style={{
                left: `${(activeMerge.toCol / cols) * 100}%`,
                top: `${(activeMerge.toRow / rows) * 100}%`,
                width: `${100 / cols}%`,
                height: `${100 / rows}%`,
              }}
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 flex items-center justify-center text-3xl shadow-[0_0_35px_rgba(245,158,11,1)] border-2 border-white animate-spin">
                ⚡
              </div>
            </div>
          )}

          {/* 7. Floating Score / Combo Popups */}
          {scorePopups.map(popup => (
            <div
              key={popup.id}
              className="absolute z-50 pointer-events-none font-black text-sm sm:text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] animate-score-float whitespace-nowrap"
              style={{
                left: `${popup.x}%`,
                top: `${popup.y}%`,
                color: popup.color,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {popup.text}
            </div>
          ))}

          {/* 8. Foam Spreading Expansion Animation */}
          {foamSpreadAnimation && (
            <div
              key={foamSpreadAnimation.id}
              className="absolute z-40 pointer-events-none flex items-center justify-center animate-foam-expand"
              style={{
                left: `${(foamSpreadAnimation.toCol / cols) * 100}%`,
                top: `${(foamSpreadAnimation.toRow / rows) * 100}%`,
                width: `${100 / cols}%`,
                height: `${100 / rows}%`,
              }}
            >
              <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-pink-300 via-purple-300 to-indigo-200 border-2 border-white shadow-[0_0_20px_rgba(236,72,153,0.8)] flex items-center justify-center text-3xl">
                🫧
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Authentic Beauty Blast Bottom Power-Up Bar */}
      <footer className="w-full max-w-sm mx-auto flex items-center justify-between px-2 py-2 z-20">
        {/* Hammer Tool (Smash) */}
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

        {/* Swap Hand Tool */}
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

        {/* Bomb Tool */}
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

        {/* Firecracker Tool */}
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
