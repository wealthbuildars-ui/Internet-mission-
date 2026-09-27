import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fadeState, setFadeState] = useState<'enter' | 'ready' | 'exit'>('enter');

  useEffect(() => {
    // Stage 1: Enter immediately
    const t1 = setTimeout(() => {
      setFadeState('ready');
    }, 400);

    // Stage 2: Begin exit transition at 1.4s
    const t2 = setTimeout(() => {
      setFadeState('exit');
    }, 1400);

    // Stage 3: Complete transition at 1.8s
    const t3 = setTimeout(() => {
      onFinish();
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onFinish]);

  return (
    <div
      onClick={onFinish}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030712] select-none cursor-pointer transition-opacity duration-400 ${
        fadeState === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background cyber radial glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/15 rounded-full blur-2xl" />
      </div>

      <div className="relative flex flex-col items-center text-center px-4 max-w-sm">
        {/* Glowing Logo */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-cyan-400/40 rounded-3xl blur-xl animate-pulse" />
          <img
            src="/logo.png"
            alt="Internet Mission Logo"
            className="relative w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-2xl drop-shadow-[0_0_25px_rgba(6,182,212,0.8)]"
          />
        </div>

        {/* Branding Typography */}
        <div className="font-display font-black text-3xl sm:text-4xl tracking-widest uppercase leading-none bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
          INTERNET
        </div>
        <div className="font-display font-black text-3xl sm:text-4xl tracking-widest uppercase leading-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
          MISSION
        </div>

        {/* Tagline */}
        <div className="mt-3 font-mono text-xs sm:text-sm text-cyan-300 font-semibold tracking-wider">
          “Learn. Build. Level Up.”
        </div>

        {/* Cyber Progress Indicator */}
        <div className="mt-8 w-48 h-1 rounded-full bg-slate-900 overflow-hidden border border-cyan-900/60">
          <div className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 animate-[pulse_1s_ease-in-out_infinite] w-full" />
        </div>

        <div className="mt-2 text-[10px] font-mono text-slate-500 tracking-widest uppercase">
          INITIALIZING RECRUIT TERMINAL...
        </div>
      </div>
    </div>
  );
};
