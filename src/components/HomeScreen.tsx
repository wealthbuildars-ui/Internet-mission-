import React from 'react';
import { Terminal, Shield, Zap, Compass, CheckCircle2, ChevronRight, Award, Lock, BookOpen, Layers, Hammer, Palette, Sparkles, Rocket, Smartphone } from 'lucide-react';
import { UserProfile } from '../types';
import { MISSIONS } from '../data/missions';
import { SECTIONS } from '../data/sections';
import { getLevelInfo } from '../data/levels';
import { sound } from '../utils/sound';

interface HomeScreenProps {
  profile: UserProfile;
  onStartMission: () => void;
  onOpenMissionMap: () => void;
  onOpenDashboard: () => void;
  onOpenSettings?: () => void;
  onOpenCommunity?: () => void;
  onTriggerInstall?: () => void;
  isInstallable?: boolean;
  isInstalled?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  onStartMission,
  onOpenMissionMap,
  onOpenDashboard,
  onOpenSettings,
  onOpenCommunity,
  onTriggerInstall,
  isInstallable = false,
  isInstalled = false,
}) => {
  const { currentLevel, progressPercent } = getLevelInfo(profile.xp);
  const completedCount = profile.completedMissionIds.length;
  const totalMissions = MISSIONS.length;

  return (
    <div className="relative min-h-[calc(100vh-60px)] flex flex-col justify-between overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] sm:w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/20 via-blue-600/10 to-indigo-600/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 cyber-grid-bg opacity-40 pointer-events-none" />

      {/* Main Hero Container */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-8 pb-12 w-full flex-1 flex flex-col items-center text-center justify-center">
        {/* Futuristic Status Beacon */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4 cyber-glow-cyan animate-pulse-subtle">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Interactive Academy Grid Online</span>
        </div>

        {/* Official Game Logo Badge */}
        <div className="relative mb-4 group cursor-pointer" onClick={() => sound.playClick()}>
          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/30 via-sky-500/25 to-blue-600/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all opacity-80 pointer-events-none" />
          <img
            src="/logo.png"
            alt="Internet Mission Official Logo"
            className="relative w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60 object-contain mx-auto drop-shadow-[0_12px_40px_rgba(6,182,212,0.55)] group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Welcome Back Greeting */}
        <div className="text-cyan-400 font-display font-bold text-sm tracking-wider uppercase mb-2">
          “Welcome back, {profile.name}!”
        </div>

        {/* Core Title Required: INTERNET MISSION */}
        <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl tracking-wider uppercase text-white mb-4 drop-shadow-[0_4px_24px_rgba(6,182,212,0.35)]">
          Internet{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
            Mission
          </span>
        </h1>

        {/* Required Tagline: “Learn. Build. Complete the Mission.” */}
        <p className="font-display text-lg sm:text-2xl text-cyan-200/90 font-bold tracking-wide max-w-xl mb-3">
          “Learn. Build. Complete the Mission.”
        </p>

        <p className="text-slate-400 text-xs sm:text-sm max-w-md mb-8 leading-relaxed">
          The gamified web coding platform. Master HTML structure, CSS design, and JavaScript behavior through bite-sized missions, memory checks, and real-time live preview.
        </p>

        {/* Primary Call to Action Buttons */}
        <div className="w-full max-w-xs flex flex-col gap-3 items-center mb-8">
          <button
            onClick={() => {
              sound.playClick();
              onStartMission();
            }}
            className="w-full py-4 px-6 rounded-2xl font-display font-bold text-base sm:text-lg text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-sky-400 hover:from-cyan-300 hover:to-sky-300 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:shadow-[0_0_40px_rgba(6,182,212,0.7)] flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>{completedCount > 0 ? 'Resume Mission' : 'Start Mission'}</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-slate-950" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenMissionMap();
            }}
            className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-cyan-300 bg-slate-900/80 hover:bg-slate-800 border border-cyan-900/60 transition-colors flex items-center justify-center gap-2"
          >
            <span>View 7-Section Mission Map</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick App Install Bar if not running standalone */}
        {!isInstalled && (
          <div className="mb-6 w-full max-w-md">
            <button
              onClick={() => {
                sound.playClick();
                if (isInstallable && onTriggerInstall) {
                  onTriggerInstall();
                } else if (onOpenSettings) {
                  onOpenSettings();
                }
              }}
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-blue-950/80 hover:from-cyan-900/90 hover:to-blue-900/90 border border-cyan-500/50 hover:border-cyan-400 text-cyan-200 text-xs font-semibold flex items-center justify-between gap-3 shadow-lg shadow-cyan-500/10 cursor-pointer transition-all active:scale-98 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-display font-bold text-white text-xs uppercase tracking-wider">
                    📱 Install Internet Mission App
                  </div>
                  <div className="text-[10px] text-cyan-400/80">
                    {isInstallable ? '1-Click Install to Home Screen' : 'Install to Android / Desktop Home Screen'}
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-[11px] uppercase tracking-wider shadow-sm shrink-0">
                {isInstallable ? 'Install Now' : 'How to Install'}
              </span>
            </button>
          </div>
        )}

        {/* Quick Live Community Bar */}
        {onOpenCommunity && (
          <div className="mb-4 w-full max-w-md">
            <button
              onClick={() => {
                sound.playClick();
                onOpenCommunity();
              }}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900/80 to-cyan-950/70 border border-cyan-500/40 hover:border-cyan-400 text-left flex items-center justify-between gap-3 group transition-all shadow-md shadow-cyan-500/10 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">💬</span>
                <div>
                  <div className="font-display font-bold text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
                    <span>Live Community Chat</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-[11px] text-cyan-200/80">
                    See active online learners and chat in real-time
                  </div>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs uppercase tracking-wider shadow-sm shrink-0">
                Open 💬
              </span>
            </button>
          </div>
        )}

        {/* Stats Preview Card if learner has progress */}
        {completedCount > 0 && (
          <div className="w-full max-w-md p-4 rounded-2xl bg-slate-900/80 border border-cyan-900/50 backdrop-blur-md mb-8 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Current Protocol
              </span>
              <span className="text-xs text-cyan-400 font-bold">
                {currentLevel.title} (Lvl {currentLevel.level})
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{profile.xp} Total XP</span>
              <span>{completedCount} of {totalMissions} Missions Completed</span>
            </div>
          </div>
        )}

        {/* 3 Sections Grid Preview */}
        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          {SECTIONS.map((sec, idx) => {
            const secMissions = MISSIONS.filter((m) => m.sectionId === sec.id);
            const done = secMissions.filter((m) => profile.completedMissionIds.includes(m.id)).length;
            const isCompleted = profile.completedSectionIds.includes(sec.id);

            return (
              <div
                key={sec.id}
                onClick={() => {
                  sound.playClick();
                  onOpenMissionMap();
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  isCompleted
                    ? 'bg-slate-900/80 border-emerald-500/50 shadow-sm shadow-emerald-500/10'
                    : idx === 0 || profile.completedSectionIds.includes(sec.requiredSectionId as any)
                    ? 'bg-slate-900/90 border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                    : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                  Section {sec.number}
                </div>
                <div className="font-display font-bold text-xs sm:text-sm text-white truncate">
                  {sec.title}
                </div>
                <div className="text-[10px] text-cyan-400 font-semibold mt-1">
                  {isCompleted ? 'Passed ✓' : `${done}/${secMissions.length} Missions`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Structured 10-Mission Sections</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Section Assessments (80% to Pass)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Mistake Learning & Retries</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Local Offline Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
};
