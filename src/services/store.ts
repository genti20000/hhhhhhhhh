import { useEffect, useState } from 'react';
import { 
  SingShotEvent, 
  Submission, 
  Venue, 
  DisplayScreen, 
  DisplayScene, 
  CrowdReactionEvent, 
  OccasionType, 
  HostMomentType, 
  ReactionType,
  ContentReport 
} from '../types';
import { initialEvent, initialSubmissions, initialVenue, initialDisplays } from './mockData';
import { playSoundEffect } from '../utils/soundEffects';
import { applyThemeToDOM, generateClubInitials } from '../utils/theme';

const STORAGE_KEYS = {
  VENUE: 'singshot_venue_v2',
  EVENT: 'singshot_event_v2',
  SUBMISSIONS: 'singshot_submissions_v2',
  DISPLAYS: 'singshot_displays_v2',
  FEATURED_ID: 'singshot_featured_id_v2',
  ACTIVE_SCENE: 'singshot_active_scene_v2',
  REPORTS: 'singshot_reports_v2'
};

// Cross-tab Broadcast Channel
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('singshot_realtime_sync_v2');
  }
} catch (e) {
  console.warn('BroadcastChannel not supported', e);
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

// In-memory singletons initialized from localStorage or mockData
let currentVenue: Venue = loadFromStorage(STORAGE_KEYS.VENUE, initialVenue);
applyThemeToDOM(currentVenue.primaryColor);
let currentEvent: SingShotEvent = loadFromStorage(STORAGE_KEYS.EVENT, initialEvent);
let currentSubmissions: Submission[] = loadFromStorage(STORAGE_KEYS.SUBMISSIONS, initialSubmissions);
let currentDisplays: DisplayScreen[] = loadFromStorage(STORAGE_KEYS.DISPLAYS, initialDisplays);
let currentFeaturedId: string = loadFromStorage(STORAGE_KEYS.FEATURED_ID, initialSubmissions[0]?.id || '');
let currentScene: DisplayScene = loadFromStorage(STORAGE_KEYS.ACTIVE_SCENE, 'SPOTLIGHT');
let currentReports: ContentReport[] = loadFromStorage(STORAGE_KEYS.REPORTS, []);

// Undo state tracking
interface UndoAction {
  type: 'APPROVE' | 'REJECT' | 'FEATURE';
  submissionId: string;
  submissionName: string;
  prevStatus: 'WAITING' | 'APPROVED' | 'REJECTED';
  prevFeaturedId: string;
  timestamp: number;
}
let lastModerationAction: UndoAction | null = null;

const listeners = new Set<() => void>();
const reactionListeners = new Set<(reaction: CrowdReactionEvent) => void>();
const newSubmissionListeners = new Set<(submission: Submission) => void>();
const toastListeners = new Set<(msg: string, undoable?: boolean) => void>();

function notifyAll() {
  listeners.forEach(cb => cb());
}

function broadcastAction(type: string, payload?: unknown) {
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type, payload });
  }
}

// Listen for broadcast messages from other tabs/windows
if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    const { type, payload } = event.data || {};
    if (type === 'STATE_UPDATE') {
      currentVenue = loadFromStorage(STORAGE_KEYS.VENUE, currentVenue);
      currentEvent = loadFromStorage(STORAGE_KEYS.EVENT, currentEvent);
      currentSubmissions = loadFromStorage(STORAGE_KEYS.SUBMISSIONS, currentSubmissions);
      currentDisplays = loadFromStorage(STORAGE_KEYS.DISPLAYS, currentDisplays);
      currentFeaturedId = loadFromStorage(STORAGE_KEYS.FEATURED_ID, currentFeaturedId);
      currentScene = loadFromStorage(STORAGE_KEYS.ACTIVE_SCENE, currentScene);
      currentReports = loadFromStorage(STORAGE_KEYS.REPORTS, currentReports);
      applyThemeToDOM(currentVenue.primaryColor);
      notifyAll();
    } else if (type === 'NEW_SUBMISSION' && payload) {
      newSubmissionListeners.forEach(cb => cb(payload as Submission));
    } else if (type === 'REACTION' && payload) {
      reactionListeners.forEach(cb => cb(payload as CrowdReactionEvent));
    } else if (type === 'SFX' && typeof payload === 'string') {
      playSoundEffect(payload as Parameters<typeof playSoundEffect>[0]);
    }
  };
}

export const store = {
  getVenue(): Venue {
    return currentVenue;
  },

  getEvent(): SingShotEvent {
    return currentEvent;
  },

  getSubmissions(): Submission[] {
    return currentSubmissions;
  },

  getDisplays(): DisplayScreen[] {
    return currentDisplays;
  },

  getFeaturedId(): string {
    return currentFeaturedId;
  },

  getFeaturedSubmission(): Submission | undefined {
    return currentSubmissions.find(s => s.id === currentFeaturedId) || 
           currentSubmissions.find(s => s.moderationStatus === 'APPROVED');
  },

  getActiveScene(): DisplayScene {
    return currentScene;
  },

  getReports(): ContentReport[] {
    return currentReports;
  },

  getLastModerationAction(): UndoAction | null {
    return lastModerationAction;
  },

  // Actions
  /**
   * Guest adds submission. It strictly enters 'WAITING' moderation status!
   * Nothing reaches the live TV until staff approves it.
   */
  addSubmission(newSub: Omit<Submission, 'id' | 'createdAt' | 'reactionCount' | 'moderationStatus' | 'displayTitle' | 'isStarred'> & { displayTitle?: string }): Submission {
    const titlesByOccasion: Record<OccasionType, string> = {
      BIRTHDAY: 'BIRTHDAY ROYALTY',
      VIP: 'VIP GUEST',
      HEN_PARTY: 'HEN PARTY HERO',
      STAG_DO: 'GROOM SQUAD',
      SOHO_SATURDAY: 'SOHO ICON',
      KARAOKE_LEGEND: 'KARAOKE LEGEND',
      DATE_NIGHT: 'DATE NIGHT VIP',
      CORPORATE: 'OFFICE HEROES',
      OFFICE_PARTY: 'OFFICE SUPERSTAR',
      AFTER_PARTY: 'AFTER PARTY STAR',
      WEDDING: 'WEDDING VIP',
      CHRISTMAS: 'CHRISTMAS PARTY STAR',
      MAIN_CHARACTER: 'MAIN CHARACTER'
    };

    // Automated Mock AI Moderation Pre-check
    const lowerMessage = (newSub.message || '').toLowerCase();
    let aiStatus: 'Safe' | 'Needs Review' | 'Blocked' = 'Safe';
    let aiReason = 'Verified safe guest selfie; no policy violations';
    let confidence = 0.98;

    const blockedWords = ['spam', 'abuse', 'hate', 'xxx', 'violation'];
    const reviewWords = ['shots', 'drunk', 'crazy', 'wild'];

    if (blockedWords.some(w => lowerMessage.includes(w))) {
      aiStatus = 'Blocked';
      aiReason = 'Flagged: prohibited content or abusive language';
      confidence = 0.96;
    } else if (reviewWords.some(w => lowerMessage.includes(w))) {
      aiStatus = 'Needs Review';
      aiReason = 'Needs staff verification for venue tone';
      confidence = 0.78;
    }

    const submission: Submission = {
      ...newSub,
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      // Must be WAITING until approved by host / moderation staff
      moderationStatus: 'WAITING',
      displayTitle: newSub.displayTitle || titlesByOccasion[newSub.occasion] || 'VIP GUEST',
      isStarred: false,
      reactionCount: { clap: 0, sing: 0, hype: 0, love: 0, shout: 0, fire: 0, applause: 0, star: 0, heart: 0, mic: 0 },
      aiSafetyScore: {
        isSafe: aiStatus !== 'Blocked',
        confidence,
        status: aiStatus,
        reason: aiReason
      }
    };

    currentSubmissions = [submission, ...currentSubmissions];
    currentEvent.metrics.totalSubmissions += 1;

    saveToStorage(STORAGE_KEYS.SUBMISSIONS, currentSubmissions);
    saveToStorage(STORAGE_KEYS.EVENT, currentEvent);

    broadcastAction('STATE_UPDATE');
    broadcastAction('NEW_SUBMISSION', submission);
    broadcastAction('SFX', 'tap');
    newSubmissionListeners.forEach(cb => cb(submission));
    playSoundEffect('tap');
    notifyAll();
    return submission;
  },

  nextStagePhoto() {
    const approved = currentSubmissions.filter(s => s.moderationStatus === 'APPROVED');
    if (approved.length <= 1) return;
    const currentIndex = approved.findIndex(s => s.id === currentFeaturedId);
    const nextIndex = (currentIndex + 1) % approved.length;
    const nextSub = approved[nextIndex];
    if (nextSub) {
      this.featureNow(nextSub.id, false);
    }
  },

  prevStagePhoto() {
    const approved = currentSubmissions.filter(s => s.moderationStatus === 'APPROVED');
    if (approved.length <= 1) return;
    const currentIndex = approved.findIndex(s => s.id === currentFeaturedId);
    const prevIndex = (currentIndex - 1 + approved.length) % approved.length;
    const prevSub = approved[prevIndex];
    if (prevSub) {
      this.featureNow(prevSub.id, false);
    }
  },

  triggerSound(type: Parameters<typeof playSoundEffect>[0]) {
    playSoundEffect(type);
    broadcastAction('SFX', type);
  },

  approveSubmission(id: string) {
    const target = currentSubmissions.find(s => s.id === id);
    if (!target) return;

    lastModerationAction = {
      type: 'APPROVE',
      submissionId: id,
      submissionName: target.firstName,
      prevStatus: target.moderationStatus,
      prevFeaturedId: currentFeaturedId,
      timestamp: Date.now()
    };

    currentSubmissions = currentSubmissions.map(sub => {
      if (sub.id === id) {
        return {
          ...sub,
          moderationStatus: 'APPROVED',
          approvedAt: Date.now()
        };
      }
      return sub;
    });

    currentEvent.metrics.approvedCount += 1;
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, currentSubmissions);
    saveToStorage(STORAGE_KEYS.EVENT, currentEvent);
    broadcastAction('STATE_UPDATE');
    broadcastAction('SFX', 'tap');
    playSoundEffect('tap');
    notifyAll();
  },

  rejectSubmission(id: string, reason?: string) {
    const target = currentSubmissions.find(s => s.id === id);
    if (!target) return;

    lastModerationAction = {
      type: 'REJECT',
      submissionId: id,
      submissionName: target.firstName,
      prevStatus: target.moderationStatus,
      prevFeaturedId: currentFeaturedId,
      timestamp: Date.now()
    };

    currentSubmissions = currentSubmissions.map(sub => {
      if (sub.id === id) {
        return {
          ...sub,
          moderationStatus: 'REJECTED',
          moderationReason: reason || 'Not approved by host'
        };
      }
      return sub;
    });

    currentEvent.metrics.rejectedCount += 1;
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, currentSubmissions);
    saveToStorage(STORAGE_KEYS.EVENT, currentEvent);
    broadcastAction('STATE_UPDATE');
    notifyAll();
  },

  featureNow(id: string, recordUndo = true) {
    const target = currentSubmissions.find(s => s.id === id);
    if (!target) return;

    if (recordUndo) {
      lastModerationAction = {
        type: 'FEATURE',
        submissionId: id,
        submissionName: target.firstName,
        prevStatus: target.moderationStatus,
        prevFeaturedId: currentFeaturedId,
        timestamp: Date.now()
      };
    }

    currentSubmissions = currentSubmissions.map(sub => {
      if (sub.id === id) {
        return { ...sub, moderationStatus: 'APPROVED', featuredAt: Date.now() };
      }
      return sub;
    });

    currentFeaturedId = id;
    currentScene = 'SPOTLIGHT';

    saveToStorage(STORAGE_KEYS.SUBMISSIONS, currentSubmissions);
    saveToStorage(STORAGE_KEYS.FEATURED_ID, currentFeaturedId);
    saveToStorage(STORAGE_KEYS.ACTIVE_SCENE, currentScene);

    broadcastAction('STATE_UPDATE');
    broadcastAction('SFX', 'flash');
    playSoundEffect('flash');
    notifyAll();
  },

  undoLastAction() {
    if (!lastModerationAction) return;
    const { submissionId, prevStatus, prevFeaturedId } = lastModerationAction;

    currentSubmissions = currentSubmissions.map(sub => {
      if (sub.id === submissionId) {
        return {
          ...sub,
          moderationStatus: prevStatus
        };
      }
      return sub;
    });

    if (prevFeaturedId && currentFeaturedId === submissionId) {
      currentFeaturedId = prevFeaturedId;
    }

    lastModerationAction = null;

    saveToStorage(STORAGE_KEYS.SUBMISSIONS, currentSubmissions);
    saveToStorage(STORAGE_KEYS.FEATURED_ID, currentFeaturedId);
    broadcastAction('STATE_UPDATE');
    notifyAll();
  },

  restoreSubmission(id: string) {
    currentSubmissions = currentSubmissions.map(sub => {
      if (sub.id === id) {
        return {
          ...sub,
          moderationStatus: 'WAITING',
          moderationReason: undefined
        };
      }
      return sub;
    });
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, currentSubmissions);
    broadcastAction('STATE_UPDATE');
    notifyAll();
  },

  deleteSubmission(id: string) {
    currentSubmissions = currentSubmissions.filter(sub => sub.id !== id);
    if (currentFeaturedId === id) {
      const remainingApproved = currentSubmissions.filter(s => s.moderationStatus === 'APPROVED');
      currentFeaturedId = remainingApproved[0]?.id || '';
    }
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, currentSubmissions);
    saveToStorage(STORAGE_KEYS.FEATURED_ID, currentFeaturedId);
    broadcastAction('STATE_UPDATE');
    notifyAll();
  },

  toggleStar(id: string) {
    currentSubmissions = currentSubmissions.map(sub => {
      if (sub.id === id) {
        return { ...sub, isStarred: !sub.isStarred };
      }
      return sub;
    });
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, currentSubmissions);
    broadcastAction('STATE_UPDATE');
    broadcastAction('SFX', 'goldChime');
    playSoundEffect('goldChime');
    notifyAll();
  },

  updateSubmissionText(id: string, newFirstName: string, newMessage: string, newTitle?: string) {
    currentSubmissions = currentSubmissions.map(sub => {
      if (sub.id === id) {
        return {
          ...sub,
          firstName: newFirstName.trim(),
          message: newMessage.trim(),
          displayTitle: newTitle ? newTitle.trim() : sub.displayTitle
        };
      }
      return sub;
    });
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, currentSubmissions);
    broadcastAction('STATE_UPDATE');
    notifyAll();
  },

  reportSubmission(submissionId: string, reason: string) {
    const report: ContentReport = {
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      submissionId,
      reason,
      reportedAt: Date.now(),
      status: 'PENDING'
    };

    currentReports = [report, ...currentReports];
    currentSubmissions = currentSubmissions.map(sub => {
      if (sub.id === submissionId) {
        return { ...sub, reported: true };
      }
      return sub;
    });

    saveToStorage(STORAGE_KEYS.REPORTS, currentReports);
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, currentSubmissions);
    broadcastAction('STATE_UPDATE');
    notifyAll();
  },

  addReaction(type: ReactionType, submissionId?: string, senderName?: string) {
    const targetId = submissionId || currentFeaturedId;
    
    currentSubmissions = currentSubmissions.map(sub => {
      if (sub.id === targetId) {
        const counts = sub.reactionCount || { clap: 0, sing: 0, hype: 0, love: 0, shout: 0 };
        return {
          ...sub,
          reactionCount: {
            ...counts,
            [type]: (counts[type] || 0) + 1
          }
        };
      }
      return sub;
    });

    currentEvent.metrics.totalReactions += 1;
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, currentSubmissions);
    saveToStorage(STORAGE_KEYS.EVENT, currentEvent);

    const reactionEvent: CrowdReactionEvent = {
      id: `rx-${Date.now()}-${Math.random()}`,
      type,
      submissionId: targetId,
      timestamp: Date.now(),
      senderName
    };

    reactionListeners.forEach(cb => cb(reactionEvent));
    broadcastAction('REACTION', reactionEvent);

    if (type === 'clap' || type === 'applause') {
      playSoundEffect('applause');
    } else if (type === 'sing' || type === 'mic') {
      playSoundEffect('cheer');
    } else if (type === 'hype' || type === 'fire') {
      playSoundEffect('airhorn');
    } else if (type === 'love' || type === 'heart') {
      playSoundEffect('goldChime');
    } else if (type === 'shout') {
      playSoundEffect('cheer');
    } else {
      playSoundEffect('tap');
    }

    notifyAll();
  },

  // Host Triggered Full-Screen Moments
  triggerHostMoment(type: HostMomentType, headline?: string, subline?: string) {
    const defaultData: Record<HostMomentType, { headline: string; subline: string; sound: Parameters<typeof playSoundEffect>[0] }> = {
      'Make Some Noise': {
        headline: 'MAKE SOME NOISE SOHO!',
        subline: 'RAISE YOUR GLASSES & SCREAM FOR THE STAGE',
        sound: 'airhorn'
      },
      'Birthday Shot': {
        headline: 'BIRTHDAY SHOT TIME! 🍸',
        subline: 'TEQUILA ON DECK FOR OUR BIRTHDAY STARS',
        sound: 'fanfare'
      },
      'Last Song': {
        headline: 'LAST SONG OF THE NIGHT! 👑',
        subline: 'EVERYBODY ON THEIR FEET — MAKE IT COUNT!',
        sound: 'cheer'
      },
      '30 Minutes Left': {
        headline: '30 MINUTES REMAINING ⚡',
        subline: 'FINAL CALL FOR BIG SCREEN SHOUTOUTS & TRACKS',
        sound: 'goldChime'
      },
      'One More Song': {
        headline: 'ONE MORE SONG! ONE MORE SONG!',
        subline: 'THE SOHO CROWD HAS SPOKEN — ENCORE TIME!',
        sound: 'applause'
      },
      'Cheers Soho': {
        headline: 'CHEERS TO LONDON KARAOKE CLUB! 🥂',
        subline: 'THANK YOU FOR SINGING YOUR HEARTS OUT',
        sound: 'goldChime'
      },
      'Star of the Night': {
        headline: 'STAR OF THE NIGHT REVEAL ⭐',
        subline: 'HONOURING SOHO’S GREATEST VOCALIST TONIGHT',
        sound: 'fanfare'
      }
    };

    const info = defaultData[type] || { headline: type, subline: 'LONDON KARAOKE CLUB SOHO', sound: 'fanfare' };

    currentEvent.activeHostMoment = {
      type,
      headline: headline || info.headline,
      subline: subline || info.subline,
      soundEffect: info.sound,
      active: true,
      timestamp: Date.now()
    };

    saveToStorage(STORAGE_KEYS.EVENT, currentEvent);
    broadcastAction('STATE_UPDATE');
    broadcastAction('SFX', info.sound);
    playSoundEffect(info.sound);
    notifyAll();
  },

  clearHostMoment() {
    currentEvent.activeHostMoment = undefined;
    saveToStorage(STORAGE_KEYS.EVENT, currentEvent);
    broadcastAction('STATE_UPDATE');
    notifyAll();
  },

  triggerStarOfNight(targetSubmissionId?: string) {
    let winner = currentSubmissions.find(s => s.id === targetSubmissionId);
    if (!winner) {
      const approved = currentSubmissions.filter(s => s.moderationStatus === 'APPROVED');
      const starred = approved.filter(s => s.isStarred);
      winner = starred[0] || approved[0];
    }

    if (!winner) return;

    currentEvent.starOfNight = {
      ...currentEvent.starOfNight,
      status: 'REVEALING',
      currentWinner: winner
    };
    currentEvent.metrics.starRounds += 1;
    currentScene = 'STAR_OF_NIGHT';

    saveToStorage(STORAGE_KEYS.EVENT, currentEvent);
    saveToStorage(STORAGE_KEYS.ACTIVE_SCENE, currentScene);
    broadcastAction('STATE_UPDATE');
    broadcastAction('SFX', 'fanfare');
    playSoundEffect('fanfare');
    notifyAll();
  },

  resetStarOfNight() {
    currentEvent.starOfNight = {
      ...currentEvent.starOfNight,
      status: 'IDLE',
      currentWinner: undefined,
      nextRevealTime: Date.now() + 1000 * 60 * 25
    };
    currentScene = 'SPOTLIGHT';
    saveToStorage(STORAGE_KEYS.EVENT, currentEvent);
    saveToStorage(STORAGE_KEYS.ACTIVE_SCENE, currentScene);
    broadcastAction('STATE_UPDATE');
    notifyAll();
  },

  triggerQuickAnnouncement(title: string, subtitle?: string) {
    currentEvent.quickAnnouncement = {
      title,
      subtitle: subtitle || 'LONDON KARAOKE CLUB SOHO',
      active: true,
      expiresAt: Date.now() + 1000 * 12
    };
    currentScene = 'QUICK_ANNOUNCEMENT';
    saveToStorage(STORAGE_KEYS.EVENT, currentEvent);
    saveToStorage(STORAGE_KEYS.ACTIVE_SCENE, currentScene);
    broadcastAction('STATE_UPDATE');
    broadcastAction('SFX', 'flash');
    playSoundEffect('flash');
    notifyAll();
  },

  setKaraokeNowSinging(active: boolean, singerName?: string, songTitle?: string, artist?: string) {
    currentEvent.karaokeNowSinging = {
      singerName: singerName || 'Maddie & Sophie',
      songTitle: songTitle || 'Valerie',
      artist: artist || 'Amy Winehouse',
      songNumber: 'Track #402',
      active,
      photoUrl: currentEvent.karaokeNowSinging?.photoUrl
    };
    currentScene = active ? 'NOW_SINGING' : 'SPOTLIGHT';
    saveToStorage(STORAGE_KEYS.EVENT, currentEvent);
    saveToStorage(STORAGE_KEYS.ACTIVE_SCENE, currentScene);
    broadcastAction('STATE_UPDATE');
    broadcastAction('SFX', 'flash');
    playSoundEffect('flash');
    notifyAll();
  },

  setScene(scene: DisplayScene) {
    currentScene = scene;
    saveToStorage(STORAGE_KEYS.ACTIVE_SCENE, currentScene);
    broadcastAction('STATE_UPDATE');
    notifyAll();
  },

  setBackgroundMode(mode: SingShotEvent['backgroundMode']) {
    currentEvent.backgroundMode = mode;
    saveToStorage(STORAGE_KEYS.EVENT, currentEvent);
    broadcastAction('STATE_UPDATE');
    notifyAll();
  },

  updateEvent(updated: Partial<SingShotEvent>) {
    currentEvent = { ...currentEvent, ...updated };
    saveToStorage(STORAGE_KEYS.EVENT, currentEvent);
    broadcastAction('STATE_UPDATE');
    notifyAll();
  },

  updateVenue(updated: Partial<Venue>) {
    const logoText = updated.logoText !== undefined 
      ? updated.logoText 
      : (updated.name ? generateClubInitials(updated.name) : currentVenue.logoText);

    currentVenue = { ...currentVenue, ...updated, logoText };
    
    if (currentVenue.primaryColor) {
      applyThemeToDOM(currentVenue.primaryColor);
    }
    
    saveToStorage(STORAGE_KEYS.VENUE, currentVenue);
    broadcastAction('STATE_UPDATE');
    notifyAll();
  },

  resetToDemo() {
    currentVenue = { ...initialVenue };
    applyThemeToDOM(currentVenue.primaryColor);
    currentEvent = { ...initialEvent };
    currentSubmissions = [...initialSubmissions];
    currentDisplays = [...initialDisplays];
    currentFeaturedId = initialSubmissions[0]?.id || '';
    currentScene = 'SPOTLIGHT';
    currentReports = [];
    lastModerationAction = null;

    saveToStorage(STORAGE_KEYS.VENUE, currentVenue);
    saveToStorage(STORAGE_KEYS.EVENT, currentEvent);
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, currentSubmissions);
    saveToStorage(STORAGE_KEYS.DISPLAYS, currentDisplays);
    saveToStorage(STORAGE_KEYS.FEATURED_ID, currentFeaturedId);
    saveToStorage(STORAGE_KEYS.ACTIVE_SCENE, currentScene);
    saveToStorage(STORAGE_KEYS.REPORTS, currentReports);

    broadcastAction('STATE_UPDATE');
    notifyAll();
  },

  incrementQrScan() {
    currentEvent.metrics.qrScans += 1;
    saveToStorage(STORAGE_KEYS.EVENT, currentEvent);
    broadcastAction('STATE_UPDATE');
    notifyAll();
  },

  /**
   * Demo mode generator: creates a fresh simulated submission from a live guest
   */
  generateDemoGuest() {
    const names = [
      { name: 'Natasha & Liv', group: 'Soho Saturday Crew', occ: 'SOHO_SATURDAY' as OccasionType, msg: 'Living for this Soho vibe! Don’t Stop Believin’ next! 🔥', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80' },
      { name: 'Kieran', group: 'Birthday Boy VIP', occ: 'BIRTHDAY' as OccasionType, msg: 'Celebrating big in London! Another round for Table 6! 🍸', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80' },
      { name: 'Zara & Maya', group: 'Karaoke Queens', occ: 'MAIN_CHARACTER' as OccasionType, msg: 'We came, we sang, we conquered London Karaoke Club! ✨👑', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80' },
      { name: 'Dev Team Soho', group: 'Tech Friday', occ: 'CORPORATE' as OccasionType, msg: 'Deploy on Friday, sing Queen on Friday night! 🎤💻', img: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=900&q=80' }
    ];

    const pick = names[Math.floor(Math.random() * names.length)];
    const sub: Submission = {
      id: `sub-demo-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      eventId: currentEvent.id,
      sessionId: 'demo-session',
      firstName: pick.name,
      groupName: pick.group,
      message: pick.msg,
      occasion: pick.occ,
      mediaType: 'image',
      originalMediaUrl: pick.img,
      displayMediaUrl: pick.img,
      thumbnailUrl: pick.img,
      moderationStatus: 'WAITING',
      createdAt: Date.now(),
      displayTitle: pick.occ.replace('_', ' '),
      isStarred: false,
      reactionCount: { clap: 0, sing: 0, hype: 0, love: 0, shout: 0 },
      aiSafetyScore: {
        isSafe: true,
        confidence: 0.99,
        status: 'Safe',
        reason: 'Simulated demo guest submission (Pre-screened Safe)'
      }
    };

    currentSubmissions = [sub, ...currentSubmissions];
    currentEvent.metrics.totalSubmissions += 1;

    saveToStorage(STORAGE_KEYS.SUBMISSIONS, currentSubmissions);
    saveToStorage(STORAGE_KEYS.EVENT, currentEvent);

    broadcastAction('STATE_UPDATE');
    broadcastAction('NEW_SUBMISSION', sub);
    broadcastAction('SFX', 'tap');
    newSubmissionListeners.forEach(cb => cb(sub));
    playSoundEffect('tap');
    notifyAll();
    return sub;
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  onReaction(listener: (reaction: CrowdReactionEvent) => void) {
    reactionListeners.add(listener);
    return () => {
      reactionListeners.delete(listener);
    };
  },

  onNewSubmission(listener: (sub: Submission) => void) {
    newSubmissionListeners.add(listener);
    return () => {
      newSubmissionListeners.delete(listener);
    };
  }
};

// React Hook to consume live store state
export function useSingShot() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setTick(t => t + 1);
    });
    return unsub;
  }, []);

  const allSubmissions = store.getSubmissions();

  return {
    venue: store.getVenue(),
    event: store.getEvent(),
    submissions: allSubmissions,
    approvedSubmissions: allSubmissions.filter(s => s.moderationStatus === 'APPROVED'),
    waitingSubmissions: allSubmissions.filter(s => s.moderationStatus === 'WAITING'),
    rejectedSubmissions: allSubmissions.filter(s => s.moderationStatus === 'REJECTED'),
    displays: store.getDisplays(),
    featuredId: store.getFeaturedId(),
    featuredSubmission: store.getFeaturedSubmission(),
    activeScene: store.getActiveScene(),
    reports: store.getReports(),
    lastAction: store.getLastModerationAction(),
    store
  };
}
