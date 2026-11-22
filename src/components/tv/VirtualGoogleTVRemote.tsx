import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Home, 
  Menu, 
  Play, 
  Pause, 
  Mic, 
  Volume2, 
  VolumeX, 
  Tv, 
  Sparkles,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { playSoundEffect } from '../../utils/soundEffects';

interface VirtualGoogleTVRemoteProps {
  onRemoteAction: (button: string) => void;
  lastActiveKey?: string | null;
  onOpenAndroidPackageModal?: () => void;
  wakeLockActive?: boolean;
}

export const VirtualGoogleTVRemote: React.FC<VirtualGoogleTVRemoteProps> = ({
  onRemoteAction,
  lastActiveKey,
  onOpenAndroidPackageModal,
  wakeLockActive = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const handlePress = (button: string, soundName: 'tap' | 'goldChime' | 'cheer' | 'airhorn' = 'tap') => {
    playSoundEffect(soundName);
    onRemoteAction(button);
  };

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
    handlePress('PLAY_PAUSE');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      {/* Minimized Pill Trigger */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => {
            playSoundEffect('tap');
            setIsOpen(true);
          }}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-neutral-900/95 hover:bg-neutral-800 text-white font-extrabold text-xs tracking-wider border-2 border-amber-400/80 shadow-[0_0_25px_rgba(234,179,8,0.4)] backdrop-blur-md cursor-pointer active:scale-95 transition"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <Tv className="w-4 h-4 text-amber-400" />
          <span>GOOGLE TV REMOTE</span>
          {lastActiveKey && (
            <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black text-[10px] font-black uppercase">
              {lastActiveKey}
            </span>
          )}
        </motion.button>
      )}

      {/* Expanded Realistic Google TV Remote */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            className="w-72 bg-gradient-to-b from-[#181820] to-[#0D0D12] border-2 border-amber-400/70 rounded-[38px] p-5 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_25px_rgba(234,179,8,0.3)] backdrop-blur-xl flex flex-col items-center relative text-white"
          >
            {/* Top Remote Header */}
            <div className="w-full flex items-center justify-between pb-2 border-b border-neutral-800/80">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
                <span className="text-[11px] font-black uppercase tracking-widest text-neutral-300">
                  GOOGLE TV REMOTE
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                title="Minimize Remote"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Remote Feedback HUD (Recent Key Pressed) */}
            <div className="w-full h-7 my-2 px-3 rounded-xl bg-black/60 border border-neutral-800 flex items-center justify-between text-[11px] font-mono">
              <span className="text-neutral-400 text-[10px]">REMOTE CMD:</span>
              <span className="text-amber-400 font-bold uppercase tracking-wider truncate">
                {lastActiveKey || 'READY (D-PAD)'}
              </span>
            </div>

            {/* D-PAD CIRCLE (Classic Google TV Directional Wheel) */}
            <div className="relative w-48 h-48 my-2 rounded-full bg-neutral-900 border-2 border-neutral-700 shadow-inner flex items-center justify-center">
              {/* UP BUTTON */}
              <button
                onClick={() => handlePress('UP')}
                className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-11 flex items-center justify-center text-neutral-300 hover:text-amber-300 active:scale-95 transition cursor-pointer"
                title="D-Pad Up (ArrowUp)"
              >
                <ChevronUp className="w-6 h-6" />
              </button>

              {/* DOWN BUTTON */}
              <button
                onClick={() => handlePress('DOWN')}
                className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-16 h-11 flex items-center justify-center text-neutral-300 hover:text-amber-300 active:scale-95 transition cursor-pointer"
                title="D-Pad Down (ArrowDown)"
              >
                <ChevronDown className="w-6 h-6" />
              </button>

              {/* LEFT BUTTON */}
              <button
                onClick={() => handlePress('LEFT')}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-11 h-16 flex items-center justify-center text-neutral-300 hover:text-amber-300 active:scale-95 transition cursor-pointer"
                title="D-Pad Left (ArrowLeft)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* RIGHT BUTTON */}
              <button
                onClick={() => handlePress('RIGHT')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-11 h-16 flex items-center justify-center text-neutral-300 hover:text-amber-300 active:scale-95 transition cursor-pointer"
                title="D-Pad Right (ArrowRight)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* CENTER SELECT (OK) BUTTON */}
              <button
                onClick={() => handlePress('OK', 'goldChime')}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-950 border-2 border-amber-400 text-amber-300 hover:bg-neutral-800 active:scale-90 font-black text-sm uppercase tracking-wider flex items-center justify-center shadow-lg transition cursor-pointer"
                title="Center Select (OK / Enter)"
              >
                OK
              </button>
            </div>

            {/* KEYPAD ROW 1: BACK & HOME */}
            <div className="w-full grid grid-cols-3 gap-2 mt-2">
              <button
                onClick={() => handlePress('BACK')}
                className="h-11 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 flex flex-col items-center justify-center active:scale-95 transition cursor-pointer"
                title="Back (Escape / Backspace)"
              >
                <RotateCcw className="w-4 h-4 text-neutral-300" />
                <span className="text-[9px] font-bold text-neutral-400 mt-0.5">BACK</span>
              </button>

              <button
                onClick={() => handlePress('MENU')}
                className="h-11 rounded-2xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/60 flex flex-col items-center justify-center active:scale-95 transition cursor-pointer"
                title="TV Menu / Quick Bar (M)"
              >
                <Menu className="w-4 h-4 text-amber-300" />
                <span className="text-[9px] font-black text-amber-300 mt-0.5">MENU</span>
              </button>

              <button
                onClick={() => handlePress('HOME')}
                className="h-11 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 flex flex-col items-center justify-center active:scale-95 transition cursor-pointer"
                title="Google TV Home"
              >
                <Home className="w-4 h-4 text-neutral-300" />
                <span className="text-[9px] font-bold text-neutral-400 mt-0.5">HOME</span>
              </button>
            </div>

            {/* KEYPAD ROW 2: GOOGLE ASSISTANT / MIC & PLAY/PAUSE & FAST FORWARD */}
            <div className="w-full grid grid-cols-3 gap-2 mt-2">
              <button
                onClick={() => handlePress('MIC', 'cheer')}
                className="h-11 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/60 flex flex-col items-center justify-center active:scale-95 transition cursor-pointer text-cyan-300"
                title="Google Assistant / Crowd Cheer"
              >
                <Mic className="w-4 h-4" />
                <span className="text-[9px] font-black mt-0.5">CHEER</span>
              </button>

              <button
                onClick={togglePlayPause}
                className="h-11 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 flex flex-col items-center justify-center active:scale-95 transition cursor-pointer"
                title="Play/Pause Slideshow (Space)"
              >
                {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-amber-400" />}
                <span className="text-[9px] font-bold text-neutral-400 mt-0.5">
                  {isPlaying ? 'PAUSE' : 'PLAY'}
                </span>
              </button>

              <button
                onClick={() => handlePress('NEXT')}
                className="h-11 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 flex flex-col items-center justify-center active:scale-95 transition cursor-pointer"
                title="Next Stage Photo (N)"
              >
                <ChevronRight className="w-4 h-4 text-neutral-300" />
                <span className="text-[9px] font-bold text-neutral-400 mt-0.5">NEXT</span>
              </button>
            </div>

            {/* QUICK HOST MOMENT SHORTCUTS */}
            <div className="w-full mt-3 pt-3 border-t border-neutral-800/90 space-y-1.5">
              <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center justify-between">
                <span>QUICK TV MOMENTS</span>
                <span className="text-[9px] text-neutral-400">NUM KEYS 1-3</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handlePress('MOMENT_1', 'airhorn')}
                  className="px-2 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/50 text-[10px] font-extrabold text-rose-300 uppercase truncate cursor-pointer"
                >
                  📢 1: Airhorn
                </button>
                <button
                  onClick={() => handlePress('MOMENT_2', 'cheer')}
                  className="px-2 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-[10px] font-extrabold text-purple-300 uppercase truncate cursor-pointer"
                >
                  🎂 2: B-Day
                </button>
              </div>
            </div>

            {/* BOTTOM STATUS BAR: WAKELOCK & APK MODAL */}
            <div className="w-full mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>WAKELOCK ON</span>
              </div>

              {onOpenAndroidPackageModal && (
                <button
                  onClick={onOpenAndroidPackageModal}
                  className="text-amber-400 hover:text-white underline cursor-pointer font-extrabold text-[10px]"
                >
                  APK / Package Info
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
