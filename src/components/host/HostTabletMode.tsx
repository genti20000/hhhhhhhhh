import React, { useState } from 'react';
import { useSingShot } from '../../services/store';
import { HostMomentType } from '../../types';
import { 
  Sparkles, 
  Crown, 
  Flame, 
  Volume2, 
  Radio, 
  Check, 
  X, 
  ArrowUpRight, 
  Play, 
  Pause, 
  Music, 
  RotateCcw,
  SkipBack,
  SkipForward,
  Timer,
  PartyPopper
} from 'lucide-react';
import { playSoundEffect } from '../../utils/soundEffects';

export const HostTabletMode: React.FC = () => {
  const { event, venue, waitingSubmissions, approvedSubmissions, featuredSubmission, activeScene, lastAction, store } = useSingShot();
  const [selectedQuickSong, setSelectedQuickSong] = useState({ 
    singer: event.karaokeNowSinging?.singerName || 'Maddie', 
    song: event.karaokeNowSinging?.songTitle || 'Valerie', 
    artist: event.karaokeNowSinging?.artist || 'Amy Winehouse' 
  });
  const [isPaused, setIsPaused] = useState(false);
  const [undoToast, setUndoToast] = useState<string | null>(null);

  // Host Moment Trigger Buttons
  const hostMoments: { type: HostMomentType; label: string; subline: string; icon: string; color: string }[] = [
    { type: 'Make Some Noise', label: 'MAKE SOME NOISE', subline: 'SOHO, LET ME HEAR YOU!', icon: '📢', color: 'from-amber-500 to-red-600' },
    { type: 'Birthday Shot', label: 'BIRTHDAY SHOT', subline: 'TIME TO RAISE A GLASS!', icon: '🎂', color: 'from-pink-600 to-purple-600' },
    { type: 'Last Song', label: 'LAST SONG', subline: 'MAKE IT COUNT SOHO!', icon: '⏳', color: 'from-blue-600 to-cyan-600' },
    { type: '30 Minutes Left', label: '30 MINS LEFT', subline: 'GET YOUR TRACKS IN!', icon: '⏰', color: 'from-yellow-500 to-amber-600' },
    { type: 'One More Song', label: 'ONE MORE SONG', subline: 'CROWD DEMAND!', icon: '🔥', color: 'from-rose-600 to-orange-600' },
    { type: 'Cheers Soho', label: 'CHEERS SOHO', subline: 'THANK YOU FOR SINGING!', icon: '🥂', color: 'from-emerald-500 to-teal-700' },
  ];

  // Rotation speeds
  const rotationSpeeds = [12, 15, 18];
  const currentSpeed = event.settings?.autoRotateSeconds || 14;

  const handleTriggerMoment = (type: HostMomentType) => {
    store.triggerHostMoment(type);
    playSoundEffect(type === 'Make Some Noise' ? 'airhorn' : type === 'Birthday Shot' ? 'fanfare' : 'applause');
  };

  const handleApprove = (id: string) => {
    store.approveSubmission(id);
    showUndoToast('Approved submission');
  };

  const handleFeature = (id: string) => {
    store.featureNow(id);
    showUndoToast('Featured photo on TV');
  };

  const handleReject = (id: string) => {
    store.rejectSubmission(id);
    showUndoToast('Rejected submission');
  };

  const handleUndo = () => {
    store.undoLastAction();
    playSoundEffect('tap');
    setUndoToast(null);
  };

  const showUndoToast = (msg: string) => {
    setUndoToast(msg);
    setTimeout(() => setUndoToast(null), 4000);
  };

  return (
    <div className="w-full min-h-screen bg-[#070709] text-white p-5 font-sans select-none">
      {/* Top Host Bar */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-neutral-800 gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center font-brand font-black text-xl shadow-[0_0_20px_rgba(234,179,8,0.4)]">
            {venue.logoText || 'LKC'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-display font-black text-white">
                HOST CONTROL SURFACE
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400/30">
                TABLET MODE
              </span>
            </div>
            <div className="text-xs font-semibold text-neutral-400">
              {venue.name} ({venue.area || 'Soho'}) · Active Event: <strong className="text-neutral-200">{event.name}</strong>
            </div>
          </div>
        </div>

        {/* Status and Global Undo */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Undo Action Button */}
          {lastAction && (
            <button
              onClick={handleUndo}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-amber-400/50 text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo {lastAction.type.toLowerCase()}</span>
            </button>
          )}

          {/* Live Scene Indicator */}
          <div className="px-3.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span className="text-xs font-bold text-neutral-300">
              TV Scene: <strong className="text-amber-400 uppercase">{activeScene.replace('_', ' ')}</strong>
            </span>
          </div>

          {/* Pause / Resume Slideshow */}
          <button
            onClick={() => {
              setIsPaused(!isPaused);
              playSoundEffect('tap');
            }}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
              isPaused 
                ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]' 
                : 'bg-neutral-900 text-neutral-300 border border-neutral-700 hover:text-white'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-black" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'RESUME SLIDES' : 'PAUSE SLIDES'}</span>
          </button>
        </div>
      </header>

      {/* Undo Notification Banner */}
      {undoToast && (
        <div className="my-3 px-4 py-2 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-bold flex items-center justify-between animate-fade-in">
          <span>Action: {undoToast}</span>
          <button 
            onClick={handleUndo}
            className="underline hover:text-white cursor-pointer ml-4"
          >
            Undo Now
          </button>
        </div>
      )}

      {/* Main Grid: Waiting Queue (Left) + Show Control Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
        {/* LEFT COLUMN: Fast 1-Tap Approval Queue */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">
                WAITING FOR APPROVAL
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-xs font-black">
                {waitingSubmissions.length}
              </span>
            </div>
            <span className="text-[11px] text-neutral-400">Strict Moderation Active</span>
          </div>

          {waitingSubmissions.length === 0 ? (
            <div className="p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-center text-neutral-500 space-y-2">
              <Check className="w-8 h-8 mx-auto text-emerald-500" />
              <div className="font-bold text-sm text-neutral-300">All Clear!</div>
              <div className="text-xs">No guest photos waiting for approval.</div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-190px)] overflow-y-auto pr-1">
              {waitingSubmissions.map((sub) => (
                <div 
                  key={sub.id} 
                  className="p-3.5 rounded-2xl bg-neutral-900/90 border border-amber-500/30 hover:border-amber-400/80 transition space-y-2.5 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={sub.thumbnailUrl || sub.displayMediaUrl} 
                      alt={sub.firstName} 
                      referrerPolicy="no-referrer"
                      className="w-16 h-20 rounded-xl object-cover border border-neutral-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider">
                          {sub.occasion.replace('_', ' ')}
                        </span>
                        {sub.aiSafetyScore && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                            sub.aiSafetyScore.status === 'Safe' 
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' 
                              : 'bg-amber-950/60 text-amber-400 border-amber-800'
                          }`}>
                            {sub.aiSafetyScore.status}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white truncate">
                        {sub.firstName} {sub.groupName ? `(${sub.groupName})` : ''}
                      </h3>
                      <p className="text-xs text-neutral-300 line-clamp-2">
                        "{sub.message}"
                      </p>
                    </div>
                  </div>

                  {/* Giant 1-Tap Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-neutral-800">
                    <button
                      onClick={() => handleApprove(sub.id)}
                      className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase flex items-center justify-center gap-1 shadow cursor-pointer active:scale-95 transition"
                    >
                      <Check className="w-4 h-4" /> APPROVE
                    </button>
                    <button
                      onClick={() => handleFeature(sub.id)}
                      className="py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(234,179,8,0.4)] cursor-pointer active:scale-95 transition"
                    >
                      <ArrowUpRight className="w-4 h-4" /> FEATURE NOW
                    </button>
                    <button
                      onClick={() => handleReject(sub.id)}
                      className="py-2.5 rounded-xl bg-neutral-900 hover:bg-red-950 text-neutral-400 hover:text-red-400 font-bold text-xs uppercase flex items-center justify-center gap-1 border border-neutral-800 cursor-pointer active:scale-95 transition"
                    >
                      <X className="w-4 h-4" /> REJECT
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Major Live Show Triggers & Fast Action Surface */}
        <div className="lg:col-span-7 space-y-4">
          {/* SECTION 1: LIVE STAGE MOMENTS (Full-Screen Takeovers) */}
          <div className="p-4 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>⚡ LIVE VENUE MOMENT TRIGGERS</span>
              </div>
              {event.activeHostMoment?.active && (
                <button
                  onClick={() => store.clearHostMoment()}
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                >
                  Clear Active Moment
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {hostMoments.map((m) => (
                <button
                  key={m.type}
                  onClick={() => handleTriggerMoment(m.type)}
                  className={`p-3 rounded-2xl bg-gradient-to-br ${m.color} text-white text-left font-black text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer flex flex-col justify-between h-20 border border-white/10`}
                >
                  <div className="text-xl">{m.icon}</div>
                  <div>
                    <div className="font-extrabold">{m.label}</div>
                    <div className="text-[9px] text-white/80 font-normal truncate">{m.subline}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 2: SLIDESHOW CONTROLS & ROTATION SPEED */}
          <div className="p-4 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-neutral-300">
                <Timer className="w-4 h-4 text-amber-400" />
                <span>SLIDESHOW & ROTATION CONTROLS</span>
              </div>
              <span className="text-[11px] text-neutral-400 font-mono font-bold">
                Speed: {currentSpeed}s
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Prev / Next buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => store.prevStagePhoto()}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs uppercase flex items-center gap-1 cursor-pointer active:scale-95 transition"
                >
                  <SkipBack className="w-3.5 h-3.5" /> Prev Photo
                </button>
                <button
                  onClick={() => store.nextStagePhoto()}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase flex items-center gap-1 cursor-pointer active:scale-95 transition shadow"
                >
                  <span>Next Photo</span>
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Rotation interval selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-neutral-400 font-bold uppercase">Interval:</span>
                {rotationSpeeds.map(speed => (
                  <button
                    key={speed}
                    onClick={() => store.updateEvent({ settings: { ...event.settings, autoRotateSeconds: speed } })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      currentSpeed === speed
                        ? 'bg-amber-400 text-black font-extrabold'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {speed}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 3: KARAOKE NOW SINGING CONTROLLER */}
          <div className="p-4 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  KARAOKE NOW SINGING LOWER-THIRD
                </h3>
              </div>
              <button
                onClick={() => {
                  store.setKaraokeNowSinging(
                    !event.karaokeNowSinging?.active,
                    selectedQuickSong.singer,
                    selectedQuickSong.song,
                    selectedQuickSong.artist
                  );
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition cursor-pointer ${
                  event.karaokeNowSinging?.active
                    ? 'bg-red-600 text-white shadow-lg red-glow'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {event.karaokeNowSinging?.active ? 'ON STAGE NOW (TAP TO REMOVE)' : 'SHOW ON TV'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Singer Name"
                value={selectedQuickSong.singer}
                onChange={(e) => setSelectedQuickSong({ ...selectedQuickSong, singer: e.target.value })}
                className="px-3 py-2 rounded-xl bg-black border border-neutral-700 text-xs text-white placeholder-neutral-500 font-medium focus:border-amber-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Song Title"
                value={selectedQuickSong.song}
                onChange={(e) => setSelectedQuickSong({ ...selectedQuickSong, song: e.target.value })}
                className="px-3 py-2 rounded-xl bg-black border border-neutral-700 text-xs text-white placeholder-neutral-500 font-medium focus:border-amber-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Artist"
                value={selectedQuickSong.artist}
                onChange={(e) => setSelectedQuickSong({ ...selectedQuickSong, artist: e.target.value })}
                className="px-3 py-2 rounded-xl bg-black border border-neutral-700 text-xs text-white placeholder-neutral-500 font-medium focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* SECTION 4: STAR OF THE NIGHT & SOUND BOARD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Star of Night Ceremony */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/20 to-neutral-900 border border-amber-400/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400">
                  <Crown className="w-4 h-4 fill-amber-400" />
                  <span>STAR OF THE NIGHT</span>
                </div>
                {activeScene === 'STAR_OF_NIGHT' && (
                  <button
                    onClick={() => store.setScene('SPOTLIGHT')}
                    className="text-[10px] text-neutral-400 hover:text-white underline cursor-pointer"
                  >
                    Reset to Normal
                  </button>
                )}
              </div>

              <p className="text-xs text-neutral-300">
                Triggers dramatic countdown, spotlight reveal, fanfare, and confetti on TV.
              </p>

              <button
                onClick={() => store.triggerStarOfNight()}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(234,179,8,0.4)] cursor-pointer active:scale-95 transition"
              >
                🏆 LAUNCH STAR CEREMONY
              </button>
            </div>

            {/* Club SFX Board */}
            <div className="p-4 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-neutral-300">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>CLUB SOUND FX BOARD</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => store.triggerSound('airhorn')}
                  className="py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-[11px] cursor-pointer active:scale-95 shadow"
                >
                  📢 Airhorn
                </button>
                <button
                  onClick={() => store.triggerSound('cheer')}
                  className="py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold text-[11px] cursor-pointer active:scale-95"
                >
                  🗣️ Cheer
                </button>
                <button
                  onClick={() => store.triggerSound('applause')}
                  className="py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-[11px] cursor-pointer active:scale-95"
                >
                  👏 Applause
                </button>
                <button
                  onClick={() => store.triggerSound('fanfare')}
                  className="py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-[11px] cursor-pointer active:scale-95"
                >
                  🎺 Fanfare
                </button>
                <button
                  onClick={() => store.triggerSound('goldChime')}
                  className="py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-[11px] cursor-pointer active:scale-95"
                >
                  ✨ Chime
                </button>
                <button
                  onClick={() => store.triggerSound('tap')}
                  className="py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 font-bold text-[11px] cursor-pointer active:scale-95"
                >
                  🔔 Bell
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
