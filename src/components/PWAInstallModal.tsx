import React from 'react';
import { Rocket, X, Smartphone, Zap, WifiOff, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/sound';

interface PWAInstallModalProps {
  isOpen: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onInstall,
  onDismiss,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-[#030712] border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/20 p-6 sm:p-7 text-center overflow-hidden">
        {/* Futuristic glowing backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-0 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onDismiss();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 transition-colors"
          title="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Rocket Badge */}
        <div className="relative mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/30 flex items-center justify-center">
          <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
            <Rocket className="w-8 h-8 text-cyan-400 animate-bounce" />
          </div>
        </div>

        {/* Header Title */}
        <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-wider bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
          🚀 INSTALL INTERNET MISSION
        </h2>

        {/* Subtitle / Description */}
        <p className="mt-2 text-sm text-slate-300 leading-relaxed font-medium">
          “Install the game on your phone and continue your coding missions anytime.”
        </p>

        {/* Key Features Pill Shelf */}
        <div className="mt-5 grid grid-cols-1 gap-2 text-left bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Standalone mobile game view without browser URL bars</span>
          </div>
          <div className="flex items-center gap-2.5">
            <WifiOff className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Play missions & practice code offline anytime</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Instant launch from your home screen</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              sound.playSuccess();
              onInstall();
            }}
            className="w-full py-3.5 px-5 rounded-2xl font-display font-black text-sm uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-lg shadow-cyan-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Rocket className="w-4 h-4 fill-current" />
            <span>INSTALL NOW</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onDismiss();
            }}
            className="w-full py-3.5 px-5 rounded-2xl font-display font-bold text-xs uppercase tracking-wider text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 active:scale-95 transition-all cursor-pointer"
          >
            MAYBE LATER
          </button>
        </div>

        {/* Offline indicator hint */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" />
          <span>Your XP, badges, and progress remain 100% saved locally</span>
        </div>
      </div>
    </div>
  );
};
