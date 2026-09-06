export type OccasionType = 
  | 'BIRTHDAY'
  | 'VIP'
  | 'HEN_PARTY'
  | 'STAG_DO'
  | 'SOHO_SATURDAY'
  | 'KARAOKE_LEGEND'
  | 'DATE_NIGHT'
  | 'CORPORATE'
  | 'OFFICE_PARTY'
  | 'AFTER_PARTY'
  | 'WEDDING'
  | 'CHRISTMAS'
  | 'MAIN_CHARACTER';

export type ModerationStatus = 'WAITING' | 'APPROVED' | 'REJECTED';

export type AiSafetyStatus = 'Safe' | 'Needs Review' | 'Blocked';

export type HostMomentType = 
  | 'Make Some Noise'
  | 'Birthday Shot'
  | 'Last Song'
  | '30 Minutes Left'
  | 'One More Song'
  | 'Cheers Soho'
  | 'Star of the Night';

export type TransitionType = 
  | 'spotlight' 
  | 'gold-flash' 
  | 'curtain' 
  | 'shutter' 
  | 'broadcast-cut' 
  | 'soft-zoom' 
  | 'award-reveal';

export type BackgroundMode = 
  | 'original' 
  | 'premium-blur' 
  | 'london-karaoke-club' 
  | 'event-theme' 
  | 'minimal-broadcast'
  | 'no-flash-club';

export type DisplayScene = 
  | 'SPOTLIGHT'
  | 'GALLERY'
  | 'KARAOKE'
  | 'BIRTHDAY'
  | 'HEN_PARTY'
  | 'CORPORATE'
  | 'CLOSING_TIME'
  | 'STAR_OF_NIGHT'
  | 'NOW_SINGING'
  | 'QUICK_ANNOUNCEMENT'
  | 'STANDBY';

export type ReactionType = 'clap' | 'sing' | 'hype' | 'love' | 'shout' | 'fire' | 'applause' | 'star' | 'heart' | 'mic';

export interface ReactionCounts {
  clap: number;
  sing: number;
  hype: number;
  love: number;
  shout: number;
  fire?: number;
  applause?: number;
  star?: number;
  heart?: number;
  mic?: number;
}

export interface ContentReport {
  id: string;
  submissionId: string;
  reason: string;
  reportedAt: number;
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED';
}

export interface Submission {
  id: string;
  eventId: string;
  sessionId: string;
  firstName: string;
  groupName?: string;
  message: string;
  occasion: OccasionType;
  mediaType: 'image' | 'video';
  originalMediaUrl: string;
  displayMediaUrl: string;
  thumbnailUrl: string;
  moderationStatus: ModerationStatus;
  moderationReason?: string;
  createdAt: number;
  approvedAt?: number;
  featuredAt?: number;
  displayTitle: string;
  isStarred: boolean;
  reactionCount: ReactionCounts;
  aiSafetyScore?: {
    isSafe: boolean;
    confidence: number;
    status: AiSafetyStatus;
    reason?: string;
    flags?: string[];
  };
  deviceFingerprint?: string;
  frameStyle?: string;
  reported?: boolean;
}

export interface SingShotEvent {
  id: string;
  slug: string;
  venueId: string;
  name: string;
  occasion: OccasionType;
  guestOfHonour?: string;
  subtitle?: string;
  roomName?: string;
  currentHost?: string;
  date: string;
  startTime: string;
  endTime: string;
  theme: string;
  backgroundMode: BackgroundMode;
  instagramHandle: string;
  tickerMessages: string[];
  eventFlash?: {
    type: string;
    headline: string;
    subline: string;
    active: boolean;
    expiresAt?: number;
  };
  activeHostMoment?: {
    type: HostMomentType;
    headline: string;
    subline: string;
    soundEffect?: string;
    active: boolean;
    timestamp: number;
  };
  quickAnnouncement?: {
    title: string;
    subtitle?: string;
    active: boolean;
    expiresAt?: number;
  };
  starOfNight: {
    nextRevealTime: number;
    status: 'IDLE' | 'COUNTDOWN' | 'REVEALING' | 'CELEBRATING';
    currentWinner?: Submission;
    countdownMinutes: number;
  };
  karaokeNowSinging?: {
    singerName: string;
    songTitle: string;
    artist: string;
    songNumber?: string;
    active: boolean;
    photoUrl?: string;
  };
  settings: {
    autoRotateSeconds: number;
    featuredDurationSeconds: number;
    allowReactions: boolean;
    aiModerationEnabled: boolean;
    soundEffectsEnabled: boolean;
    requireConsent: boolean;
    maxSubmissionsPerGuest: number;
    blurImagesByDefault: boolean;
    highContrastMode: boolean;
    demoModeActive: boolean;
    qrUrl: string;
    dataRetentionHours: number;
  };
  metrics: {
    qrScans: number;
    uniqueGuests: number;
    totalSubmissions: number;
    approvedCount: number;
    rejectedCount: number;
    totalReactions: number;
    starRounds: number;
    avgModerationSeconds: number;
  };
}

export interface Venue {
  id: string;
  name: string;
  brandName: string;
  city: string;
  area: string;
  logoText: string;
  primaryColor: string;
  accentColor: string;
  neonPinkColor?: string;
  neonBlueColor?: string;
  electricPurpleColor?: string;
  activeEventId: string;
  plan: 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
  isWhiteLabel: boolean;
}

export interface DisplayScreen {
  id: string;
  name: string;
  venueId: string;
  location: string;
  status: 'ONLINE' | 'OFFLINE';
  lastHeartbeat: number;
  resolution: string;
  currentScene: DisplayScene;
}

export interface CrowdReactionEvent {
  id: string;
  type: ReactionType;
  submissionId?: string;
  timestamp: number;
  senderName?: string;
}
