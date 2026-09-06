import { SingShotEvent, Submission, Venue, DisplayScreen } from '../types';

export const initialVenue: Venue = {
  id: 'venue-lkc-soho',
  name: 'London Karaoke Club',
  brandName: 'London Karaoke Club Soho',
  city: 'London',
  area: 'Soho',
  logoText: 'LKC SOHO',
  primaryColor: '#EAB308', // Warm Gold
  accentColor: '#EC4899', // Hot Pink
  neonPinkColor: '#EC4899',
  neonBlueColor: '#06B6D4',
  electricPurpleColor: '#A855F7',
  activeEventId: 'event-maddies-birthday',
  plan: 'PRO',
  isWhiteLabel: false
};

export const initialEvent: SingShotEvent = {
  id: 'event-maddies-birthday',
  slug: 'maddies-birthday',
  venueId: 'venue-lkc-soho',
  name: "Maddie's 25th Birthday & Soho Saturday",
  occasion: 'BIRTHDAY',
  guestOfHonour: 'Maddie',
  subtitle: 'Soho Birthday Takeover at London Karaoke Club',
  roomName: 'Main Lounge & Stage 1',
  currentHost: 'DJ Leo Soho',
  date: 'Tonight',
  startTime: '20:00',
  endTime: '02:00',
  theme: 'Soho Gold & Electric Neon',
  backgroundMode: 'premium-blur',
  instagramHandle: '@londonkaraokeclub',
  tickerMessages: [
    '⚡ SINGSHOT LIVE AT LONDON KARAOKE CLUB SOHO',
    '📸 SCAN QR WITH YOUR PHONE CAMERA TO BE ON THE BIG SCREEN IN SECONDS',
    '⭐ STAR OF THE NIGHT SELECTED EVERY 30 MINUTES BY HOST & AUDIENCE VOTES',
    '🍸 COMPLIMENTARY TEQUILA SHOTS FOR SELECTED INSTAGRAM POSTS #LKCSOHO',
    '🎤 NOW TAKING SONG REQUESTS AT THE HOST BOOTH OR VIP CONCIERGE'
  ],
  eventFlash: {
    type: 'BIRTHDAY FLASH',
    headline: "CELEBRATING MADDIE'S 25TH BIRTHDAY TONIGHT",
    subline: 'RAISE A GLASS & SING OUT LOUD AT LONDON KARAOKE CLUB SOHO',
    active: false
  },
  activeHostMoment: undefined,
  starOfNight: {
    nextRevealTime: Date.now() + 1000 * 60 * 18,
    status: 'IDLE',
    countdownMinutes: 18
  },
  karaokeNowSinging: {
    singerName: 'Maddie & Sophie',
    songTitle: 'Valerie',
    artist: 'Amy Winehouse',
    songNumber: 'Track #402',
    active: false,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
  },
  settings: {
    autoRotateSeconds: 14, // 12-15 seconds requirement
    featuredDurationSeconds: 18,
    allowReactions: true,
    aiModerationEnabled: true,
    soundEffectsEnabled: true,
    requireConsent: true,
    maxSubmissionsPerGuest: 5,
    blurImagesByDefault: false,
    highContrastMode: false,
    demoModeActive: true,
    qrUrl: 'https://londonkaraokeclub.co.uk/join',
    dataRetentionHours: 24
  },
  metrics: {
    qrScans: 184,
    uniqueGuests: 74,
    totalSubmissions: 38,
    approvedCount: 32,
    rejectedCount: 3,
    totalReactions: 628,
    starRounds: 2,
    avgModerationSeconds: 16
  }
};

export const initialSubmissions: Submission[] = [
  // 1. Birthday Royalty (Approved & Featured)
  {
    id: 'sub-1',
    eventId: 'event-maddies-birthday',
    sessionId: 'session-maddie-01',
    firstName: 'Maddie',
    groupName: 'The Soho Girls',
    message: 'Turning 25 in Soho with the best girls! Tequila shot time! 🍸✨',
    occasion: 'BIRTHDAY',
    mediaType: 'image',
    originalMediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
    displayMediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    moderationStatus: 'APPROVED',
    createdAt: Date.now() - 1000 * 60 * 18,
    approvedAt: Date.now() - 1000 * 60 * 17,
    featuredAt: Date.now() - 1000 * 60 * 2,
    displayTitle: 'BIRTHDAY ROYALTY',
    isStarred: true,
    reactionCount: { clap: 112, sing: 78, hype: 145, love: 180, shout: 64, fire: 94, applause: 72, star: 110, heart: 140, mic: 48 },
    aiSafetyScore: {
      isSafe: true,
      confidence: 0.99,
      status: 'Safe',
      reason: 'Face detected, clear lighting, no safety flags'
    }
  },
  // 2. Hen Party (Approved)
  {
    id: 'sub-2',
    eventId: 'event-maddies-birthday',
    sessionId: 'session-sophie-02',
    firstName: 'Sophie & The Bridesmaids',
    groupName: 'Team Bride London',
    message: 'Bride squad warming up for Mr. Brightside! 👰‍♀️🎤 Soho takeover!',
    occasion: 'HEN_PARTY',
    mediaType: 'image',
    originalMediaUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    displayMediaUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
    moderationStatus: 'APPROVED',
    createdAt: Date.now() - 1000 * 60 * 14,
    approvedAt: Date.now() - 1000 * 60 * 13,
    featuredAt: Date.now() - 1000 * 60 * 6,
    displayTitle: 'HEN PARTY HERO',
    isStarred: true,
    reactionCount: { clap: 85, sing: 92, hype: 110, love: 135, shout: 58, fire: 65, applause: 52, star: 48, heart: 98, mic: 40 },
    aiSafetyScore: {
      isSafe: true,
      confidence: 0.98,
      status: 'Safe',
      reason: 'Verified safe group selfie'
    }
  },
  // 3. VIP / Soho Saturday (Approved)
  {
    id: 'sub-3',
    eventId: 'event-maddies-birthday',
    sessionId: 'session-alex-03',
    firstName: 'Alex & Jordan',
    groupName: 'Booth 4 VIPs',
    message: 'Soho Saturday crew ready to hit those high notes! Let’s go! 🔥',
    occasion: 'VIP',
    mediaType: 'image',
    originalMediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
    displayMediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    moderationStatus: 'APPROVED',
    createdAt: Date.now() - 1000 * 60 * 11,
    approvedAt: Date.now() - 1000 * 60 * 10,
    featuredAt: Date.now() - 1000 * 60 * 9,
    displayTitle: 'VIP GUEST',
    isStarred: false,
    reactionCount: { clap: 64, sing: 45, hype: 88, love: 62, shout: 39, fire: 50, applause: 41, star: 35, heart: 55, mic: 22 },
    aiSafetyScore: {
      isSafe: true,
      confidence: 0.99,
      status: 'Safe',
      reason: 'No policy violations detected'
    }
  },
  // 4. Karaoke Legend (Approved)
  {
    id: 'sub-4',
    eventId: 'event-maddies-birthday',
    sessionId: 'session-marcus-04',
    firstName: 'Marcus',
    groupName: 'Karaoke Masters',
    message: 'Bohemian Rhapsody incoming! London Karaoke Club legend since 2022! 👑',
    occasion: 'KARAOKE_LEGEND',
    mediaType: 'image',
    originalMediaUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
    displayMediaUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    moderationStatus: 'APPROVED',
    createdAt: Date.now() - 1000 * 60 * 8,
    approvedAt: Date.now() - 1000 * 60 * 7,
    featuredAt: Date.now() - 1000 * 60 * 3,
    displayTitle: 'KARAOKE LEGEND',
    isStarred: true,
    reactionCount: { clap: 92, sing: 120, hype: 95, love: 48, shout: 84, fire: 75, applause: 88, star: 60, heart: 42, mic: 105 },
    aiSafetyScore: {
      isSafe: true,
      confidence: 0.97,
      status: 'Safe',
      reason: 'Clear portrait, audio track matched'
    }
  },
  // 5. Date Night (Approved)
  {
    id: 'sub-5',
    eventId: 'event-maddies-birthday',
    sessionId: 'session-chloe-james-05',
    firstName: 'Chloe & James',
    groupName: 'Date Night in W1',
    message: 'Soho cocktails, high notes & duet goals! Valerie is our song! 🥂✨',
    occasion: 'DATE_NIGHT',
    mediaType: 'image',
    originalMediaUrl: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=900&q=80',
    displayMediaUrl: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=900&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=300&q=80',
    moderationStatus: 'APPROVED',
    createdAt: Date.now() - 1000 * 60 * 5,
    approvedAt: Date.now() - 1000 * 60 * 4,
    featuredAt: Date.now() - 1000 * 60 * 1,
    displayTitle: 'DATE NIGHT VIP',
    isStarred: false,
    reactionCount: { clap: 54, sing: 68, hype: 42, love: 112, shout: 24, fire: 38, applause: 45, star: 30, heart: 95, mic: 26 },
    aiSafetyScore: {
      isSafe: true,
      confidence: 0.99,
      status: 'Safe',
      reason: 'High confidence aesthetic photo'
    }
  },
  // 6. Corporate / Office Hire (Approved)
  {
    id: 'sub-6',
    eventId: 'event-maddies-birthday',
    sessionId: 'session-fintech-06',
    firstName: 'FinTech Friday Crew',
    groupName: 'Square Mile Squad',
    message: 'Q3 celebration in Soho! Out of office is ON and mics are LIVE! 💼🔥',
    occasion: 'CORPORATE',
    mediaType: 'image',
    originalMediaUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
    displayMediaUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&q=80',
    moderationStatus: 'APPROVED',
    createdAt: Date.now() - 1000 * 60 * 3,
    approvedAt: Date.now() - 1000 * 60 * 2,
    displayTitle: 'OFFICE HEROES',
    isStarred: false,
    reactionCount: { clap: 76, sing: 52, hype: 94, love: 38, shout: 62, fire: 58, applause: 65, star: 32, heart: 30, mic: 44 },
    aiSafetyScore: {
      isSafe: true,
      confidence: 0.98,
      status: 'Safe',
      reason: 'Corporate social group photo'
    }
  },
  // 7. WAITING: Needs Review (Low Light / Ambiguous)
  {
    id: 'sub-7',
    eventId: 'event-maddies-birthday',
    sessionId: 'session-liam-07',
    firstName: 'Liam & The Lads',
    groupName: 'Stag Do Squad',
    message: 'Groom on the mic! Don’t Stop Believin’ up next! 🎩🎤',
    occasion: 'STAG_DO',
    mediaType: 'image',
    originalMediaUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80',
    displayMediaUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    moderationStatus: 'WAITING',
    createdAt: Date.now() - 1000 * 50,
    displayTitle: 'GROOM SQUAD',
    isStarred: false,
    reactionCount: { clap: 0, sing: 0, hype: 0, love: 0, shout: 0 },
    aiSafetyScore: {
      isSafe: true,
      confidence: 0.82,
      status: 'Needs Review',
      reason: 'Low lighting in background; manual host check suggested',
      flags: ['low_contrast', 'crowded_background']
    }
  },
  // 8. WAITING: Safe (Fresh guest submission)
  {
    id: 'sub-8',
    eventId: 'event-maddies-birthday',
    sessionId: 'session-priya-08',
    firstName: 'Priya',
    groupName: 'Main Character Club',
    message: 'Sweet Caroline is calling my name! Ready for Soho! 🌟',
    occasion: 'MAIN_CHARACTER',
    mediaType: 'image',
    originalMediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
    displayMediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    moderationStatus: 'WAITING',
    createdAt: Date.now() - 1000 * 20,
    displayTitle: 'MAIN CHARACTER',
    isStarred: false,
    reactionCount: { clap: 0, sing: 0, hype: 0, love: 0, shout: 0 },
    aiSafetyScore: {
      isSafe: true,
      confidence: 0.99,
      status: 'Safe',
      reason: 'Verified safe portrait selfie'
    }
  },
  // 9. REJECTED: Blocked by Safety AI
  {
    id: 'sub-9',
    eventId: 'event-maddies-birthday',
    sessionId: 'session-blocked-09',
    firstName: 'Anonymous User',
    groupName: 'Unknown',
    message: 'Test spam duplicate upload #999',
    occasion: 'VIP',
    mediaType: 'image',
    originalMediaUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=900&q=80',
    displayMediaUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=900&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
    moderationStatus: 'REJECTED',
    moderationReason: 'Automated policy block: Duplicate submission rate exceeded',
    createdAt: Date.now() - 1000 * 60 * 25,
    displayTitle: 'BLOCKED CONTENT',
    isStarred: false,
    reactionCount: { clap: 0, sing: 0, hype: 0, love: 0, shout: 0 },
    aiSafetyScore: {
      isSafe: false,
      confidence: 0.96,
      status: 'Blocked',
      reason: 'Rate limit violation / duplicate photo detected',
      flags: ['duplicate_hash', 'rapid_upload']
    }
  }
];

export const initialDisplays: DisplayScreen[] = [
  {
    id: 'disp-main-stage',
    name: 'Main Stage 4K Video Wall',
    venueId: 'venue-lkc-soho',
    location: 'Main Stage Center (16:9)',
    status: 'ONLINE',
    lastHeartbeat: Date.now(),
    resolution: '1920x1080 (16:9 Full HD)',
    currentScene: 'SPOTLIGHT'
  },
  {
    id: 'disp-soho-bar',
    name: 'Cocktail Bar Screen',
    venueId: 'venue-lkc-soho',
    location: 'Ground Floor Lounge Bar',
    status: 'ONLINE',
    lastHeartbeat: Date.now(),
    resolution: '1920x1080 (16:9 Full HD)',
    currentScene: 'SPOTLIGHT'
  },
  {
    id: 'disp-vip-booth',
    name: 'VIP Soho Booth TV',
    venueId: 'venue-lkc-soho',
    location: 'Private Room #1',
    status: 'ONLINE',
    lastHeartbeat: Date.now(),
    resolution: '1920x1080 (16:9 Full HD)',
    currentScene: 'SPOTLIGHT'
  }
];
