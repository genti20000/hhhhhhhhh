import React from 'react';
import { motion } from 'motion/react';
import { 
  Play, 
  Pause, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Crown, 
  Tv, 
  Maximize2, 
  QrCode, 
  Mic, 
  ShieldCheck, 
  Grid, 
  X,
  Volume2
} from 'lucide-react';
import { DisplayScene } from '../../types';

interface GoogleTVQuickBarProps {
  isOpen: boolean;
  onClose: () => void;
  isAutoRotating: boolean;
  onTogglePlayPause: () => void;
  onNextPhoto: () => void;
  onPrevPhoto: () => void;
  activeScene: DisplayScene;
  onSelectScene: (scene: DisplayScene) => void;
  overscanPercent: number;
  onCycleOverscan: () => void;
  overscanGuideVisible: boolean;
  onToggleOverscanGuide: () => void;
  largeQR: boolean;
  onToggleLargeQR: () => void;
  lowerThirdActive: boolean;
  onToggleLowerThird: () => void;
  onOpenAndroidPackageModal: () => void;
  wakeLockActive: boolean;
}

export const GoogleTVQuickBar: React.FC<GoogleTVQuickBarProps> = ({
  isOpen,
  onClose,
  isAutoRotating,
  onTogglePlayPause,
  onNextPhoto,
  onPrevPhoto,
  activeScene,
  onSelectScene,
  overscanPercent,
  onCycleOverscan,
  overscanGuideVisible,
  onToggleOverscanGuide,
  largeQR,
  onToggleLargeQR,
  lowerThirdActive,
  onToggleLowerThird,
  onOpenAndroidPackageModal,
  wakeLockActive,
}) => {
  if (!isOpen) return null;

  return (
    <motion.aside
      aria-label="Google TV Quick Action Menu"
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 80 }}
      className="absolute bottom-0 left-0 right-0 z-50 bg-black/95 border-t-2 border-amber-400/80 p-5 shadow-[0_-20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
    >
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Top Header of Quick Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black shadow-lg">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm uppercase tracking-wider text-white">
                  GOOGLE TV LEANBACK CONTROLLER
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase border border-amber-400/40">
                  D-PAD NAVIGATION
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Use TV remote arrows to navigate · Press OK to select · Press Back or Menu (M) to dismiss
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-mono">
              <span className={`w-2 h-2 rounded-full ${wakeLockActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-neutral-300">WAKELOCK: {wakeLockActive ? 'ACTIVE' : 'STANDBY'}</span>
            </div>

            <button
              id="tv-btn-close-osd"
              data-tv-focus="true"
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
              title="Close Menu (Back/Menu)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons Carousel (Remote Focusable) */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {/* 1. Play / Pause Slideshow */}
          <button
            id="tv-btn-play-pause"
            data-tv-focus="true"
            onClick={onTogglePlayPause}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-amber-400/40 text-amber-300 font-extrabold text-xs uppercase tracking-wider shrink-0 transition cursor-pointer"
          >
            {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isAutoRotating ? 'PAUSE ROTATION' : 'RESUME ROTATION'}</span>
          </button>

          {/* 2. Previous Photo */}
          <button
            id="tv-btn-prev-photo"
            data-tv-focus="true"
            onClick={onPrevPhoto}
            className="flex items-center gap-2 px-3.5 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-bold text-xs uppercase shrink-0 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>PREV</span>
          </button>

          {/* 3. Next Photo */}
          <button
            id="tv-btn-next-photo"
            data-tv-focus="true"
            onClick={onNextPhoto}
            className="flex items-center gap-2 px-3.5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider shrink-0 transition cursor-pointer shadow-lg"
          >
            <span>NEXT PHOTO</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* 4. Switch Scene: Spotlight */}
          <button
            id="tv-btn-scene-spotlight"
            data-tv-focus="true"
            onClick={() => onSelectScene('SPOTLIGHT')}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-black uppercase tracking-wider shrink-0 transition cursor-pointer ${
              activeScene === 'SPOTLIGHT'
                ? 'bg-purple-600/40 border-purple-400 text-purple-200'
                : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>SPOTLIGHT</span>
          </button>

          {/* 5. Switch Scene: Star of the Night */}
          <button
            id="tv-btn-scene-star"
            data-tv-focus="true"
            onClick={() => onSelectScene('STAR_OF_NIGHT')}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-black uppercase tracking-wider shrink-0 transition cursor-pointer ${
              activeScene === 'STAR_OF_NIGHT'
                ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_20px_rgba(234,179,8,0.5)]'
                : 'bg-neutral-900 border-neutral-700 text-amber-300 hover:text-white'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>STAR CEREMONY</span>
          </button>

          {/* 6. Switch Scene: Standby */}
          <button
            id="tv-btn-scene-standby"
            data-tv-focus="true"
            onClick={() => onSelectScene('STANDBY')}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-black uppercase tracking-wider shrink-0 transition cursor-pointer ${
              activeScene === 'STANDBY'
                ? 'bg-neutral-100 text-black border-white'
                : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>STANDBY</span>
          </button>

          {/* 7. Overscan Safe Area Padding */}
          <button
            id="tv-btn-overscan"
            data-tv-focus="true"
            onClick={onCycleOverscan}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-bold text-xs uppercase shrink-0 transition cursor-pointer"
          >
            <Maximize2 className="w-4 h-4 text-cyan-400" />
            <span>OVERSCAN: {overscanPercent}%</span>
          </button>

          {/* 8. TV Calibration Guide Toggle */}
          <button
            id="tv-btn-guide-toggle"
            data-tv-focus="true"
            onClick={onToggleOverscanGuide}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-bold uppercase shrink-0 transition cursor-pointer ${
              overscanGuideVisible
                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300'
                : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>SAFE GUIDE: {overscanGuideVisible ? 'ON' : 'OFF'}</span>
          </button>

          {/* 9. Large QR Code Toggle */}
          <button
            id="tv-btn-qr-size"
            data-tv-focus="true"
            onClick={onToggleLargeQR}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-bold uppercase shrink-0 transition cursor-pointer ${
              largeQR
                ? 'bg-amber-400/30 border-amber-400 text-amber-300'
                : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR SIZE: {largeQR ? 'JUMBO (2X)' : 'NORMAL'}</span>
          </button>

          {/* 10. Now Singing Lower-Third */}
          <button
            id="tv-btn-lower-third"
            data-tv-focus="true"
            onClick={onToggleLowerThird}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-bold uppercase shrink-0 transition cursor-pointer ${
              lowerThirdActive
                ? 'bg-rose-600/30 border-rose-500 text-rose-300'
                : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>LOWER THIRD: {lowerThirdActive ? 'SHOW' : 'HIDE'}</span>
          </button>

          {/* 11. Android TV APK / Manifest Info */}
          <button
            id="tv-btn-android-package"
            data-tv-focus="true"
            onClick={onOpenAndroidPackageModal}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs uppercase tracking-wider shrink-0 transition cursor-pointer shadow-md"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ANDROID TV APK SPEC</span>
          </button>
        </div>
      </div>
    </motion.aside>
  );
};
