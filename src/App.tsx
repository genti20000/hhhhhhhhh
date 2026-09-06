import React, { useState, useEffect } from 'react';
import { TVDisplay } from './components/tv/TVDisplay';
import { GuestMobileView } from './components/guest/GuestMobileView';
import { HostTabletMode } from './components/host/HostTabletMode';
import { ModeratorDashboard } from './components/moderator/ModeratorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { useSingShot } from './services/store';
import { Tv, Tablet, Smartphone, ShieldCheck, Settings, Layers, Maximize2 } from 'lucide-react';

export type AppMode = 'tv' | 'host' | 'guest' | 'moderator' | 'admin' | 'split';

export function App() {
  const [mode, setMode] = useState<AppMode>('split');
  const [isFullscreenTV, setIsFullscreenTV] = useState(false);
  const { venue } = useSingShot();

  // Check URL query param for direct routing (e.g. ?mode=tv or ?mode=guest)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode') as AppMode;
      if (urlMode && ['tv', 'host', 'guest', 'moderator', 'admin', 'split'].includes(urlMode)) {
        setMode(urlMode);
      }
    }
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreenTV(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreenTV(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Application Mode Switcher Bar */}
      <header className="bg-[#0e0e11] border-b border-zinc-800/90 px-4 py-2 flex items-center justify-between z-50 sticky top-0 shadow-sm animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-700/80 text-zinc-100 flex items-center justify-center font-mono font-black text-xs tracking-tight shadow-none relative" title={venue.name}>
            <span>{venue.logoText || (venue.name ? venue.name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase() : 'LKC')}</span>
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-display font-black text-sm tracking-wider text-zinc-100 uppercase">
              {venue.name}
            </span>
            <span className="text-[11px] text-zinc-400 font-medium hidden md:inline">
              STAGE CONTROL
            </span>
          </div>
        </div>

        {/* Mode Selector Tabs - Matte High-Contrast Precision */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800/90">
          <button
            id="nav-split-mode"
            onClick={() => setMode('split')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              mode === 'split'
                ? 'bg-zinc-100 text-zinc-950 font-black shadow-none border border-zinc-200'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Club Multiview</span>
          </button>

          <button
            id="nav-tv-mode"
            onClick={() => setMode('tv')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              mode === 'tv'
                ? 'bg-zinc-100 text-zinc-950 font-black shadow-none border border-zinc-200'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>TV (16:9)</span>
          </button>

          <button
            id="nav-host-mode"
            onClick={() => setMode('host')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              mode === 'host'
                ? 'bg-zinc-100 text-zinc-950 font-black shadow-none border border-zinc-200'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Host Mode</span>
          </button>

          <button
            id="nav-guest-mode"
            onClick={() => setMode('guest')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              mode === 'guest'
                ? 'bg-zinc-100 text-zinc-950 font-black shadow-none border border-zinc-200'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Guest Mobile</span>
          </button>

          <button
            id="nav-mod-mode"
            onClick={() => setMode('moderator')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              mode === 'moderator'
                ? 'bg-zinc-100 text-zinc-950 font-black shadow-none border border-zinc-200'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Moderation</span>
          </button>

          <button
            id="nav-admin-mode"
            onClick={() => setMode('admin')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              mode === 'admin'
                ? 'bg-zinc-100 text-zinc-950 font-black shadow-none border border-zinc-200'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Admin</span>
          </button>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900/80 border border-zinc-800 text-[11px] font-mono text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>BROADCAST ACTIVE</span>
          </div>

          {mode === 'tv' && (
            <button
              onClick={handleToggleFullscreen}
              className="p-2 rounded-md bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 hover:bg-zinc-800 transition cursor-pointer"
              title="Toggle Fullscreen 1080p"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Primary View Container */}
      <main className="flex-1 flex flex-col">
        {/* MODE 1: FULL 16:9 TELEVISION PRESENTATION */}
        {mode === 'tv' && (
          <div className="flex-1 flex items-center justify-center p-2 md:p-6 bg-black">
            <TVDisplay isStandalone={true} />
          </div>
        )}

        {/* MODE 2: HOST TABLET SURFACE */}
        {mode === 'host' && <HostTabletMode />}

        {/* MODE 3: GUEST MOBILE SUBMISSION */}
        {mode === 'guest' && <GuestMobileView />}

        {/* MODE 4: MODERATION KANBAN */}
        {mode === 'moderator' && <ModeratorDashboard />}

        {/* MODE 5: ADMIN & VENUE SAAS DASHBOARD */}
        {mode === 'admin' && (
          <AdminDashboard 
            onSwitchMode={(newMode) => setMode(newMode as AppMode)} 
          />
        )}

        {/* MODE 6: CLUB LIVE MULTIVIEW (TV + Host Tablet + Guest Mobile Simulation) */}
        {mode === 'split' && (
          <div className="flex-1 p-6 space-y-6 max-w-[1920px] mx-auto w-full">
            {/* Context Header */}
            <div className="flex items-center justify-between bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black">
                  ★
                </div>
                <div>
                  <h1 className="text-base font-display font-extrabold text-white">
                    SingShot Live Venue Multiview — {venue.name} {venue.area}
                  </h1>
                  <p className="text-xs text-neutral-400">
                    Interact in real-time across the 16:9 Big Screen Television, Host Tablet Surface, and Guest Phone!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMode('tv')}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-black font-extrabold text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Tv className="w-3.5 h-3.5" /> Fullscreen TV
                </button>
              </div>
            </div>

            {/* Multiview Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Left Column (8 cols): 16:9 Big-Screen Television */}
              <div className="xl:col-span-8 space-y-3">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                    <Tv className="w-4 h-4" /> 16:9 Big Screen Television (1920×1080)
                  </div>
                  <span className="text-[11px] font-semibold text-neutral-400">
                    Broadcast Canvas
                  </span>
                </div>

                <TVDisplay isStandalone={false} />

                {/* Submissions Moderation Quick Strip beneath TV */}
                <div className="pt-2">
                  <ModeratorDashboard />
                </div>
              </div>

              {/* Right Column (4 cols): Mobile Guest Phone & Host Tablet */}
              <div className="xl:col-span-4 space-y-6">
                {/* Guest Phone Mockup */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
                      <Smartphone className="w-4 h-4" /> Guest Mobile (Scan QR)
                    </div>
                    <span className="text-[11px] font-semibold text-neutral-400">
                      No App Install
                    </span>
                  </div>

                  <div className="rounded-3xl border-2 border-neutral-700 overflow-hidden shadow-2xl bg-black max-h-[640px] overflow-y-auto">
                    <GuestMobileView />
                  </div>
                </div>

                {/* Host Quick Controls */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                      <Tablet className="w-4 h-4" /> Host Tablet Surface
                    </div>
                  </div>

                  <div className="rounded-3xl border border-neutral-800 overflow-hidden shadow-2xl bg-neutral-950 p-2">
                    <HostTabletMode />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
