import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Plus, Check, Trash2, Droplets, Clock, BookOpen, GraduationCap, ClipboardList, X } from 'lucide-react';
import { useApp } from './AppContext';
import { fetchReminders, addReminder as addReminderToDb, updateReminder, deleteReminder as deleteReminderFromDb, type Reminder } from '../../lib/reminders';

const TYPE_CONFIG = {
  study: { color: 'from-violet-500 to-purple-600', bg: 'bg-violet-500/10 border-violet-500/20', icon: BookOpen, emoji: '📖' },
  exam: { color: 'from-red-500 to-rose-600', bg: 'bg-red-500/10 border-red-500/20', icon: GraduationCap, emoji: '📝' },
  hydration: { color: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-500/10 border-cyan-500/20', icon: Droplets, emoji: '💧' },
  assignment: { color: 'from-amber-500 to-orange-600', bg: 'bg-amber-500/10 border-amber-500/20', icon: ClipboardList, emoji: '📋' },
};

function HydrationTimer() {
  const [seconds, setSeconds] = useState(45 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) {
      setRunning(false);
      setSeconds(45 * 60);
      return;
    }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, seconds]);

  const progress = ((45 * 60 - seconds) / (45 * 60)) * 100;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="bg-white/5 border border-cyan-500/20 rounded-[24px] p-5 mb-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
          <Droplets className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">Hydration Reminder</h3>
          <p className="text-white/40 text-xs">Drink water every 45 minutes</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
            <circle
              cx="28" cy="28" r="24"
              fill="none"
              stroke="url(#grad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 24}`}
              strokeDashoffset={`${2 * Math.PI * 24 * (1 - progress / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-[11px]">{mins}:{secs.toString().padStart(2, '0')}</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-white/60 text-xs mb-3">{running ? 'Timer running...' : 'Start to track hydration'}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setRunning(r => !r)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold ${
                running
                  ? 'bg-white/8 border border-white/10 text-white/60'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
              }`}
            >
              {running ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={() => { setRunning(false); setSeconds(45 * 60); }}
              className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center"
            >
              <span className="text-white/40 text-sm">↺</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RemindersPage() {
  const { user, session } = useApp();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loadingRem, setLoadingRem] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newReminder, setNewReminder] = useState({ title: '', time: '', type: 'study' as Reminder['type'] });

  useEffect(() => {
    if (!session?.user.id) return;
    fetchReminders(session.user.id)
      .then(setReminders)
      .catch(console.error)
      .finally(() => setLoadingRem(false));
  }, [session]);

  const toggleComplete = async (id: number) => {
    const rem = reminders.find(r => r.id === id);
    if (!rem) return;
    await updateReminder(id, { completed: !rem.completed });
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const deleteReminder = async (id: number) => {
    await deleteReminderFromDb(id);
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const addReminder = async () => {
    if (!newReminder.title || !session?.user.id) return;
    const r = await addReminderToDb({
      user_id: session.user.id,
      title: newReminder.title,
      time: newReminder.time || '08:00',
      type: newReminder.type,
      completed: false,
    });
    setReminders(prev => [r, ...prev]);
    setNewReminder({ title: '', time: '', type: 'study' });
    setShowAdd(false);
  };

  const pending = reminders.filter(r => !r.completed);
  const completed = reminders.filter(r => r.completed);

  return (
    <div className="pb-28 min-h-screen" style={{ background: 'linear-gradient(135deg, #08081A 0%, #0D0820 100%)' }}>
      {/* BG glow */}
      <div className="absolute top-20 right-0 w-40 h-40 bg-cyan-700/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Header */}
      <div className="px-5 pt-14 pb-5 flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-bold">Reminders</h1>
          <p className="text-white/40 text-xs mt-0.5">{pending.length} pending · {completed.length} done</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-lg"
        >
          <Plus className="w-4 h-4" /> Add
        </motion.button>
      </div>

      {/* Stats */}
      <div className="px-5 grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Pending', value: pending.length, emoji: '⏰', color: 'border-amber-500/20 bg-amber-500/5' },
          { label: 'Completed', value: completed.length, emoji: '✅', color: 'border-emerald-500/20 bg-emerald-500/5' },
          { label: 'Total', value: reminders.length, emoji: '📋', color: 'border-violet-500/20 bg-violet-500/5' },
        ].map(s => (
          <div key={s.label} className={`border rounded-[18px] p-3 flex flex-col items-center gap-1 ${s.color}`}>
            <span className="text-xl">{s.emoji}</span>
            <span className="text-white font-bold text-base">{s.value}</span>
            <span className="text-white/40 text-[10px]">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="px-5">
        {/* Hydration Timer */}
        <HydrationTimer />

        {/* Pending Reminders */}
        {pending.length > 0 && (
          <div className="mb-5">
            <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
              <Bell className="w-3.5 h-3.5" /> Upcoming
            </h3>
            <div className="space-y-3">
              <AnimatePresence>
                {pending.map((reminder, i) => {
                  const cfg = TYPE_CONFIG[reminder.type];
                  return (
                    <motion.div
                      key={reminder.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`flex items-center gap-3 border rounded-[20px] px-4 py-3.5 ${cfg.bg}`}
                    >
                      <button
                        onClick={() => toggleComplete(reminder.id!)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          reminder.completed
                            ? `bg-gradient-to-r ${cfg.color} border-transparent`
                            : 'border-white/20'
                        }`}
                      >
                        {reminder.completed && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <div className={`w-9 h-9 rounded-[12px] bg-gradient-to-br ${cfg.color} flex items-center justify-center text-base shadow-md flex-shrink-0`}>
                        {cfg.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{reminder.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3 text-white/30" />
                          <span className="text-white/30 text-[11px]">{reminder.time}</span>
                        </div>
                      </div>
                      <button onClick={() => deleteReminder(reminder.id!)} className="w-7 h-7 rounded-xl bg-white/5 flex items-center justify-center">
                        <Trash2 className="w-3.5 h-3.5 text-white/25" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <div>
            <h3 className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
              <Check className="w-3.5 h-3.5" /> Completed
            </h3>
            <div className="space-y-2">
              {completed.map(reminder => {
                const cfg = TYPE_CONFIG[reminder.type];
                return (
                  <div key={reminder.id} className="flex items-center gap-3 bg-white/3 border border-white/5 rounded-[18px] px-4 py-3 opacity-50">
                    <button onClick={() => toggleComplete(reminder.id!)} className={`w-6 h-6 rounded-full bg-gradient-to-r ${cfg.color} flex items-center justify-center flex-shrink-0`}>
                      <Check className="w-3 h-3 text-white" />
                    </button>
                    <span className="text-base">{cfg.emoji}</span>
                    <p className="text-white/50 text-sm line-through flex-1">{reminder.title}</p>
                    <button onClick={() => deleteReminder(reminder.id!)}>
                      <Trash2 className="w-3.5 h-3.5 text-white/20" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center">
            <motion.div
              initial={{ y: 400 }}
              animate={{ y: 0 }}
              exit={{ y: 400 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full max-w-[430px] bg-[#12121E] border border-white/10 rounded-t-[32px] p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold text-lg">New Reminder</h3>
                <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center">
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  placeholder="Reminder title..."
                  value={newReminder.title}
                  onChange={e => setNewReminder(r => ({ ...r, title: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-[16px] px-4 py-3.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-violet-500/50"
                />
                <input
                  type="time"
                  value={newReminder.time}
                  onChange={e => setNewReminder(r => ({ ...r, time: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-[16px] px-4 py-3.5 text-white text-sm focus:outline-none focus:border-violet-500/50"
                />
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(TYPE_CONFIG) as Reminder['type'][]).map(type => {
                    const cfg = TYPE_CONFIG[type];
                    return (
                      <button
                        key={type}
                        onClick={() => setNewReminder(r => ({ ...r, type }))}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-[14px] border transition-all ${
                          newReminder.type === type
                            ? `bg-gradient-to-r ${cfg.color} border-transparent text-white`
                            : 'bg-white/5 border-white/10 text-white/50'
                        }`}
                      >
                        <span>{cfg.emoji}</span>
                        <span className="text-sm font-medium capitalize">{type}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setShowAdd(false)} className="flex-1 bg-white/5 border border-white/10 rounded-[16px] py-3.5 text-white/60 text-sm font-medium">Cancel</button>
                  <button onClick={addReminder} className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-[16px] py-3.5 text-white text-sm font-semibold shadow-lg">Add Reminder</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
