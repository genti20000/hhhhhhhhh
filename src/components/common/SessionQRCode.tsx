import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Sparkles, Copy, Check, Share2, Maximize2, QrCode, ExternalLink } from 'lucide-react';
import { useSingShot } from '../../services/store';

export type SessionQRVariant = 'tv-badge' | 'tv-card' | 'mobile-inline' | 'modal';

interface SessionQRCodeProps {
  variant?: SessionQRVariant;
  jumbo?: boolean;
  onToggleJumbo?: () => void;
  onExpand?: () => void;
  focusId?: string;
  className?: string;
}

/**
 * Dynamically builds the live session join URL based on the current browser location,
 * active URL query parameters (such as ?session= or ?room=), and active SingShot event.
 */
export function useCurrentSessionJoinUrl(): {
  joinUrl: string;
  displayPath: string;
  sessionCode: string;
} {
  const { event, venue } = useSingShot();
  const [locationHref, setLocationHref] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.href : ''
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncLocation = () => setLocationHref(window.location.href);
    window.addEventListener('popstate', syncLocation);
    window.addEventListener('hashchange', syncLocation);
    return () => {
      window.removeEventListener('popstate', syncLocation);
      window.removeEventListener('hashchange', syncLocation);
    };
  }, []);

  return useMemo(() => {
    if (typeof window === 'undefined') {
      const fallback = `https://londonkaraokeclub.co.uk/?mode=guest&event=${event.slug}`;
      return {
        joinUrl: fallback,
        displayPath: `/?mode=guest&event=${event.slug}`,
        sessionCode: event.slug.toUpperCase()
      };
    }

    try {
      const current = new URL(locationHref || window.location.href);
      const params = new URLSearchParams(current.search);

      // Remove TV-only flags if present so guests land cleanly in mobile mode
      params.delete('obs');
      params.set('mode', 'guest');
      params.set('event', event.slug || event.id);

      // Preserve any explicit session/room param from the current URL, or derive from event/venue
      const existingSession = params.get('session') || params.get('room');
      const sessionSlug =
        existingSession ||
        (event.roomName
          ? event.roomName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
          : venue.area?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'live');

      params.set('session', sessionSlug);

      const joinUrl = `${current.origin}${current.pathname}?${params.toString()}`;
      const displayPath = `${current.host}?mode=guest&event=${event.slug}`;

      return {
        joinUrl,
        displayPath,
        sessionCode: sessionSlug.toUpperCase()
      };
    } catch {
      const fallbackUrl = `${window.location.origin}/?mode=guest&event=${event.slug}`;
      return {
        joinUrl: fallbackUrl,
        displayPath: `${window.location.host}/?mode=guest&event=${event.slug}`,
        sessionCode: event.slug.toUpperCase()
      };
    }
  }, [locationHref, event.slug, event.id, event.roomName, venue.area]);
}

export const SessionQRCode: React.FC<SessionQRCodeProps> = ({
  variant = 'tv-badge',
  jumbo = false,
  onToggleJumbo,
  onExpand,
  focusId,
  className = ''
}) => {
  const { event, venue, store } = useSingShot();
  const { joinUrl, displayPath, sessionCode } = useCurrentSessionJoinUrl();
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback ignored if blocked in iframe
    }
  };

  const handleShare = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${venue.name} — SingShot Live`,
          text: `Join ${event.name} on the big screen!`,
          url: joinUrl
        });
        return;
      } catch {
        // Fallback to copy if user cancelled or share unavailable
      }
    }
    handleCopy();
  };

  // VARIANT 1: TV HEADER BADGE (10-foot Leanback focusable)
  if (variant === 'tv-badge') {
    return (
      <div
        id={focusId || 'tv-qr-box'}
        data-tv-focus="true"
        role="button"
        tabIndex={0}
        onClick={onToggleJumbo}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleJumbo?.();
          }
        }}
        className={`px-4 py-2.5 rounded-2xl bg-neutral-900/90 backdrop-blur-md flex items-center gap-3.5 border border-amber-400/50 shadow-[0_0_20px_rgba(234,179,8,0.25)] shrink-0 transition-all active:scale-95 cursor-pointer ${className}`}
        title={`Scan or click to toggle QR Jumbo size (${joinUrl})`}
      >
        <div className="p-1.5 bg-white rounded-xl shadow-inner shrink-0">
          <QRCodeSVG
            value={joinUrl}
            size={jumbo ? 104 : 66}
            level="M"
            bgColor="#ffffff"
            fgColor="#000000"
            marginSize={1}
            title={`Join ${event.name}`}
          />
        </div>
        <div className="flex flex-col text-left min-w-0">
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> SCAN TO JOIN
          </span>
          <span className="text-xs font-extrabold text-white leading-tight">
            Snap selfie on phone
          </span>
          <span className="text-[10px] font-mono font-bold text-neutral-400 tracking-tight mt-0.5 truncate max-w-[155px]">
            {event.slug} · LIVE
          </span>
        </div>
      </div>
    );
  }

  // VARIANT 2: LARGE TV STANDBY STAGE CARD
  if (variant === 'tv-card') {
    return (
      <div
        className={`inline-flex flex-col sm:flex-row items-center gap-6 p-5 rounded-3xl bg-black/75 border-2 border-amber-400/60 shadow-[0_0_40px_rgba(234,179,8,0.28)] backdrop-blur-md ${className}`}
      >
        <div className="p-3 bg-white rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.2)] shrink-0">
          <QRCodeSVG
            value={joinUrl}
            size={156}
            level="M"
            bgColor="#ffffff"
            fgColor="#000000"
            marginSize={1}
            title={`Scan to join ${event.name}`}
          />
        </div>
        <div className="text-left space-y-2 max-w-xs">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-widest">
            <QrCode className="w-3 h-3" /> INSTANT SESSION QR
          </div>
          <div className="text-xl font-display font-black text-white leading-tight uppercase">
            Point Your Camera To Join
          </div>
          <p className="text-xs text-neutral-300 font-medium leading-relaxed">
            Links directly to <span className="text-amber-300 font-bold">{event.name}</span>. No app download needed.
          </p>
          <div className="px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-400 truncate">
            {displayPath}
          </div>
        </div>
      </div>
    );
  }

  // VARIANT 3: COMPACT INLINE CARD FOR GUEST MOBILE VIEW
  if (variant === 'mobile-inline') {
    return (
      <div
        className={`p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center gap-3 text-left shadow-lg ${className}`}
      >
        <button
          type="button"
          onClick={onExpand}
          className="p-1.5 bg-white rounded-xl shadow-inner shrink-0 hover:scale-105 transition cursor-pointer"
          title="Enlarge session QR code"
        >
          <QRCodeSVG
            value={joinUrl}
            size={60}
            level="M"
            bgColor="#ffffff"
            fgColor="#000000"
            marginSize={1}
            title="Session Join QR"
          />
        </button>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1">
              <QrCode className="w-3 h-3" /> TABLE JOIN QR
            </span>
            <span className="text-[9px] font-mono font-bold text-neutral-400 px-1.5 py-0.5 rounded bg-black/60 border border-neutral-800 truncate max-w-[110px]">
              {sessionCode}
            </span>
          </div>
          <div className="text-xs font-bold text-white truncate">
            Invite friends at your table
          </div>
          <div className="text-[10px] font-mono text-neutral-400 truncate">
            {joinUrl}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition cursor-pointer"
            title="Copy session join link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          {onExpand && (
            <button
              type="button"
              onClick={onExpand}
              className="p-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/40 transition cursor-pointer"
              title="Expand QR code"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // VARIANT 4: FULL INTERACTIVE MODAL BODY
  return (
    <div className={`space-y-4 text-center ${className}`}>
      <div className="p-3.5 bg-white rounded-2xl inline-block shadow-[0_0_30px_rgba(234,179,8,0.2)]">
        <QRCodeSVG
          value={joinUrl}
          size={184}
          level="M"
          bgColor="#ffffff"
          fgColor="#000000"
          marginSize={2}
          title={`Join ${event.name}`}
        />
      </div>

      <div className="space-y-1">
        <div className="text-xs font-black uppercase tracking-wider text-amber-400">
          {event.name}
        </div>
        <p className="text-xs text-neutral-300">
          Point any phone camera to join <strong>{venue.name}</strong> instantly — no app install required.
        </p>
      </div>

      {/* Live Session URL Readout */}
      <div className="p-2.5 rounded-xl bg-black/70 border border-neutral-800 flex items-center justify-between gap-2 text-left">
        <span className="text-[11px] font-mono text-neutral-300 truncate flex-1">
          {joinUrl}
        </span>
        <a
          href={joinUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => store.incrementQrScan()}
          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 shrink-0 transition"
          title="Open join URL in new tab"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-amber-400" /> Copy Link
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
        >
          <Share2 className="w-3.5 h-3.5" /> Share URL
        </button>
      </div>
    </div>
  );
};
