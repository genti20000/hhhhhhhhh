import React, { useState, useEffect } from 'react';
import { useSingShot } from '../../services/store';
import { Submission } from '../../types';
import { 
  Check, 
  X, 
  ArrowUpRight, 
  Star, 
  Edit2, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  RotateCcw, 
  Trash2, 
  Flag, 
  Clock, 
  Keyboard,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { playSoundEffect } from '../../utils/soundEffects';

export const ModeratorDashboard: React.FC = () => {
  const { 
    waitingSubmissions, 
    approvedSubmissions, 
    rejectedSubmissions, 
    featuredId, 
    featuredSubmission,
    reports, 
    lastAction, 
    store 
  } = useSingShot();

  const [activeTab, setActiveTab] = useState<'WAITING' | 'APPROVED' | 'FEATURED' | 'REJECTED' | 'REPORTS'>('WAITING');
  const [blurImagesByDefault, setBlurImagesByDefault] = useState(false);
  const [unblurredIds, setUnblurredIds] = useState<Set<string>>(new Set());
  const [editingSub, setEditingSub] = useState<Submission | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [undoToast, setUndoToast] = useState<string | null>(null);

  // Keyboard Shortcuts: A = Approve top, R = Reject top, F = Feature top, Z = Undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const topWaiting = waitingSubmissions[0];

      if (e.key === 'a' || e.key === 'A') {
        if (topWaiting) {
          e.preventDefault();
          store.approveSubmission(topWaiting.id);
          showToast(`Approved ${topWaiting.firstName}`);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (topWaiting) {
          e.preventDefault();
          store.rejectSubmission(topWaiting.id, 'Moderated by hotkey');
          showToast(`Rejected ${topWaiting.firstName}`);
        }
      } else if (e.key === 'f' || e.key === 'F') {
        if (topWaiting) {
          e.preventDefault();
          store.featureNow(topWaiting.id);
          showToast(`Featured ${topWaiting.firstName} on TV`);
        }
      } else if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        store.undoLastAction();
        playSoundEffect('tap');
        setUndoToast(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [waitingSubmissions, store]);

  const showToast = (msg: string) => {
    setUndoToast(msg);
    setTimeout(() => setUndoToast(null), 3500);
  };

  const handleStartEdit = (sub: Submission) => {
    setEditingSub(sub);
    setEditFirstName(sub.firstName);
    setEditMessage(sub.message);
    setEditTitle(sub.displayTitle);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;
    store.updateSubmissionText(editingSub.id, editFirstName, editMessage, editTitle);
    setEditingSub(null);
  };

  const toggleImageBlur = (id: string) => {
    setUnblurredIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const shouldBlur = (id: string) => {
    return blurImagesByDefault && !unblurredIds.has(id);
  };

  return (
    <div className="w-full min-h-screen bg-[#070709] text-white p-6 font-sans">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-neutral-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-extrabold text-white">
              CONTENT SAFETY & MODERATION
            </h1>
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> AI PRE-CHECK ACTIVE
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time moderation console for Soho live displays. Nothing reaches the TV without staff approval.
          </p>
        </div>

        {/* Global Controls & Hotkeys Info */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Staff Image Blur Toggle */}
          <button
            onClick={() => setBlurImagesByDefault(!blurImagesByDefault)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
              blurImagesByDefault 
                ? 'bg-amber-400 text-black border-amber-300' 
                : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:text-white'
            }`}
            title="Blur images by default until staff hovers or clicks"
          >
            {blurImagesByDefault ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{blurImagesByDefault ? 'Staff Blur: ON' : 'Staff Blur: OFF'}</span>
          </button>

          {/* Keyboard Hotkeys Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400 font-mono">
            <Keyboard className="w-3.5 h-3.5 text-amber-400" />
            <span>[A] Approve</span>
            <span>[R] Reject</span>
            <span>[F] Feature</span>
            <span>[Z] Undo</span>
          </div>

          {/* Undo Action Button */}
          {lastAction && (
            <button
              onClick={() => {
                store.undoLastAction();
                playSoundEffect('tap');
              }}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-amber-400/50 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo {lastAction.type.toLowerCase()}</span>
            </button>
          )}
        </div>
      </header>

      {/* Undo Toast Notification */}
      {undoToast && (
        <div className="my-4 p-3 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-bold flex items-center justify-between animate-fade-in">
          <span>{undoToast}</span>
          <button
            onClick={() => {
              store.undoLastAction();
              playSoundEffect('tap');
              setUndoToast(null);
            }}
            className="underline hover:text-white cursor-pointer ml-4"
          >
            Undo Decision
          </button>
        </div>
      )}

      {/* Queue Navigation Tabs */}
      <div className="flex items-center gap-2 mt-5 border-b border-neutral-800 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('WAITING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition ${
            activeTab === 'WAITING' 
              ? 'bg-amber-400 text-black font-extrabold shadow-md' 
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          <span>WAITING REVIEW</span>
          <span className="px-1.5 py-0.5 rounded-full bg-black/40 text-xs font-black">
            {waitingSubmissions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('APPROVED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition ${
            activeTab === 'APPROVED' 
              ? 'bg-emerald-500 text-black font-extrabold shadow-md' 
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span>LIVE QUEUE</span>
          <span className="px-1.5 py-0.5 rounded-full bg-black/40 text-xs font-black">
            {approvedSubmissions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('FEATURED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition ${
            activeTab === 'FEATURED' 
              ? 'bg-rose-500 text-white font-extrabold shadow-md' 
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
          <span>ON TV NOW</span>
          {featuredSubmission && <span className="text-[10px] font-bold">({featuredSubmission.firstName})</span>}
        </button>

        <button
          onClick={() => setActiveTab('REJECTED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition ${
            activeTab === 'REJECTED' 
              ? 'bg-red-700 text-white font-extrabold shadow-md' 
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          <span>REJECTED</span>
          <span className="px-1.5 py-0.5 rounded-full bg-black/40 text-xs font-black">
            {rejectedSubmissions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition ${
            activeTab === 'REPORTS' 
              ? 'bg-purple-600 text-white font-extrabold shadow-md' 
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <Flag className="w-3.5 h-3.5 text-purple-400" />
          <span>GUEST REPORTS</span>
          <span className="px-1.5 py-0.5 rounded-full bg-black/40 text-xs font-black">
            {reports.length}
          </span>
        </button>
      </div>

      {/* QUEUE CONTENT GRIDS */}
      <div className="mt-6">
        {/* TAB 1: WAITING REVIEW */}
        {activeTab === 'WAITING' && (
          <div>
            {waitingSubmissions.length === 0 ? (
              <div className="p-12 rounded-3xl bg-neutral-900/40 border border-neutral-800 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
                <div className="text-base font-bold text-white">Waiting Queue is Empty</div>
                <div className="text-xs text-neutral-400">All submissions have been reviewed by staff.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {waitingSubmissions.map((sub) => {
                  const blurred = shouldBlur(sub.id);
                  const isBlocked = sub.aiSafetyScore?.status === 'Blocked';
                  const isNeedsReview = sub.aiSafetyScore?.status === 'Needs Review';

                  return (
                    <div 
                      key={sub.id}
                      className="p-4 rounded-2xl bg-neutral-900/90 border border-amber-500/40 hover:border-amber-400 transition space-y-3 shadow-lg"
                    >
                      <div className="flex gap-4">
                        {/* Image with Staff Blur Overlay */}
                        <div 
                          className="relative w-24 h-28 rounded-xl overflow-hidden bg-black shrink-0 border border-neutral-700 cursor-pointer"
                          onClick={() => toggleImageBlur(sub.id)}
                          title="Click to toggle blur"
                        >
                          <img 
                            src={sub.thumbnailUrl || sub.displayMediaUrl} 
                            alt={sub.firstName} 
                            referrerPolicy="no-referrer"
                            className={`w-full h-full object-cover transition duration-300 ${blurred ? 'blur-xl' : ''}`}
                          />
                          {blurred && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-[10px] text-amber-300 font-bold text-center p-1">
                              <EyeOff className="w-4 h-4 mb-1" />
                              <span>Click to Reveal</span>
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-amber-400 uppercase">
                              {sub.occasion.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Just now
                            </span>
                          </div>

                          <div className="text-base font-bold text-white truncate">
                            {sub.firstName} {sub.groupName ? `(${sub.groupName})` : ''}
                          </div>

                          <p className="text-xs text-neutral-300 line-clamp-2">
                            "{sub.message}"
                          </p>

                          {/* AI Pre-check label & Confidence */}
                          {sub.aiSafetyScore && (
                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1.5 ${
                              isBlocked 
                                ? 'bg-red-950/80 text-red-400 border-red-800' 
                                : isNeedsReview 
                                ? 'bg-amber-950/80 text-amber-400 border-amber-800' 
                                : 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                            }`}>
                              <span>AI: {sub.aiSafetyScore.status} ({(sub.aiSafetyScore.confidence * 100).toFixed(0)}%)</span>
                              <span className="text-neutral-400">· {sub.aiSafetyScore.reason}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-neutral-800">
                        <button
                          onClick={() => {
                            store.approveSubmission(sub.id);
                            showToast(`Approved ${sub.firstName}`);
                          }}
                          className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase flex items-center justify-center gap-1 cursor-pointer transition active:scale-95 shadow"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>

                        <button
                          onClick={() => {
                            store.featureNow(sub.id);
                            showToast(`Featured ${sub.firstName} on TV`);
                          }}
                          className="py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase flex items-center justify-center gap-1 cursor-pointer transition active:scale-95 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" /> Feature
                        </button>

                        <button
                          onClick={() => handleStartEdit(sub)}
                          className="py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition"
                          title="Edit text before approving"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>

                        <button
                          onClick={() => {
                            store.rejectSubmission(sub.id, 'Declined by moderator');
                            showToast(`Rejected ${sub.firstName}`);
                          }}
                          className="py-2 rounded-xl bg-neutral-900 hover:bg-red-950 text-neutral-400 hover:text-red-400 font-bold text-xs uppercase flex items-center justify-center gap-1 border border-neutral-800 cursor-pointer transition active:scale-95"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APPROVED LIVE QUEUE */}
        {activeTab === 'APPROVED' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {approvedSubmissions.map((sub) => {
              const isCurrentlyFeatured = sub.id === featuredId;
              const blurred = shouldBlur(sub.id);

              return (
                <div 
                  key={sub.id}
                  className={`p-4 rounded-2xl transition space-y-3 shadow-lg ${
                    isCurrentlyFeatured 
                      ? 'bg-amber-950/40 border-2 border-amber-400 gold-glow' 
                      : 'bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex gap-4">
                    <div 
                      className="relative w-20 h-24 rounded-xl overflow-hidden bg-black shrink-0 border border-neutral-700 cursor-pointer"
                      onClick={() => toggleImageBlur(sub.id)}
                    >
                      <img 
                        src={sub.thumbnailUrl || sub.displayMediaUrl} 
                        alt={sub.firstName} 
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover transition ${blurred ? 'blur-xl' : ''}`}
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        {isCurrentlyFeatured ? (
                          <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                            ON TV NOW
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-400 uppercase">
                            {sub.displayTitle}
                          </span>
                        )}
                        <button
                          onClick={() => handleStartEdit(sub)}
                          className="text-neutral-400 hover:text-white p-1 cursor-pointer"
                          title="Edit text"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-base font-bold text-white truncate">
                        {sub.firstName}
                      </div>

                      <p className="text-xs text-neutral-300 line-clamp-2">
                        "{sub.message}"
                      </p>
                    </div>
                  </div>

                  {/* Actions for Approved */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-neutral-800">
                    <button
                      onClick={() => store.featureNow(sub.id)}
                      className={`col-span-2 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition ${
                        isCurrentlyFeatured 
                          ? 'bg-amber-400 text-black' 
                          : 'bg-neutral-800 hover:bg-amber-400 hover:text-black text-neutral-200'
                      }`}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" /> Feature Now
                    </button>

                    <button
                      onClick={() => store.toggleStar(sub.id)}
                      className={`py-1.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition ${
                        sub.isStarred 
                          ? 'bg-amber-400 text-black border-amber-300' 
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-amber-400'
                      }`}
                      title="Star for awards"
                    >
                      <Star className={`w-3.5 h-3.5 ${sub.isStarred ? 'fill-black' : ''}`} />
                    </button>

                    <button
                      onClick={() => store.rejectSubmission(sub.id, 'Removed by staff')}
                      className="py-1.5 rounded-xl bg-neutral-800 hover:bg-red-950 text-neutral-400 hover:text-red-400 border border-neutral-700 text-xs font-bold flex items-center justify-center cursor-pointer transition"
                      title="Move to rejected"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: FEATURED ITEM */}
        {activeTab === 'FEATURED' && (
          <div className="max-w-xl mx-auto">
            {featuredSubmission ? (
              <div className="p-6 rounded-3xl bg-neutral-900 border-2 border-amber-400 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping inline-block" />
                    LIVE ON BIG-SCREEN TV RIGHT NOW
                  </span>
                  <span className="text-xs font-bold text-amber-400">
                    {featuredSubmission.displayTitle}
                  </span>
                </div>

                <div className="flex gap-6 items-center">
                  <img 
                    src={featuredSubmission.displayMediaUrl} 
                    alt={featuredSubmission.firstName} 
                    referrerPolicy="no-referrer"
                    className="w-36 h-48 rounded-2xl object-cover border-2 border-amber-400 shadow-xl"
                  />
                  <div className="space-y-2">
                    <div className="text-2xl font-display font-black text-white">
                      {featuredSubmission.firstName}
                    </div>
                    <div className="p-3 rounded-xl bg-black/60 border border-neutral-800 text-sm text-neutral-200 italic">
                      "{featuredSubmission.message}"
                    </div>
                    <div className="text-xs text-neutral-400">
                      Celebration: {featuredSubmission.occasion.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-neutral-800">
                  <button
                    onClick={() => store.nextStagePhoto()}
                    className="flex-1 py-2.5 rounded-xl bg-amber-400 text-black font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Rotate to Next Photo</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleStartEdit(featuredSubmission)}
                    className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase cursor-pointer"
                  >
                    Edit Text
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 text-center text-neutral-400">
                No item currently featured on TV.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: REJECTED */}
        {activeTab === 'REJECTED' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {rejectedSubmissions.map((sub) => (
              <div 
                key={sub.id}
                className="p-4 rounded-2xl bg-neutral-900/60 border border-red-950 space-y-3 opacity-80 hover:opacity-100 transition"
              >
                <div className="flex gap-4">
                  <img 
                    src={sub.thumbnailUrl || sub.displayMediaUrl} 
                    alt={sub.firstName} 
                    referrerPolicy="no-referrer"
                    className="w-16 h-20 rounded-xl object-cover grayscale shrink-0 border border-neutral-800"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-neutral-200 truncate">
                      {sub.firstName}
                    </div>
                    <div className="text-xs text-red-400 mt-0.5">
                      Reason: {sub.moderationReason || 'Declined by staff'}
                    </div>
                    <div className="text-xs text-neutral-400 mt-1 line-clamp-1">
                      "{sub.message}"
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-neutral-800">
                  <button
                    onClick={() => {
                      store.approveSubmission(sub.id);
                      showToast(`Restored ${sub.firstName} to queue`);
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-neutral-800 hover:bg-emerald-950 text-neutral-300 hover:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restore to Queue
                  </button>
                  <button
                    onClick={() => {
                      store.deleteSubmission(sub.id);
                      showToast(`Permanently deleted ${sub.firstName}`);
                    }}
                    className="p-2 rounded-xl bg-neutral-900 hover:bg-red-950 text-neutral-500 hover:text-red-400 border border-neutral-800 cursor-pointer"
                    title="Permanent Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: GUEST REPORTS */}
        {activeTab === 'REPORTS' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
              <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm mb-1">
                <Flag className="w-4 h-4" /> GUEST-REPORTED CONTENT AUDIT
              </div>
              <p className="text-xs text-neutral-400">
                Audience members inside London Karaoke Club Soho can report inappropriate content shown on the big screen.
              </p>
            </div>

            {reports.length === 0 ? (
              <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-center text-xs text-neutral-500">
                No user reports flagged tonight. Audience trust score is 100%.
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div 
                    key={report.id}
                    className="p-4 rounded-2xl bg-neutral-900 border border-red-900/60 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-red-400 uppercase">
                        REPORTED CONTENT: {report.submissionId}
                      </div>
                      <div className="text-sm font-semibold text-white">
                        Reason: "{report.reason}"
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        {new Date(report.reportedAt).toLocaleTimeString()} · Status: Under Review
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          store.rejectSubmission(report.submissionId, `Removed due to guest report: ${report.reason}`);
                          showToast('Removed reported item from screen');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-xs uppercase cursor-pointer"
                      >
                        Remove from TV
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Submission Modal */}
      {editingSub && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveEdit}
            className="w-full max-w-md bg-neutral-900 border border-neutral-700 p-6 rounded-3xl space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Edit Broadcast Text</h3>
              <button 
                type="button" 
                onClick={() => setEditingSub(null)} 
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">
                Guest Name
              </label>
              <input
                type="text"
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">
                Display Title (e.g. VIP GUEST / BIRTHDAY ROYALTY)
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">
                Message
              </label>
              <textarea
                rows={2}
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingSub(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-400 text-black font-extrabold text-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
