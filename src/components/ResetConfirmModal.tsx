import React from 'react';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';
import { sound } from '../utils/sound';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-400 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="font-display font-bold text-lg text-white">
            Reset All Progress?
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            This will clear all completed missions, reset your XP to 0, and start you back at Mission 1.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              sound.playFail();
              onConfirmReset();
              onClose();
            }}
            className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-lg shadow-rose-600/30"
          >
            Reset Progress
          </button>
        </div>
      </div>
    </div>
  );
};
