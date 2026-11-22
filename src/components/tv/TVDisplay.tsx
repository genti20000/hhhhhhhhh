import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { SessionQRCode } from '../common/SessionQRCode';
import { useSingShot } from '../../services/store';
import { CrowdReactionEvent, HostMomentType } from '../../types';
import { 
  Sparkles, 
  Crown, 
  Flame, 
  Heart, 
  Mic, 
  Radio, 
  Clock, 
  Music, 
  Volume2, 
  ArrowRight,
  X,
  Tv,
  Menu,
  Pause,
  Play,
  Grid,
  ShieldCheck,
  Maximize2
} from 'lucide-react';
import { 
  AnimatedVoiceEqualizer, 
  AnimatedFloatingNotes,
  StageDiscoLasers
} from '../common/LiveStageAtmosphere';
import { useGoogleTVRemote } from '../../hooks/useGoogleTVRemote';
import { useScreenWakeLock } from '../../hooks/useScreenWakeLock';
import { TVOverscanGuide } from './TVOverscanGuide';
import { GoogleTVQuickBar } from './GoogleTVQuickBar';
import { VirtualGoogleTVRemote } from './VirtualGoogleTVRemote';
import { AndroidTVPackageModal } from './AndroidTVPackageModal';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface TVDisplayProps {
  isStandalone?: boolean;
}

// Sophisticated transitions designed for 16:9 venue displays
const transitionStyles = [
  {
    name: 'STAGE SPOTLIGHT',
    initial: { opacity: 0, scale: 0.92, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 1.05, y: -20 },
    transition: { type: 'spring' as const, damping: 18, stiffness: 180 }
  },
  {
    name: 'NEON SWEEP',
    initial: { opacity: 0, x: -60, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 60, scale: 0.95 },
    transition: { type: 'spring' as const, damping: 16, stiffness: 160 }
  },
  {
    name: 'FLASH REVEAL',
    initial: { opacity: 0, scale: 1.1, filter: 'brightness(2.2)' },
    animate: { opacity: 1, scale: 1, filter: 'brightness(1)' },
    exit: { opacity: 0, scale: 0.9, filter: 'brightness(1.5)' },
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  {
    name: 'GOLDEN GLOW',
    initial: { opacity: 0, y: 40, rotate: -2 },
    animate: { opacity: 1, y: 0, rotate: 0 },
    exit: { opacity: 0, y: -40, rotate: 2 },
    transition: { type: 'spring' as const, damping: 15, stiffness: 170 }
  }
];

export const TVDisplay: React.FC<TVDisplayProps> = ({ isStandalone = false }) => {
  const { event, venue, approvedSubmissions, featuredSubmission, activeScene, store } = useSingShot();
  const [activeReactions, setActiveReactions] = useState<CrowdReactionEvent[]>([]);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState('');
  const [starStep, setStarStep] = useState<1 | 2 | 3>(1);
  const [flashActive, setFlashActive] = useState(false);
  const [transitionIndex, setTransitionIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevHeroIdRef = useRef<string | undefined>(undefined);

  // Google TV & Android TV 10-Foot State
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [overscanPercent, setOverscanPercent] = useState<number>(0);
  const [overscanGuideVisible, setOverscanGuideVisible] = useState(false);
  const [largeQR, setLargeQR] = useState(false);
  const [isOSDOpen, setIsOSDOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [lowerThirdActive, setLowerThirdActive] = useState(true);

  // Screen WakeLock for Android TV / Google TV (prevents screensaver during show)
  const { isLocked: wakeLockActive } = useScreenWakeLock(true);

  // Google TV Remote Control Engine (Hardware remote D-pad + Virtual on-screen remote)
  const { focusedId, lastRemoteKey, triggerRemoteButton } = useGoogleTVRemote({
    enabled: true,
    onMenuToggle: () => setIsOSDOpen(prev => !prev),
    onNextPhoto: () => {
      store.nextStagePhoto();
      setTransitionIndex(prev => (prev + 1) % transitionStyles.length);
    },
    onPrevPhoto: () => {
      store.prevStagePhoto();
      setTransitionIndex(prev => (prev - 1 + transitionStyles.length) % transitionStyles.length);
    },
    onPlayPauseToggle: () => setIsAutoRotating(prev => !prev),
    onBackPress: () => {
      if (isAndroidModalOpen) {
        setIsAndroidModalOpen(false);
      } else if (isOSDOpen) {
        setIsOSDOpen(false);
      } else if (overscanGuideVisible) {
        setOverscanGuideVisible(false);
      } else if (event.activeHostMoment?.active) {
        store.clearHostMoment();
      } else if (activeScene === 'STAR_OF_NIGHT') {
        store.resetStarOfNight();
      }
    },
    onHostMomentQuick: (num) => {
      const momentNames: Record<number, HostMomentType> = {
        1: 'Make Some Noise',
        2: 'Birthday Shot',
        3: 'Last Song',
        4: '30 Minutes Left',
        5: 'One More Song',
        6: 'Cheers Soho'
      };
      if (momentNames[num]) {
        store.triggerHostMoment(momentNames[num]);
      }
    }
  });

  // High contrast mode check
  const isHighContrast = event.settings?.highContrastMode ?? false;

  // Real-time clock update
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // News ticker cycling
  useEffect(() => {
    if (!event.tickerMessages || event.tickerMessages.length === 0) return;
    const interval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % event.tickerMessages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [event.tickerMessages]);

  // Slideshow auto-rotation: every 12-15 seconds (default 14s)
  useEffect(() => {
    if (!isAutoRotating) return;
    if (activeScene !== 'SPOTLIGHT' || approvedSubmissions.length <= 1) return;
    if (event.activeHostMoment?.active) return; // Don't rotate while a moment takeover is on

    const rotationSeconds = event.settings?.autoRotateSeconds || 14;
    const timer = setInterval(() => {
      store.nextStagePhoto();
      setTransitionIndex(prev => (prev + 1) % transitionStyles.length);
    }, rotationSeconds * 1000);

    return () => clearInterval(timer);
  }, [isAutoRotating, activeScene, approvedSubmissions.length, event.settings?.autoRotateSeconds, event.activeHostMoment, store]);

  // Flashbulb and confetti on new photo
  const heroGuest = featuredSubmission || approvedSubmissions[0];
  useEffect(() => {
    if (heroGuest && heroGuest.id !== prevHeroIdRef.current) {
      prevHeroIdRef.current = heroGuest.id;
      setFlashActive(true);
      const timer = setTimeout(() => setFlashActive(false), 380);

      // Subtle gold & violet stage sparkles
      try {
        confetti({
          particleCount: 28,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#EAB308', '#EC4899', '#A855F7', '#06B6D4', '#FFFFFF'],
          disableForReducedMotion: true
        });
      } catch {
        // Safe fallback
      }

      return () => clearTimeout(timer);
    }
  }, [heroGuest?.id]);

  // Host Moment Auto-Dismiss after 12 seconds
  useEffect(() => {
    if (event.activeHostMoment?.active) {
      const timer = setTimeout(() => {
        store.clearHostMoment();
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [event.activeHostMoment, store]);

  // Dramatic Star of the Night Ceremony Progression
  useEffect(() => {
    if (activeScene === 'STAR_OF_NIGHT') {
      setStarStep(1);
      const t1 = setTimeout(() => setStarStep(2), 2400);
      const t2 = setTimeout(() => {
        setStarStep(3);
        try {
          confetti({
            particleCount: 160,
            spread: 120,
            origin: { y: 0.4 },
            colors: ['#EAB308', '#FDE047', '#EC4899', '#A855F7', '#FFFFFF']
          });
        } catch {
          // Safe fallback
        }
      }, 5500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [activeScene]);

  // Real-time Crowd Reactions Stream
  useEffect(() => {
    const unsub = store.onReaction((rx) => {
      setActiveReactions(prev => [...prev.slice(-15), rx]);
      setTimeout(() => {
        setActiveReactions(prev => prev.filter(r => r.id !== rx.id));
      }, 2600);
    });
    return unsub;
  }, [store]);

  // Total reaction counts for live HUD
  const totalReactions = event.metrics?.totalReactions || 0;

  return (
    <div 
      ref={containerRef}
      id="singshot-tv-canvas"
      className={`relative w-full aspect-video bg-[#070709] overflow-hidden select-none text-white flex flex-col justify-between ${
        isStandalone ? 'h-screen max-w-none' : 'max-w-[1920px] mx-auto rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.9)] border border-neutral-800/80'
      } ${isHighContrast ? 'contrast-125' : ''}`}
      style={{
        padding: overscanPercent > 0 ? `${overscanPercent}%` : undefined,
        backgroundColor: '#070709',
        backgroundImage: `
          radial-gradient(ellipse at 50% 0%, rgba(168, 85, 247, 0.18) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 100%, rgba(236, 72, 153, 0.14) 0%, transparent 55%),
          radial-gradient(ellipse at 20% 90%, rgba(6, 182, 212, 0.12) 0%, transparent 50%),
          linear-gradient(180deg, #09090D 0%, #050507 100%)
        `
      }}
    >
      {/* Background Mode: Premium Velvet Blur */}
      {heroGuest && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <img 
            src={heroGuest.displayMediaUrl} 
            alt="Stage Ambience" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover blur-3xl scale-125 opacity-20 filter saturate-150"
          />
          <div className="absolute inset-0 bg-[#070709]/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-radial from-transparent via-black/70 to-[#070709]" />
        </div>
      )}

      {/* Stage Moving Light Beams & Laser Sweeps */}
      <StageDiscoLasers />
      <AnimatedFloatingNotes />

      {/* Camera Flashbulb burst on photo change */}
      {flashActive && (
        <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-camera-flash mix-blend-screen opacity-90" />
      )}

      {/* Floating Reaction Particles Overlay */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        <AnimatePresence>
          {activeReactions.map((rx) => {
            const randomX = 35 + (Math.random() * 32); // Biased toward stage center
            const reactionIcons: Record<string, React.ReactNode> = {
              clap: <span className="text-5xl drop-shadow-[0_0_20px_rgba(234,179,8,0.9)] animate-pulse">👏</span>,
              sing: <span className="text-5xl drop-shadow-[0_0_20px_rgba(6,182,212,0.9)] animate-bounce">🎤</span>,
              hype: <span className="text-5xl drop-shadow-[0_0_20px_rgba(236,72,153,0.9)] animate-ping">🔥</span>,
              love: <span className="text-5xl drop-shadow-[0_0_20px_rgba(244,63,94,0.9)]">💖</span>,
              shout: <span className="text-5xl drop-shadow-[0_0_20px_rgba(168,85,247,0.9)]">🗣️</span>,
              fire: <Flame className="w-12 h-12 text-amber-400 fill-amber-400 filter drop-shadow-[0_0_15px_rgba(234,179,8,0.9)]" />,
              applause: <span className="text-5xl drop-shadow-[0_0_20px_rgba(234,179,8,0.9)]">👏</span>,
              star: <Sparkles className="w-12 h-12 text-yellow-300 fill-yellow-300 filter drop-shadow-[0_0_15px_rgba(253,224,71,0.9)]" />,
              heart: <Heart className="w-12 h-12 text-rose-500 fill-rose-500 filter drop-shadow-[0_0_15px_rgba(244,63,94,0.9)]" />,
              mic: <Mic className="w-12 h-12 text-cyan-400 filter drop-shadow-[0_0_15px_rgba(6,182,212,0.9)]" />
            };

            return (
              <motion.div
                key={rx.id}
                initial={{ opacity: 0, y: 600, x: `${randomX}%`, scale: 0.6 }}
                animate={{ opacity: [0, 1, 1, 0], y: 140, scale: [0.6, 1.4, 1.2, 0.9] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.4, ease: "easeOut" }}
                className="absolute flex items-center gap-2"
              >
                {reactionIcons[rx.type] || reactionIcons.clap}
                {rx.senderName && (
                  <span className="bg-black/85 px-2.5 py-0.5 rounded-full text-xs font-bold text-amber-300 border border-amber-400/40 shadow-xl backdrop-blur-sm">
                    {rx.senderName}
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* FULL-SCREEN HOST-TRIGGERED MOMENTS OVERLAY */}
      <AnimatePresence>
        {event.activeHostMoment?.active && (
          <motion.div
            key={`host-moment-${event.activeHostMoment.type}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center text-center p-8 bg-black/90 backdrop-blur-xl"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.35) 0%, rgba(236, 72, 153, 0.25) 50%, rgba(5, 5, 8, 0.95) 100%)'
            }}
          >
            <button
              onClick={() => store.clearHostMoment()}
              className="absolute top-6 right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Close takeover"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 14, stiffness: 200 }}
              className="space-y-6 max-w-4xl"
            >
              <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-black font-black text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(234,179,8,0.5)]">
                <Sparkles className="w-4 h-4 fill-black" />
                LONDON KARAOKE CLUB SOHO MOMENT
              </div>

              <h1 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tight text-white drop-shadow-[0_0_40px_rgba(236,72,153,0.7)]">
                {event.activeHostMoment.headline}
              </h1>

              <p className="text-2xl md:text-3xl font-extrabold text-amber-300 uppercase tracking-wider max-w-2xl mx-auto drop-shadow-md">
                {event.activeHostMoment.subline}
              </p>

              <div className="pt-4 flex items-center justify-center gap-3">
                <span className="w-3 h-3 rounded-full bg-pink-500 animate-ping inline-block" />
                <span className="text-sm font-bold text-neutral-300 uppercase tracking-widest">
                  LIVE STAGE ENERGY
                </span>
                <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping inline-block" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP BROADCAST HEADER */}
      <header id="tv-header" className="relative z-20 flex items-center justify-between px-8 pt-6 pb-2 w-full">
        {/* Left: Club Identity & Live Badge */}
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center font-black text-black text-xl shadow-[0_0_25px_rgba(234,179,8,0.5)] border border-amber-200">
            {venue.logoText || 'LKC'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="font-display font-black text-2xl tracking-wider text-white">
                {venue.name.toUpperCase()}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-pink-400/40 text-pink-300 text-xs font-black uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                {venue.area || 'SOHO'} LIVE
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-neutral-400 tracking-wide mt-1">
              <span className="inline-flex items-center gap-1.5 text-rose-500 font-extrabold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                <Radio className="w-3.5 h-3.5 text-rose-500" /> ON AIR
              </span>
              <span>·</span>
              <span className="text-neutral-300 font-bold">{event.roomName || 'Main Lounge'}</span>
              <span>·</span>
              <span className="text-amber-400 font-mono font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> {currentTime || '20:30'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Cheer Counter HUD & Google TV 10-Foot Remote Pill */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-400 tracking-wider">
              <Flame className="w-4 h-4 fill-amber-400" />
              CHEERS:
            </div>
            <span className="text-base font-mono font-black text-white px-2 py-0.2 rounded-lg bg-black/60 border border-neutral-700">
              {totalReactions}
            </span>
          </div>

          {/* Google TV 10-Foot HUD Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-neutral-900/90 border border-amber-400/50 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-1.5 font-black text-amber-400 text-xs">
              <Tv className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px] tracking-wider">GOOGLE TV</span>
            </div>
            <span className="text-neutral-600">|</span>
            <div className="flex items-center gap-1 font-mono text-[10px] text-emerald-400 font-bold">
              <span className={`w-2 h-2 rounded-full ${wakeLockActive ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'}`} />
              <span>{wakeLockActive ? 'WAKELOCK' : 'STANDBY'}</span>
            </div>
            {lastRemoteKey && (
              <>
                <span className="text-neutral-600">|</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black text-[9px] font-black uppercase tracking-wider">
                  {lastRemoteKey}
                </span>
              </>
            )}
            <button
              id="tv-btn-open-osd"
              data-tv-focus="true"
              onClick={() => setIsOSDOpen(true)}
              className="ml-1 px-2 py-0.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[10px] font-black text-amber-300 border border-amber-400/40 flex items-center gap-1 transition cursor-pointer"
              title="Press 'M' or Menu on Remote"
            >
              <Menu className="w-3 h-3 text-amber-400" />
              <span>MENU (M)</span>
            </button>
          </div>
        </div>

        {/* Right: Scannable Big-Screen QR Code Box & Google TV Install */}
        <div className="flex items-center gap-3">
          <SessionQRCode
            variant="tv-badge"
            jumbo={largeQR}
            onToggleJumbo={() => setLargeQR(prev => !prev)}
            focusId="tv-qr-box"
          />

          <div className="hidden xl:block">
            <PWAInstallButton onOpenAndroidPackageModal={() => setIsAndroidModalOpen(true)} />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT STAGE */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-8 py-2 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* SCENE 1: STAR OF THE NIGHT AWARDS CEREMONY */}
          {activeScene === 'STAR_OF_NIGHT' && heroGuest && (
            <motion.div
              key="star-scene"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center text-center w-full max-w-4xl"
            >
              {starStep === 1 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1.08 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-4"
                >
                  <div className="text-amber-400 text-sm font-black tracking-widest uppercase">
                    LONDON KARAOKE CLUB SPECIAL CEREMONY
                  </div>
                  <h1 className="text-6xl md:text-7xl font-display font-black tracking-tight text-white uppercase drop-shadow-2xl">
                    SOHO… ARE YOU READY?
                  </h1>
                </motion.div>
              )}

              {starStep === 2 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-400 text-black font-black text-sm tracking-widest uppercase shadow-lg">
                    <Crown className="w-4 h-4" /> LONDON KARAOKE CLUB HONOUR
                  </div>
                  <h1 className="text-5xl md:text-6xl font-display font-black text-amber-300 drop-shadow-[0_0_30px_rgba(253,224,71,0.6)]">
                    TONIGHT’S STAR OF THE NIGHT IS…
                  </h1>
                </motion.div>
              )}

              {starStep === 3 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.85, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 180, damping: 18 }}
                  className="flex items-center gap-10"
                >
                  {/* Portrait Card with Gold Crown */}
                  <div className="relative w-[340px] h-[460px] rounded-3xl overflow-hidden border-4 border-amber-300 bg-neutral-900 shadow-[0_0_50px_rgba(234,179,8,0.5)] shrink-0">
                    <img 
                      src={heroGuest.displayMediaUrl} 
                      alt={heroGuest.firstName} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-amber-400 text-black px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xl">
                      <Crown className="w-4 h-4 fill-black" /> STAR OF THE NIGHT
                    </div>
                  </div>

                  {/* Winner Details */}
                  <div className="text-left space-y-4 max-w-md">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-bold tracking-widest uppercase">
                      <Sparkles className="w-3.5 h-3.5 fill-amber-400" /> SOHO RECOGNITION
                    </div>
                    <h2 className="text-6xl font-display font-black uppercase tracking-tight text-white">
                      {heroGuest.firstName}
                    </h2>
                    
                    <div className="p-4 rounded-2xl bg-neutral-900/90 border border-amber-400/40 shadow-lg">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 mb-1">
                        PERSONAL SHOUTOUT:
                      </div>
                      <p className="text-lg font-bold text-neutral-100 italic">
                        "{heroGuest.message || `Taking over tonight at ${venue.name}!`}"
                      </p>
                    </div>

                    <div className="pt-2">
                      <AnimatedVoiceEqualizer size="sm" label="AUDIENCE APPLAUSE & VOCALS" />
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* SCENE 2: HERO SPOTLIGHT (DEFAULT ACTIVE STATE) */}
          {activeScene === 'SPOTLIGHT' && heroGuest && approvedSubmissions.length > 0 && (() => {
            const currentTransition = transitionStyles[transitionIndex % transitionStyles.length];
            return (
              <motion.div
                key={heroGuest.id}
                initial={currentTransition.initial}
                animate={currentTransition.animate}
                exit={currentTransition.exit}
                transition={currentTransition.transition}
                className="flex items-center justify-center gap-10 max-w-5xl relative z-20"
              >
                {/* Center: The Photogenic Stage Portrait Card */}
                <div className="relative group shrink-0">
                  <div className="relative w-[350px] h-[480px] rounded-3xl overflow-hidden border-4 border-amber-400/90 bg-neutral-950 shadow-[0_0_45px_rgba(234,179,8,0.4)]">
                    <img 
                      src={heroGuest.displayMediaUrl} 
                      alt={heroGuest.firstName} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />
                    
                    {/* Shadow gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

                    {/* Occasion / Star Top Badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      {heroGuest.isStarred && (
                        <span className="bg-amber-400 text-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-lg border border-black">
                          <Crown className="w-3.5 h-3.5 fill-black" /> VIP STAR
                        </span>
                      )}
                      <span className="bg-black/90 text-amber-300 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border border-amber-400">
                        {heroGuest.occasion.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Identity Bar */}
                    <div className="absolute bottom-4 left-5 right-5 text-left space-y-0.5">
                      <div className="text-[11px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                        {heroGuest.displayTitle || 'VIP GUEST'}
                      </div>
                      <div className="text-3xl font-display font-black text-white tracking-tight uppercase drop-shadow-md">
                        {heroGuest.firstName}
                      </div>
                      {heroGuest.groupName && (
                        <div className="text-xs font-bold text-neutral-300 uppercase">
                          {heroGuest.groupName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Shoutout Bubble & Stage Atmosphere */}
                <div className="flex flex-col text-left space-y-4 max-w-md relative z-20">
                  {/* Shoutout Message Bubble */}
                  <div className="bg-black/80 backdrop-blur-md p-6 rounded-3xl border-2 border-amber-400/80 shadow-[0_0_25px_rgba(234,179,8,0.25)] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-amber-400 text-xs font-black tracking-widest uppercase">
                        <Sparkles className="w-4 h-4 fill-amber-400" /> LIVE SHOUTOUT
                      </div>
                      <span className="text-[10px] font-black text-black bg-amber-400 px-2.5 py-0.5 rounded-full uppercase">
                        {heroGuest.occasion.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-2xl font-display font-black text-white leading-snug uppercase">
                      "{heroGuest.message || 'Loving the Soho vibes tonight! Cheers!'}"
                    </p>
                    <div className="text-xs font-black text-amber-300 uppercase tracking-wider">
                      — {heroGuest.firstName}
                    </div>
                  </div>

                  {/* Audio Equalizer */}
                  <AnimatedVoiceEqualizer size="sm" label="LIVE VOCAL HARMONICS" />

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      id="tv-btn-stage-next-photo"
                      data-tv-focus="true"
                      onClick={() => store.nextStagePhoto()}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider shadow-md transition-transform active:scale-95 cursor-pointer"
                    >
                      <span>NEXT PHOTO</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id="tv-btn-stage-airhorn"
                      data-tv-focus="true"
                      onClick={() => store.triggerHostMoment('Make Some Noise')}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider transition-transform active:scale-95 cursor-pointer shadow-md"
                    >
                      <Volume2 className="w-3.5 h-3.5 inline mr-1" /> AIRHORN
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* SCENE 3: SAFE FALLBACK SCREEN (When no content is approved yet) */}
          {(approvedSubmissions.length === 0 || activeScene === 'STANDBY') && (
            <motion.div
              key="standby-scene"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 max-w-3xl py-12 glass-panel p-10 rounded-3xl border border-amber-500/30"
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center font-black text-3xl mx-auto shadow-[0_0_35px_rgba(234,179,8,0.5)]">
                ★
              </div>

              <div className="space-y-2">
                <div className="text-xs font-black tracking-widest text-amber-400 uppercase">
                  {venue.name.toUpperCase()} · SOHO
                </div>
                <h1 className="text-5xl md:text-6xl font-display font-black text-white uppercase tracking-tight">
                  BE THE FIRST ON THE BIG SCREEN
                </h1>
                <p className="text-lg font-medium text-neutral-300 max-w-lg mx-auto">
                  Scan the QR code with your mobile camera. No app download. Snap a selfie and share your Soho moment!
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <SessionQRCode variant="tv-card" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* NOW SINGING LOWER-THIRD (Visible when Karaoke track is active) */}
        {event.karaokeNowSinging?.active && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="absolute bottom-4 left-8 right-8 z-30 flex items-center justify-between p-4 rounded-2xl bg-black/90 border border-amber-400/60 shadow-[0_0_30px_rgba(234,179,8,0.3)] backdrop-blur-md"
          >
            <div className="flex items-center gap-4">
              <div className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                <Mic className="w-4 h-4 animate-pulse" /> NOW SINGING
              </div>
              <div>
                <div className="text-lg font-display font-black text-white uppercase">
                  {event.karaokeNowSinging.singerName}
                </div>
                <div className="text-xs font-bold text-amber-400">
                  {event.karaokeNowSinging.songTitle} · by {event.karaokeNowSinging.artist}
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-neutral-400">
                {event.karaokeNowSinging.songNumber || 'Track #402'}
              </span>
              <AnimatedVoiceEqualizer size="sm" />
            </div>
          </motion.div>
        )}
      </main>

      {/* WALL OF FAME THUMBNAIL CAROUSEL */}
      {approvedSubmissions.length > 0 && (
        <footer id="tv-wall-of-fame" className="relative z-20 w-full px-8 pb-2">
          <div className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800/90 backdrop-blur-md flex items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-2 pl-2 shrink-0">
              <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
                TONIGHT'S WALL OF FAME
              </span>
            </div>

            {/* Horizontal Rolling Portrait Thumbnails */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar flex-1">
              {approvedSubmissions.slice(0, 8).map((sub) => {
                const isCurrentlyFeatured = sub.id === heroGuest?.id;
                return (
                  <button
                    key={sub.id}
                    id={`tv-fame-${sub.id}`}
                    data-tv-focus="true"
                    onClick={() => store.featureNow(sub.id)}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-300 cursor-pointer ${
                      isCurrentlyFeatured 
                        ? 'bg-amber-400/20 border border-amber-400/80 shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
                        : 'bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <img 
                      src={sub.thumbnailUrl || sub.displayMediaUrl} 
                      alt={sub.firstName} 
                      referrerPolicy="no-referrer"
                      className="w-8 h-10 object-cover rounded-lg shrink-0 border border-neutral-700"
                    />
                    <div className="text-left">
                      <div className="flex items-center gap-1">
                        {isCurrentlyFeatured && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[9px] font-black uppercase">
                            LIVE
                          </span>
                        )}
                        <span className="text-xs font-bold text-white truncate max-w-[90px]">
                          {sub.firstName}
                        </span>
                      </div>
                      <div className="text-[10px] font-semibold text-neutral-400 truncate max-w-[100px]">
                        {sub.displayTitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-bold text-neutral-400 pr-2 shrink-0 hidden md:block">
              {approvedSubmissions.length} VIPs Featured
            </div>
          </div>
        </footer>
      )}

      {/* BOTTOM TICKER */}
      <div id="tv-news-ticker" className="relative z-20 bg-black/95 border-t border-amber-500/20 px-8 py-2.5 flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-2 text-amber-400 font-black tracking-widest shrink-0">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
          ⚡ SOHO LIVE TICKER:
        </div>

        <div className="flex-1 mx-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={tickerIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="text-neutral-200 font-bold uppercase tracking-wider truncate"
            >
              {event.tickerMessages[tickerIndex] || 'SINGSHOT LIVE AT LONDON KARAOKE CLUB SOHO'}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="text-neutral-400 text-[11px] font-mono shrink-0">
          TAG <strong className="text-amber-400">{event.instagramHandle || '@londonkaraokeclub'}</strong> FOR SHOTS
        </div>
      </div>

      {/* GOOGLE TV OVERSCAN CALIBRATION GUIDE */}
      <TVOverscanGuide 
        visible={overscanGuideVisible} 
        onClose={() => setOverscanGuideVisible(false)} 
      />

      {/* GOOGLE TV QUICK ACTION LEANBACK OSD BAR */}
      <GoogleTVQuickBar
        isOpen={isOSDOpen}
        onClose={() => setIsOSDOpen(false)}
        isAutoRotating={isAutoRotating}
        onTogglePlayPause={() => setIsAutoRotating(prev => !prev)}
        onNextPhoto={() => {
          store.nextStagePhoto();
          setTransitionIndex(prev => (prev + 1) % transitionStyles.length);
        }}
        onPrevPhoto={() => {
          store.prevStagePhoto();
          setTransitionIndex(prev => (prev - 1 + transitionStyles.length) % transitionStyles.length);
        }}
        activeScene={activeScene}
        onSelectScene={(scene) => {
          if (scene === 'STAR_OF_NIGHT') {
            store.triggerStarOfNight();
          } else {
            store.setScene(scene);
          }
        }}
        overscanPercent={overscanPercent}
        onCycleOverscan={() => {
          setOverscanPercent(prev => {
            if (prev === 0) return 3;
            if (prev === 3) return 5;
            if (prev === 5) return 7;
            return 0;
          });
        }}
        overscanGuideVisible={overscanGuideVisible}
        onToggleOverscanGuide={() => setOverscanGuideVisible(prev => !prev)}
        largeQR={largeQR}
        onToggleLargeQR={() => setLargeQR(prev => !prev)}
        lowerThirdActive={lowerThirdActive}
        onToggleLowerThird={() => setLowerThirdActive(prev => !prev)}
        onOpenAndroidPackageModal={() => setIsAndroidModalOpen(true)}
        wakeLockActive={wakeLockActive}
      />

      {/* VIRTUAL GOOGLE TV REMOTE CONTROL (ON-SCREEN HUD) */}
      <VirtualGoogleTVRemote
        onRemoteAction={triggerRemoteButton}
        lastActiveKey={lastRemoteKey}
        onOpenAndroidPackageModal={() => setIsAndroidModalOpen(true)}
        wakeLockActive={wakeLockActive}
      />

      {/* ANDROID TV PACKAGE / APK SPECS MODAL */}
      <AndroidTVPackageModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />
    </div>
  );
};
