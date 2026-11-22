import { useEffect, useState, useCallback, useRef } from 'react';
import { playSoundEffect } from '../utils/soundEffects';

export interface TVRemoteOptions {
  enabled?: boolean;
  onMenuToggle?: () => void;
  onNextPhoto?: () => void;
  onPrevPhoto?: () => void;
  onPlayPauseToggle?: () => void;
  onBackPress?: () => void;
  onHostMomentQuick?: (number: number) => void;
  onToggleOverscan?: () => void;
}

export function useGoogleTVRemote({
  enabled = true,
  onMenuToggle,
  onNextPhoto,
  onPrevPhoto,
  onPlayPauseToggle,
  onBackPress,
  onHostMomentQuick,
}: TVRemoteOptions = {}) {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [lastRemoteKey, setLastRemoteKey] = useState<string | null>(null);
  const keyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper to visually log recent remote key pressed for TV feedback
  const registerKeyActivity = useCallback((keyName: string) => {
    setLastRemoteKey(keyName);
    if (keyTimeoutRef.current) clearTimeout(keyTimeoutRef.current);
    keyTimeoutRef.current = setTimeout(() => setLastRemoteKey(null), 1800);
  }, []);

  // Spatial navigation between elements marked with [data-tv-focus="true"]
  const moveFocus = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (typeof document === 'undefined') return;

    const focusable = Array.from(
      document.querySelectorAll<HTMLElement>('[data-tv-focus="true"]')
    ).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none';
    });

    if (focusable.length === 0) return;

    const currentEl = focusedId ? document.getElementById(focusedId) : null;

    if (!currentEl || !focusable.includes(currentEl)) {
      // Focus first item
      const first = focusable[0];
      first.focus();
      setFocusedId(first.id || null);
      first.classList.add('tv-focused');
      playSoundEffect('tap');
      return;
    }

    const currentRect = currentEl.getBoundingClientRect();
    const currentCenter = {
      x: currentRect.left + currentRect.width / 2,
      y: currentRect.top + currentRect.height / 2,
    };

    let bestCandidate: HTMLElement | null = null;
    let bestScore = Infinity;

    for (const candidate of focusable) {
      if (candidate === currentEl) continue;
      const cRect = candidate.getBoundingClientRect();
      const cCenter = {
        x: cRect.left + cRect.width / 2,
        y: cRect.top + cRect.height / 2,
      };

      const dx = cCenter.x - currentCenter.x;
      const dy = cCenter.y - currentCenter.y;

      let isDirectionMatch = false;
      let primaryDiff = 0;
      let secondaryDiff = 0;

      switch (direction) {
        case 'up':
          if (dy < -5) {
            isDirectionMatch = true;
            primaryDiff = Math.abs(dy);
            secondaryDiff = Math.abs(dx);
          }
          break;
        case 'down':
          if (dy > 5) {
            isDirectionMatch = true;
            primaryDiff = Math.abs(dy);
            secondaryDiff = Math.abs(dx);
          }
          break;
        case 'left':
          if (dx < -5) {
            isDirectionMatch = true;
            primaryDiff = Math.abs(dx);
            secondaryDiff = Math.abs(dy);
          }
          break;
        case 'right':
          if (dx > 5) {
            isDirectionMatch = true;
            primaryDiff = Math.abs(dx);
            secondaryDiff = Math.abs(dy);
          }
          break;
      }

      if (isDirectionMatch) {
        // Weighted distance score: favor primary direction
        const score = primaryDiff + secondaryDiff * 1.8;
        if (score < bestScore) {
          bestScore = score;
          bestCandidate = candidate;
        }
      }
    }

    if (bestCandidate) {
      // Remove class from previous
      currentEl.classList.remove('tv-focused');
      bestCandidate.classList.add('tv-focused');
      bestCandidate.focus();
      setFocusedId(bestCandidate.id || null);
      playSoundEffect('tap');
    }
  }, [focusedId]);

  // Activate currently focused element
  const activateFocused = useCallback(() => {
    if (!focusedId) {
      // If nothing focused, trigger play/pause or default action
      onPlayPauseToggle?.();
      return;
    }
    const el = document.getElementById(focusedId);
    if (el) {
      playSoundEffect('tap');
      el.click();
    }
  }, [focusedId, onPlayPauseToggle]);

  // Handle hardware keyboard / Android TV remote events
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    // Ignore if user is currently typing in an input or textarea
    const activeTag = (document.activeElement?.tagName || '').toLowerCase();
    if (activeTag === 'input' || activeTag === 'textarea') return;

    const key = e.key;

    switch (key) {
      // D-Pad Up
      case 'ArrowUp':
      case 'Up':
        e.preventDefault();
        registerKeyActivity('D-PAD UP');
        moveFocus('up');
        break;

      // D-Pad Down
      case 'ArrowDown':
      case 'Down':
        e.preventDefault();
        registerKeyActivity('D-PAD DOWN');
        moveFocus('down');
        break;

      // D-Pad Left
      case 'ArrowLeft':
      case 'Left':
        e.preventDefault();
        registerKeyActivity('D-PAD LEFT');
        moveFocus('left');
        break;

      // D-Pad Right
      case 'ArrowRight':
      case 'Right':
        e.preventDefault();
        registerKeyActivity('D-PAD RIGHT');
        moveFocus('right');
        break;

      // Center D-Pad Select / OK
      case 'Enter':
      case 'Select':
      case 'NumpadEnter':
        e.preventDefault();
        registerKeyActivity('D-PAD OK');
        activateFocused();
        break;

      // Android TV Back Button
      case 'Escape':
      case 'Backspace':
      case 'BrowserBack':
      case 'GoBack':
        e.preventDefault();
        registerKeyActivity('BACK');
        if (onBackPress) {
          onBackPress();
        } else {
          // Blur focus
          if (focusedId) {
            document.getElementById(focusedId)?.classList.remove('tv-focused');
            setFocusedId(null);
          }
        }
        break;

      // Android TV Menu Key / OSD toggle
      case 'm':
      case 'M':
      case 'ContextMenu':
      case 'Menu':
        e.preventDefault();
        registerKeyActivity('TV MENU');
        onMenuToggle?.();
        break;

      // Play / Pause slideshow
      case ' ':
      case 'MediaPlayPause':
      case 'Play':
      case 'Pause':
        e.preventDefault();
        registerKeyActivity('PLAY / PAUSE');
        onPlayPauseToggle?.();
        break;

      // Next / Fast Forward
      case 'MediaTrackNext':
      case 'MediaFastForward':
      case 'n':
      case 'N':
        e.preventDefault();
        registerKeyActivity('NEXT PHOTO');
        onNextPhoto?.();
        break;

      // Previous / Rewind
      case 'MediaTrackPrevious':
      case 'MediaRewind':
      case 'p':
      case 'P':
        e.preventDefault();
        registerKeyActivity('PREV PHOTO');
        onPrevPhoto?.();
        break;

      // Number keys 1-6 for quick Soho Host Moments
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
        e.preventDefault();
        registerKeyActivity(`MOMENT #${key}`);
        onHostMomentQuick?.(parseInt(key, 10));
        break;

      default:
        break;
    }
  }, [
    enabled, 
    moveFocus, 
    activateFocused, 
    registerKeyActivity, 
    onBackPress, 
    onMenuToggle, 
    onPlayPauseToggle, 
    onNextPhoto, 
    onPrevPhoto, 
    onHostMomentQuick, 
    focusedId
  ]);

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  // Synthetic remote trigger function for the virtual on-screen remote controller
  const triggerRemoteButton = useCallback((button: string) => {
    registerKeyActivity(button);
    switch (button) {
      case 'UP':
        moveFocus('up');
        break;
      case 'DOWN':
        moveFocus('down');
        break;
      case 'LEFT':
        moveFocus('left');
        break;
      case 'RIGHT':
        moveFocus('right');
        break;
      case 'OK':
        activateFocused();
        break;
      case 'BACK':
        if (onBackPress) {
          onBackPress();
        } else if (focusedId) {
          document.getElementById(focusedId)?.classList.remove('tv-focused');
          setFocusedId(null);
        }
        break;
      case 'MENU':
        onMenuToggle?.();
        break;
      case 'PLAY_PAUSE':
        onPlayPauseToggle?.();
        break;
      case 'NEXT':
        onNextPhoto?.();
        break;
      case 'PREV':
        onPrevPhoto?.();
        break;
      default:
        break;
    }
  }, [registerKeyActivity, moveFocus, activateFocused, onBackPress, focusedId, onMenuToggle, onPlayPauseToggle, onNextPhoto, onPrevPhoto]);

  return {
    focusedId,
    lastRemoteKey,
    triggerRemoteButton,
  };
}
