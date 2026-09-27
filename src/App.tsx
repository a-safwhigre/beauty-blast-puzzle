import { useState, useEffect, useCallback, useRef } from 'react';
import { LevelConfig, Tile, GameStatus, ActiveTool, RocketBeam, Shockwave } from './types/game';
import { HANDCRAFTED_LEVELS, generateProceduralLevel } from './levels/levelData';
import {
  initializeBoard,
  handleTileClick,
  checkObjectivesMet,
  checkHasValidMoves,
  checkTileCanPop,
  shuffleBoard,
  applyHammerTool,
  applySwapTool,
} from './engine/puzzleEngine';
import { sound } from './engine/soundEngine';
import { TopBar } from './components/TopBar';
import { GameBoard } from './components/GameBoard';
import { GameOverModal } from './components/GameOverModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { HowToPlayModal } from './components/HowToPlayModal';

interface FlyingCollectibleItem {
  id: string;
  currentX: number;
  currentY: number;
  icon: string;
}

export function App() {
  // Persistence
  const [highestUnlockedLevel, setHighestUnlockedLevel] = useState<number>(() => {
    const saved = localStorage.getItem('beauty_blast_unlocked');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [completedStars, setCompletedStars] = useState<{ [key: number]: number }>(() => {
    const saved = localStorage.getItem('beauty_blast_stars');
    return saved ? JSON.parse(saved) : {};
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem('beauty_blast_muted') === 'true';
  });

  // Gameplay State
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(() => HANDCRAFTED_LEVELS[0]);
  const [grid, setGrid] = useState<Tile[][]>(() => initializeBoard(HANDCRAFTED_LEVELS[0]));
  const [movesLeft, setMovesLeft] = useState<number>(HANDCRAFTED_LEVELS[0].moves);
  const [score, setScore] = useState<number>(0);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [firstSwapCoord, setFirstSwapCoord] = useState<{ row: number; col: number } | null>(null);

  // Multi-Phase Animation & Physics State
  const [isBoardLocked, setIsBoardLocked] = useState<boolean>(false);
  const [blastingCoords, setBlastingCoords] = useState<Set<string>>(new Set());
  const [wigglingCoord, setWigglingCoord] = useState<string | null>(null);
  const [damagedObstacleCoords, setDamagedObstacleCoords] = useState<Set<string>>(new Set());
  const [rocketBeams, setRocketBeams] = useState<RocketBeam[]>([]);
  const [bombShockwaves, setBombShockwaves] = useState<Shockwave[]>([]);
  const [isGoalBumping, setIsGoalBumping] = useState<boolean>(false);
  const [flyingCollectibles, setFlyingCollectibles] = useState<FlyingCollectibleItem[]>([]);

  // Modals
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  const feverTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    sound.isMuted = isMuted;
    localStorage.setItem('beauty_blast_muted', String(isMuted));
  }, [isMuted]);

  const saveProgress = useCallback((levelId: number, starsEarned: number) => {
    setCompletedStars(prev => {
      const updated = { ...prev, [levelId]: Math.max(prev[levelId] || 0, starsEarned) };
      localStorage.setItem('beauty_blast_stars', JSON.stringify(updated));
      return updated;
    });

    if (levelId >= highestUnlockedLevel && levelId < HANDCRAFTED_LEVELS.length) {
      const nextUnlocked = levelId + 1;
      setHighestUnlockedLevel(nextUnlocked);
      localStorage.setItem('beauty_blast_unlocked', String(nextUnlocked));
    }
  }, [highestUnlockedLevel]);

  const loadLevel = useCallback((levelConfig: LevelConfig) => {
    if (feverTimeoutRef.current) clearTimeout(feverTimeoutRef.current);
    setCurrentLevel(levelConfig);
    setGrid(initializeBoard(levelConfig));
    setMovesLeft(levelConfig.moves);
    setScore(0);
    setStatus('playing');
    setIsShuffling(false);
    setIsBoardLocked(false);
    setBlastingCoords(new Set());
    setWigglingCoord(null);
    setDamagedObstacleCoords(new Set());
    setRocketBeams([]);
    setBombShockwaves([]);
    setFlyingCollectibles([]);
    setIsGoalBumping(false);
    setActiveTool(null);
    setFirstSwapCoord(null);
  }, []);

  const onTileClick = (row: number, col: number) => {
    if (status !== 'playing' || isShuffling || isBoardLocked) return;

    // Handle Active Power-Up Tools
    if (activeTool === 'hammer') {
      const clearedObjs: { [key: string]: number } = {};
      const newGrid = applyHammerTool(grid, row, col, currentLevel.colors, clearedObjs);
      const updatedObjectives = currentLevel.objectives.map(obj => {
        if (obj.type === 'armchair') {
          let remainingOnGrid = 0;
          for (let r = 0; r < newGrid.length; r++) {
            for (let c = 0; c < newGrid[r].length; c++) {
              if (newGrid[r][c].kind === 'obstacle' && newGrid[r][c].obstacle === 'armchair') {
                remainingOnGrid++;
              }
            }
          }
          return {
            ...obj,
            current: Math.min(obj.target, Math.max(obj.current + (clearedObjs['armchair'] || 0), obj.target - remainingOnGrid)),
          };
        }
        return {
          ...obj,
          current: Math.min(obj.target, obj.current + (clearedObjs[obj.type] || 0)),
        };
      });

      setGrid(newGrid);
      setCurrentLevel(prev => ({ ...prev, objectives: updatedObjectives }));
      setActiveTool(null);
      if (checkObjectivesMet(updatedObjectives)) {
        triggerFeverMode(newGrid, movesLeft, score + 100);
      }
      return;
    }

    if (activeTool === 'swap') {
      if (!firstSwapCoord) {
        setFirstSwapCoord({ row, col });
        return;
      } else {
        const newGrid = applySwapTool(grid, firstSwapCoord.row, firstSwapCoord.col, row, col);
        setGrid(newGrid);
        setFirstSwapCoord(null);
        setActiveTool(null);
        return;
      }
    }

    if (activeTool === 'bomb') {
      const newGrid = grid.map(r => r.map(c => ({ ...c })));
      newGrid[row][col] = {
        ...newGrid[row][col],
        kind: 'booster',
        booster: 'bomb',
      };
      setGrid(newGrid);
      setActiveTool(null);
      return;
    }

    if (activeTool === 'firecracker') {
      const newGrid = grid.map(r => r.map(c => ({ ...c })));
      newGrid[row][col] = {
        ...newGrid[row][col],
        kind: 'booster',
        booster: Math.random() > 0.5 ? 'firecracker_h' : 'firecracker_v',
      };
      setGrid(newGrid);
      setActiveTool(null);
      return;
    }

    // Step 1: Check if the tile can pop
    if (!checkTileCanPop(grid, row, col)) {
      // Rejection feedback: single isolated cube cannot pop
      sound.playTileTapInvalid();
      setWigglingCoord(`${row},${col}`);
      setTimeout(() => setWigglingCoord(null), 280);
      return;
    }

    // Step 2: Valid move!
    const result = handleTileClick(grid, row, col, currentLevel.colors);
    if (!result) return;

    setIsBoardLocked(true);
    const nextMoves = movesLeft - 1;
    const nextScore = score + result.scoreGained;
    setMovesLeft(nextMoves);

    // Phase 1 (0ms - 200ms): Blast, Beams, Shockwaves, Armchair Wobble
    const blastKeys = new Set(result.blastedPositions.map(p => `${p.row},${p.col}`));
    const damagedKeys = new Set(result.damagedObstacles.map(p => `${p.row},${p.col}`));
    setBlastingCoords(blastKeys);
    setDamagedObstacleCoords(damagedKeys);

    if (result.rocketBeams && result.rocketBeams.length > 0) {
      setRocketBeams(result.rocketBeams.map((b, idx) => ({ ...b, id: `rb-${Date.now()}-${idx}` })));
    }
    if (result.bombShockwaves && result.bombShockwaves.length > 0) {
      setBombShockwaves(result.bombShockwaves.map((s, idx) => ({ ...s, id: `bs-${Date.now()}-${idx}` })));
    }

    // Spawn Flying Collectibles for destroyed armchairs
    const flyingItems: FlyingCollectibleItem[] = [];
    const goalEl = document.getElementById('goal-capsule');
    const goalRect = goalEl?.getBoundingClientRect();

    result.damagedObstacles.forEach((p, idx) => {
      const tileEl = document.getElementById(`tile-${p.row}-${p.col}`);
      if (tileEl && goalRect) {
        const tRect = tileEl.getBoundingClientRect();
        flyingItems.push({
          id: `fly-${Date.now()}-${idx}`,
          currentX: tRect.left + tRect.width / 2,
          currentY: tRect.top + tRect.height / 2,
          icon: '🛋️',
        });
      }
    });

    if (flyingItems.length > 0) {
      setFlyingCollectibles(flyingItems);
      // Trigger fly translation toward goal capsule on next frame
      requestAnimationFrame(() => {
        if (goalRect) {
          const targetX = goalRect.left + goalRect.width / 2;
          const targetY = goalRect.top + goalRect.height / 2;
          setFlyingCollectibles(prev =>
            prev.map(item => ({
              ...item,
              currentX: targetX,
              currentY: targetY,
            }))
          );
        }
      });
    }

    // Phase 2 (200ms - 450ms): Gravity Fall & Top Refill
    setTimeout(() => {
      setBlastingCoords(new Set());
      setDamagedObstacleCoords(new Set());
      setRocketBeams([]);
      setBombShockwaves([]);

      // Update grid with smoothly falling tiles
      setGrid(result.newGrid);
      sound.playSlideLanding();
    }, 200);

    // Phase 3 (450ms - 550ms): Flying Item Arrival & Goal Capsule Bump
    setTimeout(() => {
      setFlyingCollectibles([]);
      if (flyingItems.length > 0) {
        setIsGoalBumping(true);
        sound.playCollect();
        setTimeout(() => setIsGoalBumping(false), 240);
      }

      const updatedObjectives = currentLevel.objectives.map(obj => {
        if (obj.type === 'armchair') {
          let remainingOnGrid = 0;
          for (let r = 0; r < result.newGrid.length; r++) {
            for (let c = 0; c < result.newGrid[r].length; c++) {
              if (result.newGrid[r][c].kind === 'obstacle' && result.newGrid[r][c].obstacle === 'armchair') {
                remainingOnGrid++;
              }
            }
          }
          const cleared = result.clearedObjectives['armchair'] || 0;
          return {
            ...obj,
            current: Math.min(obj.target, Math.max(obj.current + cleared, obj.target - remainingOnGrid)),
          };
        }

        if (obj.type === 'crate') {
          let remainingOnGrid = 0;
          for (let r = 0; r < result.newGrid.length; r++) {
            for (let c = 0; c < result.newGrid[r].length; c++) {
              if (result.newGrid[r][c].kind === 'obstacle' && result.newGrid[r][c].obstacle === 'crate') {
                remainingOnGrid += result.newGrid[r][c].hitPoints || 1;
              }
            }
          }
          const cleared = result.clearedObjectives['crate'] || 0;
          return {
            ...obj,
            current: Math.min(obj.target, Math.max(obj.current + cleared, obj.target - remainingOnGrid)),
          };
        }

        const cleared = result.clearedObjectives[obj.type] || 0;
        return {
          ...obj,
          current: Math.min(obj.target, obj.current + cleared),
        };
      });

      setCurrentLevel(prev => ({
        ...prev,
        objectives: updatedObjectives,
      }));
      setScore(nextScore);

      const isWon = checkObjectivesMet(updatedObjectives);

      if (isWon) {
        triggerFeverMode(result.newGrid, nextMoves, nextScore);
        setIsBoardLocked(false);
        return;
      }

      if (nextMoves <= 0) {
        sound.playDefeat();
        setStatus('lost');
        setIsBoardLocked(false);
        return;
      }

      if (!checkHasValidMoves(result.newGrid)) {
        setIsShuffling(true);
        setTimeout(() => {
          setGrid(prev => shuffleBoard(prev, currentLevel.colors));
          setIsShuffling(false);
          setIsBoardLocked(false);
        }, 700);
      } else {
        setIsBoardLocked(false);
      }
    }, 450);
  };

  const triggerFeverMode = (_currentGrid: Tile[][], leftoverMoves: number, baseScore: number) => {
    setStatus('fever');
    sound.playVictory();

    if (leftoverMoves <= 0) {
      const starsEarned = calculateStars(baseScore, currentLevel.moves, 0);
      saveProgress(currentLevel.id, starsEarned);
      setStatus('won');
      return;
    }

    let movesToBurn = leftoverMoves;
    let runningScore = baseScore;

    const burnMove = () => {
      if (movesToBurn <= 0) {
        const starsEarned = calculateStars(runningScore, currentLevel.moves, leftoverMoves);
        saveProgress(currentLevel.id, starsEarned);
        setStatus('won');
        return;
      }

      movesToBurn--;
      setMovesLeft(movesToBurn);
      runningScore += 600;
      setScore(runningScore);
      sound.playRocket();

      feverTimeoutRef.current = setTimeout(burnMove, 220);
    };

    feverTimeoutRef.current = setTimeout(burnMove, 350);
  };

  const calculateStars = (_finalScore: number, totalMoves: number, leftoverMoves: number): number => {
    const ratio = leftoverMoves / totalMoves;
    if (ratio >= 0.4) return 3;
    if (ratio >= 0.15) return 2;
    return 1;
  };

  const stars = calculateStars(score, currentLevel.moves, movesLeft);
  const hasNextLevel = currentLevel.id < HANDCRAFTED_LEVELS.length;

  const onNextLevel = () => {
    const nextIdx = HANDCRAFTED_LEVELS.findIndex(l => l.id === currentLevel.id) + 1;
    if (nextIdx < HANDCRAFTED_LEVELS.length) {
      loadLevel(HANDCRAFTED_LEVELS[nextIdx]);
    } else {
      loadLevel(generateProceduralLevel(21, 'medium'));
    }
  };

  return (
    <div
      className="w-full h-[100dvh] flex flex-col justify-between text-white font-['Montserrat',sans-serif] overflow-hidden select-none touch-manipulation relative"
      style={{
        background: 'linear-gradient(180deg, #2D3E53 0%, #1E293B 40%, #151D28 100%)',
      }}
    >
      {/* Top Authentic Beauty Blast HUD */}
      <TopBar
        levelName={currentLevel.name}
        movesLeft={movesLeft}
        objectives={currentLevel.objectives}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(prev => !prev)}
        onRestart={() => loadLevel(currentLevel)}
        onOpenLevelSelect={() => setShowLevelSelect(true)}
        onOpenHowToPlay={() => setShowHowToPlay(true)}
        isGoalBumping={isGoalBumping}
      />

      {/* Shuffling Notification */}
      {isShuffling && (
        <div className="w-full flex items-center justify-center py-1 z-30">
          <div className="bg-amber-400 text-slate-950 font-black px-4 py-1 rounded-full text-xs animate-bounce shadow-xl">
            No moves left! Shuffling board...
          </div>
        </div>
      )}

      {/* Fever Mode Banner */}
      {status === 'fever' && (
        <div className="w-full flex items-center justify-center py-1 z-30">
          <div className="bg-gradient-to-r from-pink-500 via-amber-400 to-rose-500 text-white font-black px-6 py-1.5 rounded-full text-xs uppercase tracking-widest animate-pulse shadow-xl border border-white">
            🎉 BLAST FEVER! BONUS SCORE! 🎉
          </div>
        </div>
      )}

      {/* Authentic Beauty Blast Board & Power-up Dock */}
      <GameBoard
        grid={grid}
        onTileClick={onTileClick}
        disabled={status !== 'playing' || isShuffling || isBoardLocked}
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        onOpenSettings={() => setShowLevelSelect(true)}
        blastingCoords={blastingCoords}
        wigglingCoord={wigglingCoord}
        damagedObstacleCoords={damagedObstacleCoords}
        rocketBeams={rocketBeams}
        bombShockwaves={bombShockwaves}
      />

      {/* Floating Collectibles flying to TopBar Goal Capsule */}
      {flyingCollectibles.map(item => (
        <div
          key={item.id}
          className="fixed pointer-events-none z-50 transition-all duration-400 ease-out"
          style={{
            left: `${item.currentX}px`,
            top: `${item.currentY}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-9 h-9 rounded-full bg-pink-500/90 border-2 border-white shadow-2xl flex items-center justify-center text-lg animate-pulse">
            {item.icon}
          </div>
        </div>
      ))}

      {/* Modals */}
      {(status === 'won' || status === 'lost') && (
        <GameOverModal
          status={status}
          levelName={currentLevel.name}
          score={score}
          stars={stars}
          movesLeft={movesLeft}
          hasNextLevel={hasNextLevel}
          onNextLevel={onNextLevel}
          onRestart={() => loadLevel(currentLevel)}
          onOpenLevelSelect={() => setShowLevelSelect(true)}
        />
      )}

      {showLevelSelect && (
        <LevelSelectModal
          currentLevelId={currentLevel.id}
          highestUnlockedLevel={highestUnlockedLevel}
          completedStars={completedStars}
          onSelectHandcraftedLevel={levelId => {
            const selected = HANDCRAFTED_LEVELS.find(l => l.id === levelId);
            if (selected) loadLevel(selected);
          }}
          onSelectProceduralLevel={difficulty => {
            const nextId = HANDCRAFTED_LEVELS.length + Math.floor(Math.random() * 100);
            loadLevel(generateProceduralLevel(nextId, difficulty));
          }}
          onClose={() => setShowLevelSelect(false)}
        />
      )}

      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}
    </div>
  );
}

export default App;
