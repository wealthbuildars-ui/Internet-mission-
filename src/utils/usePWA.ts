import { useState, useEffect, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface PWADiagnostics {
  manifestStatus: 'PASS' | 'FAIL' | 'CHECKING';
  serviceWorkerStatus: 'PASS' | 'FAIL' | 'CHECKING';
  secureContextStatus: 'PASS' | 'FAIL';
  installPromptAvailable: 'YES' | 'NO';
  standaloneMode: 'YES' | 'NO';
  iconsStatus: 'PASS' | 'FAIL' | 'CHECKING';
  isIframe: boolean;
  explanation: string;
}

const STORAGE_DISMISSED_KEY = 'im_pwa_install_dismissed';

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [hasDismissedPopup, setHasDismissedPopup] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_DISMISSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [diagnostics, setDiagnostics] = useState<PWADiagnostics>({
    manifestStatus: 'CHECKING',
    serviceWorkerStatus: 'CHECKING',
    secureContextStatus: typeof window !== 'undefined' && window.isSecureContext ? 'PASS' : 'FAIL',
    installPromptAvailable: 'NO',
    standaloneMode: 'NO',
    iconsStatus: 'CHECKING',
    isIframe: typeof window !== 'undefined' && window.self !== window.top,
    explanation: 'Evaluating PWA installation criteria...',
  });

  // Verify manifest and icons
  useEffect(() => {
    let isMounted = true;

    // Check standalone mode
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isNavigatorStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      const isAndroidApp = document.referrer.includes('android-app://');
      const installed = isStandaloneMedia || isNavigatorStandalone || isAndroidApp;
      if (isMounted) {
        setIsInstalled(installed);
      }
      return installed;
    };

    const installed = checkStandalone();

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    if (isMounted) {
      setIsIOS(isIOSDevice);
    }

    const isIframe = window.self !== window.top;
    const isSecure = window.isSecureContext;

    // Verify Manifest
    const verifyManifest = async (): Promise<boolean> => {
      try {
        const res = await fetch('/manifest.webmanifest');
        if (!res.ok) throw new Error('Manifest file HTTP ' + res.status);
        const data = await res.json();
        const hasName = data.name === 'Internet Mission';
        const hasShortName = data.short_name === 'Internet Mission';
        const hasStartUrl = !!data.start_url;
        const hasDisplay = data.display === 'standalone';
        const hasTheme = !!data.theme_color;
        const hasBg = !!data.background_color;
        const hasIcons = Array.isArray(data.icons) && data.icons.length >= 2;
        return hasName && hasShortName && hasStartUrl && hasDisplay && hasTheme && hasBg && hasIcons;
      } catch (err) {
        console.warn('PWA Manifest verification warning:', err);
        return false;
      }
    };

    // Verify Service Worker
    const verifyServiceWorker = async (): Promise<boolean> => {
      if (!('serviceWorker' in navigator)) return false;
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        return !!(registration && (registration.active || registration.installing || registration.waiting));
      } catch (err) {
        console.warn('PWA ServiceWorker check warning:', err);
        return false;
      }
    };

    // Verify Icons
    const verifyIcons = (): Promise<boolean> => {
      return new Promise((resolve) => {
        let loaded = 0;
        const iconPaths = ['/pwa-192x192.png', '/pwa-512x512.png'];
        iconPaths.forEach((path) => {
          const img = new Image();
          img.onload = () => {
            loaded++;
            if (loaded === iconPaths.length) resolve(true);
          };
          img.onerror = () => {
            resolve(false);
          };
          img.src = path;
        });
      });
    };

    // Execute checks
    Promise.all([verifyManifest(), verifyServiceWorker(), verifyIcons()]).then(
      ([manifestOk, swOk, iconsOk]) => {
        if (!isMounted) return;

        let explanation = '';
        if (installed) {
          explanation = 'Application is currently running in Standalone Installed Mode.';
        } else if (isIframe) {
          explanation =
            'CRITICAL: The app is running inside an embedded <iframe> preview. Modern browsers (Chrome, Edge, Android) strictly block the native "beforeinstallprompt" event inside iframes for security. Open the preview URL directly in a top-level tab or use your browser\'s menu (⋮) → "Install App".';
        } else if (isIOSDevice) {
          explanation =
            'Apple iOS Safari does not support the "beforeinstallprompt" API. Installation requires tapping the Share button and selecting "Add to Home Screen".';
        } else if (!isSecure) {
          explanation = 'PWA requires an HTTPS secure context or localhost.';
        } else {
          explanation =
            'PWA manifests, icons, and service workers are active. Waiting for browser engagement heuristics to trigger native prompt.';
        }

        setDiagnostics((prev) => ({
          ...prev,
          manifestStatus: manifestOk ? 'PASS' : 'FAIL',
          serviceWorkerStatus: swOk ? 'PASS' : 'FAIL',
          iconsStatus: iconsOk ? 'PASS' : 'FAIL',
          secureContextStatus: isSecure ? 'PASS' : 'FAIL',
          standaloneMode: installed ? 'YES' : 'NO',
          installPromptAvailable: deferredPrompt ? 'YES' : 'NO',
          isIframe,
          explanation,
        }));
      }
    );

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (!isMounted) return;
      setIsInstalled(e.matches);
      setDiagnostics((prev) => ({
        ...prev,
        standaloneMode: e.matches ? 'YES' : 'NO',
      }));
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    // Listen for beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      if (!isMounted) return;
      setDeferredPrompt(promptEvent);
      setDiagnostics((prev) => ({
        ...prev,
        installPromptAvailable: 'YES',
        explanation: 'Native install prompt received from browser. App is ready for 1-click installation!',
      }));
    };

    // Listen for appinstalled
    const handleAppInstalled = () => {
      if (!isMounted) return;
      setIsInstalled(true);
      setDeferredPrompt(null);
      try {
        localStorage.setItem(STORAGE_DISMISSED_KEY, 'true');
      } catch {}
      setDiagnostics((prev) => ({
        ...prev,
        standaloneMode: 'YES',
        installPromptAvailable: 'NO',
        explanation: 'Application successfully installed to device.',
      }));
    };

    // Network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isMounted = false;
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unsupported'> => {
    if (!deferredPrompt) {
      return 'unsupported';
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        try {
          localStorage.setItem(STORAGE_DISMISSED_KEY, 'true');
        } catch {}
      }
      return choice.outcome;
    } catch (err) {
      console.error('PWA install prompt error:', err);
      return 'unsupported';
    }
  }, [deferredPrompt]);

  const dismissPopup = useCallback((remember = true) => {
    setHasDismissedPopup(true);
    if (remember) {
      try {
        localStorage.setItem(STORAGE_DISMISSED_KEY, 'true');
      } catch {}
    }
  }, []);

  const resetDismissedState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_DISMISSED_KEY);
    } catch {}
    setHasDismissedPopup(false);
  }, []);

  // Popup is shown ONLY if the browser actually provided beforeinstallprompt,
  // app is not installed yet, and user has not dismissed it
  const shouldShowPopup = !!deferredPrompt && !isInstalled && !hasDismissedPopup;

  return {
    deferredPrompt,
    isInstallable: !!deferredPrompt && !isInstalled,
    isInstalled,
    isIOS,
    isOnline,
    shouldShowPopup,
    diagnostics,
    triggerInstall,
    dismissPopup,
    resetDismissedState,
  };
}
