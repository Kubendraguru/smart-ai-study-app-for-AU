import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Plus, Megaphone, Newspaper, ChevronDown, ChevronUp, X, CheckCircle } from 'lucide-react';
import { useApp } from './AppContext';
import { fetchAnnouncements, postAnnouncement, type Announcement } from '../../lib/announcements';

const CATEGORY_COLORS: Record<string, string> = {
  Results: 'from-emerald-500 to-teal-600',
  Exams: 'from-red-500 to-rose-600',
  Scholarships: 'from-amber-500 to-orange-500',
  Events: 'from-blue-500 to-cyan-600',
  Academic: 'from-violet-500 to-purple-600',
  Placement: 'from-pink-500 to-rose-600',
  General: 'from-slate-500 to-gray-600',
};

const CATEGORIES = ['General', 'Results', 'Exams', 'Scholarships', 'Events', 'Academic', 'Placement'];

export function NewsPage() {
  const { user } = useApp();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postForm, setPostForm] = useState({ title: '', description: '', category: 'General' });
  const [posting, setPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handlePost = async () => {
    if (!postForm.title || !postForm.description) return;
    setPosting(true);
    try {
      await postAnnouncement(postForm);
      setPostSuccess(true);
      await load();
      setTimeout(() => {
        setShowPostModal(false);
        setPostSuccess(false);
        setPostForm({ title: '', description: '', category: 'General' });
      }, 1500);
    } catch (err) {
      console.error('Failed to post announcement:', err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="pb-28 min-h-screen" style={{ background: 'linear-gradient(135deg, #08081A 0%, #0D0820 100%)' }}>
      <div className="absolute top-20 left-0 w-48 h-48 bg-violet-700/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Header */}
      <div className="px-5 pt-14 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-xl font-bold flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-violet-400" />
              College News
            </h1>
            <p className="text-white/40 text-xs mt-0.5">{announcements.length} announcements</p>
          </div>
          {user?.role === 'teacher' && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPostModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-lg shadow-violet-500/30"
            >
              <Plus className="w-3.5 h-3.5" />
              Post
            </motion.button>
          )}
        </div>
      </div>

      {/* News List */}
      <div className="px-5 space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/8 rounded-[20px] p-4 animate-pulse space-y-3">
              <div className="h-3 bg-white/10 rounded w-1/3" />
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-2 bg-white/5 rounded w-full" />
            </div>
          ))
        ) : announcements.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 mx-auto text-white/10 mb-3" />
            <p className="text-white/30 text-sm">No announcements yet</p>
            {user?.role === 'teacher' && (
              <button onClick={() => setShowPostModal(true)} className="mt-4 text-violet-400 text-sm underline">
                Post the first announcement
              </button>
            )}
          </div>
        ) : (
          announcements.map((item, i) => {
            const gradient = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.General;
            const isExpanded = expandedId === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 border border-white/8 rounded-[20px] p-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-[14px] bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <Megaphone className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${gradient} text-white`}>
                        {item.category}
                      </span>
                      <span className="text-white/25 text-[10px]">
                        {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-white font-semibold text-sm mt-1.5 leading-tight">{item.title}</p>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-white/50 text-xs mt-2 leading-relaxed"
                        >
                          {item.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                    {!isExpanded && (
                      <p className="text-white/30 text-xs mt-1 truncate">{item.description}</p>
                    )}
                  </div>
                  <div className="text-white/30 mt-1 flex-shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Post Announcement Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center">
          <motion.div
            initial={{ y: 400 }}
            animate={{ y: 0 }}
            className="w-full max-w-[430px] bg-[#12121E] border border-white/10 rounded-t-[32px] p-6"
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">Post Announcement</h3>
              <button onClick={() => setShowPostModal(false)}><X className="w-5 h-5 text-white/40" /></button>
            </div>

            <div className="space-y-4">
              <input
                placeholder="Announcement Title *"
                value={postForm.title}
                onChange={e => setPostForm(f => ({ ...f, title: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-[16px] px-4 py-3.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-violet-500/50"
              />
              <textarea
                placeholder="Description *"
                value={postForm.description}
                onChange={e => setPostForm(f => ({ ...f, description: e.target.value }))}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-[16px] px-4 py-3.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-violet-500/50 resize-none"
              />
              <select
                value={postForm.category}
                onChange={e => setPostForm(f => ({ ...f, category: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-[16px] px-4 py-3.5 text-white text-sm focus:outline-none appearance-none"
              >
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#1a1a2e]">{c}</option>)}
              </select>

              {postSuccess && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-4 py-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <p className="text-emerald-400 text-xs">Announcement posted!</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setShowPostModal(false)} className="flex-1 bg-white/5 border border-white/10 rounded-[16px] py-3.5 text-white/60 text-sm font-medium">
                  Cancel
                </button>
                <button
                  onClick={handlePost}
                  disabled={posting}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-[16px] py-3.5 text-white text-sm font-semibold shadow-lg disabled:opacity-60"
                >
                  {posting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
