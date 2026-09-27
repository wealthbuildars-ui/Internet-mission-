import React from 'react';
import {
  CheckCircle2,
  Lock,
  Play,
  Sparkles,
  Brain,
  Rocket,
  ArrowRight,
  Shield,
  Layers,
  Hammer,
  Palette,
  Award,
  Zap,
  Compass,
  Target,
  FileCheck,
} from 'lucide-react';
import { Mission, SectionId, SectionInfo, UserProfile } from '../types';
import { SECTIONS } from '../data/sections';
import { MISSIONS } from '../data/missions';
import { sound } from '../utils/sound';

interface MissionMapProps {
  profile: UserProfile;
  onSelectMission: (missionId: string) => void;
  onOpenCodeMemory: () => void;
  onOpenAssessment: (sectionId: SectionId) => void;
}

export const MissionMap: React.FC<MissionMapProps> = ({
  profile,
  onSelectMission,
  onOpenCodeMemory,
  onOpenAssessment,
}) => {
  const completedMissionsCount = profile.completedMissionIds.length;
  const totalMissionsCount = MISSIONS.length;
  const overallPercentage = Math.round(
    (completedMissionsCount / totalMissionsCount) * 100
  );

  // Helper to check section unlocked state:
  // Section 1 is unlocked. Next sections require passing the previous section assessment!
  const isSectionUnlocked = (section: SectionInfo): boolean => {
    if (!section.requiredSectionId) return true;
    return profile.completedSectionIds.includes(section.requiredSectionId);
  };

  // Helper to check mission locked state
  const isMissionUnlocked = (
    mission: Mission,
    indexInSection: number,
    sectionMissions: Mission[],
    sectionUnlocked: boolean
  ): boolean => {
    if (!sectionUnlocked) return false;
    if (indexInSection === 0) return true;
    const prevMission = sectionMissions[indexInSection - 1];
    return profile.completedMissionIds.includes(prevMission.id);
  };

  const getSectionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layers':
        return <Layers className="w-5 h-5" />;
      case 'Hammer':
        return <Hammer className="w-5 h-5" />;
      case 'Palette':
        return <Palette className="w-5 h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'Compass':
        return <Compass className="w-5 h-5" />;
      case 'Rocket':
        return <Rocket className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 space-y-8">
      {/* Map Header & Overall Pathway Progress */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/70 border border-cyan-800/40 p-5 sm:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-950 border border-cyan-700 text-cyan-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Active Tactical Grid
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Section Progression Engine
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wide uppercase">
              Mission Map
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
              Progress through structured 10-mission sections. Complete all 10 missions and pass the Section Assessment (80%+) to unlock the next section!
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-900/50 text-center min-w-[120px]">
              <div className="font-display font-bold text-2xl text-cyan-400">
                {overallPercentage}%
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Map Complete
              </div>
              <div className="text-[10px] text-cyan-500 font-semibold mt-0.5">
                {completedMissionsCount}/{totalMissionsCount} Cleared
              </div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 p-0.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(6,182,212,0.6)]"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Visual Connected Sections Pathway */}
      <div className="relative space-y-8">
        {SECTIONS.map((section, sectionIndex) => {
          const sectionMissions = MISSIONS.filter((m) => m.sectionId === section.id);
          const sectionCompletedCount = sectionMissions.filter((m) =>
            profile.completedMissionIds.includes(m.id)
          ).length;
          const sectionTotal = sectionMissions.length;
          const isUnlocked = isSectionUnlocked(section);
          const isAllMissionsDone = sectionCompletedCount === sectionTotal && sectionTotal > 0;
          const isAssessmentPassed = profile.completedSectionIds.includes(section.id);
          const sectionProgressPct = Math.round(
            (sectionCompletedCount / Math.max(1, sectionTotal)) * 100
          );

          return (
            <div key={section.id} className="relative">
              {/* Connector Line to Next Section */}
              {sectionIndex < SECTIONS.length - 1 && (
                <div className="absolute left-6 sm:left-8 top-full h-8 w-1 -translate-x-1/2 z-0">
                  <div
                    className={`h-full w-full transition-colors duration-500 ${
                      isAssessmentPassed
                        ? 'bg-gradient-to-b from-emerald-500 to-cyan-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
                        : 'bg-slate-800'
                    }`}
                  />
                </div>
              )}

              {/* Section Card */}
              <div
                className={`relative z-10 rounded-2xl border transition-all ${
                  isAssessmentPassed
                    ? 'bg-slate-900/90 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                    : isUnlocked
                    ? 'bg-slate-900/95 border-cyan-800/60 shadow-xl shadow-cyan-950/30'
                    : 'bg-slate-950/60 border-slate-900 opacity-60'
                } p-4 sm:p-6 overflow-hidden`}
              >
                {/* Header of Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-display font-black text-lg transition-transform ${
                        isAssessmentPassed
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/60 shadow-lg shadow-emerald-500/20'
                          : isUnlocked
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/60 shadow-lg shadow-cyan-500/20'
                          : 'bg-slate-900 text-slate-600 border border-slate-800'
                      }`}
                    >
                      {isAssessmentPassed ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : isUnlocked ? (
                        getSectionIcon(section.icon)
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-cyan-400 font-display">
                          SECTION {section.number}
                        </span>
                        {isAssessmentPassed && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-950 border border-emerald-700 text-emerald-300">
                            Assessment Passed ✓
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-bold text-base sm:text-lg text-white">
                        {section.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {section.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Section Stats & Badge */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-200">
                        {sectionCompletedCount}/{sectionTotal} Missions Completed
                      </div>
                      <div className="text-[10px] text-cyan-400 font-semibold">
                        {isAssessmentPassed ? 'Section Mastered' : `${sectionProgressPct}% Completed`}
                      </div>
                    </div>

                    <div className="w-20 sm:w-28 h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isAssessmentPassed
                            ? 'bg-emerald-400'
                            : 'bg-gradient-to-r from-cyan-500 to-sky-400'
                        }`}
                        style={{ width: `${sectionProgressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Section Concept Summary */}
                <div className="mb-4 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-center justify-between">
                  <span>💡 <strong className="text-white">Core Concept:</strong> {section.conceptSummary}</span>
                  {!isUnlocked && (
                    <span className="text-rose-400 text-[11px] font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Pass Section {section.number - 1} Assessment to unlock
                    </span>
                  )}
                </div>

                {/* Missions List (10 missions) */}
                <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-800/80">
                  {sectionMissions.map((mission, indexInSec) => {
                    const isCompleted = profile.completedMissionIds.includes(mission.id);
                    const missionUnlocked = isMissionUnlocked(
                      mission,
                      indexInSec,
                      sectionMissions,
                      isUnlocked
                    );
                    const nextUncompletedInSec = sectionMissions.find(
                      (m) => !profile.completedMissionIds.includes(m.id)
                    );
                    const isCurrent =
                      ((profile.currentMissionId === mission.id && !isCompleted) ||
                        (!isCompleted && nextUncompletedInSec?.id === mission.id)) &&
                      isUnlocked;

                    return (
                      <div
                        key={mission.id}
                        onClick={() => {
                          if (missionUnlocked) {
                            sound.playClick();
                            onSelectMission(mission.id);
                          } else {
                            sound.playFail();
                          }
                        }}
                        className={`group relative p-3 sm:p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isCurrent
                            ? 'bg-gradient-to-r from-slate-900 via-cyan-950/70 to-slate-900 border-cyan-400 cursor-pointer shadow-lg shadow-cyan-950/50 hover:border-cyan-300'
                            : isCompleted
                            ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 cursor-pointer'
                            : 'bg-slate-950/30 border-slate-900/60 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        {/* Left Node Status */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-xs transition-colors shrink-0 ${
                              isCompleted
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                                : isCurrent
                                ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.6)] animate-pulse'
                                : missionUnlocked
                                ? 'bg-slate-800 text-slate-300 border border-slate-700'
                                : 'bg-slate-900 text-slate-600 border border-slate-800'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : missionUnlocked ? (
                              <span>{mission.missionIndexInSection}</span>
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <span className="text-[10px] text-cyan-400 font-bold uppercase">
                                {isCurrent
                                  ? `Mission ${mission.missionIndexInSection}/10 — Current Mission`
                                  : isCompleted
                                  ? `Mission ${mission.missionIndexInSection}/10 — Completed`
                                  : `Mission ${mission.missionIndexInSection}/10`}
                              </span>
                              <h4
                                className={`font-display font-bold text-xs sm:text-sm ${
                                  isCurrent
                                    ? 'text-white'
                                    : isCompleted
                                    ? 'text-slate-300'
                                    : 'text-slate-500'
                                }`}
                              >
                                {mission.title}
                              </h4>

                              {mission.isMemoryMission && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-950/80 border border-amber-600/70 text-amber-300 flex items-center gap-0.5">
                                  <Brain className="w-2.5 h-2.5" /> Memory Mission
                                </span>
                              )}

                              {mission.isMiniProject && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-violet-950/80 border border-violet-600/70 text-violet-300 flex items-center gap-0.5">
                                  <Rocket className="w-2.5 h-2.5" /> Mini Project
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {missionUnlocked ? mission.task : 'Prerequisite mission required to unlock'}
                            </p>
                          </div>
                        </div>

                        {/* Right Rewards & Launch */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-xs font-bold font-code px-2 py-0.5 rounded ${
                              mission.isMemoryMission
                                ? 'bg-amber-950/50 text-amber-400 border border-amber-800/40'
                                : mission.isMiniProject
                                ? 'bg-violet-950/50 text-violet-400 border border-violet-800/40'
                                : 'text-cyan-400'
                            }`}
                          >
                            +{mission.xpReward} XP
                          </span>

                          {missionUnlocked && (
                            <div
                              className={`p-1.5 rounded-lg flex items-center justify-center transition-colors ${
                                isCurrent
                                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                                  : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'
                              }`}
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* SECTION ASSESSMENT NODE */}
                <div className="mt-4 pt-3 border-t border-slate-800/90">
                  <div
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isAssessmentPassed
                        ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200'
                        : isAllMissionsDone
                        ? 'bg-gradient-to-r from-amber-950/60 via-cyan-950/60 to-slate-900 border-amber-500/80 cyber-glow-cyan'
                        : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isAssessmentPassed
                            ? 'bg-emerald-900 text-emerald-300'
                            : isAllMissionsDone
                            ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                            : 'bg-slate-900 text-slate-600'
                        }`}
                      >
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-black text-sm uppercase tracking-wide text-white">
                            🎯 Section {section.number} Assessment
                          </span>
                          <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-slate-900 border border-slate-700 text-slate-300">
                            Passing Score: {section.passScorePercent}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {isAssessmentPassed
                            ? `Section Passed! +${section.assessmentXpBonus} XP Earned. Next section unlocked.`
                            : isAllMissionsDone
                            ? '“Prove what you learned.” Pass with 80%+ to unlock the next section!'
                            : 'Complete all 10 missions in this section to unlock the Assessment.'}
                        </p>
                      </div>
                    </div>

                    <div>
                      {isAssessmentPassed ? (
                        <button
                          onClick={() => {
                            sound.playClick();
                            onOpenAssessment(section.id);
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950 hover:bg-emerald-900 border border-emerald-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileCheck className="w-4 h-4" />
                          <span>Review Assessment</span>
                        </button>
                      ) : isAllMissionsDone ? (
                        <button
                          onClick={() => {
                            sound.playClick();
                            onOpenAssessment(section.id);
                          }}
                          className="px-5 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-cyan-400 hover:from-amber-300 hover:to-cyan-300 active:scale-95 transition-all shadow-lg shadow-cyan-500/30 flex items-center gap-2 cursor-pointer animate-bounce"
                        >
                          <span>Take Section Assessment</span>
                          <ArrowRight className="w-4 h-4 text-slate-950" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Locked</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Code Memory Callout Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-700/60 text-indigo-400 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 border border-indigo-700 text-indigo-300 uppercase tracking-wider">
                Special Protocol
              </span>
              <span className="text-xs text-indigo-400 font-semibold">
                Pure Visual Recall
              </span>
            </div>
            <h3 className="font-display font-bold text-base sm:text-lg text-white mt-0.5">
              🧠 CODE MEMORY MODE
            </h3>
            <p className="text-xs text-slate-400">
              See a visual preview and reconstruct the code with zero hints. Earn up to +150 XP per drill!
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onOpenCodeMemory();
          }}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 active:scale-95 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <span>Launch Code Memory</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
