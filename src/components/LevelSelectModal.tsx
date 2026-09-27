import React, { useState } from 'react';
import { HANDCRAFTED_LEVELS } from '../levels/levelData';
import { X, Star, Lock, Sparkles, Compass } from 'lucide-react';

interface LevelSelectModalProps {
  currentLevelId: number;
  highestUnlockedLevel: number;
  completedStars: { [key: number]: number };
  onSelectHandcraftedLevel: (levelId: number) => void;
  onSelectProceduralLevel: (difficulty: 'easy' | 'medium' | 'hard' | 'insane') => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  currentLevelId,
  highestUnlockedLevel,
  completedStars,
  onSelectHandcraftedLevel,
  onSelectProceduralLevel,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'levels' | 'endless'>('levels');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'insane'>('medium');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border-4 border-slate-700 flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Compass className="text-pink-400" size={22} />
            <h2 className="text-lg font-black font-['Outfit'] text-white">Select Puzzle</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all active:scale-90"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex p-2 bg-slate-950/40 gap-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('levels')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'levels'
                ? 'bg-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Story Levels (1-20)</span>
          </button>
          <button
            onClick={() => setActiveTab('endless')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'endless'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={14} className="text-yellow-300" />
            <span>Endless Generator</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeTab === 'levels' ? (
            <div className="grid grid-cols-4 gap-2.5">
              {HANDCRAFTED_LEVELS.map(lvl => {
                const isUnlocked = lvl.id <= highestUnlockedLevel;
                const isCurrent = lvl.id === currentLevelId;
                const stars = completedStars[lvl.id] || 0;

                return (
                  <button
                    key={lvl.id}
                    disabled={!isUnlocked}
                    onClick={() => {
                      onSelectHandcraftedLevel(lvl.id);
                      onClose();
                    }}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-1 relative border-2 transition-all duration-150 ${
                      isCurrent
                        ? 'bg-pink-500/20 border-pink-400 shadow-[0_0_12px_rgba(244,63,94,0.4)] scale-105'
                        : isUnlocked
                        ? 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700 hover:border-slate-500 active:scale-95'
                        : 'bg-slate-900/40 border-slate-800/40 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    {isUnlocked ? (
                      <>
                        <span className="text-base font-black font-['Outfit'] text-white">
                          {lvl.id}
                        </span>
                        <div className="flex gap-0.5 mt-1">
                          {[1, 2, 3].map(s => (
                            <Star
                              key={s}
                              size={8}
                              className={s <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <Lock size={16} className="text-slate-600" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-2">
              <div className="text-center">
                <h3 className="text-sm font-extrabold text-white">Infinite Procedural Generator</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enjoy infinite ad-free puzzles generated on-the-fly with randomized obstacles and guaranteed fairness!
                </p>
              </div>

              {/* Difficulty selector */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {(['easy', 'medium', 'hard', 'insane'] as const).map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`p-3 rounded-2xl border-2 text-left capitalize transition-all ${
                      selectedDifficulty === diff
                        ? 'bg-purple-600/30 border-purple-400 text-white shadow-md'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-xs font-black block font-['Outfit']">{diff}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {diff === 'easy' && '4 Colors • Light Obstacles'}
                      {diff === 'medium' && '5 Colors • Crates & Drops'}
                      {diff === 'hard' && 'Reinforced Crates • Ice Layers'}
                      {diff === 'insane' && 'Tight Moves • Heavy Obstacles'}
                    </span>
                  </button>
                ))}
              </div>

              {/* Start Generator Button */}
              <button
                onClick={() => {
                  onSelectProceduralLevel(selectedDifficulty);
                  onClose();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-purple-900/40 border border-purple-400/40 flex items-center justify-center gap-2 transition-all active:scale-95 mt-2"
              >
                <Sparkles size={16} />
                <span>Generate & Play {selectedDifficulty.toUpperCase()}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
