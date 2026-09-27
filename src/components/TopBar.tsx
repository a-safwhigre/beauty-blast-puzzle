import React from 'react';
import { Objective, ObjectiveType } from '../types/game';
import { Volume2, VolumeX, RotateCcw, ListFilter, HelpCircle } from 'lucide-react';

interface TopBarProps {
  levelName: string;
  movesLeft: number;
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
  objectives,
  isMuted,
  onToggleMute,
  onRestart,
  onOpenLevelSelect,
  onOpenHowToPlay,
}) => {
  const getObjectiveVisual = (type: ObjectiveType) => {
    switch (type) {
      case 'armchair':
        return (
          <div className="w-8 h-8 flex items-center justify-center text-xl filter drop-shadow">
            🛋️
          </div>
        );
      case 'red':
        return <div className="w-6 h-6 rounded-lg bg-[#E11D48] flex items-center justify-center text-xs shadow-sm">❤️</div>;
      case 'yellow':
        return <div className="w-6 h-6 rounded-lg bg-[#F59E0B] flex items-center justify-center text-xs shadow-sm">⭐</div>;
      case 'blue':
        return <div className="w-6 h-6 rounded-lg bg-[#0284C7] flex items-center justify-center text-xs shadow-sm">👗</div>;
      case 'green':
        return <div className="w-6 h-6 rounded-lg bg-[#059669] flex items-center justify-center text-xs shadow-sm">🎀</div>;
      case 'cyan':
        return <div className="w-6 h-6 rounded-lg bg-[#06B6D4] flex items-center justify-center text-xs shadow-sm">✨</div>;
      case 'crate':
        return <div className="w-7 h-7 flex items-center justify-center text-base">📦</div>;
      case 'drop_item':
        return <div className="w-7 h-7 flex items-center justify-center text-base">💄</div>;
      case 'ice':
        return <div className="w-7 h-7 flex items-center justify-center text-base">❄️</div>;
      default:
        return null;
    }
  };

  return (
    <header className="w-full max-w-lg mx-auto px-3 pt-3 flex flex-col gap-1.5 select-none z-20">
      {/* Top micro toolbar */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={onOpenLevelSelect}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-xs font-black text-white shadow-md active:scale-95 transition-all"
        >
          <ListFilter size={13} className="text-pink-300" />
          <span className="truncate max-w-[140px] sm:max-w-[200px]">{levelName}</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenHowToPlay}
            title="How to play"
            className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white/90 flex items-center justify-center active:scale-90 transition-all shadow"
          >
            <HelpCircle size={14} />
          </button>
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white/90 flex items-center justify-center active:scale-90 transition-all shadow"
          >
            {isMuted ? <VolumeX size={14} className="text-rose-400" /> : <Volume2 size={14} className="text-emerald-400" />}
          </button>
          <button
            onClick={onRestart}
            title="Restart"
            className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white/90 flex items-center justify-center active:scale-90 transition-all shadow"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Iconic Beauty Blast HUD (Pug Mascot + Goal Pill + Moves Pill) */}
      <div className="flex items-center justify-between gap-2 px-1">
        {/* Left: Cute Pug Companion Avatar */}
        <div className="relative group cursor-pointer" onClick={onOpenLevelSelect}>
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white border-3 border-sky-400 shadow-xl overflow-hidden flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
            <span className="text-4xl sm:text-5xl filter drop-shadow select-none transform transition-transform group-hover:rotate-6">
              🐶
            </span>
          </div>
          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-pink-500 text-white text-[9px] font-black uppercase tracking-wider border border-white shadow">
            Fiona
          </span>
        </div>

        {/* Center: Glossy Goal Capsule (目标) */}
        <div className="flex-1 bg-white/95 rounded-3xl p-1 px-3 shadow-xl border-2 border-white flex flex-col items-center justify-center relative min-w-[130px]">
          <span className="text-[10px] uppercase font-black tracking-widest text-amber-500 -mt-0.5">
            GOAL • 目标
          </span>
          <div className="flex items-center gap-2 justify-center py-0.5">
            {objectives.map((obj, i) => {
              const isDone = obj.current >= obj.target;
              const remaining = Math.max(0, obj.target - obj.current);
              return (
                <div key={i} className="flex items-center gap-1.5">
                  {getObjectiveVisual(obj.type)}
                  <span className={`text-xl sm:text-2xl font-black font-['Outfit'] leading-none ${
                    isDone ? 'text-emerald-500' : 'text-slate-800'
                  }`}>
                    {isDone ? '✓' : remaining}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Glossy Moves Capsule (步数) */}
        <div className={`bg-white/95 rounded-3xl p-1 px-4 shadow-xl border-2 flex flex-col items-center justify-center min-w-[95px] transition-all ${
          movesLeft <= 5 ? 'border-rose-400 animate-pulse' : 'border-white'
        }`}>
          <span className="text-[10px] uppercase font-black tracking-widest text-amber-500 -mt-0.5">
            MOVES • 步数
          </span>
          <div className="flex items-center gap-1.5 py-0.5">
            <span className="text-sky-500 text-lg font-black font-mono">⇄</span>
            <span className={`text-2xl sm:text-3xl font-black font-['Outfit'] leading-none ${
              movesLeft <= 5 ? 'text-rose-600' : 'text-slate-900'
            }`}>
              {movesLeft}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
