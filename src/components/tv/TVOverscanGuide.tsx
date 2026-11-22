import React from 'react';

interface TVOverscanGuideProps {
  visible: boolean;
  onClose?: () => void;
}

export const TVOverscanGuide: React.FC<TVOverscanGuideProps> = ({ visible, onClose }) => {
  if (!visible) return null;

  return (
    <div 
      className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center select-none"
      style={{
        backgroundImage: 'radial-gradient(circle at center, transparent 92%, rgba(234, 179, 8, 0.25) 100%)'
      }}
    >
      {/* 95% Border (Typical Google TV Bezel Guard) */}
      <div className="absolute inset-[2.5%] border border-cyan-400/60 rounded-xl flex flex-col justify-between p-2">
        <div className="flex justify-between text-[10px] font-mono font-black text-cyan-400">
          <span>95% BEZEL SAFE</span>
          <span>GOOGLE TV CALIBRATION</span>
          <span>1920×1080 / 4K</span>
        </div>
        <div className="flex justify-between text-[10px] font-mono font-black text-cyan-400">
          <span>LEFT BEZEL</span>
          <span>16:9 VENUE STAGE DISPLAY</span>
          <span>RIGHT BEZEL</span>
        </div>
      </div>

      {/* 90% Action Safe Border */}
      <div className="absolute inset-[5%] border-2 border-dashed border-amber-400/80 rounded-2xl flex flex-col justify-between p-3">
        <div className="flex justify-between text-xs font-mono font-black text-amber-400">
          <span className="bg-black/80 px-2 py-0.5 rounded">90% ACTION SAFE AREA</span>
          <span className="bg-black/80 px-2 py-0.5 rounded">LONDON KARAOKE CLUB</span>
        </div>
        <div className="flex justify-between text-xs font-mono font-black text-amber-400">
          <span className="bg-black/80 px-2 py-0.5 rounded">BOTTOM OVERHANG GUARD</span>
          <span className="bg-black/80 px-2 py-0.5 rounded">SOHO STAGE</span>
        </div>
      </div>

      {/* 80% Title Safe Border */}
      <div className="absolute inset-[10%] border border-rose-500/60 rounded-3xl flex flex-col justify-between p-4">
        <div className="flex justify-between text-[11px] font-mono font-black text-rose-400">
          <span className="bg-black/80 px-2 py-0.5 rounded">80% TITLE SAFE (TEXT & QR CODES)</span>
          <span className="bg-black/80 px-2 py-0.5 rounded">ALL TEXT VISIBLE</span>
        </div>
        <div className="flex justify-between text-[11px] font-mono font-black text-rose-400">
          <span className="bg-black/80 px-2 py-0.5 rounded">KARAOKE SUBTITLES / LOWER THIRD</span>
          <span className="bg-black/80 px-2 py-0.5 rounded">80% INNER MARGIN</span>
        </div>
      </div>

      {/* Center Crosshair */}
      <div className="absolute w-12 h-0.5 bg-amber-400" />
      <div className="absolute h-12 w-0.5 bg-amber-400" />
      <div className="w-8 h-8 rounded-full border-2 border-amber-400/90 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-amber-400" />
      </div>

      {/* Helper Banner */}
      <div className="absolute top-12 bg-black/90 text-white border border-amber-400/70 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider pointer-events-auto shadow-2xl flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        <span>GOOGLE TV OVER SCAN GUIDE ACTIVE</span>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-amber-400 hover:text-white underline cursor-pointer text-[11px]"
          >
            Dismiss (or press Menu/Back)
          </button>
        )}
      </div>
    </div>
  );
};
