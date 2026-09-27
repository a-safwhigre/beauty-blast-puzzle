import React from 'react';
import { Objective, ObjectiveType } from '../types/game';
import { Volume2, VolumeX, RotateCcw, ListFilter, HelpCircle, Star } from 'lucide-react';

interface TopBarProps {
  levelName: string;
  movesLeft: number;
  score: number;
  stars: number;
  objectives: Objective[];
  isMuted: boolean;
  onToggleMute: () => void;
  onRestart: () => void;
  onOpenLevelSelect: () => void;
  onOpenHowToPlay: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  levelName,
  movesLeft,
  score,
  stars,
  objectives,
  isMuted,
  onToggleMute,
  onRestart,
  onOpenLevelSelect,
  onOpenHowToPlay,
}) => {
  const getObjectiveVisual = (type: ObjectiveType) => {
    switch (type) {
      case 'pink':
        return <div className="w-5 h-5 rounded-md bg-[#FF4D8D] shadow-sm border border-white/40 flex items-center justify-center text-[10px]">💄</div>;
      case 'blue':
        return <div className="w-5 h-5 rounded-md bg-[#38BDF8] shadow-sm border border-white/40 flex items-center justify-center text-[10px]">💎</div>;
      case 'yellow':
        return <div className="w-5 h-5 rounded-md bg-[#FBBF24] shadow-sm border border-white/40 flex items-center justify-center text-[10px]">⭐</div>;
      case 'green':
        return <div className="w-5 h-5 rounded-md bg-[#34D399] shadow-sm border border-white/40 flex items-center justify-center text-[10px]">🍀</div>;
      case 'purple':
        return <div className="w-5 h-5 rounded-md bg-[#A855F7] shadow-sm border border-white/40 flex items-center justify-center text-[10px]">🔮</div>;
      case 'crate':
        return <div className="w-5 h-5 rounded-md bg-amber-700 border border-amber-900 shadow-sm flex items-center justify-center text-[10px]">📦</div>;
      case 'drop_item':
        return <div className="w-5 h-5 rounded-md bg-rose-500 border border-rose-700 shadow-sm flex items-center justify-center text-[10px]">💋</div>;
      case 'ice':
        return <div className="w-5 h-5 rounded-md bg-cyan-200 border border-cyan-400 shadow-sm flex items-center justify-center text-[10px]">❄️</div>;
      default:
        return null;
    }
  };

  const isLowMoves = movesLeft <= 5;

  return (
    <header className="w-full max-w-xl mx-auto px-3 pt-2 pb-1 flex flex-col gap-2 select-none">
      {/* Top action row */}
      <div className="flex items-center justify-between">
        <button
          onClick={onOpenLevelSelect}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all active:scale-95 shadow-md"
        >
          <ListFilter size={15} className="text-pink-400" />
          <span className="truncate max-w-[120px] sm:max-w-[180px]">{levelName}</span>
        </button>

        {/* Stars & Score */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 shadow-md">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3].map(s => (
              <Star
                key={s}
                size={14}
                className={s <= stars ? 'fill-amber-400 text-amber-400 drop-shadow' : 'text-slate-600'}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-amber-300 font-mono tracking-wide">{score}</span>
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenHowToPlay}
            title="How to play"
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all active:scale-90"
          >
            <HelpCircle size={17} />
          </button>
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all active:scale-90"
          >
            {isMuted ? <VolumeX size={17} className="text-rose-400" /> : <Volume2 size={17} className="text-emerald-400" />}
          </button>
          <button
            onClick={onRestart}
            title="Restart level"
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all active:scale-90"
          >
            <RotateCcw size={17} />
          </button>
        </div>
      </div>

      {/* Main HUD: Moves & Objectives */}
      <div className="flex items-center justify-between gap-2 bg-slate-800/90 backdrop-blur-md rounded-2xl p-2.5 border-2 border-slate-700/60 shadow-xl">
        {/* Moves Left Badge */}
        <div className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl min-w-[76px] transition-all shadow-inner border ${
          isLowMoves
            ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
            : 'bg-gradient-to-b from-pink-500 to-rose-600 border-pink-400/40 text-white'
        }`}>
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">Moves</span>
          <span className="text-2xl font-black font-['Outfit'] leading-none drop-shadow-md">{movesLeft}</span>
        </div>

        {/* Target Objectives Checklist */}
        <div className="flex-1 flex items-center justify-end gap-2 overflow-x-auto py-0.5 no-scrollbar">
          {objectives.map((obj, i) => {
            const isCompleted = obj.current >= obj.target;
            const remaining = Math.max(0, obj.target - obj.current);
            return (
              <div
                key={i}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all border ${
                  isCompleted
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900/60 border-slate-700/60 text-slate-200'
                }`}
              >
                {getObjectiveVisual(obj.type)}
                <span className="text-sm font-black font-['Outfit'] min-w-[16px] text-center">
                  {isCompleted ? '✓' : remaining}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
};
