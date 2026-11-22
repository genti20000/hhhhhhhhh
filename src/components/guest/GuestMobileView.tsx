import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SessionQRCode } from '../common/SessionQRCode';
import { useSingShot } from '../../services/store';
import { OccasionType, ReactionType, Submission } from '../../types';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  RefreshCw, 
  Check, 
  X, 
  MessageSquare, 
  ShieldAlert, 
  Clock, 
  QrCode, 
  Flame, 
  Heart, 
  Mic, 
  AlertCircle,
  Flag,
  Share2
} from 'lucide-react';
import { playSoundEffect } from '../../utils/soundEffects';

type GuestFlowScreen = 'WELCOME' | 'PHOTO' | 'DETAILS' | 'CONSENT' | 'SUCCESS';

export const GuestMobileView: React.FC = () => {
  const { event, venue, featuredSubmission, store } = useSingShot();
  
  // Navigation screen
  const [screen, setScreen] = useState<GuestFlowScreen>('WELCOME');

  // Form state
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isTextOnlyMode, setIsTextOnlyMode] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState('Soho VIP Gold');
  const [firstName, setFirstName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [message, setMessage] = useState('');
  const [occasion, setOccasion] = useState<OccasionType>('BIRTHDAY');
  const [agreedToConsent, setAgreedToConsent] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);

  // Validation & Error states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Rate limiting simulation (guests can submit every 45s)
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // QR modal state
  const [showQrModal, setShowQrModal] = useState(false);

  // Content report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Camera stream refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraLoading, setCameraLoading] = useState(false);

  // Cheer feedback
  const [reactionBurst, setReactionBurst] = useState<ReactionType | null>(null);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const t = setTimeout(() => setCooldownRemaining(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldownRemaining]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Frame choices
  const frames = [
    'Soho VIP Gold',
    'Electric Purple',
    'Neon London Cyan',
    'Hot Pink Soho',
    'Retro Chrome'
  ];

  // Occasions list
  const occasions: { id: OccasionType; label: string; icon: string }[] = [
    { id: 'BIRTHDAY', label: 'Birthday', icon: '🎂' },
    { id: 'HEN_PARTY', label: 'Hen Party', icon: '👰‍♀️' },
    { id: 'STAG_DO', label: 'Stag Do', icon: '🎩' },
    { id: 'DATE_NIGHT', label: 'Date Night', icon: '🥂' },
    { id: 'CORPORATE', label: 'Work / Corporate', icon: '💼' },
    { id: 'SOHO_SATURDAY', label: 'Soho Saturday', icon: '🍸' },
    { id: 'KARAOKE_LEGEND', label: 'Karaoke Legend', icon: '👑' },
    { id: 'MAIN_CHARACTER', label: 'Main Character', icon: '✨' }
  ];

  // Quick message presets
  const messageSuggestions = [
    'Turning 25 in Soho! Tequila on deck! 🍸',
    'Bride squad warming up for Mr. Brightside! 👰‍♀️',
    'Soho Saturday crew ready to hit high notes! 🔥',
    'Valerie is our song tonight! Duet goals! 🎤',
    'Out of office is ON and mics are LIVE! 💼',
    'Main character energy all night long! ✨'
  ];

  // Camera Management
  const startCamera = async (mode: 'user' | 'environment' = 'user') => {
    setCameraLoading(true);
    setFileError(null);
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1080 }, height: { ideal: 1440 } },
        audio: false
      });
      setCameraStream(stream);
      setFacingMode(mode);
      setCameraLoading(false);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 150);
    } catch {
      setCameraLoading(false);
      // If camera fails, trigger file upload seamlessly
      setFileError('Camera access not supported on this device. Please select a photo from your gallery.');
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setPhotoDataUrl(dataUrl);
      stopCamera();
      setScreen('DETAILS');
    }
  };

  // Image Upload Validation (Max 10MB, jpeg/png/webp)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);

    // Validate size (max 10MB)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setFileError('Image too large. Please select a photo under 10MB.');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFileError('Unsupported file format. Please upload JPEG, PNG, or WebP.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotoDataUrl(event.target.result as string);
        stopCamera();
        setScreen('DETAILS');
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper to generate text card if no photo is taken
  const createTextCardDataUrl = (name: string, msg: string, occ: OccasionType): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1060;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Luxurious Soho Nightclub dark gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 1060);
    grad.addColorStop(0, '#0F0B18');
    grad.addColorStop(0.5, '#1E142F');
    grad.addColorStop(1, '#08050E');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 1060);

    // Gold decorative border
    ctx.strokeStyle = '#EAB308';
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, 740, 1000);

    // Club branding
    ctx.fillStyle = '#EAB308';
    ctx.font = '900 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LONDON KARAOKE CLUB SOHO', 400, 120);

    // Occasion badge
    ctx.fillStyle = '#EC4899';
    ctx.font = '700 24px sans-serif';
    ctx.fillText(`★ ${occ.replace('_', ' ')} ★`, 400, 180);

    // Message
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 48px sans-serif';
    const words = (msg || 'VIP SHOUTOUT').split(' ');
    let line = '';
    let y = 380;
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 620 && i > 0) {
        ctx.fillText(line.trim(), 400, y);
        line = words[i] + ' ';
        y += 65;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), 400, y);

    // Signature
    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`— ${name || 'VIP Guest'}`, 400, y + 110);

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  // Submit to Moderator Queue (Strictly enters WAITING status)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToConsent) {
      setErrorMessage('Please confirm consent to display your submission publicly.');
      return;
    }

    if (cooldownRemaining > 0) {
      setErrorMessage(`Please wait ${cooldownRemaining} seconds before submitting another shoutout.`);
      return;
    }

    let finalMediaUrl = photoDataUrl;
    if (!finalMediaUrl) {
      finalMediaUrl = createTextCardDataUrl(firstName, message, occasion);
    }
    if (!finalMediaUrl) return;

    // Send to store - strictly enters WAITING state for staff approval!
    const sub = store.addSubmission({
      eventId: event.id,
      sessionId: `guest-${Math.random().toString(36).substring(2, 6)}`,
      firstName: firstName.trim() || 'VIP Guest',
      groupName: groupName.trim() || undefined,
      message: message.trim() || 'Soho vibes at London Karaoke Club! ✨',
      occasion,
      mediaType: 'image',
      originalMediaUrl: finalMediaUrl,
      displayMediaUrl: finalMediaUrl,
      thumbnailUrl: finalMediaUrl,
      frameStyle: isTextOnlyMode ? 'VIP Shoutout' : selectedFrame
    });

    setActiveSubmission(sub);
    setCooldownRemaining(45); // Set 45s cooldown
    setScreen('SUCCESS');
    playSoundEffect('tap');
  };

  // Stage Cheer Reactions
  const handleSendReaction = (type: ReactionType) => {
    store.addReaction(type, featuredSubmission?.id, firstName || 'Guest');
    setReactionBurst(type);
    setTimeout(() => setReactionBurst(null), 900);
  };

  // Content Report Handler
  const handleReportContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim() || !featuredSubmission) return;

    store.reportSubmission(featuredSubmission.id, reportReason.trim());
    setReportSubmitted(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportSubmitted(false);
      setReportReason('');
    }, 2200);
  };

  return (
    <div className="w-full min-h-screen bg-[#070709] text-white flex flex-col justify-between max-w-md mx-auto relative overflow-hidden font-sans border-x border-neutral-800/80 shadow-2xl">
      {/* Hidden File Input for Gallery Upload */}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/jpeg,image/png,image/webp,image/jpg" 
        className="hidden" 
        onChange={handleFileUpload} 
      />

      {/* Top Mobile Bar */}
      <header className="p-4 flex items-center justify-between border-b border-neutral-800/80 bg-black/70 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center font-brand font-black text-sm shadow-[0_0_12px_rgba(234,179,8,0.4)]">
            {venue.logoText || 'LKC'}
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-wider text-white flex items-center gap-1.5">
              {venue.name.toUpperCase()}
            </div>
            <div className="text-[10px] font-semibold text-neutral-400">
              {venue.area || 'Soho'} London · Live Stage
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-amber-400 cursor-pointer"
            title="Show QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-700/60 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block" />
            LIVE ON TV
          </div>
        </div>
      </header>

      {/* MAIN SCREENS CONTAINER */}
      <main className="flex-1 p-5 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* SCREEN 1: VENUE WELCOME & CTA */}
          {screen === 'WELCOME' && (
            <motion.div
              key="screen-welcome"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-center my-auto"
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600 text-black flex items-center justify-center font-black text-4xl mx-auto shadow-[0_0_35px_rgba(234,179,8,0.4)] border border-amber-200">
                <Sparkles className="w-10 h-10 text-white fill-white" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" /> LONDON KARAOKE CLUB SOHO
                </div>
                <h1 className="text-3xl font-display font-extrabold tracking-tight text-white leading-tight">
                  YOU'RE ABOUT TO BE ON THE BIG SCREEN.
                </h1>
                <p className="text-sm font-medium text-neutral-300 max-w-xs mx-auto">
                  No app download. No login required. Snap a selfie, submit your shoutout, and get featured on the main stage TV.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  id="guest-get-started-btn"
                  onClick={() => {
                    setScreen('PHOTO');
                    startCamera('user');
                  }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 transition text-black font-black text-base uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(234,179,8,0.4)] cursor-pointer"
                >
                  <Camera className="w-5 h-5" /> TAKE A SELFIE 📸
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      setIsTextOnlyMode(true);
                      setPhotoDataUrl(null);
                      setScreen('DETAILS');
                    }}
                    className="py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 active:scale-95 transition border border-neutral-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-amber-400" /> TEXT SHOUTOUT ✍️
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 active:scale-95 transition border border-neutral-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-neutral-300" /> UPLOAD PHOTO
                  </button>
                </div>
              </div>

              {/* Live Crowd Cheer Bar */}
              <div className="pt-5 border-t border-neutral-900">
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2.5 flex items-center justify-center gap-1.5">
                  <span>Send live stage cheers to the screen:</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <button
                    onClick={() => handleSendReaction('clap')}
                    className="p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center gap-1 active:scale-110 transition cursor-pointer hover:border-amber-400"
                  >
                    <span className="text-2xl">👏</span>
                    <span className="text-[9px] font-bold text-neutral-400">CLAP</span>
                  </button>
                  <button
                    onClick={() => handleSendReaction('sing')}
                    className="p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center gap-1 active:scale-110 transition cursor-pointer hover:border-cyan-400"
                  >
                    <span className="text-2xl">🎤</span>
                    <span className="text-[9px] font-bold text-neutral-400">SING</span>
                  </button>
                  <button
                    onClick={() => handleSendReaction('hype')}
                    className="p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center gap-1 active:scale-110 transition cursor-pointer hover:border-pink-500"
                  >
                    <span className="text-2xl">🔥</span>
                    <span className="text-[9px] font-bold text-neutral-400">HYPE</span>
                  </button>
                  <button
                    onClick={() => handleSendReaction('love')}
                    className="p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center gap-1 active:scale-110 transition cursor-pointer hover:border-rose-500"
                  >
                    <span className="text-2xl">💖</span>
                    <span className="text-[9px] font-bold text-neutral-400">LOVE</span>
                  </button>
                  <button
                    onClick={() => handleSendReaction('shout')}
                    className="p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center gap-1 active:scale-110 transition cursor-pointer hover:border-purple-500"
                  >
                    <span className="text-2xl">🗣️</span>
                    <span className="text-[9px] font-bold text-neutral-400">SHOUT</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Table Join QR Code */}
              <SessionQRCode
                variant="mobile-inline"
                onExpand={() => setShowQrModal(true)}
              />
            </motion.div>
          )}

          {/* SCREEN 2: TAKE SELFIE OR UPLOAD PHOTO WITH FRAME PREVIEW */}
          {screen === 'PHOTO' && (
            <motion.div
              key="screen-photo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold uppercase text-white tracking-wider">
                  STEP 1: SNAP YOUR PHOTO
                </h2>
                <button
                  onClick={() => {
                    stopCamera();
                    setScreen('WELCOME');
                  }}
                  className="p-1.5 rounded-full bg-neutral-900 text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {fileError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}

              {/* Camera viewfinder frame */}
              <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden bg-black border-2 border-amber-400/80 shadow-2xl">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />

                {cameraLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-amber-400 font-bold text-xs">
                    Starting camera...
                  </div>
                )}

                {/* Selected Frame Overlay Badge */}
                <div className="absolute top-4 left-4 bg-amber-400 text-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {selectedFrame}
                </div>

                {/* Flip camera */}
                <button
                  onClick={() => startCamera(facingMode === 'user' ? 'environment' : 'user')}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 active:rotate-180 transition-transform cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Frame selection chips */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Choose Frame Style:
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {frames.map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSelectedFrame(f)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                        selectedFrame === f 
                          ? 'bg-amber-400 text-black shadow-md font-extrabold' 
                          : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Snap Button */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={capturePhoto}
                  className="w-full py-4 rounded-2xl bg-amber-400 active:scale-95 text-black font-extrabold text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(234,179,8,0.5)] cursor-pointer"
                >
                  <Camera className="w-5 h-5" /> CAPTURE PHOTO
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 font-bold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" /> Choose from Library (Max 10MB)
                </button>
              </div>
            </motion.div>
          )}

          {/* SCREEN 3: NAME, OCCASION, AND 140-CHAR SHOUTOUT */}
          {screen === 'DETAILS' && (
            <motion.div
              key="screen-details"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <h2 className="text-base font-extrabold uppercase text-white tracking-wider">
                  STEP 2: DETAILS & SHOUTOUT
                </h2>
                <button
                  type="button"
                  onClick={() => setScreen('PHOTO')}
                  className="text-xs text-amber-400 font-bold cursor-pointer"
                >
                  Retake Photo
                </button>
              </div>

              {/* Preview Thumbnail */}
              {photoDataUrl && (
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
                  <img src={photoDataUrl} alt="Preview" className="w-14 h-18 object-cover rounded-xl border border-amber-400/60 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-amber-400 uppercase">{selectedFrame}</div>
                    <div className="text-xs text-neutral-300">Ready for big screen preview</div>
                  </div>
                </div>
              )}

              {/* Name & Crew */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                    First Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={24}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Maddie"
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 font-medium text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                    Crew / Group
                  </label>
                  <input
                    type="text"
                    maxLength={24}
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g. Soho Girls"
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 font-medium text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Shoutout Message (140 chars max with live counter) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-300">
                    Shoutout for the TV Screen
                  </label>
                  <span className={`text-[11px] font-mono font-bold ${message.length > 130 ? 'text-amber-400' : 'text-neutral-400'}`}>
                    {message.length}/140
                  </span>
                </div>
                <textarea
                  rows={2}
                  maxLength={140}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a dedication, birthday wish, or hype message..."
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 font-medium text-sm focus:border-amber-400 focus:outline-none"
                />

                {/* Quick suggestion inspiration chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1.5 pb-0.5 no-scrollbar">
                  {messageSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setMessage(suggestion)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-neutral-900 text-amber-300 border border-neutral-800 hover:border-amber-400/60 whitespace-nowrap cursor-pointer transition active:scale-95"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occasion Selector */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                  Celebration Vibe:
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {occasions.map((occ) => (
                    <button
                      key={occ.id}
                      type="button"
                      onClick={() => setOccasion(occ.id)}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer text-left ${
                        occasion === occ.id
                          ? 'bg-amber-400 text-black border border-amber-300 shadow-md font-extrabold'
                          : 'bg-neutral-900 text-neutral-300 border border-neutral-800'
                      }`}
                    >
                      <span>{occ.icon}</span>
                      <span className="truncate">{occ.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Continue to Consent */}
              <button
                type="button"
                onClick={() => setScreen('CONSENT')}
                disabled={!firstName.trim()}
                className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.3)] disabled:opacity-50 cursor-pointer"
              >
                NEXT: REVIEW & PERMISSION
              </button>
            </motion.div>
          )}

          {/* SCREEN 4: CONSENT & PRIVACY NOTICE */}
          {screen === 'CONSENT' && (
            <motion.div
              key="screen-consent"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-5 my-auto"
            >
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-display font-extrabold text-white uppercase tracking-tight">
                  PUBLIC DISPLAY PERMISSION
                </h2>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                  London Karaoke Club Soho is a live venue. Please confirm your consent before sending to the stage.
                </p>
              </div>

              {/* Review summary box */}
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2 text-left">
                <div className="text-xs font-bold text-amber-400 uppercase">SUBMISSION SUMMARY:</div>
                <div className="text-sm font-bold text-white">{firstName} {groupName ? `(${groupName})` : ''}</div>
                <div className="text-xs text-neutral-300 italic">"{message || 'Soho vibes tonight!'}"</div>
                <div className="text-[11px] text-neutral-400">Occasion: {occasion.replace('_', ' ')}</div>
              </div>

              {/* Concise privacy notice */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
                <div className="font-bold text-neutral-300">Venue Privacy Notice:</div>
                <p>
                  Submissions are reviewed by staff before broadcast. Photos are temporarily stored for the duration of tonight's event (24h retention) and are never sold or shared with external parties.
                </p>
              </div>

              {/* Checkbox */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToConsent}
                  onChange={(e) => {
                    setAgreedToConsent(e.target.checked);
                    setErrorMessage(null);
                  }}
                  className="mt-1 rounded border-neutral-700 text-amber-500 focus:ring-amber-400 cursor-pointer w-4 h-4"
                />
                <span className="text-xs text-neutral-200 font-medium">
                  I agree to display my photo and shoutout publicly on the venue's big-screen TV tonight at London Karaoke Club.
                </span>
              </label>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              {/* Submit to host queue */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!agreedToConsent}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(234,179,8,0.4)] disabled:opacity-50 cursor-pointer active:scale-95 transition"
                >
                  <Sparkles className="w-5 h-5" /> SEND FOR HOST APPROVAL
                </button>
                <button
                  type="button"
                  onClick={() => setScreen('DETAILS')}
                  className="w-full py-2 text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Back to edit details
                </button>
              </div>
            </motion.div>
          )}

          {/* SCREEN 5: SUCCESS STATE: "SENT TO THE HOST FOR APPROVAL" + STAGE CHEERS */}
          {screen === 'SUCCESS' && (
            <motion.div
              key="screen-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 my-auto"
            >
              <div className="w-16 h-16 rounded-full bg-amber-400 text-black flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(234,179,8,0.6)] text-2xl font-black">
                <Check className="w-9 h-9 stroke-[3]" />
              </div>

              <div className="space-y-1">
                {/* Real-time Status Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-xs font-black uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  SENT TO HOST FOR APPROVAL
                </div>
                <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">
                  YOU'RE IN THE SOHO QUEUE!
                </h2>
                <p className="text-xs text-neutral-300 max-w-xs mx-auto">
                  Staff are reviewing your submission. Once approved, you'll appear in the big screen spotlight rotation!
                </p>
              </div>

              {/* Submission Card Summary */}
              {activeSubmission && (
                <div className="bg-neutral-900/90 p-3.5 rounded-2xl border border-neutral-800 text-left space-y-2">
                  <div className="flex items-center gap-3">
                    <img 
                      src={activeSubmission.thumbnailUrl || activeSubmission.displayMediaUrl} 
                      alt="My submission" 
                      className="w-12 h-14 object-cover rounded-xl border border-amber-400/50 shrink-0" 
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-amber-400 uppercase">
                        {activeSubmission.displayTitle || 'VIP GUEST'}
                      </div>
                      <div className="text-sm font-bold text-white truncate">
                        {activeSubmission.firstName}
                      </div>
                      <div className="text-xs text-neutral-300 truncate">
                        "{activeSubmission.message}"
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rate limit status */}
              {cooldownRemaining > 0 && (
                <div className="text-[11px] text-neutral-400 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Next shoutout available in <strong>{cooldownRemaining}s</strong></span>
                </div>
              )}

              {/* Interactive Stage Cheer Buttons */}
              <div className="p-4 rounded-2xl bg-black/60 border border-neutral-800 space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  FIRE REAL-TIME CHEERS TO THE TV:
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <button
                    onClick={() => handleSendReaction('clap')}
                    className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center gap-1 active:scale-125 transition cursor-pointer hover:border-amber-400"
                  >
                    <span className="text-2xl">👏</span>
                    <span className="text-[9px] font-bold text-neutral-300">CLAP</span>
                  </button>
                  <button
                    onClick={() => handleSendReaction('sing')}
                    className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center gap-1 active:scale-125 transition cursor-pointer hover:border-cyan-400"
                  >
                    <span className="text-2xl">🎤</span>
                    <span className="text-[9px] font-bold text-neutral-300">SING</span>
                  </button>
                  <button
                    onClick={() => handleSendReaction('hype')}
                    className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center gap-1 active:scale-125 transition cursor-pointer hover:border-pink-500"
                  >
                    <span className="text-2xl">🔥</span>
                    <span className="text-[9px] font-bold text-neutral-300">HYPE</span>
                  </button>
                  <button
                    onClick={() => handleSendReaction('love')}
                    className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center gap-1 active:scale-125 transition cursor-pointer hover:border-rose-500"
                  >
                    <span className="text-2xl">💖</span>
                    <span className="text-[9px] font-bold text-neutral-300">LOVE</span>
                  </button>
                  <button
                    onClick={() => handleSendReaction('shout')}
                    className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center gap-1 active:scale-125 transition cursor-pointer hover:border-purple-500"
                  >
                    <span className="text-2xl">🗣️</span>
                    <span className="text-[9px] font-bold text-neutral-300">SHOUT</span>
                  </button>
                </div>
              </div>

              {/* Share Table Join QR */}
              <SessionQRCode
                variant="mobile-inline"
                onExpand={() => setShowQrModal(true)}
              />

              {/* Secondary Actions: Report content on screen & Send another */}
              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="text-neutral-400 hover:text-red-400 flex items-center gap-1 cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" /> Report content on screen
                </button>
                <button
                  onClick={() => {
                    setPhotoDataUrl(null);
                    setMessage('');
                    setScreen('WELCOME');
                  }}
                  className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  Send another photo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* QR MODAL */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="w-full max-w-xs bg-neutral-900 border border-amber-400/50 p-6 rounded-3xl space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                JOIN LIVE EXPERIENCE
              </span>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
                aria-label="Close QR modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <SessionQRCode variant="modal" />
          </div>
        </div>
      )}

      {/* CONTENT REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-neutral-900 border border-red-500/50 p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Flag className="w-4 h-4" /> Report Inappropriate Content
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-neutral-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-center text-xs font-bold space-y-1">
                <div>Report Received</div>
                <div className="text-neutral-300 text-[11px] font-normal">Our host has been alerted to review this item immediately. Thank you.</div>
              </div>
            ) : (
              <form onSubmit={handleReportContent} className="space-y-3">
                <p className="text-xs text-neutral-300">
                  If you see inappropriate photos or offensive text displayed on the screen, please let us know:
                </p>
                <textarea
                  rows={3}
                  required
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Describe the issue (e.g. offensive text, photo of private individual, spam)..."
                  className="w-full p-3 rounded-xl bg-black border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:border-red-400 focus:outline-none"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-3 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold cursor-pointer"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <footer className="p-4 text-center text-[10px] font-semibold text-neutral-500 border-t border-neutral-900">
        SingShot ★ London Karaoke Club Soho · All submissions moderated
      </footer>
    </div>
  );
};
