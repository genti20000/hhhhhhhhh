import React, { useState, useEffect } from 'react';
import { Mic, Sparkles, Volume2, Flame } from 'lucide-react';

/**
 * Ridiculously Animated Clapping Hands & Crowd Frenzy
 */
export const RidiculousAnimatedHands: React.FC<{
  caption?: string;
  count?: number;
}> = ({ caption = 'SOHO CROWD HYSTERIA' }) => {
  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-black border-2 border-amber-400 select-none shadow-[0_0_20px_rgba(234,179,8,0.4)]">
      {/* Giant Bouncing Hands */}
      <div className="flex items-center gap-1 text-3xl">
        <span className="animate-giant-clap" title="Clapping">👏</span>
        <span className="animate-rock-on text-2xl" title="Rock On">🤘</span>
        <span className="animate-hand-wave text-2xl" title="Cheering">🙌</span>
        <span className="animate-giant-clap text-2xl" title="Applause" style={{ animationDelay: '0.2s' }}>👏</span>
        <span className="animate-rock-on text-2xl" title="Rock On" style={{ animationDelay: '0.4s' }}>🤘</span>
      </div>

      <div className="flex flex-col text-left pl-2 border-l-2 border-amber-400">
        <span className="text-xs font-black text-amber-300 uppercase tracking-widest flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> APPLAUSE LEVEL: MAX
        </span>
        <span className="text-[11px] font-extrabold text-white uppercase tracking-wider">
          {caption}
        </span>
      </div>
    </div>
  );
};

/**
 * Ridiculously Animated Singing Mouth & Megaphone Sound Shockwaves
 */
export const RidiculousVocalMegaMouth: React.FC = () => {
  const [shoutIndex, setShoutIndex] = useState(0);
  const shouts = [
    'PITCH PERFECT! 🎤',
    'ABSOLUTE SOHO LEGEND! ✨',
    'STANDING OVATION! 👏',
    'NO GRAMMY NO PROBLEM! 🔥',
    'PURE VOCAL POWERHOUSE! ⚡',
    'ENCORE! ENCORE! 🙌'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setShoutIndex(prev => (prev + 1) % shouts.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [shouts.length]);

  return (
    <div className="flex items-center gap-3 bg-black px-4 py-2 rounded-2xl border-2 border-amber-400 shadow-[0_0_25px_rgba(234,179,8,0.4)]">
      {/* Animated Singing Mouth with pulsating acoustic rings */}
      <div className="relative flex items-center justify-center">
        <span className="absolute w-12 h-12 rounded-full border-2 border-amber-400/80 animate-voice-ring pointer-events-none" />
        <span className="absolute w-16 h-16 rounded-full border-2 border-red-500/60 animate-voice-ring-delayed pointer-events-none" />
        
        <div className="w-10 h-10 rounded-full bg-amber-400 text-black flex items-center justify-center text-xl shadow-lg relative z-10 animate-sing-mouth">
          👄
        </div>
      </div>

      {/* Comic Speech Bubble */}
      <div className="flex flex-col text-left">
        <div className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5" />
          <span>STAGE DECIBEL: 110dB</span>
        </div>
        <div className="text-sm font-black text-white font-display uppercase tracking-tight animate-comic-wobble">
          "{shouts[shoutIndex]}"
        </div>
      </div>
    </div>
  );
};

/**
 * Animated Voice Soundwaves & Equalizer Bars
 */
export const AnimatedVoiceEqualizer: React.FC<{ 
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  label?: string;
}> = ({ size = 'md', active = true, label = 'LIVE STAGE AUDIO' }) => {
  const heightClass = size === 'sm' ? 'h-6' : size === 'lg' ? 'h-14' : 'h-10';
  const barWidth = size === 'sm' ? 'w-1.5' : size === 'lg' ? 'w-2.5' : 'w-2';

  return (
    <div className="flex items-center gap-3 bg-black px-4 py-2 rounded-2xl border-2 border-amber-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
      <div className="relative flex items-center justify-center">
        {active && (
          <>
            <span className="absolute w-9 h-9 rounded-full border-2 border-amber-400 animate-voice-ring pointer-events-none" />
            <span className="absolute w-12 h-12 rounded-full border-2 border-yellow-300 animate-voice-ring-delayed pointer-events-none" />
          </>
        )}
        <div className="w-8 h-8 rounded-full bg-amber-400 text-black flex items-center justify-center relative z-10 font-bold shadow-md">
          <Mic className="w-4 h-4 fill-black" />
        </div>
      </div>

      <div className="flex flex-col justify-center">
        {label && (
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
            {label}
          </span>
        )}
        {/* Animated Equalizer Sound Bars */}
        <div className={`flex items-end gap-1.5 ${heightClass} py-0.5`}>
          <span className={`${barWidth} bg-gradient-to-t from-red-500 to-amber-400 rounded-sm animate-soundwave-1`} />
          <span className={`${barWidth} bg-gradient-to-t from-amber-500 to-yellow-300 rounded-sm animate-soundwave-2`} />
          <span className={`${barWidth} bg-gradient-to-t from-yellow-400 to-amber-200 rounded-sm animate-soundwave-3`} />
          <span className={`${barWidth} bg-gradient-to-t from-red-500 to-amber-400 rounded-sm animate-soundwave-4`} />
          <span className={`${barWidth} bg-gradient-to-t from-amber-400 to-yellow-300 rounded-sm animate-soundwave-5`} />
          <span className={`${barWidth} bg-gradient-to-t from-red-500 to-amber-400 rounded-sm animate-soundwave-2`} />
          <span className={`${barWidth} bg-gradient-to-t from-amber-400 to-yellow-200 rounded-sm animate-soundwave-3`} />
          <span className={`${barWidth} bg-gradient-to-t from-amber-500 to-yellow-300 rounded-sm animate-soundwave-1`} />
        </div>
      </div>
    </div>
  );
};

/**
 * Animated Clapping Hands & Crowd Cheering Unit
 */
export const AnimatedClappingCrowd: React.FC<{
  caption?: string;
  theme?: 'gold' | 'neon' | 'red';
}> = ({ caption = 'CHEERING LIVE AT SOHO' }) => {
  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-black border-2 border-amber-400 shadow-[0_0_15px_rgba(234,179,8,0.35)] select-none">
      <div className="flex items-center gap-1.5 text-2xl">
        <span className="animate-giant-clap" title="Clapping">👏</span>
        <span className="animate-rock-on text-xl" title="Cheering">🤘</span>
        <span className="animate-hand-wave text-xl" title="Waving">🙌</span>
        <span className="animate-giant-clap text-xl" title="Applause">👏</span>
      </div>

      <div className="flex flex-col text-left pl-2 border-l-2 border-neutral-700">
        <span className="text-xs font-black text-amber-300 flex items-center gap-1">
          Crowd Frenzy <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        </span>
        <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">
          {caption}
        </span>
      </div>
    </div>
  );
};

/**
 * Stage Disco Laser Beams
 */
export const StageDiscoLasers: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {/* Left green/yellow laser */}
      <div 
        className="absolute -top-10 left-1/4 w-1.5 h-[1200px] bg-gradient-to-b from-amber-400 via-yellow-200 to-transparent animate-laser-1 blur-[1px] opacity-75"
        style={{ boxShadow: '0 0 15px #eab308, 0 0 30px #facc15' }}
      />
      {/* Right red/pink laser */}
      <div 
        className="absolute -top-10 right-1/4 w-1.5 h-[1200px] bg-gradient-to-b from-red-500 via-rose-300 to-transparent animate-laser-2 blur-[1px] opacity-75"
        style={{ boxShadow: '0 0 15px #ef4444, 0 0 30px #f43f5e' }}
      />
    </div>
  );
};

/**
 * Animated Floating Singing Notes & Microphones
 */
export const AnimatedFloatingNotes: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      <div className="absolute bottom-16 left-1/4 text-amber-400 font-black text-3xl animate-music-note-1 drop-shadow-[0_0_10px_rgba(234,179,8,0.9)]">
        🎵
      </div>
      <div className="absolute bottom-24 right-1/3 text-yellow-300 font-black text-4xl animate-music-note-2 drop-shadow-[0_0_12px_rgba(253,224,71,1)]">
        🎶
      </div>
      <div className="absolute bottom-12 left-1/2 text-amber-300 font-black text-2xl animate-music-note-3 drop-shadow-[0_0_10px_rgba(234,179,8,0.9)]">
        ♪
      </div>
      <div className="absolute bottom-20 left-1/3 text-yellow-200 font-black text-3xl animate-music-note-1 drop-shadow-[0_0_10px_rgba(254,240,138,1)]" style={{ animationDelay: '1.5s' }}>
        ♫
      </div>
      <div className="absolute bottom-28 right-1/4 text-red-500 font-black text-3xl animate-music-note-2 drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]" style={{ animationDelay: '0.6s' }}>
        🎤
      </div>
      <div className="absolute bottom-10 right-1/5 text-amber-400 font-black text-2xl animate-music-note-3 drop-shadow-[0_0_10px_rgba(234,179,8,0.9)]" style={{ animationDelay: '2.1s' }}>
        💥
      </div>
    </div>
  );
};

