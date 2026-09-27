import React from 'react';
import { X, Sparkles, BookOpen } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border-4 border-slate-700 flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <BookOpen className="text-pink-400" size={20} />
            <h2 className="text-lg font-black font-['Outfit'] text-white">How To Play</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all active:scale-90"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-300">
          {/* Section 1: Basic Blast */}
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base">💄💎⭐</span>
              <h3 className="font-black text-white font-['Outfit'] text-sm">1. Tap to Blast</h3>
            </div>
            <p>Tap any group of 2 or more adjacent cubes of the same color to blast them! Cubes above will fall down and new ones fill in.</p>
          </div>

          {/* Section 2: Crafting Boosters */}
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-amber-400" size={16} />
              <h3 className="font-black text-white font-['Outfit'] text-sm">2. Crafting Boosters</h3>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-base leading-none">🚀</span>
                <div>
                  <strong className="text-amber-300">5–6 Cubes = Rocket:</strong> Clears an entire horizontal row or vertical column.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-base leading-none">💣</span>
                <div>
                  <strong className="text-rose-400">7–8 Cubes = Bomb:</strong> Explodes in a large 3x3 radius.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-base leading-none">🪩</span>
                <div>
                  <strong className="text-purple-400">9+ Cubes = Magic Mirror:</strong> Clears all cubes of the target color on the board.
                </div>
              </li>
            </ul>
          </div>

          {/* Section 3: Combos */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-950/60 to-slate-800/80 border border-purple-500/40">
            <h3 className="font-black text-white font-['Outfit'] text-sm mb-2">💥 Super Booster Combos</h3>
            <p className="mb-2">Tap any booster adjacent to another booster to unleash devastating synergy:</p>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between bg-black/30 p-1.5 rounded-lg">
                <span>🚀 + 🚀 (Rocket + Rocket)</span>
                <span className="font-bold text-amber-300">Cross (+) Clear</span>
              </div>
              <div className="flex items-center justify-between bg-black/30 p-1.5 rounded-lg">
                <span>🚀 + 💣 (Rocket + Bomb)</span>
                <span className="font-bold text-rose-300">3 Rows & 3 Columns</span>
              </div>
              <div className="flex items-center justify-between bg-black/30 p-1.5 rounded-lg">
                <span>💣 + 💣 (Bomb + Bomb)</span>
                <span className="font-bold text-orange-300">Giant 5x5 Blast</span>
              </div>
              <div className="flex items-center justify-between bg-black/30 p-1.5 rounded-lg">
                <span>🪩 + 🪩 (Disco + Disco)</span>
                <span className="font-black text-pink-300 animate-pulse">Entire Board Wipe!</span>
              </div>
            </div>
          </div>

          {/* Section 4: Obstacles */}
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
            <h3 className="font-black text-white font-['Outfit'] text-sm mb-2">📦 Obstacles & Objectives</h3>
            <ul className="space-y-1.5">
              <li>• <strong className="text-amber-300">Wooden Crates:</strong> Blast adjacent cubes to damage and break them open.</li>
              <li>• <strong className="text-cyan-300">Ice Cubes:</strong> Match the trapped color to shatter the ice coating.</li>
              <li>• <strong className="text-pink-300">Lipstick Drops:</strong> Blast cubes underneath them so gravity brings them down to the bottom row!</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs transition-all active:scale-95"
          >
            Got It, Let&apos;s Play!
          </button>
        </div>
      </div>
    </div>
  );
};
