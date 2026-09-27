import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, ArrowRight, Home, CheckCircle2, Award, Zap } from 'lucide-react';
import { Mission, UserProgress } from '../types';
import { getLevelInfo } from '../data/levels';
import { sound } from '../utils/sound';

interface MissionCompleteModalProps {
  isOpen: boolean;
  mission: Mission;
  xpEarned: number;
  progress: { xp: number };
  onNextMission: () => void;
  onBackToDashboard: () => void;
  onTakeAssessment?: () => void;
  isLastMission?: boolean;
}

export const MissionCompleteModal: React.FC<MissionCompleteModalProps> = ({
  isOpen,
  mission,
  xpEarned,
  progress,
  onNextMission,
  onBackToDashboard,
  onTakeAssessment,
  isLastMission = false,
}) => {
  const isSectionCapstone = mission.missionIndexInSection === 10;
  const { currentLevel } = getLevelInfo(progress.xp);

  useEffect(() => {
    if (isOpen) {
      if (isSectionCapstone || mission.isMiniProject || mission.type === 'mini_project') {
        sound.playHatching();
      } else {
        sound.playSuccess();
      }
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#06b6d4', '#10b981', '#fbbf24', '#ffffff'],
        });
      } catch {
        // Ignore if confetti canvas not available
      }
    }
  }, [isOpen, isSectionCapstone, mission.isMiniProject, mission.type]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-950/80 border border-cyan-500/60 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden cyber-glow-cyan">
        {/* Glow Orb */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Victory Badge */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/30 mb-4 animate-bounce">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
          </div>
        </div>

        {/* Required String: 🎉 MISSION COMPLETE! */}
        <div className="inline-block px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-2 font-display">
          Protocol Verified
        </div>

        <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wider uppercase mb-2">
          🎉 Mission Complete!
        </h2>

        <p className="text-slate-300 text-xs sm:text-sm max-w-xs mx-auto mb-4">
          Excellent work on <strong className="text-cyan-400">{mission.title}</strong>!
        </p>

        {/* Objective & Concept Summary Box */}
        <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-cyan-900/60 text-left text-xs space-y-2 mb-5">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Objective Completed
              </span>
              <span className="text-slate-200 font-semibold">
                {mission.objective}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 border-t border-slate-800/80 pt-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Concept Learned
              </span>
              <span className="text-cyan-200">
                {mission.summaryLearned || mission.conceptShort}
              </span>
            </div>
          </div>
        </div>

        {/* XP Gained Pill */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-cyan-900/60 mb-5 flex items-center justify-around">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Earned Reward
            </div>
            <div className="font-display font-bold text-xl text-cyan-400 flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>+{xpEarned} XP</span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Total XP
            </div>
            <div className="font-display font-bold text-xl text-white">
              {progress.xp} XP
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {isSectionCapstone && onTakeAssessment ? (
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/60 text-amber-200 text-xs">
                <div className="font-bold uppercase tracking-wider text-amber-400 flex items-center justify-center gap-1.5 mb-1">
                  <span>🎯 SECTION ASSESSMENT UNLOCKED</span>
                </div>
                “Prove what you learned.” Pass the assessment to unlock the next section!
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  onTakeAssessment();
                }}
                className="w-full py-3.5 px-6 rounded-xl font-display font-bold text-sm sm:text-base text-slate-950 bg-gradient-to-r from-amber-400 to-cyan-400 hover:from-amber-300 hover:to-cyan-300 active:scale-98 transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer animate-pulse"
              >
                <span>Take Section Assessment</span>
                <ArrowRight className="w-5 h-5 text-slate-950" />
              </button>
            </div>
          ) : !isLastMission ? (
            <button
              onClick={() => {
                sound.playClick();
                onNextMission();
              }}
              className="w-full py-3.5 px-6 rounded-xl font-display font-bold text-sm sm:text-base text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 active:scale-98 transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next Mission</span>
              <ArrowRight className="w-5 h-5 text-slate-950" />
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                onBackToDashboard();
              }}
              className="w-full py-3.5 px-6 rounded-xl font-display font-bold text-sm sm:text-base text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 active:scale-98 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Award className="w-5 h-5" />
              <span>All Missions Cleared!</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onBackToDashboard();
            }}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Map</span>
          </button>
        </div>
      </div>
    </div>
  );
};
