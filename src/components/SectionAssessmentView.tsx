import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Shield,
  HelpCircle,
  Eye,
  Code2,
  Award,
  BookOpen,
} from 'lucide-react';
import {
  SectionInfo,
  AssessmentQuestion,
  AssessmentResult,
  UserProfile,
} from '../types';
import { getRandomAssessmentQuestions } from '../data/assessments';
import { sound } from '../utils/sound';

interface SectionAssessmentViewProps {
  section: SectionInfo;
  profile: UserProfile;
  onAssessmentPassed: (result: AssessmentResult, xpBonus: number) => void;
  onAssessmentFailed: (result: AssessmentResult, missedObjectives: string[]) => void;
  onCancel: () => void;
}

export const SectionAssessmentView: React.FC<SectionAssessmentViewProps> = ({
  section,
  profile,
  onAssessmentPassed,
  onAssessmentFailed,
  onCancel,
}) => {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Answers state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [typedCode, setTypedCode] = useState<string>('');
  const [questionFeedback, setQuestionFeedback] = useState<{
    submitted: boolean;
    isCorrect: boolean;
    message: string;
  } | null>(null);

  // Cumulative score
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [missedObjectives, setMissedObjectives] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Select randomized questions from bank
    const randomized = getRandomAssessmentQuestions(section.id, 5);
    setQuestions(randomized);
    setCurrentQuestionIndex(0);
    setCorrectAnswersCount(0);
    setMissedObjectives([]);
    setIsFinished(false);
    resetQuestionState(randomized[0]);
  }, [section.id]);

  const resetQuestionState = (q?: AssessmentQuestion) => {
    setSelectedOption(null);
    setTypedCode(q?.starterCode || '');
    setQuestionFeedback(null);
  };

  const currentQ = questions[currentQuestionIndex];
  if (!currentQ && !isFinished) return null;

  const handleSubmitAnswer = () => {
    sound.playClick();
    let isCorrect = false;
    let message = '';

    if (currentQ.type === 'multiple_choice' || currentQ.type === 'identify_code') {
      if (selectedOption === null) return;
      isCorrect = selectedOption === currentQ.correctOptionIndex;
      message = isCorrect
        ? 'Correct! ' + currentQ.explanation
        : 'Incorrect. ' + currentQ.explanation;
    } else if (currentQ.type === 'fix_mistake' || currentQ.type === 'write_code') {
      if (!currentQ.validateCode) {
        isCorrect = true;
        message = 'Answer recorded.';
      } else {
        const val = currentQ.validateCode(typedCode);
        isCorrect = val.isCorrect;
        message = val.feedback;
      }
    }

    if (isCorrect) {
      sound.playSuccess();
      setCorrectAnswersCount((prev) => prev + 1);
    } else {
      sound.playFail();
      if (!missedObjectives.includes(currentQ.objective)) {
        setMissedObjectives((prev) => [...prev, currentQ.objective]);
      }
    }

    setQuestionFeedback({
      submitted: true,
      isCorrect,
      message,
    });
  };

  const handleNext = () => {
    sound.playClick();
    if (currentQuestionIndex + 1 < questions.length) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      resetQuestionState(questions[nextIdx]);
    } else {
      // Finished assessment
      finishAssessment();
    }
  };

  const finishAssessment = () => {
    setIsFinished(true);
    const totalQ = questions.length;
    // Note: correctAnswersCount has already updated
    const finalCorrect = correctAnswersCount + (questionFeedback?.isCorrect ? 0 : 0);
    const scorePct = Math.round((finalCorrect / totalQ) * 100);
    const passed = scorePct >= section.passScorePercent;

    const result: AssessmentResult = {
      id: 'asmt_' + Date.now(),
      sectionId: section.id,
      sectionTitle: section.title,
      date: new Date().toISOString(),
      scorePercent: scorePct,
      passed,
      totalQuestions: totalQ,
      correctAnswersCount: finalCorrect,
      missedObjectives,
      xpAwarded: passed ? section.assessmentXpBonus : 0,
      notes: passed
        ? `Passed with ${scorePct}% on ${section.title}`
        : `Failed with ${scorePct}%. Restart required for ${section.title}`,
    };

    if (passed) {
      sound.playHatching();
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#38bdf8', '#10b981', '#fbbf24', '#ffffff'],
        });
      } catch {
        // ignore
      }
    } else {
      sound.playFail();
    }
  };

  // FINAL RESULT SCREEN
  if (isFinished) {
    const totalQ = questions.length;
    const scorePct = Math.round((correctAnswersCount / totalQ) * 100);
    const passed = scorePct >= section.passScorePercent;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div
          className={`rounded-3xl p-6 sm:p-8 text-center border shadow-2xl relative overflow-hidden ${
            passed
              ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-950/80 border-cyan-400 cyber-glow-cyan'
              : 'bg-gradient-to-b from-slate-900 via-slate-900 to-rose-950/80 border-rose-500 shadow-rose-950/50'
          }`}
        >
          {/* Header Icon */}
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl p-0.5 shadow-lg mb-4 flex items-center justify-center ${
              passed
                ? 'bg-gradient-to-tr from-cyan-400 to-emerald-400'
                : 'bg-gradient-to-tr from-rose-500 to-amber-500'
            }`}
          >
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              {passed ? (
                <Award className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
              ) : (
                <RotateCcw className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400" />
              )}
            </div>
          </div>

          <div
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 font-display ${
              passed
                ? 'bg-cyan-950 border border-cyan-800 text-cyan-300'
                : 'bg-rose-950 border border-rose-800 text-rose-300'
            }`}
          >
            {passed ? 'Assessment Succeeded' : 'Section Restart Required'}
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wider mb-2">
            {passed ? '🎉 SECTION COMPLETE!' : '❌ SECTION FAILED'}
          </h2>

          <p className="text-slate-300 text-sm max-w-md mx-auto mb-6">
            {passed ? (
              <span>
                Outstanding work, <strong className="text-cyan-400">{profile.name}</strong>! You demonstrated mastery over{' '}
                <strong className="text-white">{section.title}</strong> with an{' '}
                <strong className="text-emerald-400">{scorePct}%</strong> pass score.
              </span>
            ) : (
              <span>
                You scored <strong className="text-rose-400">{scorePct}%</strong> (pass requirement: {section.passScorePercent}%).
                Before unlocking the next section, you need more practice to cement these core concepts.
              </span>
            )}
          </p>

          {/* Metrics Pill */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6 text-center">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Score Achieved</div>
              <div className="font-display font-bold text-2xl text-white">
                {correctAnswersCount} / {totalQ} ({scorePct}%)
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">XP Reward</div>
              <div className="font-display font-bold text-2xl text-cyan-400 flex items-center justify-center gap-1">
                <Sparkles className="w-5 h-5 text-cyan-300" />
                <span>+{passed ? section.assessmentXpBonus : 0} XP</span>
              </div>
            </div>
          </div>

          {/* Missed Objectives Feedback */}
          {!passed && missedObjectives.length > 0 && (
            <div className="text-left p-4 rounded-2xl bg-rose-950/50 border border-rose-800/60 mb-6 space-y-2">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Areas to Improve:</span>
              </div>
              <ul className="space-y-1 text-xs text-rose-200">
                {missedObjectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-rose-900/60">
                Per assessment rules, you will return to Mission 1 of this section to replay and solidify these objectives. Your overall lifetime XP and previous sections are safely preserved!
              </div>
            </div>
          )}

          {/* Action Button */}
          <div>
            {passed ? (
              <button
                onClick={() => {
                  sound.playClick();
                  onAssessmentPassed(
                    {
                      id: 'asmt_' + Date.now(),
                      sectionId: section.id,
                      sectionTitle: section.title,
                      date: new Date().toISOString(),
                      scorePercent: scorePct,
                      passed: true,
                      totalQuestions: totalQ,
                      correctAnswersCount,
                      missedObjectives: [],
                      xpAwarded: section.assessmentXpBonus,
                      notes: 'Passed',
                    },
                    section.assessmentXpBonus
                  );
                }}
                className="w-full py-4 px-6 rounded-2xl font-display font-bold text-base text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 active:scale-98 transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Advance to Next Section</span>
                <ArrowRight className="w-5 h-5 text-slate-950" />
              </button>
            ) : (
              <button
                onClick={() => {
                  sound.playFail();
                  onAssessmentFailed(
                    {
                      id: 'asmt_' + Date.now(),
                      sectionId: section.id,
                      sectionTitle: section.title,
                      date: new Date().toISOString(),
                      scorePercent: scorePct,
                      passed: false,
                      totalQuestions: totalQ,
                      correctAnswersCount,
                      missedObjectives,
                      xpAwarded: 0,
                      notes: 'Failed - section restarted',
                    },
                    missedObjectives
                  );
                }}
                className="w-full py-4 px-6 rounded-2xl font-display font-bold text-base text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 active:scale-98 transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5 text-white" />
                <span>Restart Section Missions for Practice</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE QUESTION SCREEN
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Assessment Header */}
      <div className="rounded-3xl bg-slate-900/95 border border-cyan-800/60 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-950 border border-cyan-700 text-cyan-300 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              <span>Section Assessment</span>
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              {section.title}
            </span>
          </div>

          <div className="text-xs text-cyan-400 font-bold font-code">
            Question {currentQuestionIndex + 1} of {questions.length} • Pass: {section.passScorePercent}%
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center gap-1.5 mb-4">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                idx === currentQuestionIndex
                  ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                  : idx < currentQuestionIndex
                  ? 'bg-emerald-500'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Objective Strip Required */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-900/50 mb-4">
          <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
            OBJECTIVE:
          </div>
          <div className="text-xs sm:text-sm font-semibold text-white mt-0.5">
            {currentQ.objective}
          </div>
        </div>

        {/* The Question Prompt */}
        <h2 className="font-display font-bold text-base sm:text-lg text-white mb-4">
          {currentQ.question}
        </h2>

        {/* Question Type: Multiple Choice or Identify Code */}
        {(currentQ.type === 'multiple_choice' || currentQ.type === 'identify_code') && currentQ.options && (
          <div className="space-y-2 mb-4">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = selectedOption === optIdx;
              return (
                <button
                  key={optIdx}
                  type="button"
                  disabled={questionFeedback?.submitted}
                  onClick={() => {
                    sound.playClick();
                    setSelectedOption(optIdx);
                  }}
                  className={`w-full p-3.5 rounded-xl border text-left font-code text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <span>{opt}</span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 ${
                      isSelected
                        ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold'
                        : 'border-slate-700'
                    }`}
                  >
                    {isSelected && '✓'}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Question Type: Fix Mistake or Write Code */}
        {(currentQ.type === 'fix_mistake' || currentQ.type === 'write_code') && (
          <div className="space-y-2 mb-4">
            <div className="rounded-xl border border-slate-800 bg-[#030712] overflow-hidden">
              <div className="px-3 py-1.5 bg-slate-950 border-b border-slate-900 text-[11px] text-slate-500 font-mono flex items-center justify-between">
                <span>{currentQ.type === 'fix_mistake' ? 'Fix the code below:' : 'Write your solution:'}</span>
                <button
                  type="button"
                  onClick={() => setTypedCode(currentQ.starterCode || '')}
                  className="text-slate-500 hover:text-cyan-400 transition-colors"
                >
                  Reset
                </button>
              </div>

              <textarea
                value={typedCode}
                onChange={(e) => setTypedCode(e.target.value)}
                disabled={questionFeedback?.submitted}
                placeholder="<!-- Type your answer here -->"
                className="w-full bg-transparent text-slate-100 p-3 leading-6 resize-none outline-none font-code text-xs sm:text-sm min-h-[100px]"
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
              />
            </div>
          </div>
        )}

        {/* Feedback Alert After Submitting */}
        {questionFeedback && (
          <div
            className={`p-3.5 rounded-xl border mb-4 text-xs animate-in fade-in duration-150 flex items-start gap-2.5 ${
              questionFeedback.isCorrect
                ? 'bg-emerald-950/70 border-emerald-600/70 text-emerald-200'
                : 'bg-rose-950/70 border-rose-600/70 text-rose-200'
            }`}
          >
            {questionFeedback.isCorrect ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold uppercase tracking-wider text-[11px] mb-0.5">
                {questionFeedback.isCorrect ? '✅ Objective Met' : '❌ Objective Missed'}
              </div>
              <p>{questionFeedback.message}</p>
            </div>
          </div>
        )}

        {/* Action Button: Submit or Next */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Exit Assessment
          </button>

          {!questionFeedback ? (
            <button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={
                (currentQ.type === 'multiple_choice' || currentQ.type === 'identify_code') &&
                selectedOption === null
              }
              className="px-6 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 disabled:opacity-50 active:scale-95 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              Submit Answer
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 active:scale-95 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>{currentQuestionIndex + 1 < questions.length ? 'Next Question' : 'View Results'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
