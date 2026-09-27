import React, { useState } from 'react';
import { WifiOff, X, CheckCircle2 } from 'lucide-react';

interface OfflineBannerProps {
  isOnline: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOnline }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isOnline || isDismissed) return null;

  return (
    <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white px-3 sm:px-4 py-2 border-b border-amber-500/40 shadow-lg shadow-amber-950/40 animate-in slide-in-from-top duration-300">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-md bg-amber-950/60 border border-amber-400/40 text-amber-200">
            <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <span className="font-display font-black tracking-wider uppercase mr-1.5 text-amber-200">
              📡 OFFLINE MODE
            </span>
            <span className="font-medium text-amber-100">
              “You're offline, but your saved missions are still available.”
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-amber-200/90 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Local progress autosaved
          </span>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded text-amber-200 hover:text-white hover:bg-amber-800/60 transition-colors"
            title="Dismiss Offline Alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
