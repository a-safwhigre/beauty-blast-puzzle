import { useState, useEffect, useCallback, useRef } from 'react';
import { LevelConfig, Tile, GameStatus, ActiveTool } from './types/game';
import { HANDCRAFTED_LEVELS, generateProceduralLevel } from './levels/levelData';
import {
  initializeBoard,
  handleTileClick,
  checkObjectivesMet,
  checkHasValidMoves,
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
    setActiveTool(null);
    setFirstSwapCoord(null);
  }, []);

  const onTileClick = (row: number, col: number) => {
    if (status !== 'playing' || isShuffling) return;

    // Handle Active Power-Up Tools
    if (activeTool === 'hammer') {
      const clearedObjs: { [key: string]: number } = {};
      const newGrid = applyHammerTool(grid, row, col, currentLevel.colors, clearedObjs);
      const updatedObjectives = currentLevel.objectives.map(obj => ({
        ...obj,
        current: obj.current + (clearedObjs[obj.type] || 0),
      }));

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

    // Standard Blast / Match Tap
    const result = handleTileClick(grid, row, col, currentLevel.colors);
    if (!result) return;

    const nextMoves = movesLeft - 1;
    const nextScore = score + result.scoreGained;

    const updatedObjectives = currentLevel.objectives.map(obj => {
      const cleared = result.clearedObjectives[obj.type] || 0;
      return {
        ...obj,
        current: obj.current + cleared,
      };
    });

    const isWon = checkObjectivesMet(updatedObjectives);

    setCurrentLevel(prev => ({
      ...prev,
      objectives: updatedObjectives,
    }));
    setGrid(result.newGrid);
    setMovesLeft(nextMoves);
    setScore(nextScore);

    if (isWon) {
      triggerFeverMode(result.newGrid, nextMoves, nextScore);
      return;
    }

    if (nextMoves <= 0) {
      sound.playDefeat();
      setStatus('lost');
      return;
    }

    if (!checkHasValidMoves(result.newGrid)) {
      setIsShuffling(true);
      setTimeout(() => {
        setGrid(prev => shuffleBoard(prev, currentLevel.colors));
        setIsShuffling(false);
      }, 700);
    }
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
        disabled={status !== 'playing' || isShuffling}
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        onOpenSettings={() => setShowLevelSelect(true)}
      />

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
