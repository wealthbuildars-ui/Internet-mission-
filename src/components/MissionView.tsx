import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Lightbulb,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Brain,
  HelpCircle,
  Eye,
  Code2,
  ChevronRight,
  Bot,
  Zap,
  BookOpen,
  Target,
  FileCode,
  RotateCcw,
  Check,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp,
  Play,
  MousePointer,
} from 'lucide-react';
import {
  Mission,
  MissionCode,
  ValidationResult,
  MistakeCategory,
  CodeLanguage,
} from '../types';
import { CodeEditor } from './CodeEditor';
import { LivePreview } from './LivePreview';
import { AITutorModal } from './AITutorModal';
import { MissionCompleteModal } from './MissionCompleteModal';
import { SECTIONS } from '../data/sections';
import { normalizeMissionCode } from '../utils/domValidator';
import { sound } from '../utils/sound';

interface MissionViewProps {
  mission: Mission;
  progress: {
    xp: number;
    codeSnippets: Record<string, string>;
    commonMistakes?: Record<string, number>;
    weakAreas?: Record<string, number>;
    completedMissionIds?: string[];
  };
  onBackToDashboard: () => void;
  onCompleteMission: (
    missionId: string,
    earnedXp: number,
    nextMissionId?: string,
    wasMistakeFixed?: boolean
  ) => void;
  onDeductXp: (amount: number) => void;
  onRecordMistake: (category: MistakeCategory) => void;
  onSaveCodeSnippet: (missionId: string, code: string) => void;
  onTakeAssessment?: (sectionId: any) => void;
  allMissions: Mission[];
}

export const MissionView: React.FC<MissionViewProps> = ({
  mission,
  progress,
  onBackToDashboard,
  onCompleteMission,
  onDeductXp,
  onRecordMistake,
  onSaveCodeSnippet,
  onTakeAssessment,
  allMissions,
}) => {
  // Determine available languages for this mission (default to html)
  const availableLanguages: CodeLanguage[] =
    mission.languages && mission.languages.length > 0
      ? mission.languages
      : ['html'];

  // Load starter code or stored progress code
  const initialCode: MissionCode = normalizeMissionCode(
    progress.codeSnippets[mission.id] || mission.starterCode
  );

  const [code, setCode] = useState<MissionCode>(initialCode);
  const [renderedPreviewCode, setRenderedPreviewCode] = useState<MissionCode>(initialCode);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [hasAttemptedAndFailed, setHasAttemptedAndFailed] = useState<boolean>(false);
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'editor' | 'preview'>('editor');
  const [hintLevel, setHintLevel] = useState<number>(0); // 0 = closed, 1 = small clue, 2 = concept, 3 = example
  const [earnedBonusXp, setEarnedBonusXp] = useState<number>(0);
  const [isTeachExpanded, setIsTeachExpanded] = useState<boolean>(() => {
    return !!(mission.teachBreakdown && mission.teachBreakdown.length > 0);
  });
  const [demoState, setDemoState] = useState<'original' | 'clicked'>('original');

  // Sync state whenever active mission changes
  useEffect(() => {
    const freshCode: MissionCode = normalizeMissionCode(
      progress.codeSnippets[mission.id] || mission.starterCode
    );
    setCode(freshCode);
    setRenderedPreviewCode(freshCode);
    setValidation(null);
    setIsValidating(false);
    setHasAttemptedAndFailed(false);
    setIsCompleteModalOpen(false);
    setActiveMobileTab('editor');
    setHintLevel(0);
    setEarnedBonusXp(0);
    setIsTeachExpanded(!!(mission.teachBreakdown && mission.teachBreakdown.length > 0));
    setDemoState('original');
  }, [mission.id]);

  const handleCodeChange = (newCode: MissionCode) => {
    setCode(newCode);
    // Persist as JSON string to preserve all language tabs
    onSaveCodeSnippet(mission.id, JSON.stringify(newCode));
  };

  const handleRunCode = async () => {
    setIsValidating(true);
    setRenderedPreviewCode(code);

    try {
      const validationInput =
        mission.languages && mission.languages.length > 1
          ? code
          : typeof code === 'string'
          ? code
          : code.html;
      const result = await mission.validate(validationInput);
      setValidation(result);

      if (result.isCorrect) {
        sound.playSuccess();

        // Check if learner fixed a previously failed mistake during this session
        let bonus = 0;
        const wasMistakeFixed = hasAttemptedAndFailed;
        if (wasMistakeFixed) {
          bonus = 20; // +20 XP bonus for fixing a mistake
        }
        setEarnedBonusXp(bonus);

        setIsCompleteModalOpen(true);
        const currentIndex = allMissions.findIndex((m) => m.id === mission.id);
        const nextMission = allMissions[currentIndex + 1];
        onCompleteMission(
          mission.id,
          mission.xpReward + bonus,
          nextMission?.id,
          wasMistakeFixed
        );
      } else {
        sound.playFail();
        setHasAttemptedAndFailed(true);

        if (result.mistakeCategory) {
          onRecordMistake(result.mistakeCategory);
        }

        if (result.xpPenalty && progress.xp > 0) {
          onDeductXp(result.xpPenalty);
        }
      }
    } catch (err) {
      console.error('Validation error:', err);
      setValidation({
        isCorrect: false,
        message: 'MISSION FAILED',
        friendlyExplanation: 'An error occurred during verification. Check your syntax and try again.',
        hint: 'Review your code structure.',
      });
      sound.playFail();
    } finally {
      setIsValidating(false);
    }
  };

  const handleResetCode = () => {
    const reset = normalizeMissionCode(mission.starterCode);
    setCode(reset);
    setRenderedPreviewCode(reset);
    setValidation(null);
    onSaveCodeSnippet(mission.id, JSON.stringify(reset));
  };

  const cycleHint = () => {
    sound.playClick();
    setHintLevel((prev) => (prev >= 3 ? 0 : prev + 1));
  };

  const currentSection =
    SECTIONS.find((s) => s.id === mission.sectionId) || SECTIONS[0];
  const sectionMissions = allMissions.filter((m) => m.sectionId === currentSection.id);
  const completedInSection = sectionMissions.filter((m) =>
    (progress.completedMissionIds || []).includes(m.id)
  ).length;
  const isMissionAlreadyCompleted = (progress.completedMissionIds || []).includes(mission.id);
  const currentIndex = allMissions.findIndex((m) => m.id === mission.id);
  const nextMission = allMissions[currentIndex + 1];
  const isLastMission = currentIndex === allMissions.length - 1;

  // Formatted mission number: MISSION 01
  const missionNumberFormatted = `MISSION ${mission.missionIndexInSection
    .toString()
    .padStart(2, '0')}`;

  const difficultyColor: Record<string, string> = {
    BEGINNER: 'bg-emerald-950/80 border-emerald-700 text-emerald-300',
    EASY: 'bg-teal-950/80 border-teal-700 text-teal-300',
    MEDIUM: 'bg-amber-950/80 border-amber-700 text-amber-300',
    HARD: 'bg-rose-950/80 border-rose-700 text-rose-300',
    PROJECT: 'bg-purple-950/80 border-purple-700 text-purple-300',
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* 2. LEARNING SCREEN HEADER */}
      <div className="rounded-3xl bg-slate-900/95 border border-cyan-900/60 p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          {/* Top Bar with Navigation & Metadata Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onBackToDashboard();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Mission Map</span>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              {/* Mission Type Badge */}
              {mission.type === 'memory' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-950/80 border border-amber-700/60 text-amber-300 flex items-center gap-1 shadow-sm">
                  <Brain className="w-3 h-3" /> Memory Mission
                </span>
              )}
              {mission.type === 'recovery' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-950/80 border border-teal-700/60 text-teal-300 flex items-center gap-1 shadow-sm">
                  <Shield className="w-3 h-3" /> Recovery Drill
                </span>
              )}
              {mission.type === 'mini_project' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-950/80 border border-purple-700/60 text-purple-300 flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3" /> Mini Project
                </span>
              )}

              {/* Difficulty Badge */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${
                  difficultyColor[mission.difficulty || 'BEGINNER']
                }`}
              >
                {mission.difficulty || 'BEGINNER'}
              </span>

              {/* XP Reward Badge */}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-950 border border-cyan-800 text-cyan-300 flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                +{mission.xpReward} XP
              </span>
            </div>
          </div>

          {/* Section & Mission Title */}
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-cyan-400 tracking-wider uppercase mb-1">
              <span className="px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-800/80">
                Mission {mission.missionIndexInSection}/10 — {isMissionAlreadyCompleted ? 'Completed' : 'Current Mission'}
              </span>
              <span>•</span>
              <span className="text-slate-300">
                {completedInSection}/10 Missions Completed
              </span>
              <span>•</span>
              <span className="text-cyan-400 font-semibold">
                {currentSection.title}
              </span>
            </div>

            <h1 className="font-display font-black text-xl sm:text-2xl text-white tracking-wide uppercase">
              {mission.title}
            </h1>
          </div>

          {/* CORE FLOW: LEARN → OBJECTIVE → TASK Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {/* 1. LEARN Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-1.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 border border-blue-800 text-blue-300 uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> LEARN
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {mission.shortLesson || mission.learnExplanation}
                </p>
              </div>
            </div>

            {/* 2. OBJECTIVE Box */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-800/50 space-y-1.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 border border-indigo-700 text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                    <Target className="w-3 h-3" /> OBJECTIVE
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                  {mission.objective}
                </p>
              </div>
            </div>

            {/* 3. TASK Box */}
            <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 space-y-1.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500 text-slate-950 uppercase tracking-wider flex items-center gap-1">
                    <Code2 className="w-3 h-3" /> TASK
                  </span>

                  {/* 3-Tier Hint Trigger Button */}
                  <button
                    onClick={cycleHint}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 hover:bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <Lightbulb className="w-3 h-3 text-amber-400" />
                    <span>
                      {hintLevel === 0 ? '💡 Hint' : `Hint ${hintLevel}/3`}
                    </span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-cyan-100 leading-snug">
                  {mission.instructions || mission.task || mission.tryTask}
                </p>
              </div>
            </div>
          </div>

          {/* TEACH THEN TRAIN: CONCEPT BREAKDOWN & BRAIN TRAINER */}
          {mission.teachBreakdown && mission.teachBreakdown.length > 0 && (
            <div className="mt-3 rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-950 to-cyan-950/60 border border-cyan-500/50 p-4 shadow-xl text-left transition-all">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-cyan-800/40">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                    <Brain className="w-4 h-4 animate-pulse text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-xs sm:text-sm tracking-wider uppercase text-cyan-300 flex items-center gap-2">
                      <span>🧠 TEACH THEN TRAIN YOUR BRAIN</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-200 border border-cyan-700/60 font-mono">
                        Concept Walkthrough
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Learn how the code works step-by-step before you type.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    setIsTeachExpanded(!isTeachExpanded);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>{isTeachExpanded ? 'Minimize Guide' : 'Open Teach Guide'}</span>
                  {isTeachExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {isTeachExpanded && (
                <div className="pt-3 space-y-3.5 animate-in fade-in duration-200">
                  {/* Step Breakdown Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mission.teachBreakdown.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-700/60 transition-colors space-y-1.5"
                      >
                        <div className="font-display font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-600 flex items-center justify-center text-[10px] text-cyan-300 font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <span>{step.title}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {step.description}
                        </p>
                        {step.code && (
                          <div className="p-2 rounded-lg bg-slate-950 border border-cyan-900/60 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                            <code>{step.code}</code>
                          </div>
                        )}
                        {step.highlight && (
                          <div className="text-[11px] font-semibold text-amber-300/95 bg-amber-950/30 p-2 rounded-lg border border-amber-800/40">
                            💡 {step.highlight}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Interactive Mini Simulator */}
                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-indigo-700/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
                    <div className="space-y-1 text-center sm:text-left">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center justify-center sm:justify-start gap-1.5">
                        <Play className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Interactive Demo (Try It Before Coding):</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Target Paragraph Text:{' '}
                        <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-all ${
                          demoState === 'clicked'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 shadow-sm'
                            : 'bg-slate-900 text-slate-300 border border-slate-800'
                        }`}>
                          "{demoState === 'clicked' ? 'Hello World' : 'Original Text'}"
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          sound.playSuccess();
                          setDemoState('clicked');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-display font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <MousePointer className="w-3.5 h-3.5" />
                        <span>Simulate Button Click</span>
                      </button>

                      {demoState === 'clicked' && (
                        <button
                          onClick={() => {
                            sound.playClick();
                            setDemoState('original');
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer border border-slate-800"
                          title="Reset demo"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Brain Trainer Tip & Jump to Code Button */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-cyan-950/50 border border-cyan-800/60 text-xs">
                    <div className="text-cyan-200 text-left">
                      <strong className="text-white">🧠 Brain Trainer Goal: </strong>
                      <span>{mission.brainTrainerTip || mission.instructions}</span>
                    </div>

                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveMobileTab('editor');
                        const editorEl = document.getElementById('mission-code-workspace');
                        if (editorEl) editorEl.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-md shadow-cyan-500/25 active:scale-95 transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>⚡ Train Your Brain & Code Now</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 7. 3-TIER HINT SYSTEM BANNER */}
          {hintLevel > 0 && (
            <div className="mt-3 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-700/60 text-xs text-amber-200 animate-in fade-in duration-150 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="font-bold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>
                    HINT {hintLevel}:{' '}
                    {hintLevel === 1
                      ? 'Very Small Clue'
                      : hintLevel === 2
                      ? 'Concept Clarification'
                      : 'Related Example'}
                  </span>
                </div>
                <p className="leading-relaxed text-amber-100 font-medium">
                  {mission.hints[hintLevel - 1]}
                </p>
              </div>

              <button
                onClick={cycleHint}
                className="px-2.5 py-1 rounded-lg bg-amber-900/80 hover:bg-amber-800 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
              >
                {hintLevel < 3 ? 'Next Hint' : 'Close Hint'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 6. RESULT SYSTEM (CHECK & RESULT) */}
      {validation && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all animate-in fade-in duration-200 ${
            validation.isCorrect
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-xl shadow-emerald-950/30'
              : 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-xl shadow-rose-950/30'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {validation.isCorrect ? (
                <div className="w-8 h-8 rounded-xl bg-emerald-900/80 border border-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-rose-900/80 border border-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display font-black text-sm sm:text-base tracking-wider uppercase">
                    {validation.isCorrect ? '🎉 MISSION COMPLETE!' : '❌ MISSION FAILED'}
                  </span>

                  {validation.isCorrect && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-900 border border-emerald-600 text-emerald-200">
                      +{mission.xpReward} XP Earned
                    </span>
                  )}

                  {hasAttemptedAndFailed && validation.isCorrect && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950 border border-amber-600 text-amber-300">
                      +20 XP: Mistake Fixed!
                    </span>
                  )}
                </div>

                {/* Explanation of what happened */}
                <p className="text-xs sm:text-sm font-medium leading-relaxed">
                  {validation.friendlyExplanation || validation.message}
                </p>

                {/* Hint if failed */}
                {validation.hint && !validation.isCorrect && (
                  <div className="text-xs text-rose-200/90 pt-1 flex items-center gap-1.5">
                    <strong className="text-amber-300">Hint:</strong>
                    <span>{validation.hint}</span>
                  </div>
                )}

                {/* Concept learned if passed */}
                {validation.isCorrect && (
                  <div className="pt-2 text-xs text-emerald-300 border-t border-emerald-800/60 mt-2 space-y-1">
                    <p>
                      <strong className="text-white">Objective Completed: </strong>
                      {mission.objective}
                    </p>
                    <p>
                      <strong className="text-white">Concept Learned: </strong>
                      {mission.summaryLearned || mission.conceptShort}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons on Result */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              {!validation.isCorrect ? (
                <>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setValidation(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Try Again
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsTutorOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-900/90 hover:bg-rose-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Ask AI</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsCompleteModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <span>Next Mission</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Tab Switcher (Editor vs Live Preview) */}
      <div className="flex sm:hidden p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-display font-bold">
        <button
          onClick={() => setActiveMobileTab('editor')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeMobileTab === 'editor'
              ? 'bg-cyan-500 text-slate-950'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Code Editor</span>
        </button>
        <button
          onClick={() => setActiveMobileTab('preview')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeMobileTab === 'preview'
              ? 'bg-cyan-500 text-slate-950'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Live Preview</span>
        </button>
      </div>

      {/* Workspace Split (Side by Side on Desktop, Tabbed on Mobile) */}
      <div id="mission-code-workspace" className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch min-h-[400px]">
        {/* 3. CODE EDITOR PANEL */}
        <div
          className={`h-full ${
            activeMobileTab === 'preview' ? 'hidden md:block' : 'block'
          }`}
        >
          <CodeEditor
            code={code}
            availableLanguages={availableLanguages}
            defaultLanguage={mission.defaultLanguage}
            onChange={handleCodeChange}
            onRunCode={handleRunCode}
            onResetCode={handleResetCode}
            onOpenAITutor={() => setIsTutorOpen(true)}
            onToggleHint={cycleHint}
            hintLevel={hintLevel}
            isRunning={isValidating}
          />
        </div>

        {/* 4. LIVE PREVIEW PANEL */}
        <div
          className={`h-full ${
            activeMobileTab === 'editor' ? 'hidden md:block' : 'block'
          }`}
        >
          <LivePreview code={renderedPreviewCode} />
        </div>
      </div>

      {/* 8. AI TUTOR MODAL */}
      <AITutorModal
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        mission={mission}
        userCode={code}
        currentMistake={
          validation?.isCorrect === false
            ? validation.friendlyExplanation
            : undefined
        }
        onApplySolution={(solution) => {
          const updated = normalizeMissionCode(solution);
          handleCodeChange(updated);
          setRenderedPreviewCode(updated);
        }}
      />

      {/* 15. MISSION COMPLETE CELEBRATION MODAL */}
      <MissionCompleteModal
        isOpen={isCompleteModalOpen}
        mission={mission}
        xpEarned={mission.xpReward + earnedBonusXp}
        progress={progress}
        onTakeAssessment={() => {
          setIsCompleteModalOpen(false);
          onTakeAssessment?.(mission.sectionId);
        }}
        onNextMission={() => {
          if (nextMission) {
            onCompleteMission(mission.id, 0, nextMission.id);
            setIsCompleteModalOpen(false);
          } else {
            setIsCompleteModalOpen(false);
            onBackToDashboard();
          }
        }}
        onBackToDashboard={() => {
          setIsCompleteModalOpen(false);
          onBackToDashboard();
        }}
        isLastMission={isLastMission}
      />
    </div>
  );
};
