import React, { useState } from 'react';
import { Shield, Sparkles, User, Lock, ArrowRight, UserPlus, KeyRound, CheckCircle2, ChevronRight, RotateCcw } from 'lucide-react';
import { UserProfile } from '../types';
import { getAllProfiles, createProfile, loginProfile, setActiveProfileId } from '../utils/storage';
import { sound } from '../utils/sound';

interface LoginScreenProps {
  onLoginSuccess: (profile: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const existingProfiles = getAllProfiles();
  const profileList = Object.values(existingProfiles);
  const mostRecentProfile = profileList.sort(
    (a, b) => new Date(b.lastLoginAt || b.createdAt).getTime() - new Date(a.lastLoginAt || a.createdAt).getTime()
  )[0] || null;

  const [mode, setMode] = useState<'welcome' | 'create' | 'login'>(
    mostRecentProfile ? 'welcome' : 'create'
  );

  const [name, setName] = useState('');
  const [username, setUsername] = useState(mostRecentProfile?.username || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleQuickContinue = (profile: UserProfile) => {
    sound.playSuccess();
    setActiveProfileId(profile.id);
    onLoginSuccess(profile);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide your name or codename.');
      sound.playFail();
      return;
    }
    if (!username.trim()) {
      setError('Please enter a username.');
      sound.playFail();
      return;
    }
    if (existingProfiles[username.trim().toLowerCase()]) {
      setError('A profile with this username already exists on this device.');
      sound.playFail();
      return;
    }
    if (!password) {
      setError('Please set a password for this learning profile.');
      sound.playFail();
      return;
    }

    sound.playSuccess();
    const newProfile = createProfile(name, username, password);
    onLoginSuccess(newProfile);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter your username.');
      sound.playFail();
      return;
    }

    const res = loginProfile(username, password);
    if (!res.success || !res.profile) {
      sound.playFail();
      setError(res.error || 'Authentication failed.');
      return;
    }

    sound.playSuccess();
    onLoginSuccess(res.profile);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center p-4 bg-[#030712] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-gradient-to-tr from-cyan-600/20 via-blue-600/10 to-indigo-600/5 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 cyber-grid-bg opacity-35 pointer-events-none" />

      {/* Main Terminal Box */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-cyan-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md cyber-glow-cyan">
        {/* Terminal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 group">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-xl group-hover:blur-2xl transition-all pointer-events-none" />
            <img
              src="/logo.png"
              alt="Internet Mission Logo"
              className="relative w-full h-full object-contain mx-auto drop-shadow-[0_4px_20px_rgba(6,182,212,0.6)] group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="inline-block px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-[10px] font-bold text-cyan-300 uppercase tracking-widest font-display">
            Local Learning Terminal
          </div>

          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wider">
            Internet Mission
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            “Learn. Build. Complete the Mission.”
          </p>
        </div>

        {/* MODE: WELCOME BACK (If a profile exists) */}
        {mode === 'welcome' && mostRecentProfile && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/40 text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                  Active Local Profile
                </span>
                <span className="text-xs text-cyan-400 font-bold">
                  {mostRecentProfile.xp} XP
                </span>
              </div>
              <h2 className="font-display font-bold text-lg text-white">
                “Welcome back, {mostRecentProfile.name}!”
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Username: @{mostRecentProfile.username} • {mostRecentProfile.completedMissionIds.length} Missions Completed
              </p>
            </div>

            <button
              onClick={() => handleQuickContinue(mostRecentProfile)}
              className="w-full py-3.5 px-6 rounded-xl font-display font-bold text-base text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 active:scale-98 transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue Mission</span>
              <ArrowRight className="w-5 h-5 text-slate-950" />
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setMode('login');
                }}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Log In as Another User
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setMode('create');
                }}
                className="text-slate-400 hover:text-white font-medium transition-colors"
              >
                + Create New Profile
              </button>
            </div>
          </div>
        )}

        {/* MODE: CREATE PROFILE */}
        {mode === 'create' && (
          <form onSubmit={handleCreate} className="space-y-4 animate-in fade-in duration-200">
            <div className="text-left">
              <h2 className="font-display font-bold text-lg text-white">
                Create Learner Profile
              </h2>
              <p className="text-xs text-slate-400">
                Saved locally on this device to track your missions, assessments, and XP.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-600/70 text-rose-200 text-xs text-left">
                {error}
              </div>
            )}

            <div className="space-y-3 text-left">
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">
                  Full Name / Codename
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Hunter"
                    className="w-full bg-slate-950 text-white pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 text-xs sm:text-sm outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">
                  Username
                </label>
                <div className="relative">
                  <span className="text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="alexcoder"
                    className="w-full bg-slate-950 text-white pl-8 pr-3 py-2.5 rounded-xl border border-slate-800 text-xs sm:text-sm outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">
                  Profile Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 text-white pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 text-xs sm:text-sm outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl font-display font-bold text-sm sm:text-base text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 active:scale-98 transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <UserPlus className="w-4 h-4 text-slate-950" />
              <span>Create Profile</span>
            </button>

            {/* Quick 1-Tap Instant Start for Friends & New Cadets */}
            <div className="relative py-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <span className="relative px-3 bg-slate-900 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Or start in 1-tap
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playSuccess();
                const randomId = Math.floor(100 + Math.random() * 900);
                const quickName = name.trim() || `Cadet ${randomId}`;
                const quickUser = (username.trim() || `cadet_${randomId}`).toLowerCase();
                const quickPass = password || 'cadet123';
                const newProfile = createProfile(quickName, quickUser, quickPass);
                onLoginSuccess(newProfile);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 hover:border-cyan-500/80 font-display font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>🚀 1-Tap Quick Play (No Signup Delay)</span>
            </button>

            {profileList.length > 0 && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setMode('welcome');
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  ← Return to existing profile
                </button>
              </div>
            )}
          </form>
        )}

        {/* MODE: LOG IN EXISTING USER */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in duration-200">
            <div className="text-left">
              <h2 className="font-display font-bold text-lg text-white">
                Learner Profile Login
              </h2>
              <p className="text-xs text-slate-400">
                Log into an existing local profile on this device.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-600/70 text-rose-200 text-xs text-left">
                {error}
              </div>
            )}

            <div className="space-y-3 text-left">
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">
                  Username
                </label>
                <div className="relative">
                  <span className="text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="alexcoder"
                    className="w-full bg-slate-950 text-white pl-8 pr-3 py-2.5 rounded-xl border border-slate-800 text-xs sm:text-sm outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 text-white pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 text-xs sm:text-sm outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl font-display font-bold text-sm sm:text-base text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 active:scale-98 transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setMode('create');
                }}
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Create New Profile
              </button>

              {mostRecentProfile && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setMode('welcome');
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Quick Welcome
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <div className="relative z-10 text-[11px] text-slate-500 mt-6 text-center max-w-sm">
        Profiles, assessments, and learning progression are stored locally in your browser’s storage for offline readiness.
      </div>
    </div>
  );
};
