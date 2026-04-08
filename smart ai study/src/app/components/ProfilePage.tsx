import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import type { ElementType } from 'react';
import {
  LogOut, Moon, Sun, ChevronRight,
  Settings, Bell, Shield, HelpCircle, Edit3,
  Calculator, BarChart3, User
} from 'lucide-react';
import { useApp } from './AppContext';
import { GPACalculator } from './GPACalculator';
import { signOut } from '../../lib/auth';
import { fetchGpaRecords, type GPARecord } from '../../lib/gpa';
import { fetchTeacherMaterials, type Material } from '../../lib/materials';

type Tab = 'profile' | 'gpa' | 'teacher';

const ACHIEVEMENT_BADGES = [
  { emoji: '🔥', label: 'Hot Streak', desc: '7-day streak' },
  { emoji: '📚', label: 'Bookworm', desc: '50+ materials read' },
  { emoji: '🤖', label: 'AI Explorer', desc: 'Used AI Study 10x' },
  { emoji: '🏆', label: 'Top Student', desc: 'CGPA > 8.5' },
];

export function ProfilePage() {
  const { user, session, darkMode, toggleDarkMode, streak } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [gpaRecords, setGpaRecords] = useState<GPARecord[]>([]);

  useEffect(() => {
    if (session?.user.id) {
      fetchGpaRecords(session.user.id).then(setGpaRecords).catch(console.error);
    }
  }, [session]);

  const currentGpa = gpaRecords.length > 0
    ? (gpaRecords.reduce((a, r) => a + Number(r.gpa), 0) / gpaRecords.length).toFixed(2)
    : '–';

  const handleLogout = async () => {
    try { await signOut(); } catch (e) { console.error(e); }
    navigate('/auth', { replace: true });
  };

  return (
    <div className="pb-28 min-h-screen" style={{ background: 'linear-gradient(135deg, #08081A 0%, #0D0820 100%)' }}>
      {/* BG glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-700/8 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="relative px-5 pt-14 pb-5">
        {/* Hero Profile */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-xl shadow-violet-500/30 text-2xl font-bold text-white">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#08081A] rounded-full flex items-center justify-center border border-white/10">
              <span className="text-xs">{user?.role === 'teacher' ? '👨‍🏫' : '🎓'}</span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-lg">{user?.name}</h2>
            <p className="text-white/40 text-xs">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-xs px-2.5 py-0.5 rounded-lg font-semibold ${
                user?.role === 'teacher'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-violet-500/20 text-violet-400'
              }`}>
                {user?.role === 'teacher' ? '👨‍🏫 Teacher' : '🎓 Student'}
              </span>
              {user?.departmentCode && (
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-white/8 text-white/50">{user.departmentCode}</span>
              )}
            </div>
          </div>
          <button className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Edit3 className="w-4 h-4 text-white/40" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Streak', value: `${streak}🔥`, color: 'from-orange-500 to-amber-500' },
            { label: 'CGPA', value: currentGpa, color: 'from-violet-500 to-purple-600' },
            { label: 'Semesters', value: gpaRecords.length || '–', color: 'from-blue-500 to-cyan-500' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/5 border border-white/8 rounded-[18px] p-3 text-center">
              <p className={`font-bold text-lg bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</p>
              <p className="text-white/30 text-[10px] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/5 border border-white/8 rounded-[18px] p-1 mb-5">
          {([
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'gpa', label: 'GPA Calc', icon: Calculator },
            ...(user?.role === 'teacher' ? [{ id: 'teacher', label: 'Dashboard', icon: BarChart3 }] : []),
          ] as { id: Tab; label: string; icon: ElementType }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[14px] text-xs font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                  : 'text-white/40'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Achievements */}
              <div className="mb-5">
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Achievements</h3>
                <div className="grid grid-cols-4 gap-2">
                  {ACHIEVEMENT_BADGES.map(badge => (
                    <div key={badge.label} className="bg-white/5 border border-white/8 rounded-[16px] p-3 flex flex-col items-center gap-1">
                      <span className="text-2xl">{badge.emoji}</span>
                      <span className="text-white/60 text-[9px] text-center font-medium leading-tight">{badge.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Info */}
              {user?.role === 'student' && (
                <div className="bg-white/5 border border-white/8 rounded-[20px] p-4 mb-4">
                  <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Student Info</h3>
                  {[
                    { label: 'Department', value: user.department },
                    { label: 'Year', value: `Year ${user.year}` },
                    { label: 'Semester', value: `Semester ${user.semester}` },
                    { label: 'Roll Number', value: user.rollNo || '211CS043' },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                      <span className="text-white/40 text-sm">{item.label}</span>
                      <span className="text-white text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Settings */}
              <div className="space-y-2 mb-4">
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Settings</h3>
                {[
                  { icon: darkMode ? Moon : Sun, label: darkMode ? 'Dark Mode' : 'Light Mode', action: toggleDarkMode, toggle: true, active: darkMode },
                  { icon: Bell, label: 'Notifications', action: () => {}, toggle: false },
                  { icon: Shield, label: 'Privacy & Security', action: () => {}, toggle: false },
                  { icon: HelpCircle, label: 'Help & Support', action: () => {}, toggle: false },
                  { icon: Settings, label: 'App Settings', action: () => {}, toggle: false },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center gap-3 bg-white/5 border border-white/8 rounded-[18px] px-4 py-3.5 text-left"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-white/50" />
                    </div>
                    <span className="text-white/70 text-sm flex-1">{item.label}</span>
                    {item.toggle ? (
                      <div className={`w-10 h-6 rounded-full transition-colors ${item.active ? 'bg-violet-600' : 'bg-white/10'}`}>
                        <div className={`w-5 h-5 rounded-full bg-white m-0.5 transition-transform ${item.active ? 'translate-x-4' : ''}`} />
                      </div>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-white/20" />
                    )}
                  </button>
                ))}
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 rounded-[18px] py-3.5 text-red-400 text-sm font-semibold"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </motion.div>
          )}

          {activeTab === 'gpa' && (
            <motion.div key="gpa" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <GPACalculator />
            </motion.div>
          )}

          {activeTab === 'teacher' && (
            <motion.div key="teacher" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <TeacherDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TeacherDashboard() {
  const { session, user } = useApp();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user.id) return;
    fetchTeacherMaterials(session.user.id)
      .then(setMaterials)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session]);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Uploads', value: loading ? '...' : materials.length, emoji: '📁' },
          { label: 'Depts', value: [...new Set(materials.map(m => m.department))].length || '–', emoji: '🏫' },
          { label: 'Years', value: [...new Set(materials.map(m => m.year))].length || '–', emoji: '📅' },
        ].map(s => (
          <div key={s.label} className="bg-white/5 border border-white/8 rounded-[18px] p-3 flex flex-col items-center gap-1">
            <span className="text-xl">{s.emoji}</span>
            <span className="text-white font-bold text-lg">{s.value}</span>
            <span className="text-white/30 text-[10px]">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Action */}
      <div className="bg-white/5 border border-white/8 rounded-[20px] p-4 text-center">
        <h3 className="text-white font-semibold text-sm mb-2">Manage Materials</h3>
        <p className="text-white/40 text-xs mb-4">Upload and manage materials for your students.</p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => window.location.href = '/materials'}
          className="w-full bg-gradient-to-r from-violet-600 to-purple-600 rounded-[14px] py-3.5 text-white text-sm font-semibold shadow-lg flex items-center justify-center gap-2"
        >
          Go to Materials <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* My Uploads */}
      <div>
        <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Recent Uploads</h3>
        <div className="space-y-2">
          {materials.slice(0, 4).map(mat => (
            <div key={mat.id} className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-[16px] px-3.5 py-3">
              <span className="text-base">📄</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">{mat.title}</p>
                <p className="text-white/25 text-[10px]">{mat.subject} · {mat.file_size}</p>
              </div>
            </div>
          ))}
          {materials.length === 0 && (
            <p className="text-white/30 text-xs text-center py-4">No uploads yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}