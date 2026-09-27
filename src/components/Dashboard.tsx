import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Sparkles,
  Lock,
  CheckCircle2,
  Play,
  RotateCcw,
  Code2,
  Palette,
  Terminal,
  Brain,
  ChevronRight,
  HelpCircle,
  Award,
  Layers,
  Map,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Target,
  LogOut,
  User,
  Zap,
  Settings,
  Smartphone,
  Download,
  Upload,
  Eye,
  Share2,
  Clock,
  Check,
  BarChart3,
  FolderGit2,
  X,
} from 'lucide-react';
import { UserProfile, SectionInfo, Mission, CompletedProject } from '../types';
import { MISSIONS } from '../data/missions';
import { SECTIONS } from '../data/sections';
import { BADGES } from '../data/badges';
import { RECOVERY_MISSIONS } from '../data/recoveryMissions';
import { getLevelInfo } from '../data/levels';
import { sound } from '../utils/sound';
import { exportProfileData, importProfileData } from '../utils/storage';
import { downloadProjectZip, shareProject } from '../utils/projectDownloader';

interface DashboardProps {
  profile: UserProfile;
  onSelectMission: (missionId: string) => void;
  onOpenMissionMap: () => void;
  onOpenCodeMemory: () => void;
  onOpenAssessment: (sectionId: string) => void;
  onOpenRecoveryMission: (conceptKey: string) => void;
  onOpenAITutor: () => void;
  onOpenSettings?: () => void;
  onTriggerInstall?: () => void;
  isInstallable?: boolean;
  isInstalled?: boolean;
  onLogout: () => void;
  onNavigateProjects?: () => void;
  onNavigatePlayground?: () => void;
  onNavigateRevision?: () => void;
  onImportProfile?: (imported: UserProfile) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  onSelectMission,
  onOpenMissionMap,
  onOpenCodeMemory,
  onOpenAssessment,
  onOpenRecoveryMission,
  onOpenAITutor,
  onOpenSettings,
  onTriggerInstall,
  isInstallable,
  isInstalled,
  onLogout,
  onNavigateProjects,
  onNavigatePlayground,
  onNavigateRevision,
  onImportProfile,
}) => {
  const [previewProject, setPreviewProject] = useState<CompletedProject | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { currentLevel, nextLevel, progressPercent, xpToNext } = getLevelInfo(profile.xp);

  const currentSection =
    SECTIONS.find((s) => s.id === profile.currentSectionId) || SECTIONS[0];
  const sectionMissions = MISSIONS.filter((m) => m.sectionId === currentSection.id);
  const sectionCompletedCount = sectionMissions.filter((m) =>
    profile.completedMissionIds.includes(m.id)
  ).length;

  // The active mission to work on:
  // First uncompleted mission in this section, or the explicitly selected mission if in this section & uncompleted
  const nextUncompletedMission = sectionMissions.find(
    (m) => !profile.completedMissionIds.includes(m.id)
  );
  const selectedMission = MISSIONS.find((m) => m.id === profile.currentMissionId);
  const currentMission =
    (selectedMission && selectedMission.sectionId === currentSection.id && !profile.completedMissionIds.includes(selectedMission.id))
      ? selectedMission
      : nextUncompletedMission || sectionMissions[sectionMissions.length - 1] || MISSIONS[0];

  const currentMissionIndex = currentMission ? currentMission.missionIndexInSection : 1;

  // Check if Section Assessment is unlocked (all 10 missions of current section completed)
  const isSectionAssessmentReady =
    sectionMissions.length > 0 &&
    sectionMissions.every((m) => profile.completedMissionIds.includes(m.id));

  // Detect weak areas: concept with 2+ failures
  const weakConceptEntries = Object.entries(profile.weakAreas || {}).filter(
    ([_, count]) => count >= 2
  );
  const topWeakConcept = weakConceptEntries.sort((a, b) => b[1] - a[1])[0];
  const recoveryMission = topWeakConcept ? RECOVERY_MISSIONS[topWeakConcept[0]] : null;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 space-y-6">
      {/* Failed Section Restart Banner (Requirement 6) */}
      {profile.failedSectionRestartNotice && (
        <div className="p-4 sm:p-5 rounded-3xl bg-rose-950/70 border border-rose-500/80 text-rose-200 animate-in fade-in duration-200 shadow-xl shadow-rose-950/30">
          <div className="flex items-start gap-3">
            <RotateCcw className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-display font-bold text-sm tracking-wider uppercase text-rose-300">
                MISSION SECTION RESTART
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-white">
                “You need more practice before advancing.”
              </p>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                Restarting {profile.failedSectionRestartNotice.sectionTitle}: Mission 1 → Mission 10 → Assessment.
                Your lifetime XP, badges, and prior completed sections remain safely intact!
              </p>
              {profile.failedSectionRestartNotice.missedObjectives.length > 0 && (
                <div className="pt-2 text-xs text-amber-300">
                  <strong>Focus on these missed objectives: </strong>
                  {profile.failedSectionRestartNotice.missedObjectives.join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD PLAYER OVERVIEW CARD (Requirement 11) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/70 border border-cyan-800/40 p-5 sm:p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 bg-cyan-500/25 rounded-2xl blur-md" />
              <img
                src="/logo.png"
                alt="Internet Mission"
                className="relative w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-2xl drop-shadow-[0_4px_16px_rgba(6,182,212,0.5)]"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-950 border border-cyan-700 text-cyan-300">
                  PLAYER: {profile.name}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  @{profile.username}
                </span>
              </div>

              <div className="pt-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Rank Level: {currentLevel.level}
                </div>
                <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wide uppercase">
                  {currentLevel.title}
                </h1>
              </div>

              <div className="text-xs text-slate-300 pt-1">
                <strong className="text-cyan-400">CURRENT SECTION: </strong>
                <span className="font-bold text-white uppercase">{currentSection.title}</span>
              </div>

              <div className="text-xs text-slate-300">
                <strong className="text-cyan-400">PROGRESS: </strong>
                <span className="font-bold text-white">{sectionCompletedCount}/10 Missions Completed</span>
              </div>

              <div className="text-xs text-slate-300">
                <strong className="text-cyan-400">CURRENT MISSION: </strong>
                <span className="font-bold text-white">
                  {isSectionAssessmentReady
                    ? 'Section Assessment Ready'
                    : `Mission ${currentMissionIndex}/10 — Current Mission`}
                </span>
              </div>

              <div className="text-xs text-slate-300 flex items-start gap-1 pt-0.5">
                <strong className="text-amber-400 shrink-0">NEXT OBJECTIVE: </strong>
                <span className="text-slate-200">{currentMission?.objective || 'Complete section assessment'}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full md:w-auto">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-900/40 text-center">
              <div className="flex items-center justify-center gap-1 text-cyan-400 mb-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-display font-bold text-lg text-white">
                  {profile.xp}
                </span>
              </div>
              <div className="text-[10px] uppercase font-bold text-cyan-500 tracking-wider">
                Total XP
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-900/40 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
                <Flame className="w-3.5 h-3.5" />
                <span className="font-display font-bold text-lg text-white">
                  {profile.streak}
                </span>
              </div>
              <div className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">
                Streak
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-900/40 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-400 mb-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="font-display font-bold text-lg text-white">
                  {profile.completedSectionIds.length}/{SECTIONS.length}
                </span>
              </div>
              <div className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">
                Sections
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar towards Next Rank */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-300">
              Rank Pathway:{' '}
              <strong className="text-cyan-300">
                {nextLevel ? `${nextLevel.title} (Lvl ${nextLevel.level})` : 'Max Rank!'}
              </strong>
            </span>
            <span className="text-cyan-400 font-code text-[11px]">
              {nextLevel ? `${xpToNext} XP to next level` : '100%'}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Install Banner on Dashboard Overview */}
        {!isInstalled && (
          <div className="mt-4 pt-3.5 border-t border-cyan-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 shrink-0">
                <Smartphone className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-left">
                <div className="font-display font-bold text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
                  <span>📱 Install Internet Mission</span>
                  <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 text-[10px] font-bold">PWA</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Full standalone app with offline missions and home screen icon.
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                if (isInstallable && onTriggerInstall) {
                  onTriggerInstall();
                } else if (onOpenSettings) {
                  onOpenSettings();
                }
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-md shadow-cyan-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Smartphone className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isInstallable ? 'Install Now' : 'How to Install'}</span>
            </button>
          </div>
        )}
      </div>

      {/* WEAK AREA DETECTION & RECOVERY MISSION BANNER (Requirement 8) */}
      {recoveryMission && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/60 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-700 text-indigo-400 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 border border-indigo-700 text-indigo-300 uppercase tracking-wider">
                  AI Tutor Detected Weak Area
                </span>
                <span className="text-xs text-indigo-400 font-semibold">
                  +{recoveryMission.xpReward} Recovery XP
                </span>
              </div>
              <h3 className="font-display font-bold text-base text-white mt-0.5">
                “You've had trouble with {recoveryMission.conceptName} a few times. Let's practice one.”
              </h3>
              <p className="text-xs text-slate-400">
                Objective: {recoveryMission.objective}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onOpenRecoveryMission(recoveryMission.conceptKey);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 active:scale-95 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Brain className="w-4 h-4" />
            <span>Launch Recovery Mission</span>
          </button>
        </div>
      )}

      {/* SECTION ASSESSMENT READY PROMPT (Requirement 4) */}
      {isSectionAssessmentReady && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-blue-950/70 border border-cyan-400 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cyber-glow-cyan animate-pulse-subtle">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500 text-slate-950 uppercase tracking-wider animate-bounce">
                Assessment Ready
              </span>
              <span className="text-xs text-cyan-400 font-bold">
                +{currentSection.assessmentXpBonus} XP Bonus
              </span>
            </div>
            <h3 className="font-display font-black text-xl text-white">
              🎯 SECTION {currentSection.number} ASSESSMENT: “Prove what you learned.”
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              You cleared all 10 missions in {currentSection.title}! Pass with {currentSection.passScorePercent}%+ to unlock the next section.
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onOpenAssessment(currentSection.id);
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-display font-bold text-sm bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 active:scale-95 transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Target className="w-4 h-4" />
            <span>Begin Section Assessment</span>
          </button>
        </div>
      )}

      {/* Primary Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Visual Mission Map Card */}
        <div
          onClick={() => {
            sound.playClick();
            onOpenMissionMap();
          }}
          className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950/60 border border-cyan-500/40 hover:border-cyan-400 cursor-pointer transition-all shadow-xl group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Map className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              {SECTIONS.length} Structured Sections
            </span>
          </div>
          <h3 className="font-display font-bold text-lg text-white group-hover:text-cyan-200 transition-colors">
            Mission Map & Sections
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Follow the logical progression: HTML Foundation (1–10) → CSS Foundation (11–20) → JavaScript Foundation (21–30).
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-cyan-400">
            <span>Explore Mission Grid</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Code Memory Drills Card */}
        <div
          onClick={() => {
            sound.playClick();
            onOpenCodeMemory();
          }}
          className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/60 border border-indigo-500/40 hover:border-indigo-400 cursor-pointer transition-all shadow-xl group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-700 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
              🧠 Code Memory
            </span>
          </div>
          <h3 className="font-display font-bold text-lg text-white group-hover:text-indigo-200 transition-colors">
            Code Memory Drills
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            See the target preview (“What code could create this?”) and build it purely from memory without hints.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-indigo-400">
            <span>Start Memory Recall</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Active Mission Direct Launch Card */}
      {!isSectionAssessmentReady && currentMission && (
        <div className="p-4 sm:p-5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cyber-glow-blue">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500 text-slate-950 uppercase tracking-wider animate-pulse">
                Mission {currentMission.missionIndexInSection}/10 — Current Mission
              </span>
              <span className="text-xs text-cyan-400 font-semibold">
                +{currentMission.xpReward} XP Reward
              </span>
            </div>
            <h2 className="font-display font-bold text-lg sm:text-xl text-white">
              {currentMission.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-1">
              Objective: {currentMission.objective}
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onSelectMission(currentMission.id);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-display font-bold text-sm bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 active:scale-95 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Engage Mission</span>
          </button>
        </div>
      )}

      {/* Badges Shelf */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-bold text-base sm:text-lg text-white uppercase tracking-wider">
              Earned Badges ({profile.unlockedBadgeIds.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {profile.unlockedBadgeIds.length}/{BADGES.length} Total
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {BADGES.map((badge) => {
            const isUnlocked = profile.unlockedBadgeIds.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-3 rounded-xl border transition-all text-center space-y-1 ${
                  isUnlocked
                    ? 'bg-slate-950/90 border-amber-500/40 text-slate-200 shadow-md shadow-amber-950/20'
                    : 'bg-slate-950/30 border-slate-900 opacity-40 text-slate-600'
                }`}
              >
                <div className="text-xl">{badge.icon}</div>
                <div className="font-display font-bold text-[11px] text-white truncate">
                  {badge.title}
                </div>
                <div className="text-[9px] text-slate-400 line-clamp-2">
                  {badge.requirement}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assessment History Card */}
      {profile.assessmentHistory && profile.assessmentHistory.length > 0 && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
          <h3 className="font-display font-bold text-sm sm:text-base text-white uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>Assessment Record</span>
          </h3>

          <div className="space-y-2">
            {profile.assessmentHistory.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white">{item.sectionTitle}</div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(item.date).toLocaleDateString()} • {item.notes}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.passed
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {item.scorePercent}% {item.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LEARNING STATISTICS (Requirement 8) */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-bold text-base sm:text-lg text-white uppercase tracking-wider">
              📈 My Statistics
            </h3>
          </div>
          <span className="text-xs text-cyan-400 font-mono">Performance Telemetry</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total XP</div>
            <div className="text-xl font-display font-black text-cyan-400 mt-0.5">
              {profile.xp.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Experience Points</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Current Level</div>
            <div className="text-xl font-display font-black text-amber-400 mt-0.5">
              Lvl {currentLevel.level}
            </div>
            <div className="text-[10px] text-slate-300 truncate">{currentLevel.title}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Missions Completed</div>
            <div className="text-xl font-display font-black text-emerald-400 mt-0.5">
              {profile.completedMissionIds.length} / {MISSIONS.length}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Curriculum Path</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Projects Built</div>
            <div className="text-xl font-display font-black text-blue-400 mt-0.5">
              {(profile.completedProjects || []).length}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Website Projects</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Assessments Passed</div>
            <div className="text-xl font-display font-black text-indigo-400 mt-0.5">
              {(profile.completedSectionIds || []).length}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Section Capstones</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Coding Streak</div>
            <div className="text-xl font-display font-black text-rose-400 mt-0.5">
              {profile.streak} Days
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Momentum Active</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Learning Time</div>
            <div className="text-xl font-display font-black text-teal-400 mt-0.5">
              {profile.learningTimeMinutes || 25}m
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Estimated Hands-on</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Concepts Mastered</div>
            <div className="text-xl font-display font-black text-purple-400 mt-0.5">
              {profile.masteredObjectives.length > 0 ? profile.masteredObjectives.length : profile.completedMissionIds.length}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Verified Objectives</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Weak Areas</div>
            <div className="text-xl font-display font-black text-amber-300 mt-0.5">
              {Object.values(profile.commonMistakes || {}).filter((v) => v > 0).length}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Identified for Review</div>
          </div>
        </div>
      </div>

      {/* MY PROJECTS (Requirement 13) */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-bold text-base sm:text-lg text-white uppercase tracking-wider">
              📁 My Projects ({(profile.completedProjects || []).length})
            </h3>
          </div>
          {onNavigateProjects && (
            <button
              onClick={() => {
                sound.playClick();
                onNavigateProjects();
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
            >
              Open Project Studio →
            </button>
          )}
        </div>

        {(!profile.completedProjects || profile.completedProjects.length === 0) ? (
          <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">
              You haven't completed any website projects yet. Ready to build your first real site?
            </p>
            {onNavigateProjects && (
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigateProjects();
                }}
                className="py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
              >
                🏗️ Launch Project Mode
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {profile.completedProjects.map((proj) => (
              <div
                key={proj.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-white text-sm">{proj.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      ✓ Completed
                    </span>
                    {proj.buildWithoutHelp && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                        🔥 No-Help
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Completed: {new Date(proj.completedAt).toLocaleDateString()} • +{proj.xpEarned} XP
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setPreviewProject(proj);
                    }}
                    className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={async () => {
                      sound.playClick();
                      await downloadProjectZip({
                        projectName: proj.title,
                        learnerName: profile.name,
                        html: proj.html,
                        css: proj.css,
                        js: proj.js,
                      });
                      sound.playSuccess();
                    }}
                    className="py-1.5 px-3 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download (.zip)</span>
                  </button>

                  <a
                    href="https://chat.whatsapp.com/EVCWh9Vxfk2KLzOdpQMzYJ"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => sound.playClick()}
                    className="py-1.5 px-3 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BACKUP & RESTORE PROGRESS (Requirement 14) */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-bold text-base sm:text-lg text-white uppercase tracking-wider">
              💾 Data Protection & Progress Backup
            </h3>
          </div>
          <span className="text-xs text-slate-400">Offline Safe</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Export your entire profile (missions, projects, achievements, and code history) to a backup file so you never lose your progress if browser cache is cleared.
        </p>

        {importStatus && (
          <div className="p-3 rounded-xl bg-cyan-950/70 border border-cyan-700 text-xs text-cyan-200">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => {
              sound.playClick();
              exportProfileData(profile);
            }}
            className="py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-cyan-800 text-cyan-300 font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>💾 EXPORT MY PROGRESS (JSON)</span>
          </button>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  const content = event.target?.result as string;
                  const res = importProfileData(content);
                  if (res.success && res.profile) {
                    sound.playSuccess();
                    setImportStatus('✓ Progress imported successfully! Profile restored.');
                    if (onImportProfile) onImportProfile(res.profile);
                  } else {
                    sound.playError();
                    setImportStatus(`❌ Import failed: ${res.error}`);
                  }
                };
                reader.readAsText(file);
              }}
            />
            <button
              onClick={() => {
                sound.playClick();
                fileInputRef.current?.click();
              }}
              className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-700 text-slate-300 hover:text-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>📥 IMPORT MY PROGRESS (RESTORE)</span>
            </button>
          </div>
        </div>
      </div>

      {/* PROJECT PREVIEW MODAL */}
      {previewProject && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 p-3 sm:p-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="font-display font-bold text-sm text-white">
                Project Preview: {previewProject.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  sound.playClick();
                  await downloadProjectZip({
                    projectName: previewProject.title,
                    learnerName: profile.name,
                    html: previewProject.html,
                    css: previewProject.css,
                    js: previewProject.js,
                  });
                  sound.playSuccess();
                }}
                className="py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .zip</span>
              </button>

              <button
                onClick={() => setPreviewProject(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>${previewProject.css}</style></head><body>${previewProject.html}<script>${previewProject.js}<\/script></body></html>`}
              title="Dashboard Project Preview"
              sandbox="allow-scripts allow-modals allow-same-origin"
              className="w-full h-full border-none"
            />
          </div>
        </div>
      )}

      {/* Settings & Installation Section (Requirement 3) */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-bold text-base text-white uppercase tracking-wider">
              Settings & App Installation
            </h3>
          </div>
          {onOpenSettings && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenSettings();
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
            >
              Open Full Settings →
            </button>
          )}
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span className="font-display font-bold text-xs uppercase tracking-wider text-white">
                📱 Install Internet Mission
              </span>
              {isInstalled ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                  ✓ INSTALLED
                </span>
              ) : null}
            </div>
            <p className="text-xs text-slate-400">
              {isInstalled
                ? 'Running as a standalone mobile application with offline capabilities.'
                : 'Install to your Android phone or home screen to continue missions anytime.'}
            </p>
          </div>

          <div>
            {isInstalled ? (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                ✓ INTERNET MISSION INSTALLED
              </span>
            ) : onOpenSettings ? (
              <button
                onClick={() => {
                  sound.playClick();
                  if (isInstallable && onTriggerInstall) {
                    onTriggerInstall();
                  } else {
                    onOpenSettings();
                  }
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-md shadow-cyan-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Smartphone className="w-4 h-4 stroke-[2.5]" />
                <span>📱 {isInstallable ? 'Install Now' : 'How to Install'}</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Profile Logout / Switcher Bar */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <User className="w-4 h-4 text-slate-400" />
          <span>Signed in as <strong className="text-white">{profile.name}</strong> (@{profile.username})</span>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onLogout();
          }}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span>Switch Profile / Logout</span>
        </button>
      </div>
    </div>
  );
};
