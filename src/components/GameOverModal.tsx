import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Frown, RotateCcw, ArrowRight, Star, ListFilter } from 'lucide-react';

interface GameOverModalProps {
  status: 'won' | 'lost';
  levelName: string;
  score: number;
  stars: number;
  movesLeft: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRestart: () => void;
  onOpenLevelSelect: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  status,
  levelName,
  score,
  stars,
  movesLeft,
  hasNextLevel,
  onNextLevel,
  onRestart,
  onOpenLevelSelect,
}) => {
  const isWon = status === 'won';

  useEffect(() => {
    if (isWon) {
      // Fire confetti bursts
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FF4D8D', '#38BDF8', '#FBBF24', '#34D399', '#A855F7'],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FF4D8D', '#38BDF8', '#FBBF24', '#34D399', '#A855F7'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isWon]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-4 border-slate-700 p-6 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
        {/* Glow Header */}
        <div
          className={`absolute -top-16 inset-x-0 h-32 blur-3xl opacity-40 pointer-events-none ${
            isWon ? 'bg-amber-400' : 'bg-rose-500'
          }`}
        />

        {/* Icon & Title */}
        {isWon ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/40 mb-3 animate-bounce">
              <Trophy size={36} className="text-slate-950" />
            </div>
            <h2 className="text-2xl font-black font-['Outfit'] text-white">Level Cleared!</h2>
            <p className="text-xs font-semibold text-slate-400 mt-1">{levelName}</p>

            {/* Stars */}
            <div className="flex items-center justify-center gap-3 my-4">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className={`transform transition-all duration-300 ${
                    s <= stars
                      ? 'scale-110 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                      : 'opacity-30 scale-90'
                  }`}
                >
                  <Star
                    size={36}
                    className={s <= stars ? 'fill-amber-400 text-amber-300' : 'text-slate-600'}
                  />
                </div>
              ))}
            </div>

            {/* Score & Stats */}
            <div className="w-full bg-slate-800/80 rounded-2xl p-3 border border-slate-700/80 my-2 flex justify-around">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Moves Saved</span>
                <span className="text-lg font-black text-pink-400 font-['Outfit']">+{movesLeft}</span>
              </div>
              <div className="border-r border-slate-700" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Score</span>
                <span className="text-lg font-black text-amber-300 font-mono">{score}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full flex flex-col gap-2 mt-4">
              {hasNextLevel ? (
                <button
                  onClick={onNextLevel}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold text-base shadow-lg shadow-pink-600/40 border border-pink-400/40 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span>Next Level</span>
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  onClick={onRestart}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-extrabold text-base shadow-lg shadow-pink-600/40 flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} />
                  <span>Play Again</span>
                </button>
              )}

              <div className="flex gap-2">
                <button
                  onClick={onRestart}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <RotateCcw size={14} />
                  <span>Replay</span>
                </button>
                <button
                  onClick={onOpenLevelSelect}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <ListFilter size={14} />
                  <span>Levels</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-400 flex items-center justify-center shadow-lg shadow-rose-600/40 mb-3 animate-pulse">
              <Frown size={36} className="text-white" />
            </div>
            <h2 className="text-2xl font-black font-['Outfit'] text-white">Out of Moves!</h2>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xs">
              Don&apos;t give up! Try matching groups of 5+ cubes to craft rockets and bombs that wipe out obstacles.
            </p>

            <div className="w-full bg-slate-800/80 rounded-2xl p-3 border border-slate-700/80 my-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Score Achieved</span>
              <span className="text-lg font-black text-amber-300 font-mono">{score}</span>
            </div>

            {/* Actions */}
            <div className="w-full flex flex-col gap-2">
              <button
                onClick={onRestart}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold text-base shadow-lg shadow-pink-600/40 border border-pink-400/40 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <RotateCcw size={18} />
                <span>Try Again</span>
              </button>
              <button
                onClick={onOpenLevelSelect}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <ListFilter size={14} />
                <span>Select Level</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
