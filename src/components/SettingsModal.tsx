import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  X,
  Volume2,
  VolumeX,
  Smartphone,
  CheckCircle2,
  Share2,
  RotateCcw,
  LogOut,
  Wifi,
  WifiOff,
  Info,
  Shield,
  Sparkles,
  Music,
  Egg,
  Radio,
  Zap,
  Terminal,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Upload,
  Headphones,
  Disc,
  Mail,
  Phone,
  MessageCircle,
  Users,
  Copy,
  Check,
  AlertCircle,
  Download,
  Globe,
} from 'lucide-react';
import { UserProfile } from '../types';
import { MISSIONS } from '../data/missions';
import { sound } from '../utils/sound';
import { PWADiagnostics } from '../utils/usePWA';
import { getPublicAppUrl } from '../utils/appUrl';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  isMusicPlaying: boolean;
  onResetProgress: () => void;
  onLogout: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isOnline: boolean;
  diagnostics?: PWADiagnostics;
  onTriggerInstall: () => void;
  initialSection?: 'settings' | 'community' | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onToggleSound,
  onToggleMusic,
  isMusicPlaying,
  onResetProgress,
  onLogout,
  isInstallable,
  isInstalled,
  isIOS,
  isOnline,
  diagnostics,
  onTriggerInstall,
  initialSection,
}) => {
  const communityRef = useRef<HTMLDivElement>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [hatchState, setHatchState] = useState<'idle' | 'wobbling' | 'shattering' | 'hatched'>('idle');
  const [isUploadingMusic, setIsUploadingMusic] = useState(false);
  const [musicMessage, setMusicMessage] = useState<string | null>(null);
  const [musicVolume, setMusicVolume] = useState<number>(65);
  const [copiedLink, setCopiedLink] = useState(false);

  const publicUrl = getPublicAppUrl();

  useEffect(() => {
    if (isOpen && initialSection === 'community') {
      const timer = setTimeout(() => {
        communityRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialSection]);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMusic(true);
    setMusicMessage('Loading song into game engine...');

    const success = await sound.loadAudioFile(file);
    setIsUploadingMusic(false);

    if (success) {
      sound.playSuccess();
      setMusicMessage('✓ "I\'m Only Human" (Chizi Wave) loaded & active!');
      setTimeout(() => setMusicMessage(null), 4000);
    } else {
      sound.playFail();
      setMusicMessage('Could not load audio file. Please try a valid MP3 or WAV.');
      setTimeout(() => setMusicMessage(null), 4000);
    }
  };

  const handleVolumeChange = (newVal: number) => {
    setMusicVolume(newVal);
    sound.setMusicVolume(newVal / 100);
  };

  if (!isOpen) return null;

  const triggerHatchingTest = () => {
    if (hatchState !== 'idle') return;
    setHatchState('wobbling');

    sound.playHatching(() => {
      setHatchState('shattering');
      setTimeout(() => {
        setHatchState('hatched');
        setTimeout(() => {
          setHatchState('idle');
        }, 3200);
      }, 200);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl p-5 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-white uppercase tracking-wider">
                Settings & System
              </h2>
              <p className="text-xs text-slate-400">Configure Internet Mission preferences</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: PWA Installation (Requirements 5, 6, 7) */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span className="font-display font-bold text-xs uppercase tracking-wider text-white">
                Application Mode
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isInstalled
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              }`}
            >
              {isInstalled ? 'STANDALONE APP' : 'WEB CLIENT'}
            </span>
          </div>

          {/* Intelligent Button State (Requirement 5) */}
          {isInstalled ? (
            /* State: Already Installed (Requirement 7) */
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-display font-bold text-xs uppercase tracking-wider">
                    ✓ INSTALLED
                  </div>
                  <div className="text-[11px] text-emerald-300/80">
                    Internet Mission is running as an installed standalone app.
                  </div>
                </div>
              </div>
            </div>
          ) : isInstallable ? (
            /* State: Install Prompt Available (Requirement 5) */
            <div className="space-y-2">
              <p className="text-xs text-slate-300 leading-relaxed">
                Install Internet Mission to your Android or desktop home screen for the full standalone experience.
              </p>
              <button
                onClick={() => {
                  sound.playSuccess();
                  onTriggerInstall();
                }}
                className="w-full py-3 px-4 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>📱 INSTALL NOW</span>
              </button>
            </div>
          ) : (
            /* State: Browser does not support native prompt / in iframe (Requirements 5 & 6) */
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-800/60 text-xs space-y-2.5">
                <div className="font-semibold text-cyan-300 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-cyan-400" />
                    <span>How to Install</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
                    HOW TO INSTALL
                  </span>
                </div>
                {isIOS ? (
                  <div className="text-slate-300 text-[11px] leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                    <strong className="text-white">To install on iPhone / iPad (iOS Safari):</strong>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300">
                      <li>Tap the <strong>Share</strong> button (box with upward arrow) in the Safari toolbar.</li>
                      <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                      <li>Tap <strong>Add</strong> in the top right corner.</li>
                    </ol>
                  </div>
                ) : (
                  <div className="text-slate-300 text-[11px] leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    “Your browser does not currently provide the quick install prompt.
                    <br /><br />
                    <strong>To install Internet Mission:</strong><br />
                    Open your browser menu (⋮) → <strong>Add to Home screen / Install app</strong>.”
                  </div>
                )}
                {diagnostics?.isIframe && (
                  <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-amber-300/90">
                    <span>💡 <em>Preview note:</em> Browser security prohibits native install dialogs inside preview iframes.</span>
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open in New Tab</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Share App with Friends (Solves 403 Forbidden Error & Explains WhatsApp Webview) */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-display font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>📲 Share App with Friends</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                PUBLIC LINK
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Always share this official public link. <strong>Never</strong> copy the URL directly from your browser's address bar while inside the AI Studio editor (<code className="text-rose-300">aistudio.google.com</code>), because Google blocks other users with an <strong>Error 403 (Forbidden)</strong>!
            </p>

            {/* Link display & copy */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono focus:outline-none"
              />
              <button
                onClick={() => {
                  sound.playClick();
                  navigator.clipboard.writeText(publicUrl);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="shrink-0 px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Direct WhatsApp Share button */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Hey! Check out Internet Mission to learn HTML, CSS & JavaScript through practical coding missions: ' + publicUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share to Friends on WhatsApp</span>
            </a>

            {/* WhatsApp In-App Webview Notice */}
            <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-[11px] text-amber-200/90 space-y-1">
              <div className="font-bold flex items-center gap-1 text-amber-300">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>If opening link inside WhatsApp on phone:</span>
              </div>
              <p className="text-[10px] leading-relaxed">
                WhatsApp's built-in browser blocks PWA installation. Instruct your friend to tap the <strong>3 dots (⋮)</strong> at the top right corner of WhatsApp's browser and choose <strong>"Open in Chrome"</strong> (or Safari on iPhone), then tap <strong>"Install App"</strong>!
              </p>
            </div>
          </div>

          {/* Publish to GitHub & Free Hosting (Vercel / Netlify) */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/50 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-display font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-400" />
                <span>🐙 Publish to GitHub & Free Hosting</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                100% PUBLIC & FREE
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Google Cloud preview links can require Google permissions or block external friends. Hosting on <strong>GitHub + Vercel or Netlify</strong> gives you a permanent, free public URL (e.g. <code className="text-cyan-300">internet-mission.vercel.app</code>) that any friend can open and install instantly with zero login blocks!
            </p>

            {/* Download Clean Source Code .zip Button */}
            <a
              href="/api/download-source"
              download="internet-mission-source.zip"
              onClick={() => sound.playSuccess()}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Complete GitHub Zip (.zip)</span>
            </a>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
              <strong className="text-cyan-300 block">How to publish in 2 minutes:</strong>
              <ol className="list-decimal list-inside space-y-1 text-[10px] text-slate-300">
                <li>Click the download button above to get <strong>internet-mission-source.zip</strong>.</li>
                <li>Go to <strong className="text-white">github.com/new</strong> and create a new repository named <code className="text-cyan-300">internet-mission</code>.</li>
                <li>Upload the files to your GitHub repository (or drag-and-drop the unzipped folder).</li>
                <li>Go to <strong className="text-white">vercel.com</strong> or <strong className="text-white">netlify.com</strong>, click <em>Import from GitHub</em>, and click <em>Deploy</em>!</li>
              </ol>
              <div className="text-[10px] text-emerald-400 font-semibold pt-1">
                ✓ Free permanent URL • ✓ Installs on any Android/iPhone • ✓ Works 100% for all friends
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Audio, Music & Hatching Sounds */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span className="font-display font-bold text-xs uppercase tracking-wider text-white">
                Audio & Game Music System
              </span>
            </div>
          </div>

          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                {profile.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <span className="font-semibold text-xs text-white">
                  Sound Effects (SFX)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Synthesized tactile clicks, level up cues, and victory sounds
              </p>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onToggleSound();
              }}
              className={`px-3 py-1.5 rounded-xl font-display font-bold text-xs transition-colors cursor-pointer border ${
                profile.soundEnabled
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {profile.soundEnabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          {/* Official Game Soundtrack ("I'm Only Human" - Chizi Wave) */}
          <div className="pt-3 border-t border-slate-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Disc className={`w-4 h-4 text-cyan-400 ${isMusicPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                  <span className="font-semibold text-xs text-white">
                    Official Game Soundtrack
                  </span>
                  {isMusicPlaying && (
                    <span className="flex items-center gap-0.5 ml-1">
                      <span className="w-1 h-3 bg-indigo-400 animate-pulse rounded-full" />
                      <span className="w-1 h-4 bg-cyan-400 animate-pulse delay-75 rounded-full" />
                      <span className="w-1 h-2 bg-blue-400 animate-pulse delay-150 rounded-full" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  <strong className="text-cyan-300">"I'm Only Human"</strong> by <strong className="text-white">Chizi Wave</strong>
                </p>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  onToggleMusic();
                }}
                className={`px-3 py-1.5 rounded-xl font-display font-bold text-xs transition-colors cursor-pointer border ${
                  isMusicPlaying
                    ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {isMusicPlaying ? 'PLAYING 🎵' : 'PLAY MUSIC'}
              </button>
            </div>

            {/* Track Info & Mode Badge */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Headphones className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-300 font-medium">Soundtrack Mode:</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-950 border border-cyan-800 text-cyan-300">
                  {sound.isCustomTrackLoaded ? 'STUDIO MASTER TRACK' : 'SYNTHESIZER CHORDS'}
                </span>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[11px] text-slate-400 font-medium shrink-0">Volume</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicVolume}
                  onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-[10px] text-cyan-400 font-mono w-7 text-right shrink-0">
                  {musicVolume}%
                </span>
              </div>

              {/* Upload Song File Option */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-400">
                  Load your original audio file into the game:
                </div>
                <div>
                  <input
                    type="file"
                    id="theme-file-input"
                    accept="audio/*,.mp3,.wav,.ogg,.m4a"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="theme-file-input"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                      isUploadingMusic
                        ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                        : 'bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border-cyan-700/80 hover:border-cyan-500 active:scale-95'
                    }`}
                  >
                    <Upload className="w-3 h-3 text-cyan-400" />
                    <span>{isUploadingMusic ? 'Loading...' : 'Select Song File'}</span>
                  </label>
                </div>
              </div>

              {musicMessage && (
                <div className="text-[11px] p-2 rounded-lg bg-cyan-950/60 border border-cyan-700/60 text-cyan-200 text-center animate-in fade-in duration-150">
                  {musicMessage}
                </div>
              )}
            </div>
          </div>

          {/* Hatching Gaming Sound FX Station */}
          <div className="pt-3 border-t border-slate-800/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Egg className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-xs text-amber-300">
                  🐣 Hatching Gaming Sound & FX
                </span>
              </div>
              <span className="text-[10px] text-amber-400/80 font-mono">
                {hatchState === 'idle'
                  ? 'READY'
                  : hatchState === 'wobbling'
                  ? 'CRACKING...'
                  : hatchState === 'shattering'
                  ? 'BURST!'
                  : 'HATCHED! 🎉'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Animated Egg */}
                <div
                  onClick={triggerHatchingTest}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 border ${
                    hatchState === 'hatched'
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300 scale-110 shadow-lg shadow-emerald-500/30'
                      : hatchState === 'wobbling'
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300 animate-bounce'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-amber-400 hover:text-amber-300'
                  }`}
                  title="Tap egg to hatch!"
                >
                  {hatchState === 'hatched' ? (
                    <Sparkles className="w-6 h-6 animate-spin text-amber-300" />
                  ) : (
                    <Egg className={`w-6 h-6 ${hatchState === 'wobbling' ? 'animate-wiggle' : ''}`} />
                  )}
                </div>

                <div className="space-y-0.5 text-left">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Gaming Hatching Sequence</span>
                    <span className="text-[10px] text-cyan-400 px-1.5 py-0.2 bg-cyan-950 rounded">5-Stage FX</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Wobble → Shell cracks → Burst pop → Newborn fanfare melody
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    sound.playEggCrack(1.2);
                  }}
                  className="flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-semibold cursor-pointer transition-colors"
                  title="Play single shell crack"
                >
                  ⚡ Crack
                </button>

                <button
                  onClick={triggerHatchingTest}
                  disabled={hatchState !== 'idle'}
                  className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 text-xs font-display font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{hatchState === 'idle' ? 'Play Hatching' : 'Hatching...'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Connectivity & Cache Status */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-emerald-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-amber-400" />
              )}
              <span className="font-display font-bold text-xs uppercase tracking-wider text-white">
                Network & Offline Engine
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isOnline
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {isOnline ? 'ONLINE' : 'OFFLINE MODE'}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            {Array.isArray(MISSIONS) && MISSIONS.length > 0
              ? `${MISSIONS.length} learning missions, DOM validators, XP tracking, and offline assets are stored locally in your browser.`
              : 'Available learning missions, DOM validators, XP tracking, and offline assets are stored locally in your browser.'}
          </p>
        </div>

        {/* Section 4: Developer Diagnostics Panel (Requirement 8) */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
          <button
            onClick={() => {
              sound.playClick();
              setShowDebugPanel(!showDebugPanel);
            }}
            className="w-full flex items-center justify-between text-left text-xs text-slate-300 font-semibold cursor-pointer hover:text-white"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>🛠️ Developer Diagnostics (PWA)</span>
            </div>
            {showDebugPanel ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showDebugPanel && (
            <div className="pt-2 border-t border-slate-800 space-y-3 text-xs">
              <div className="font-display font-bold text-white text-xs uppercase tracking-wider">
                PWA Diagnostics
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Manifest:</span>
                  <span
                    className={`font-bold ${
                      diagnostics?.manifestStatus === 'PASS' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {diagnostics?.manifestStatus || 'CHECKING'}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Service Worker:</span>
                  <span
                    className={`font-bold ${
                      diagnostics?.serviceWorkerStatus === 'PASS' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {diagnostics?.serviceWorkerStatus || 'CHECKING'}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">HTTPS/Secure:</span>
                  <span
                    className={`font-bold ${
                      diagnostics?.secureContextStatus === 'PASS' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {diagnostics?.secureContextStatus || 'PASS'}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Install Prompt:</span>
                  <span
                    className={`font-bold ${
                      diagnostics?.installPromptAvailable === 'YES' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {diagnostics?.installPromptAvailable || 'NO'}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Standalone Mode:</span>
                  <span
                    className={`font-bold ${
                      diagnostics?.standaloneMode === 'YES' ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {diagnostics?.standaloneMode || 'NO'}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Icons:</span>
                  <span
                    className={`font-bold ${
                      diagnostics?.iconsStatus === 'PASS' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {diagnostics?.iconsStatus || 'CHECKING'}
                  </span>
                </div>
              </div>

              {diagnostics?.explanation && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed font-sans">
                  <span className="font-semibold text-cyan-400">Diagnostic Analysis: </span>
                  {diagnostics.explanation}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 5: Contact & Community */}
        <div
          ref={communityRef}
          id="contact-community-section"
          className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-800/60 p-4 sm:p-5 space-y-4 shadow-xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="font-display font-bold text-xs uppercase tracking-wider text-white">
                Contact & Community
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
              OFFICIAL CHANNELS
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Connect with the Internet Mission community, ask questions, follow updates, and build alongside learners across the globe.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Card 1: Official Email */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/90 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800/80 text-cyan-400 shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    📧 Contact
                  </span>
                  <a
                    href="mailto:internetmissionHtml@gmail.com"
                    className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-colors break-all"
                  >
                    internetmissionHtml@gmail.com
                  </a>
                </div>
              </div>

              <a
                href="mailto:internetmissionHtml@gmail.com"
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-cyan-950/70 border border-slate-800 hover:border-cyan-700/60 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </a>
            </div>

            {/* Card 2: Contact Phone */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/90 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800/80 text-emerald-400 shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    📱 Contact
                  </span>
                  <a
                    href="tel:+2349162072645"
                    className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 transition-colors"
                  >
                    +234 916 207 2645
                  </a>
                </div>
              </div>

              <a
                href="tel:+2349162072645"
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-emerald-950/70 border border-slate-800 hover:border-emerald-700/60 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call / Contact</span>
              </a>
            </div>

            {/* Card 3: WhatsApp Channel */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-emerald-900/50 hover:border-emerald-500/60 transition-all flex flex-col justify-between space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-700 text-emerald-400 shrink-0 mt-0.5">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    📢 WhatsApp Channel
                  </span>
                  <p className="text-xs text-slate-300 font-medium">
                    Follow Internet Mission on WhatsApp
                  </p>
                </div>
              </div>

              <a
                href="https://whatsapp.com/channel/0029Vb7FoRi3QxS3AL6Wej1e"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer"
              >
                <span>📢 Follow Internet Mission on WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>

            {/* Card 4: WhatsApp Community */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-cyan-900/50 hover:border-cyan-500/60 transition-all flex flex-col justify-between space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-700 text-cyan-400 shrink-0 mt-0.5">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                    💬 WhatsApp Community
                  </span>
                  <p className="text-xs text-slate-300 font-medium">
                    Join the Internet Mission Community
                  </p>
                </div>
              </div>

              <a
                href="https://chat.whatsapp.com/EVCWh9Vxfk2KLzOdpQMzYJ"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-md shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer"
              >
                <span>💬 Join Internet Mission Community</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          </div>
        </div>

        {/* Section 6: Profile & Safety Actions */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="font-display font-bold text-xs uppercase tracking-wider text-white">
              Profile Management
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
                onLogout();
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Switch Profile</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
                onResetProgress();
              }}
              className="py-2.5 px-3 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Reset Progress</span>
            </button>
          </div>
        </div>

        {/* Settings / About Area Footer */}
        <div className="pt-4 border-t border-slate-800 text-center space-y-1">
          <div className="font-display font-black text-sm uppercase tracking-wider text-cyan-400">
            Internet Mission
          </div>
          <div className="text-xs text-slate-300 font-semibold tracking-wide">
            Learn. Build. Level Up.
          </div>
          <div className="text-[11px] text-slate-500 pt-1">
            © Internet Mission
          </div>
          <div className="text-[10px] text-slate-600 tracking-widest pt-0.5">
            INTERNET MISSION PWA • BUILD v1.2.0 • OFFLINE READY
          </div>
        </div>
      </div>
    </div>
  );
};
