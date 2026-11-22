import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Tv, Download, X, Smartphone, Check } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  onOpenAndroidPackageModal?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = '',
  onOpenAndroidPackageModal
}) => {
  const { isInstallable, isInstalled, isAndroidTV, install } = usePWAInstall();
  const [showTVGuide, setShowTVGuide] = useState(false);

  // If already running as an installed PWA / standalone TV mode, hide button
  if (isInstalled) {
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-[11px] font-mono text-emerald-400 ${className}`}>
        <Check className="w-3.5 h-3.5" />
        <span>GOOGLE TV APP ACTIVE</span>
      </div>
    );
  }

  // Chromium / Android TV / Google TV native prompt
  if (isInstallable) {
    return (
      <button
        id="btn-install-tv-app"
        onClick={install}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs tracking-wider shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer ${className}`}
      >
        <Tv className="w-3.5 h-3.5" />
        <span>Install Google TV App</span>
      </button>
    );
  }

  // Fallback Google TV guide / Android packaging trigger
  return (
    <>
      <button
        id="btn-install-tv-guide"
        onClick={() => {
          if (onOpenAndroidPackageModal) {
            onOpenAndroidPackageModal();
          } else {
            setShowTVGuide(true);
          }
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-amber-400/40 font-bold text-xs tracking-wider transition cursor-pointer ${className}`}
      >
        <Tv className="w-3.5 h-3.5" />
        <span>Google TV / Android App</span>
      </button>

      {showTVGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-amber-400/50 p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-black flex items-center justify-center font-black">
                  <Tv className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold">Install on Google TV / Android</h3>
              </div>
              <button
                onClick={() => setShowTVGuide(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-neutral-300 space-y-3 leading-relaxed">
              <p>
                <strong>Method 1: Direct Google TV PWA</strong><br />
                Open this app in Chrome on Chromecast / Google TV, tap menu (⋮), and select <em>"Add to Home screen / Install"</em>.
              </p>
              <p>
                <strong>Method 2: Standby Fullscreen (Instant)</strong><br />
                Press <strong>F11</strong> or click <em>Fullscreen TV</em> to run the 16:9 stage broadcast in 1080p kiosk mode with full D-pad remote navigation.
              </p>
              <p>
                <strong>Method 3: Native Android APK</strong><br />
                Use Android Studio or Capacitor to build an APK using the provided <code>AndroidManifest.xml</code> and Leanback TV launcher banner.
              </p>
            </div>

            <button
              onClick={() => setShowTVGuide(false)}
              className="w-full py-2 rounded-xl bg-amber-400 text-black font-extrabold text-xs uppercase cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
