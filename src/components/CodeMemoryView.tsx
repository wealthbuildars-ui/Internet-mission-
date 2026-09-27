import React, { useState } from 'react';
import {
  Brain,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Eye,
  ChevronRight,
  Award,
} from 'lucide-react';
import { CodeMemoryChallenge, UserProgress, ValidationResult } from '../types';
import { CODE_MEMORY_CHALLENGES } from '../data/codeMemory';
import { sound } from '../utils/sound';

interface CodeMemoryViewProps {
  progress: { xp: number; completedCodeMemoryIds: string[] };
  onBackToMap: () => void;
  onCompleteDrill: (drillId: string, earnedXp: number) => void;
  onDeductXp: (amount: number) => void;
}

export const CodeMemoryView: React.FC<CodeMemoryViewProps> = ({
  progress,
  onBackToMap,
  onCompleteDrill,
  onDeductXp,
}) => {
  const [selectedDrillIndex, setSelectedDrillIndex] = useState(0);
  const currentDrill = CODE_MEMORY_CHALLENGES[selectedDrillIndex];

  const [code, setCode] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [hintLevel, setHintLevel] = useState<number>(0); // 0 = none, 1, 2, 3
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const isCompleted = progress.completedCodeMemoryIds.includes(currentDrill.id);

  const handleSelectDrill = (idx: number) => {
    sound.playClick();
    setSelectedDrillIndex(idx);
    setCode('');
    setValidation(null);
    setHintLevel(0);
  };

  const handleCheck = () => {
    const result = currentDrill.validate(code);
    setValidation(result);

    if (result.isCorrect) {
      sound.playSuccess();
      setIsSuccessModalOpen(true);
      onCompleteDrill(currentDrill.id, currentDrill.xpReward);
    } else {
      sound.playFail();
      if (progress.xp > 0 && result.xpPenalty) {
        onDeductXp(result.xpPenalty);
      }
    }
  };

  const cycleHint = () => {
    sound.playClick();
    setHintLevel((prev) => (prev >= 3 ? 1 : prev + 1));
  };

  const quickKeys = ['< >', '</ >', '<', '>', '/', '"', '=', 'h1', 'p', 'button', 'a', 'style'];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-5 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sound.playClick();
            onBackToMap();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Mission Map</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-950 border border-indigo-700 text-indigo-300 flex items-center gap-1">
            <Brain className="w-3.5 h-3.5 text-indigo-400" />
            <span>Code Memory Mode</span>
          </span>
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
            {progress.completedCodeMemoryIds.length}/{CODE_MEMORY_CHALLENGES.length} Drills Done
          </span>
        </div>
      </div>

      {/* Drill Carousel / Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CODE_MEMORY_CHALLENGES.map((drill, idx) => {
          const isDone = progress.completedCodeMemoryIds.includes(drill.id);
          const isCurrent = idx === selectedDrillIndex;

          return (
            <button
              key={drill.id}
              onClick={() => handleSelectDrill(idx)}
              className={`px-3 py-2 rounded-xl text-xs font-display font-bold shrink-0 flex items-center gap-2 transition-all border ${
                isCurrent
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-indigo-500/30'
                  : isDone
                  ? 'bg-slate-900/90 text-emerald-400 border-emerald-800 hover:border-emerald-600'
                  : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center">
                  {idx + 1}
                </span>
              )}
              <span>Drill {idx + 1}</span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded ${
                  drill.difficulty === 'Easy'
                    ? 'bg-emerald-950 text-emerald-300'
                    : drill.difficulty === 'Medium'
                    ? 'bg-amber-950 text-amber-300'
                    : 'bg-rose-950 text-rose-300'
                }`}
              >
                {drill.difficulty}
              </span>
            </button>
          );
        })}
      </div>

      {/* Challenge Card */}
      <div className="rounded-3xl bg-slate-900/95 border border-indigo-900/60 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
              {currentDrill.difficulty} Visual Recall
            </div>
            <h2 className="font-display font-bold text-xl text-white">
              {currentDrill.title}
            </h2>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold font-code bg-indigo-950/80 border border-indigo-700 text-indigo-300 flex items-center gap-1 self-start sm:self-center">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            +{currentDrill.xpReward} XP Reward
          </span>
        </div>

        {/* The Core Question: What code could create this? */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/40 mb-5">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Eye className="w-4 h-4 text-indigo-400" />
            <span>Target Visual Result: “{currentDrill.prompt}”</span>
          </div>

          {/* Rendered Live Visual Target Box */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center min-h-[100px] shadow-inner">
            <div
              dangerouslySetInnerHTML={{ __html: currentDrill.previewHtml }}
              className="transition-transform hover:scale-105"
            />
          </div>

          <div className="text-[11px] text-slate-400 mt-2 text-center">
            Objective: {currentDrill.targetDescription}
          </div>
        </div>

        {/* 3-Tier Hint Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={cycleHint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>
                {hintLevel === 0 ? 'Need a Hint?' : `Hint Level ${hintLevel} of 3`}
              </span>
            </button>

            {hintLevel > 0 && (
              <button
                onClick={() => setHintLevel(0)}
                className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                Hide Hint
              </button>
            )}
          </div>

          {hintLevel > 0 && (
            <div className="mt-2.5 p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-200 animate-in fade-in duration-150">
              <span className="font-bold text-indigo-300">
                Hint {hintLevel}:{' '}
              </span>
              <span>{currentDrill.hints[hintLevel - 1]}</span>
            </div>
          )}
        </div>

        {/* Feedback Alert if Run */}
        {validation && (
          <div
            className={`p-3.5 rounded-xl border mb-4 text-xs animate-in fade-in duration-150 flex items-start gap-2.5 ${
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
              <div className="font-bold uppercase tracking-wider text-[11px] mb-0.5">
                {validation.isCorrect ? '✅ Visual Matched!' : '❌ Visual Mismatch'}
              </div>
              <div>{validation.message}</div>
              <div className="text-[11px] opacity-85 mt-0.5">
                {validation.friendlyExplanation}
              </div>
              {validation.hint && (
                <div className="text-[11px] font-semibold mt-1 text-amber-300">
                  Clue: {validation.hint}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Code Input Box */}
        <div className="rounded-2xl border border-slate-800 bg-[#030712] overflow-hidden mb-3">
          <div className="px-3 py-1.5 bg-slate-950 border-b border-slate-900 text-[11px] text-slate-500 font-mono flex items-center justify-between">
            <span>Type the HTML code that creates the visual target above:</span>
            <button
              onClick={() => setCode('')}
              className="text-slate-500 hover:text-rose-400 transition-colors"
            >
              Clear
            </button>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="<!-- Type the code from memory -->"
            className="w-full bg-transparent text-slate-100 p-3 leading-6 resize-none outline-none font-code text-xs sm:text-sm min-h-[100px]"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />

          {/* Quick Keys */}
          <div className="flex items-center gap-1 px-2 py-1.5 bg-slate-950 border-t border-slate-900 overflow-x-auto scrollbar-none select-none">
            {quickKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setCode((prev) => prev + key)}
                className="shrink-0 px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 text-[11px] font-code"
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={() => setCode(currentDrill.starterCode)}
            className="px-3 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleCheck}
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-400 hover:from-indigo-300 hover:to-cyan-300 active:scale-95 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Check My Code</span>
          </button>
        </div>
      </div>
    </div>
  );
};
