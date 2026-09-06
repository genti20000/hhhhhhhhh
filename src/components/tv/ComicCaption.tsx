import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Flame, Zap, Mic, Camera, Star, Crown, X, Volume2, Quote } from 'lucide-react';
import { Submission } from '../../types';
import { store } from '../../services/store';
import { playSoundEffect } from '../../utils/soundEffects';

export interface ComicCaptionData {
  id: string;
  senderName: string;
  message: string;
  occasion?: string;
  displayTitle?: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  burstWord: string;
  comicStyle: 'superhero' | 'popArt' | 'rockstar' | 'neonNight';
  timestamp: number;
}

const ONOMATOPOEIA_BURSTS = [
  { word: 'KA-POW! 💥', sound: 'boing' as const },
  { word: 'BOOM! 🔥', sound: 'airhorn' as const },
  { word: 'STAGE DROP! ⚡', sound: 'flash' as const },
  { word: 'MIC DROP! 🎤', sound: 'cheer' as const },
  { word: 'NEW STAGE STAR! 🌟', sound: 'goldChime' as const },
  { word: 'HOT SNAP! 📸', sound: 'shutter' as const },
  { word: 'HOLY SOHO! 👑', sound: 'fanfare' as const },
  { word: 'LEGENDARY! 🤘', sound: 'cheer' as const },
  { word: 'WHAM! 💫', sound: 'boing' as const }
];

const COMIC_STYLES: Array<'superhero' | 'popArt' | 'rockstar' | 'neonNight'> = [
  'superhero',
  'popArt',
  'rockstar',
  'neonNight'
];

interface ComicCaptionProps {
  /** Optional external caption item to display */
  caption?: ComicCaptionData | null;
  /** Whether to listen to real-time store submissions (default: true) */
  listenToStore?: boolean;
  /** Maximum simultaneous visible captions (default: 2) */
  maxVisible?: number;
  /** Duration in ms before auto-dismiss (default: 9000 for relaxed reading) */
  durationMs?: number;
  /** Position layout on screen */
  position?: 'top-right' | 'bottom-right' | 'center-stage' | 'bottom-center';
  /** Animation pacing: 'slower' (smooth, gentle, deliberate) or 'normal' */
  animationSpeed?: 'slower' | 'normal';
  /** Callback when dismissed */
  onDismiss?: (id: string) => void;
}

export const ComicCaption: React.FC<ComicCaptionProps> = ({
  caption: externalCaption,
  listenToStore = true,
  maxVisible = 2,
  durationMs = 9000,
  position = 'bottom-right',
  animationSpeed = 'slower',
  onDismiss
}) => {
  const [captions, setCaptions] = useState<ComicCaptionData[]>([]);

  // Function to create formatted ComicCaptionData from Submission
  const formatSubmissionToComic = useCallback((sub: Submission): ComicCaptionData => {
    const burstConfig = ONOMATOPOEIA_BURSTS[Math.floor(Math.random() * ONOMATOPOEIA_BURSTS.length)];
    const style = COMIC_STYLES[Math.floor(Math.random() * COMIC_STYLES.length)];

    return {
      id: sub.id || `comic-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderName: sub.firstName || 'VIP GUEST',
      message: sub.message || 'TURNING UP THE ENERGY AT LONDON KARAOKE CLUB!',
      occasion: sub.occasion?.replace('_', ' ') || 'SOHO VIP',
      displayTitle: sub.displayTitle || 'KARAOKE STAR',
      mediaType: sub.mediaType || 'image',
      mediaUrl: sub.displayMediaUrl || sub.originalMediaUrl,
      burstWord: burstConfig.word,
      comicStyle: style,
      timestamp: Date.now()
    };
  }, []);

  // Handle external caption prop change
  useEffect(() => {
    if (externalCaption) {
      setCaptions(prev => [externalCaption, ...prev.slice(0, maxVisible - 1)]);
    }
  }, [externalCaption, maxVisible]);

  // Subscribe to real-time new submissions from store
  useEffect(() => {
    if (!listenToStore) return;

    const unsub = store.onNewSubmission((sub: Submission) => {
      const newComic = formatSubmissionToComic(sub);
      
      // Play comic sound effect
      const randomBurst = ONOMATOPOEIA_BURSTS[Math.floor(Math.random() * ONOMATOPOEIA_BURSTS.length)];
      playSoundEffect(randomBurst.sound);

      setCaptions(prev => [newComic, ...prev.slice(0, maxVisible - 1)]);
    });

    return unsub;
  }, [listenToStore, formatSubmissionToComic, maxVisible]);

  // Auto-dismiss after durationMs
  useEffect(() => {
    if (captions.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setCaptions(prev => prev.filter(c => now - c.timestamp < durationMs));
    }, 500);

    return () => clearInterval(interval);
  }, [captions.length, durationMs]);

  const handleDismiss = (id: string) => {
    setCaptions(prev => prev.filter(c => c.id !== id));
    if (onDismiss) onDismiss(id);
  };

  // Position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-20 right-8 items-end';
      case 'bottom-center':
        return 'bottom-20 left-1/2 -translate-x-1/2 items-center';
      case 'center-stage':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center';
      case 'bottom-right':
      default:
        return 'bottom-20 right-8 items-end';
    }
  };

  return (
    <div 
      className={`fixed z-50 pointer-events-none flex flex-col gap-4 max-w-lg ${getPositionClasses()}`}
      id="comic-captions-container"
    >
      <AnimatePresence>
        {captions.map((cap, index) => {
          const isPhoto = cap.mediaUrl && cap.mediaUrl.length > 5;
          
          // Theme-based comic styles
          const themeStyle = getThemeColors(cap.comicStyle);

          const isSlower = animationSpeed === 'slower';

          return (
            <motion.div
              key={cap.id}
              initial={
                isSlower
                  ? { scale: 0.8, rotate: -6, y: 70, opacity: 0 }
                  : { scale: 0.15, rotate: -24, y: 140, opacity: 0 }
              }
              animate={
                isSlower
                  ? { 
                      scale: 1, 
                      rotate: index % 2 === 0 ? -1.5 : 1.5, 
                      y: 0, 
                      opacity: 1 
                    }
                  : { 
                      scale: [0.15, 1.15, 0.96, 1.03, 1], 
                      rotate: [-24, 6, -3, 2, index % 2 === 0 ? -2 : 2], 
                      y: 0, 
                      opacity: 1 
                    }
              }
              exit={
                isSlower
                  ? { 
                      scale: 0.9, 
                      rotate: 3, 
                      y: -35, 
                      opacity: 0,
                      transition: { duration: 0.75, ease: [0.32, 0, 0.67, 0] }
                    }
                  : { 
                      scale: 0.2, 
                      rotate: 28, 
                      y: -100, 
                      opacity: 0,
                      transition: { duration: 0.35, ease: 'backIn' }
                    }
              }
              transition={
                isSlower
                  ? { 
                      duration: 1.25, 
                      ease: [0.16, 1, 0.3, 1] 
                    }
                  : { 
                      type: 'spring', 
                      damping: 12, 
                      stiffness: 220 
                    }
              }
              className="pointer-events-auto relative select-none w-[380px] sm:w-[440px]"
            >
              {/* Comic Action Starburst Burst Word (KA-POW / BOOM) */}
              <div className="absolute -top-7 -left-5 z-30">
                <div 
                  className={`relative px-4 py-2 text-base sm:text-lg font-black tracking-wider uppercase border-4 border-black text-black shadow-[5px_5px_0px_#000] rotate-[-8deg] ${isSlower ? 'animate-comic-float' : 'animate-comic-wobble'} ${themeStyle.burstBadgeBg}`}
                  style={{
                    clipPath: 'polygon(0% 15%, 15% 0%, 85% 0%, 100% 20%, 95% 85%, 85% 100%, 15% 100%, 0% 85%)'
                  }}
                >
                  <span className="drop-shadow-[1px_1px_0px_#fff] flex items-center gap-1">
                    {cap.burstWord}
                  </span>
                </div>
              </div>

              {/* Floating Action Sparkles around the Comic Card */}
              <div className="absolute -top-4 -right-3 z-20 text-yellow-300 text-2xl animate-spin-slow pointer-events-none drop-shadow-[0_0_8px_rgba(253,224,71,1)]">
                ★
              </div>
              <div className="absolute -bottom-3 -left-3 z-20 text-red-500 text-2xl pointer-events-none drop-shadow-[0_0_8px_rgba(239,68,68,1)]">
                💥
              </div>

              {/* Main Comic Panel Card */}
              <div 
                className={`relative rounded-3xl border-4 border-black p-5 shadow-[10px_10px_0px_#000] overflow-hidden ${themeStyle.cardBg}`}
              >
                {/* Halftone Dot Pattern Overlay */}
                <div 
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(#000 2px, transparent 2px)',
                    backgroundSize: '12px 12px'
                  }}
                />

                {/* Comic Action Speed Lines Top Accent */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b-4 border-black relative z-10">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-black animate-ping" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-black flex items-center gap-1">
                      {isPhoto ? <Camera className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      <span>{isPhoto ? 'NEW STAGE SNAP' : 'STAGE SHOUTOUT'}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-black text-amber-300 text-[10px] font-black uppercase tracking-wider">
                      {cap.occasion}
                    </span>
                    <button
                      onClick={() => handleDismiss(cap.id)}
                      className="w-6 h-6 rounded-full bg-black text-white hover:bg-neutral-800 flex items-center justify-center text-xs font-black cursor-pointer active:scale-90 transition"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content Layout: Photo Preview + Speech Bubble */}
                <div className="flex items-start gap-4 relative z-10">
                  {/* Polaroid Photo Thumbnail (if photo exists) */}
                  {isPhoto && (
                    <div className="shrink-0 relative group">
                      {/* Comic Tape / Pin */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3.5 bg-yellow-200/90 border border-black rotate-[-6deg] z-20 shadow-sm" />
                      
                      <div className="w-20 h-24 bg-white border-3 border-black p-1 pb-4 shadow-[4px_4px_0px_#000] rotate-[-5deg] rounded-md overflow-hidden">
                        <img 
                          src={cap.mediaUrl} 
                          alt={cap.senderName} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center rounded-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Comic Speech Bubble with Quote */}
                  <div className="flex-1 min-w-0">
                    {/* Sender Name Headline */}
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-xl sm:text-2xl font-display font-black text-black uppercase tracking-tight drop-shadow-[1px_1px_0px_#fff]">
                        {cap.senderName}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-black/75">
                        {cap.displayTitle}
                      </span>
                    </div>

                    {/* Comic Dialogue Balloon */}
                    <div className="mt-2 relative bg-white border-3 border-black p-3 rounded-2xl shadow-[4px_4px_0px_#000]">
                      {/* Speech Bubble Arrow Tail */}
                      <div 
                        className="absolute -left-2 top-3 w-3 h-3 bg-white border-l-3 border-b-3 border-black rotate-45" 
                      />

                      <p className="text-sm sm:text-base font-display font-black text-black uppercase leading-snug break-words">
                        "{cap.message}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Comic Footer: Soundwave & Dynamic Timer Progress Bar */}
                <div className="mt-3 pt-2 flex items-center justify-between border-t-2 border-black/30 relative z-10">
                  <div className="flex items-center gap-1 text-[10px] font-black text-black uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5 fill-black" />
                    <span>BROADCASTING LIVE ON BIG SCREEN</span>
                  </div>

                  {/* Sound Trigger */}
                  <button
                    onClick={() => {
                      playSoundEffect('airhorn');
                      store.triggerSound('airhorn');
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black text-yellow-400 font-black text-[10px] uppercase tracking-wider hover:bg-neutral-800 cursor-pointer active:scale-95 transition"
                  >
                    <Volume2 className="w-3 h-3" /> HORN
                  </button>
                </div>

                {/* Comic Animated Countdown Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20 overflow-hidden">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: durationMs / 1000, ease: 'linear' }}
                    className="h-full bg-black"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// Helper for vibrant comic color themes
function getThemeColors(style: 'superhero' | 'popArt' | 'rockstar' | 'neonNight') {
  switch (style) {
    case 'popArt':
      return {
        cardBg: 'bg-[#FF007F]', // Hot Pop Pink
        burstBadgeBg: 'bg-[#00F0FF]' // Electric Cyan
      };
    case 'rockstar':
      return {
        cardBg: 'bg-[#FF4500]', // Fiery Comic Orange
        burstBadgeBg: 'bg-[#FFE600]' // High Voltage Yellow
      };
    case 'neonNight':
      return {
        cardBg: 'bg-[#00E5FF]', // Neon Cyan
        burstBadgeBg: 'bg-[#FF0055]' // Comic Crimson
      };
    case 'superhero':
    default:
      return {
        cardBg: 'bg-[#FFE500]', // Classic Comic Superhero Yellow
        burstBadgeBg: 'bg-[#FF2A2A]' // Comic Red
      };
  }
}

export default ComicCaption;
