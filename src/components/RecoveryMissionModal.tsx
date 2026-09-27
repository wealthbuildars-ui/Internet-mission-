import React, { useState } from 'react';
import { Brain, X, CheckCircle2, AlertTriangle, Play, RotateCcw, Sparkles } from 'lucide-react';
import { RecoveryMission, ValidationResult } from '../types';
import { CodeEditor } from './CodeEditor';
import { LivePreview } from './LivePreview';
import { sound } from '../utils/sound';

interface RecoveryMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  recoveryMission: RecoveryMission;
  onCompleteRecovery: (conceptKey: string, xpBonus: number) => void;
}

export const RecoveryMissionModal: React.FC<RecoveryMissionModalProps> = ({
  isOpen,
  onClose,
  recoveryMission,
  onCompleteRecovery,
}) => {
  const [code, setCode] = useState(recoveryMission.starterCode);
  const [renderedPreview, setRenderedPreview] = useState(recoveryMission.starterCode);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleRun = () => {
    setRenderedPreview(code);
    const res = recoveryMission.validate(code);
    setValidation(res);

    if (res.isCorrect) {
      sound.playSuccess();
      setIsSuccess(true);
      onCompleteRecovery(recoveryMission.conceptKey, recoveryMission.xpReward);
    } else {
      sound.playFail();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-indigo-700/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-indigo-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-700 text-indigo-400 flex items-center justify-center">
              <Brain className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-sm text-white">
                  🧠 RECOVERY MISSION
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 font-bold">
                  {recoveryMission.conceptName}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Targeted practice to conquer a detected weak area (+{recoveryMission.xpReward} XP)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Challenge Box */}
        <div className="p-4 bg-slate-950/80 border-b border-indigo-950 space-y-1 text-left">
          <div className="text-[10px] font-bold uppercase text-indigo-400">
            OBJECTIVE: {recoveryMission.objective}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-white">
            {recoveryMission.task}
          </div>
        </div>

        {/* Feedback Alert */}
        {validation && (
          <div
            className={`m-4 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              validation.isCorrect
                ? 'bg-emerald-950/70 border-emerald-600/70 text-emerald-200'
                : 'bg-rose-950/70 border-rose-600/70 text-rose-200'
            }`}
          >
            {validation.isCorrect ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-[11px] uppercase">
                {validation.isCorrect ? '✅ Weak Area Mastered!' : '❌ Not Quite Right'}
              </div>
              <div>{validation.friendlyExplanation || validation.message}</div>
            </div>
          </div>
        )}

        {/* Editor & Preview Split */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 flex-1 overflow-y-auto">
          <div className="space-y-2">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
              <span>Code Editor</span>
              <button
                onClick={() => setCode(recoveryMission.starterCode)}
                className="text-slate-500 hover:text-slate-300"
              >
                Reset
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="<!-- Type recovery solution here -->"
              className="w-full bg-[#030712] border border-slate-800 rounded-xl p-3 text-xs sm:text-sm font-code text-white outline-none focus:border-indigo-500 min-h-[140px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <div className="text-[11px] text-slate-400 font-semibold">Live Preview</div>
            <div className="h-[140px] rounded-xl border border-slate-800 overflow-hidden bg-slate-950 p-2">
              <iframe
                title="Recovery Preview"
                srcDoc={`<!DOCTYPE html><html><body style="font-family: sans-serif; color: white; padding: 10px; background: #0f172a;">${renderedPreview}</body></html>`}
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white"
          >
            {isSuccess ? 'Close' : 'Cancel Practice'}
          </button>

          {!isSuccess ? (
            <button
              onClick={handleRun}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Verify Recovery Code</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed! Return to Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
