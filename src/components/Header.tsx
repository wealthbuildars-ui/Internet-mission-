import React from 'react';
import {
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Shield,
  ArrowLeft,
  RotateCcw,
  Map,
  Brain,
  LayoutDashboard,
  LogOut,
  User,
  Settings,
  Smartphone,
  Music,
  CheckCircle2,
  Users,
  FolderCode,
  Code2,
  Share2,
} from 'lucide-react';
import { UserProfile, AppView } from '../types';
import { getLevelInfo } from '../data/levels';
import { sound } from '../utils/sound';

export type { AppView };

interface HeaderProps {
  profile: UserProfile;
  onToggleSound: () => void;
  onToggleMusic?: () => void;
  isMusicPlaying?: boolean;
  onNavigateHome: () => void;
  onNavigateMap: () => void;
  onNavigateProjects?: () => void;
  onNavigatePlayground?: () => void;
  onNavigateRevision?: () => void;
  onNavigateMemory: () => void;
  onNavigateDashboard: () => void;
  onResetProgress?: () => void;
  onLogout?: () => void;
  onOpenSettings?: () => void;
  onOpenCommunity?: () => void;
  onTriggerInstall?: () => void;
  isInstallable?: boolean;
  isInstalled?: boolean;
  currentView: AppView;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onToggleSound,
  onToggleMusic,
  isMusicPlaying = false,
  onNavigateHome,
  onNavigateMap,
  onNavigateProjects,
  onNavigatePlayground,
  onNavigateRevision,
  onNavigateMemory,
  onNavigateDashboard,
  onResetProgress,
  onLogout,
  onOpenSettings,
  onOpenCommunity,
  onTriggerInstall,
  isInstallable,
  isInstalled,
  currentView,
}) => {
  const { currentLevel } = getLevelInfo(profile.xp);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-900/40 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
        {/* Brand or Back */}
        <div className="flex items-center gap-2 shrink-0">
          {currentView === 'mission' ? (
            <button
              onClick={onNavigateMap}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-900/60 transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Back to Mission Map"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Map</span>
            </button>
          ) : null}

          <div
            onClick={onNavigateHome}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="relative">
              <img
                src="/logo.png"
                alt="Internet Mission Logo"
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-xl drop-shadow-[0_0_10px_rgba(6,182,212,0.6)] group-hover:scale-105 group-hover:drop-shadow-[0_0_14px_rgba(6,182,212,0.9)] transition-all"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="font-display font-black text-sm tracking-wider uppercase bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                Internet Mission
              </div>
              <div className="text-[10px] text-slate-400 -mt-0.5 tracking-wide hidden sm:block">
                Level {currentLevel.level} • {currentLevel.title}
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs (Map, Projects, Playground, Revision, Profile, Community) */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-display font-semibold overflow-x-auto">
          <button
            onClick={() => {
              sound.playClick();
              onNavigateMap();
            }}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all shrink-0 ${
              currentView === 'map'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Tactical Mission Grid"
          >
            <Map className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Missions</span>
          </button>

          {onNavigateProjects && (
            <button
              onClick={() => {
                sound.playClick();
                onNavigateProjects();
              }}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all shrink-0 ${
                currentView === 'projects'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Project Mode - Build Websites"
            >
              <FolderCode className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Projects</span>
            </button>
          )}

          {onNavigatePlayground && (
            <button
              onClick={() => {
                sound.playClick();
                onNavigatePlayground();
              }}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all shrink-0 ${
                currentView === 'playground'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Code Playground Sandbox"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Playground</span>
            </button>
          )}

          {onNavigateRevision && (
            <button
              onClick={() => {
                sound.playClick();
                onNavigateRevision();
              }}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all shrink-0 ${
                currentView === 'revision'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Revision Center & Weak Areas"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Revision</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onNavigateDashboard();
            }}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all shrink-0 ${
              currentView === 'dashboard'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Profile, Statistics & History"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Profile</span>
          </button>

          {/* Always-visible 💬 Community Button */}
          <button
            onClick={() => {
              sound.playClick();
              if (onOpenCommunity) {
                onOpenCommunity();
              } else if (onOpenSettings) {
                onOpenSettings();
              }
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 hover:from-cyan-900 hover:to-indigo-900 text-cyan-300 hover:text-white border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all font-display font-bold text-xs uppercase cursor-pointer shrink-0"
            title="Open Live Community (Chat & Active Learners)"
          >
            <span className="text-sm leading-none drop-shadow">💬</span>
            <span className="hidden xs:inline sm:inline">Community</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </span>
          </button>
        </div>

        {/* Stats Badges & User Info */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* User Codename Pill */}
          <div
            onClick={onNavigateDashboard}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold cursor-pointer hover:border-cyan-500/50 transition-colors"
            title={`Logged in as ${profile.name} (@${profile.username})`}
          >
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[80px]">{profile.name}</span>
          </div>

          {/* XP Pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{profile.xp}</span>
            <span className="text-[10px] text-cyan-500 uppercase tracking-wider font-bold">XP</span>
          </div>

          {/* Streak Pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>{profile.streak}</span>
          </div>

          {/* Prominent Install App Button (Visible on mobile and desktop) */}
          {isInstalled ? (
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-semibold"
              title="Internet Mission is running as an installed standalone app"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Installed</span>
            </div>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                if (isInstallable && onTriggerInstall) {
                  onTriggerInstall();
                } else if (onOpenSettings) {
                  onOpenSettings();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-md shadow-cyan-500/30 active:scale-95 transition-all cursor-pointer animate-pulse shrink-0 border border-cyan-300"
              title="Install Internet Mission to your Android or Desktop home screen"
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
              <span>📱 Install</span>
            </button>
          )}

          {/* Sound FX Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors cursor-pointer"
            title={profile.soundEnabled ? 'Mute Sound FX' : 'Unmute Sound FX'}
          >
            {profile.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Game Music Toggle ("I'm Only Human" - Chizi Wave) */}
          {onToggleMusic && (
            <button
              onClick={() => {
                sound.playClick();
                onToggleMusic();
              }}
              className={`px-2 py-1.5 rounded-lg transition-all cursor-pointer border flex items-center gap-1.5 ${
                isMusicPlaying
                  ? 'bg-cyan-950/90 hover:bg-cyan-900 border-cyan-500/60 text-cyan-300 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-500 hover:text-cyan-300'
              }`}
              title={
                isMusicPlaying
                  ? 'Playing: "I\'m Only Human" — Chizi Wave (Click to pause)'
                  : 'Play Soundtrack: "I\'m Only Human" — Chizi Wave'
              }
            >
              <Music className={`w-3.5 h-3.5 ${isMusicPlaying ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
              <span className="hidden md:inline text-[11px] font-bold font-display">
                {isMusicPlaying ? '🎵 Human' : 'Music'}
              </span>
            </button>
          )}

          {/* Settings Modal Button */}
          {onOpenSettings && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenSettings();
              }}
              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors cursor-pointer"
              title="Settings & System"
            >
              <Settings className="w-4 h-4 text-cyan-400" />
            </button>
          )}

          {/* Switch Profile / Logout */}
          {onLogout && (
            <button
              onClick={() => {
                sound.playClick();
                onLogout();
              }}
              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-500 hover:text-cyan-400 border border-slate-800 transition-colors cursor-pointer"
              title="Logout / Switch Profile"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Reset progress */}
          {onResetProgress && (
            <button
              onClick={onResetProgress}
              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-500 hover:text-rose-400 border border-slate-800 transition-colors hidden sm:block cursor-pointer"
              title="Reset All Progress"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
