import React, { useState, useEffect } from 'react';
import { useSingShot } from '../../services/store';
import { QRCodeSVG } from 'qrcode.react';
import { BRAND_COLOR_PRESETS, generateClubInitials, getContrastTextColor } from '../../utils/theme';
import { 
  Sparkles, 
  Tv, 
  Tablet, 
  Smartphone, 
  Settings, 
  BarChart3, 
  Calendar, 
  Palette, 
  Radio, 
  ShieldCheck, 
  Download, 
  Layers, 
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Flame,
  Crown,
  Eye,
  CameraOff,
  Check,
  Building2,
  Paintbrush
} from 'lucide-react';

interface AdminDashboardProps {
  onSwitchMode: (mode: 'tv' | 'host' | 'guest' | 'moderator' | 'split') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSwitchMode }) => {
  const { event, venue, approvedSubmissions, waitingSubmissions, rejectedSubmissions, featuredSubmission, displays, store } = useSingShot();
  const [activeTab, setActiveTab] = useState<'TONIGHT' | 'EVENTS' | 'DISPLAYS' | 'THEMES' | 'ANALYTICS' | 'QR_STUDIO' | 'SETTINGS'>('TONIGHT');

  // Event form edit state
  const [eventName, setEventName] = useState(event.name);
  const [guestOfHonour, setGuestOfHonour] = useState(event.guestOfHonour || '');
  const [ticker1, setTicker1] = useState(event.tickerMessages[0] || '');
  const [ticker2, setTicker2] = useState(event.tickerMessages[1] || '');

  // Club & Brand Identity Customization State
  const [clubName, setClubName] = useState(venue.name);
  const [primaryColor, setPrimaryColor] = useState(venue.primaryColor || '#EAB308');
  const [logoText, setLogoText] = useState(venue.logoText || 'LKC');
  const [brandSavedToast, setBrandSavedToast] = useState(false);

  // Keep in sync with store updates (e.g. cross-tab sync or resets)
  useEffect(() => {
    setClubName(venue.name);
    setPrimaryColor(venue.primaryColor || '#EAB308');
    setLogoText(venue.logoText || generateClubInitials(venue.name));
  }, [venue.name, venue.primaryColor, venue.logoText]);

  const handleSaveBrandSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalClubName = clubName.trim() || 'SingShot Club';
    const finalLogo = logoText.trim() || generateClubInitials(finalClubName);
    
    store.updateVenue({
      name: finalClubName,
      brandName: `${finalClubName} ${venue.area || 'Soho'}`,
      primaryColor,
      logoText: finalLogo
    });

    setBrandSavedToast(true);
    setTimeout(() => setBrandSavedToast(false), 3000);
  };

  const handleSelectColorPreset = (hex: string) => {
    setPrimaryColor(hex);
    // Instant real-time live preview across all views
    store.updateVenue({ primaryColor: hex });
    setBrandSavedToast(true);
    setTimeout(() => setBrandSavedToast(false), 2000);
  };

  const handleResetBrandDefaults = () => {
    const defaultColor = '#EAB308';
    const defaultName = 'London Karaoke Club';
    const defaultLogo = 'LKC';
    setClubName(defaultName);
    setPrimaryColor(defaultColor);
    setLogoText(defaultLogo);
    store.updateVenue({
      name: defaultName,
      brandName: `${defaultName} Soho`,
      primaryColor: defaultColor,
      logoText: defaultLogo
    });
    setBrandSavedToast(true);
    setTimeout(() => setBrandSavedToast(false), 2500);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateEvent({
      name: eventName,
      guestOfHonour,
      tickerMessages: [ticker1, ticker2, ...event.tickerMessages.slice(2)]
    });
    alert('Event settings updated and synchronized with live displays!');
  };

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="px-8 py-5 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 text-black flex items-center justify-center font-brand font-black text-xl shadow-[0_0_20px_rgba(234,179,8,0.4)]">
            {venue.logoText || (venue.name ? venue.name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase() : 'LKC')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-xl tracking-wider text-white">
                SINGSHOT
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
                PRO SAAS
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-700/80 text-zinc-300 text-[11px] font-mono font-bold flex items-center gap-1.5">
                <CameraOff className="w-3.5 h-3.5 text-zinc-400" />
                THEME: <strong className="text-white">NO FLASH</strong>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ml-0.5" title="No Flash Club Active" />
              </span>
            </div>
            <div className="text-xs font-semibold text-neutral-400">
              {venue.name} · {venue.area} London · Active Event: <strong className="text-neutral-200">{event.name}</strong>
            </div>
          </div>
        </div>

        {/* Fast Action Launchers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSwitchMode('tv')}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(234,179,8,0.3)] cursor-pointer transition"
          >
            <Tv className="w-4 h-4" /> Open TV (16:9)
          </button>
          <button
            onClick={() => onSwitchMode('host')}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer transition"
          >
            <Tablet className="w-4 h-4 text-amber-400" /> Host Tablet
          </button>
          <button
            onClick={() => onSwitchMode('guest')}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer transition"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" /> Guest Mobile
          </button>
          <button
            onClick={() => onSwitchMode('moderator')}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer transition"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" /> Moderation
          </button>
          <button
            onClick={() => onSwitchMode('split')}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer transition"
          >
            <Layers className="w-4 h-4 text-purple-400" /> Club Multiview
          </button>
        </div>
      </header>

      {/* Admin Subnav */}
      <nav className="px-8 border-b border-neutral-800 bg-neutral-900/40 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'TONIGHT', label: 'Tonight Live', icon: Radio },
          { id: 'EVENTS', label: 'Event Setup', icon: Calendar },
          { id: 'DISPLAYS', label: 'Displays & OBS', icon: Tv },
          { id: 'THEMES', label: 'Themes & Branding', icon: Palette },
          { id: 'QR_STUDIO', label: 'QR Print Studio', icon: Download },
          { id: 'ANALYTICS', label: 'Analytics & Reports', icon: BarChart3 },
          { id: 'SETTINGS', label: 'Venue Settings', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-amber-400 text-amber-300 bg-amber-400/5 font-extrabold'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Main Tab Views */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {/* TAB 1: TONIGHT LIVE CONTROL CENTER */}
        {activeTab === 'TONIGHT' && (
          <div className="space-y-8">
            {/* Top Telemetry Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="glass-panel p-4 rounded-2xl border border-neutral-800 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  QR Scans Tonight
                </div>
                <div className="text-3xl font-display font-black text-white">
                  {event.metrics.qrScans}
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold">+18 in last hour</div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-neutral-800 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Submissions
                </div>
                <div className="text-3xl font-display font-black text-amber-400">
                  {event.metrics.totalSubmissions}
                </div>
                <div className="text-[10px] text-neutral-400">{approvedSubmissions.length} approved on TV</div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-neutral-800 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Waiting Review
                </div>
                <div className="text-3xl font-display font-black text-white">
                  {waitingSubmissions.length}
                </div>
                <div className="text-[10px] text-amber-400 font-semibold">1-tap approval</div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-neutral-800 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Total Reactions
                </div>
                <div className="text-3xl font-display font-black text-white flex items-center gap-1.5">
                  <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
                  {event.metrics.totalReactions}
                </div>
                <div className="text-[10px] text-neutral-400">Live cheers & claps</div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-neutral-800 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Star Rounds
                </div>
                <div className="text-3xl font-display font-black text-amber-300 flex items-center gap-1.5">
                  <Crown className="w-6 h-6 fill-amber-300" />
                  {event.metrics.starRounds}
                </div>
                <div className="text-[10px] text-neutral-400">Next in {event.starOfNight.countdownMinutes}m</div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-neutral-800 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Displays Connected
                </div>
                <div className="text-3xl font-display font-black text-emerald-400 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping inline-block" />
                  {displays.length}/3
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold">100% Uptime</div>
              </div>
            </div>

            {/* Live TV Stage Overview & Quick Triggers */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 cols: Current TV Spotlight Overview */}
              <div className="lg:col-span-7 glass-gold-panel p-6 rounded-3xl border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
                    <h2 className="text-sm font-extrabold uppercase tracking-widest text-white">
                      CURRENTLY BROADCASTING ON BIG SCREEN
                    </h2>
                  </div>
                  <button
                    onClick={() => onSwitchMode('tv')}
                    className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View 1080p Stream <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {featuredSubmission ? (
                  <div className="flex items-center gap-6 bg-black/60 p-4 rounded-2xl border border-neutral-800">
                    <img 
                      src={featuredSubmission.displayMediaUrl} 
                      alt={featuredSubmission.firstName} 
                      referrerPolicy="no-referrer"
                      className="w-28 h-36 rounded-2xl object-cover gold-border shadow-lg shrink-0"
                    />
                    <div className="space-y-2 min-w-0">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-black text-xs font-black uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" /> {featuredSubmission.displayTitle}
                      </div>
                      <h3 className="text-2xl font-display font-black text-white truncate">
                        {featuredSubmission.firstName}
                      </h3>
                      <p className="text-sm text-neutral-300 line-clamp-2">
                        "{featuredSubmission.message}"
                      </p>
                      <div className="flex items-center gap-3 text-xs font-semibold text-neutral-400 pt-1">
                        <span>🔥 {featuredSubmission.reactionCount.fire}</span>
                        <span>👏 {featuredSubmission.reactionCount.applause}</span>
                        <span>⭐ {featuredSubmission.reactionCount.star}</span>
                        <span>❤️ {featuredSubmission.reactionCount.heart}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-neutral-500">
                    Standby branded loop active
                  </div>
                )}

                {/* Quick Scene Trigger Buttons */}
                <div className="pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Override Display Scene:
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {(['SPOTLIGHT', 'GALLERY', 'STAR_OF_NIGHT', 'STANDBY'] as const).map((sc) => (
                      <button
                        key={sc}
                        onClick={() => store.setScene(sc)}
                        className="py-2.5 rounded-xl bg-neutral-900 hover:bg-amber-400 hover:text-black border border-neutral-700 text-xs font-extrabold uppercase transition cursor-pointer"
                      >
                        {sc.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right 5 cols: Live Queue Quick Preview */}
              <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-white">
                    LIVE ROTATION QUEUE
                  </h2>
                  <span className="text-xs text-neutral-400">
                    {approvedSubmissions.length} in queue
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {approvedSubmissions.slice(0, 5).map((sub, i) => (
                    <div 
                      key={sub.id} 
                      className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-neutral-500 font-bold w-4">#{i+1}</span>
                        <img 
                          src={sub.thumbnailUrl || sub.displayMediaUrl} 
                          alt={sub.firstName} 
                          referrerPolicy="no-referrer"
                          className="w-8 h-10 rounded-lg object-cover border border-neutral-700"
                        />
                        <div className="truncate max-w-[120px]">
                          <div className="font-bold text-white truncate">{sub.firstName}</div>
                          <div className="text-[10px] text-neutral-400 truncate">{sub.displayTitle}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => store.featureNow(sub.id)}
                        className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-[11px] uppercase cursor-pointer"
                      >
                        Feature
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => store.resetToDemo()}
                  className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Demo Event Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EVENT SETUP */}
        {activeTab === 'EVENTS' && (
          <form onSubmit={handleSaveEvent} className="max-w-2xl glass-panel p-8 rounded-3xl border border-neutral-800 space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-display font-extrabold text-white">
                Live Event Configuration
              </h2>
              <p className="text-xs text-neutral-400">
                Configure event name, guest of honour, and broadcast ticker copy.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-300 mb-1.5">
                Event Title
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-300 mb-1.5">
                Guest of Honour (Optional)
              </label>
              <input
                type="text"
                value={guestOfHonour}
                onChange={(e) => setGuestOfHonour(e.target.value)}
                placeholder="e.g. Maddie"
                className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-medium"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase text-neutral-300">
                Live TV Ticker Messages
              </label>
              <input
                type="text"
                value={ticker1}
                onChange={(e) => setTicker1(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white"
                placeholder="Ticker message #1"
              />
              <input
                type="text"
                value={ticker2}
                onChange={(e) => setTicker2(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white"
                placeholder="Ticker message #2"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              Save & Sync All Displays
            </button>
          </form>
        )}

        {/* TAB 3: DISPLAYS & OBS INTEGRATION */}
        {activeTab === 'DISPLAYS' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-display font-extrabold text-white">
                  Connected Displays & Streaming Feeds
                </h2>
                <p className="text-xs text-neutral-400">
                  Manage television outputs, bar screens, and OBS / Resolume browser sources.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displays.map((disp) => (
                <div key={disp.id} className="glass-panel p-5 rounded-3xl border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-black uppercase text-emerald-400">ONLINE</span>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400">{disp.resolution}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{disp.name}</h3>
                    <div className="text-xs text-neutral-400">{disp.location}</div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => onSwitchMode('tv')}
                      className="flex-1 py-2 rounded-xl bg-neutral-900 hover:bg-amber-400 hover:text-black border border-neutral-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Launch Feed
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* OBS / Resolume Source Box */}
            <div className="glass-gold-panel p-6 rounded-3xl border-amber-500/30 space-y-3">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <Radio className="w-4 h-4" /> OBS / Resolume Arena Browser Source
              </h3>
              <p className="text-xs text-neutral-300">
                Use this URL inside OBS Studio, vMix, or Resolume Arena as a 1920x1080 60FPS browser source:
              </p>
              <div className="p-3 rounded-xl bg-black font-mono text-xs text-amber-300 border border-neutral-800 break-all select-all">
                {typeof window !== 'undefined' ? `${window.location.origin}/?mode=tv&obs=true` : 'https://singshot.live/display/obs'}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: THEMES & BRANDING */}
        {activeTab === 'THEMES' && (
          <div className="space-y-8">
            {/* Dynamic Club Identity & Primary Brand Color Section */}
            <div className="glass-panel p-8 rounded-3xl border border-neutral-800 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black">
                      <Paintbrush className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl font-display font-extrabold text-white">
                      Club Identity & Primary Brand Color
                    </h2>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
                    Configure your club name and signature venue accent color. Changes dynamically cascade in real-time across the 16:9 TV broadcast, host tablet surface, guest mobile interface, and venue badges.
                  </p>
                </div>

                {brandSavedToast && (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-fade-in">
                    <Check className="w-4 h-4" />
                    <span>Dynamic Theme Synced Globally!</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Form Controls (7 cols) */}
                <form onSubmit={handleSaveBrandSettings} className="lg:col-span-7 space-y-6">
                  {/* Row: Club Name and Initials */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="club-name-input" className="block text-xs font-bold uppercase text-neutral-300 mb-1.5">
                        Club Name
                      </label>
                      <input
                        id="club-name-input"
                        type="text"
                        value={clubName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setClubName(val);
                          setLogoText(generateClubInitials(val));
                        }}
                        placeholder="e.g. London Karaoke Club"
                        className="w-full px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-700 text-white font-medium text-sm focus:border-amber-400 focus:outline-none transition"
                      />
                      <span className="text-[11px] text-neutral-500 mt-1 block">
                        Displayed in headers, guest landing pages, and TV stage overlays.
                      </span>
                    </div>

                    <div>
                      <label htmlFor="logo-text-input" className="block text-xs font-bold uppercase text-neutral-300 mb-1.5">
                        Badge Initials
                      </label>
                      <input
                        id="logo-text-input"
                        type="text"
                        maxLength={4}
                        value={logoText}
                        onChange={(e) => setLogoText(e.target.value.toUpperCase())}
                        placeholder="LKC"
                        className="w-full px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-700 text-white font-mono font-bold text-sm uppercase tracking-wider focus:border-amber-400 focus:outline-none text-center"
                      />
                      <span className="text-[11px] text-neutral-500 mt-1 block text-center">
                        2-4 characters
                      </span>
                    </div>
                  </div>

                  {/* Primary Brand Color Presets */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase text-neutral-300">
                        Primary Brand Color
                      </label>
                      <span className="text-xs font-mono font-bold text-neutral-400 uppercase">
                        Current: <strong className="text-white">{primaryColor}</strong>
                      </span>
                    </div>

                    {/* Color Swatch Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {BRAND_COLOR_PRESETS.map((preset) => {
                        const isSelected = primaryColor.toLowerCase() === preset.hex.toLowerCase();
                        return (
                          <button
                            key={preset.hex}
                            type="button"
                            onClick={() => handleSelectColorPreset(preset.hex)}
                            className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
                              isSelected
                                ? 'bg-neutral-800/90 border-white ring-2 ring-white/40 shadow-lg'
                                : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50'
                            }`}
                          >
                            <span 
                              className="w-6 h-6 rounded-full shrink-0 shadow-sm border border-white/20 flex items-center justify-center"
                              style={{ backgroundColor: preset.hex }}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 text-black drop-shadow" />}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-white truncate">{preset.name}</div>
                              <div className="text-[10px] font-mono text-neutral-400">{preset.hex}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Hex Picker */}
                    <div className="pt-2 flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 flex-1">
                        <label htmlFor="custom-color-picker" className="text-xs text-neutral-400 font-semibold cursor-pointer">
                          Custom Hex:
                        </label>
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            id="custom-color-picker"
                            type="color"
                            value={primaryColor.startsWith('#') ? primaryColor : `#${primaryColor}`}
                            onChange={(e) => handleSelectColorPreset(e.target.value.toUpperCase())}
                            className="w-7 h-7 rounded-lg border-0 bg-transparent cursor-pointer p-0"
                          />
                          <input
                            type="text"
                            value={primaryColor}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPrimaryColor(val);
                              if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                                store.updateVenue({ primaryColor: val });
                              }
                            }}
                            placeholder="#EAB308"
                            className="font-mono text-xs text-white bg-transparent focus:outline-none uppercase w-24"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleResetBrandDefaults}
                        className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition cursor-pointer"
                        title="Reset to default Soho Gold"
                      >
                        Reset Default
                      </button>
                    </div>
                  </div>

                  {/* Submit Actions */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Save & Apply Brand Theme
                    </button>
                    <span className="text-xs text-neutral-500 font-medium">
                      Syncs to TV, Host, Guest Mobile & Moderator in real-time.
                    </span>
                  </div>
                </form>

                {/* Right Column: Live Visual Stage Preview (5 cols) */}
                <div className="lg:col-span-5 bg-neutral-900/80 p-6 rounded-3xl border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-amber-400" /> Live Stage UI Preview
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">
                      Real-time CSS
                    </span>
                  </div>

                  {/* Preview Component 1: Venue Initials Badge & Club Name */}
                  <div className="p-4 rounded-2xl bg-black border border-neutral-800 flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-sm shadow-md"
                      style={{ 
                        backgroundColor: primaryColor,
                        color: getContrastTextColor(primaryColor)
                      }}
                    >
                      {logoText || 'LKC'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-white truncate">
                        {clubName || 'London Karaoke Club'}
                      </div>
                      <div className="text-xs font-semibold" style={{ color: primaryColor }}>
                        ★ LIVE VIP STAGE
                      </div>
                    </div>
                  </div>

                  {/* Preview Component 2: Primary Button */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold uppercase text-neutral-400">
                      Guest Mobile / Host Action Button
                    </div>
                    <div 
                      className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md"
                      style={{ 
                        backgroundColor: primaryColor,
                        color: getContrastTextColor(primaryColor)
                      }}
                    >
                      <Sparkles className="w-3.5 h-3.5" /> SUBMIT PHOTO TO BIG SCREEN
                    </div>
                  </div>

                  {/* Preview Component 3: Glowing Broadcast Card */}
                  <div 
                    className="p-4 rounded-2xl bg-neutral-950 border-2 space-y-1 transition"
                    style={{ 
                      borderColor: primaryColor,
                      boxShadow: `0 0 25px -5px ${primaryColor}40`
                    }}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold" style={{ color: primaryColor }}>
                      <span>16:9 TV SPOTLIGHT FRAME</span>
                      <span className="font-mono text-white text-[10px]">#LIVE</span>
                    </div>
                    <p className="text-xs text-neutral-300 font-medium italic">
                      "Stage atmosphere, ambient spotlights, and crowd badges adapt dynamically to {clubName}!"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Display Background & Aesthetic Modes */}
            <div>
              <h2 className="text-xl font-display font-extrabold text-white">
                Display Background & Aesthetic Modes
              </h2>
              <p className="text-xs text-neutral-400">
                Select visual presentation styling for the 16:9 television layout.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { id: 'no-flash-club', name: 'Mode A: No Flash Club', desc: 'Sober matte darkroom aesthetic, zero neon glare, razor-sharp high-contrast club staging.' },
                { id: 'premium-blur', name: 'Mode B: Premium Blur', desc: 'Softly blurred widescreen backdrop generated dynamically from the guest portrait.' },
                { id: 'london-karaoke-club', name: 'Mode C: Soho Nightlife', desc: `${venue.name} signature nightlife ambiance with warm glow and gold borders.` },
                { id: 'minimal-broadcast', name: 'Mode E: Minimal Broadcast', desc: 'Ultra-clean black stage with razor-sharp gold frame accents.' }
              ].map((th) => (
                <div 
                  key={th.id}
                  onClick={() => store.setBackgroundMode(th.id as any)}
                  className={`p-6 rounded-3xl border transition cursor-pointer space-y-2 ${
                    event.backgroundMode === th.id
                      ? 'glass-gold-panel border-2 border-amber-400 gold-glow'
                      : 'glass-panel border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">{th.name}</h3>
                    {event.backgroundMode === th.id && (
                      <CheckCircle2 className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {th.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: QR ASSET GENERATOR & PRINT STUDIO */}
        {activeTab === 'QR_STUDIO' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-display font-extrabold text-white">
                Table Card & Poster QR Asset Studio
              </h2>
              <p className="text-xs text-neutral-400">
                Generate high-resolution printable table stands and TV overlays for guests to scan.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 glass-panel p-8 rounded-3xl border border-neutral-800">
              {/* Printable Card Mockup */}
              <div className="w-64 bg-neutral-900 p-6 rounded-3xl border-2 border-amber-400 gold-glow text-center space-y-4 shrink-0 shadow-2xl">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black mx-auto">
                  {venue.logoText || (venue.name ? venue.name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase() : 'LKC')}
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-black tracking-widest text-amber-400 uppercase">
                    SINGSHOT LIVE
                  </div>
                  <div className="text-lg font-display font-black text-white">
                    SEE YOURSELF ON THE BIG SCREEN
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl inline-block shadow-inner">
                  <QRCodeSVG 
                    value={typeof window !== 'undefined' ? `${window.location.origin}/?mode=guest&event=${event.slug}` : 'https://singshot.live'}
                    size={140}
                  />
                </div>

                <div className="text-[11px] font-bold text-neutral-300">
                  Scan with Camera · No App Needed
                </div>
              </div>

              {/* Download Options */}
              <div className="space-y-4 max-w-md">
                <h3 className="text-lg font-bold text-white">
                  Ready-to-Print Soho Table Assets
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Place on cocktail tables, booth mirrors, and bar countertops. Each QR links straight to <strong>{event.name}</strong> without app installation.
                </p>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => window.print()}
                    className="w-full py-3 rounded-xl bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow"
                  >
                    <Download className="w-4 h-4" /> Print A4 / Table Stand (PDF)
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(typeof window !== 'undefined' ? `${window.location.origin}/?mode=guest&event=${event.slug}` : '');
                      alert('Direct guest link copied to clipboard!');
                    }}
                    className="w-full py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer hover:bg-neutral-800"
                  >
                    Copy Direct Guest Submission URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ANALYTICS & REPORTS */}
        {activeTab === 'ANALYTICS' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-display font-extrabold text-white">
                  Event Performance Summary
                </h2>
                <p className="text-xs text-neutral-400">
                  Comprehensive audience participation report for {event.name} at London Karaoke Club Soho.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const headers = ['ID', 'First Name', 'Group', 'Occasion', 'Message', 'Moderation Status', 'AI Status', 'Starred', 'Created At'];
                    const rows = (store.getSubmissions() || []).map(s => [
                      `"${s.id}"`,
                      `"${s.firstName.replace(/"/g, '""')}"`,
                      `"${(s.groupName || '').replace(/"/g, '""')}"`,
                      `"${s.occasion}"`,
                      `"${s.message.replace(/"/g, '""')}"`,
                      `"${s.moderationStatus}"`,
                      `"${s.aiSafetyScore?.status || 'Unknown'}"`,
                      `"${s.isStarred ? 'Yes' : 'No'}"`,
                      `"${new Date(s.createdAt).toLocaleTimeString()}"`
                    ]);

                    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', `lkc_soho_${event.slug}_event_data.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Download className="w-4 h-4 text-emerald-400" /> Export CSV Report
                </button>
                <button
                  onClick={() => {
                    const summaryText = `SINGSHOT EVENT SUMMARY - ${event.name}\nVenue: London Karaoke Club Soho\nQR Scans: ${event.metrics.qrScans}\nTotal Submissions: ${event.metrics.totalSubmissions}\nApproved on TV: ${approvedSubmissions.length}\nAudience Cheers: ${event.metrics.totalReactions}\nActive Displays: ${displays.length}\nStar Rounds: ${event.metrics.starRounds}`;
                    navigator.clipboard.writeText(summaryText);
                    alert('Event Summary Report copied to clipboard!');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase cursor-pointer transition shadow"
                >
                  Copy Summary Text
                </button>
              </div>
            </div>

            {/* 6 Required Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="glass-panel p-6 rounded-3xl border border-neutral-800 space-y-1">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Submissions</div>
                <div className="text-4xl font-display font-black text-white">
                  {event.metrics.totalSubmissions}
                </div>
                <div className="text-xs text-neutral-400">Guest photos & shoutouts sent</div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-neutral-800 space-y-1">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Approval Rate</div>
                <div className="text-4xl font-display font-black text-emerald-400">
                  {((approvedSubmissions.length / Math.max(1, event.metrics.totalSubmissions)) * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-neutral-400">{approvedSubmissions.length} approved for TV broadcast</div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-neutral-800 space-y-1">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Table QR Scans</div>
                <div className="text-4xl font-display font-black text-amber-400">
                  {event.metrics.qrScans}
                </div>
                <div className="text-xs text-neutral-400">Cocktail tables & mirror scans</div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-neutral-800 space-y-1">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Audience Cheers</div>
                <div className="text-4xl font-display font-black text-pink-400">
                  {event.metrics.totalReactions}
                </div>
                <div className="text-xs text-neutral-400">Live claps, hypes & love sent to TV</div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-neutral-800 space-y-1">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Active Displays</div>
                <div className="text-4xl font-display font-black text-cyan-400">
                  {displays.length || 3}
                </div>
                <div className="text-xs text-neutral-400">Main Stage, VIP Booth, & Bar Displays</div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-neutral-800 space-y-1">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Star Rounds</div>
                <div className="text-4xl font-display font-black text-purple-400">
                  {event.metrics.starRounds}
                </div>
                <div className="text-xs text-neutral-400">Star of the Night awards completed</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: VENUE SETTINGS */}
        {activeTab === 'SETTINGS' && (
          <div className="max-w-2xl glass-panel p-8 rounded-3xl border border-neutral-800 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
              <div>
                <h2 className="text-xl font-display font-extrabold text-white">
                  Venue Multi-Tenant SaaS Settings
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Manage club identity, branding, and multi-tenant licensing.
                </p>
              </div>

              {brandSavedToast && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-fade-in">
                  <Check className="w-3.5 h-3.5" />
                  <span>Settings Saved!</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveBrandSettings} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="settings-venue-name" className="block text-xs font-bold uppercase text-neutral-300 mb-1.5">
                    Club / Venue Name
                  </label>
                  <input
                    id="settings-venue-name"
                    type="text"
                    value={clubName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setClubName(val);
                      setLogoText(generateClubInitials(val));
                    }}
                    placeholder="London Karaoke Club"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-semibold text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="settings-logo-text" className="block text-xs font-bold uppercase text-neutral-300 mb-1.5">
                    Badge Initials
                  </label>
                  <input
                    id="settings-logo-text"
                    type="text"
                    maxLength={4}
                    value={logoText}
                    onChange={(e) => setLogoText(e.target.value.toUpperCase())}
                    placeholder="LKC"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono font-bold text-sm uppercase text-center focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-300 mb-2">
                  Primary Brand Accent Color
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BRAND_COLOR_PRESETS.map((p) => {
                    const isSelected = primaryColor.toLowerCase() === p.hex.toLowerCase();
                    return (
                      <button
                        key={p.hex}
                        type="button"
                        onClick={() => handleSelectColorPreset(p.hex)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition cursor-pointer ${
                          isSelected
                            ? 'border-white bg-neutral-800 text-white ring-1 ring-white/40'
                            : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: p.hex }} />
                        <span className="truncate">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content Safety & Data Retention Policies */}
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> CONTENT RETENTION & SAFETY POLICY
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">AI Content Pre-Check Engine</div>
                    <div className="text-[11px] text-neutral-400">Automated classification for nudity, offensive language & spam</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] uppercase border border-emerald-500/30">
                    ENABLED
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs border-t border-neutral-800/80 pt-2.5">
                  <div>
                    <div className="font-bold text-white">24-Hour GDPR Data Auto-Purge</div>
                    <div className="text-[11px] text-neutral-400">Guest photos and shoutouts automatically purged at 6:00 AM next day</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 font-extrabold text-[10px] uppercase border border-neutral-700">
                    AUTOMATIC
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-300 mb-1">
                  SaaS Subscription Tier
                </label>
                <div className="px-4 py-2.5 rounded-xl bg-amber-400/10 border border-amber-400/40 text-amber-300 font-bold text-sm flex items-center justify-between">
                  <span>PRO VENUE LICENSE ({venue.name} {venue.area})</span>
                  <span className="text-[11px] uppercase tracking-wider bg-amber-400/20 px-2 py-0.5 rounded-md">Active</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow transition"
                  >
                    <Check className="w-4 h-4" /> Save Venue Settings
                  </button>
                  <button
                    type="button"
                    onClick={handleResetBrandDefaults}
                    className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer transition"
                  >
                    Reset Defaults
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset entire system to Soho nightlife demo data? This will load sample guests, waiting items, and metrics.')) {
                      store.resetToDemo();
                      alert('System reset to London Karaoke Club Soho demo data.');
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-950 hover:bg-red-900 border border-red-800/80 text-red-300 font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Demo Data
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
