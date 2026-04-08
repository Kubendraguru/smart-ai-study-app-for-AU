import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, Settings, Flame, TrendingUp, BookOpen, ChevronRight, Award, Zap, User as UserIcon } from 'lucide-react';
import { useApp } from './AppContext';
import { fetchGpaRecords, type GPARecord } from '../../lib/gpa';
import { saveProfile } from '../../lib/auth';

const SUBJECT_COLORS: Record<string, string> = {
  'from-violet-500 to-purple-700': 'bg-gradient-to-br from-violet-500 to-purple-700',
  'from-blue-500 to-cyan-600': 'bg-gradient-to-br from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600': 'bg-gradient-to-br from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600': 'bg-gradient-to-br from-orange-500 to-amber-600',
  'from-pink-500 to-rose-600': 'bg-gradient-to-br from-pink-500 to-rose-600',
  'from-indigo-500 to-blue-700': 'bg-gradient-to-br from-indigo-500 to-blue-700',
};

export function HomePage() {
  const { user, session, streak } = useApp();
  const navigate = useNavigate();
  const [gpaRecords, setGpaRecords] = useState<GPARecord[]>([]);

  useEffect(() => {
    if (session?.user.id) {
      fetchGpaRecords(session.user.id).then(setGpaRecords).catch(console.error);
    }
  }, [session]);

  const currentGpa = gpaRecords.length > 0 ? Number(gpaRecords[gpaRecords.length - 1].gpa) : 0;
  
  // NOTE: Mock subjects used for visual demonstration since there isn't a central subjects table in requirements
  const subjects = [
    { id: '1', name: 'Data Structures', code: 'CS301', credits: 4, progress: 85, color: 'from-violet-500 to-purple-700', emoji: '💻' },
    { id: '2', name: 'Database Systems', code: 'CS302', credits: 4, progress: 60, color: 'from-blue-500 to-cyan-600', emoji: '🗄️' },
    { id: '3', name: 'Computer Networks', code: 'CS303', credits: 3, progress: 40, color: 'from-emerald-500 to-teal-600', emoji: '🌐' },
    { id: '4', name: 'Operating Systems', code: 'CS304', credits: 4, progress: 25, color: 'from-orange-500 to-amber-600', emoji: '⚙️' },
  ];
  const avgProgress = Math.round(subjects.reduce((a, s) => a + s.progress, 0) / subjects.length);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const [setupName, setSetupName] = useState('');
  const [setupError, setSetupError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleProfileSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupName.trim()) {
      setSetupError('Name is required.');
      return;
    }
    setIsSaving(true);
    setSetupError('');
    try {
      await saveProfile(setupName);
      // Wait a bit, then reload window to fetch the new profile from AppContext
      window.location.reload(); 
    } catch (err: any) {
      setSetupError(err.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user && session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#08081A]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm bg-white/5 border border-white/10 rounded-[24px] p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30 mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Complete Your Profile</h2>
          <p className="text-white/50 text-sm mb-6">Let's get your dashboard ready.</p>
          
          <form onSubmit={handleProfileSetup} className="space-y-4">
            <input 
              type="text" 
              placeholder="Your Full Name" 
              value={setupName}
              onChange={e => setSetupName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500/60"
            />
            {setupError && <p className="text-red-400 text-xs">{setupError}</p>}
            <button 
              disabled={isSaving}
              type="submit" 
              className="w-full bg-violet-600 text-white py-3 rounded-2xl font-bold text-sm"
            >
              {isSaving ? 'Saving...' : 'Save Student Data'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-28 min-h-screen" style={{ background: 'linear-gradient(135deg, #08081A 0%, #0D0820 50%, #08081A 100%)' }}>
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-700/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-40 left-0 w-48 h-48 bg-blue-700/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-center justify-between relative z-10">
        <div>
          <p className="text-white/50 text-xs font-medium">{getGreeting()} 👋</p>
          <h1 className="text-white text-xl font-bold mt-0.5">{user?.name?.split(' ')[0]}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Bell className="w-4 h-4 text-white/60" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-violet-500 rounded-full" />
          </button>
          <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <span className="text-white text-sm font-bold">{user?.name?.[0] || 'A'}</span>
          </button>
        </div>
      </div>

      {/* Student Info Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-5 relative overflow-hidden rounded-[24px] p-5 mb-5"
        style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #4f46e5 100%)' }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-6 -translate-x-4" />
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-3 h-3 text-white" />
              </div>
              <span className="text-white/70 text-xs font-medium">{user?.departmentCode}</span>
            </div>
            <h2 className="text-white font-bold text-lg leading-tight mb-1">{user?.department?.split(' ').slice(0, 2).join(' ')}</h2>
            <div className="flex items-center gap-3 mt-3">
              <div className="bg-white/15 rounded-xl px-3 py-1.5">
                <p className="text-white/60 text-[10px]">Year</p>
                <p className="text-white font-bold text-sm">{user?.year}</p>
              </div>
              <div className="bg-white/15 rounded-xl px-3 py-1.5">
                <p className="text-white/60 text-[10px]">Semester</p>
                <p className="text-white font-bold text-sm">{user?.semester}</p>
              </div>
              <div className="bg-white/15 rounded-xl px-3 py-1.5">
                <p className="text-white/60 text-[10px]">Roll No</p>
                <p className="text-white font-bold text-sm">{user?.rollNo || '211CS043'}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center bg-white/15 rounded-2xl px-3 py-2">
            <Flame className="w-5 h-5 text-orange-300 mb-1" />
            <span className="text-white font-bold text-xl">{streak}</span>
            <span className="text-white/60 text-[10px]">streak</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="px-5 grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Subjects', value: subjects.length, icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
          { label: 'Avg Progress', value: `${avgProgress}%`, icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
          { label: 'CGPA', value: currentGpa.toFixed(1), icon: Award, color: 'from-amber-500 to-orange-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="bg-white/5 border border-white/8 rounded-[20px] p-3.5 flex flex-col items-center gap-1.5"
          >
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
              <stat.icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-base">{stat.value}</span>
            <span className="text-white/40 text-[10px] text-center">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="px-5 mb-5">
        <div className="flex items-center gap-3 mb-3">
          <Zap className="w-4 h-4 text-violet-400" />
          <h2 className="text-white font-semibold text-sm">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/ai-study')}
            className="relative overflow-hidden rounded-[20px] p-4 text-left"
            style={{ background: 'linear-gradient(135deg, #7c3aed20, #6d28d930)', border: '1px solid rgba(139,92,246,0.2)' }}
          >
            <div className="text-2xl mb-2">🤖</div>
            <p className="text-white font-semibold text-sm">AI Study</p>
            <p className="text-white/40 text-[11px] mt-0.5">Ask anything</p>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/profile')}
            className="relative overflow-hidden rounded-[20px] p-4 text-left"
            style={{ background: 'linear-gradient(135deg, #059669 20, #14b8a630)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <div className="text-2xl mb-2">📊</div>
            <p className="text-white font-semibold text-sm">GPA Calc</p>
            <p className="text-white/40 text-[11px] mt-0.5">Calculate GPA</p>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          </motion.button>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-400" />
            My Subjects
          </h2>
          <span className="text-white/40 text-xs">{user?.semester ? `Sem ${user.semester}` : ''}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {subjects.map((subject, i) => (
            <motion.button
              key={subject.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/subject/${subject.id}`)}
              className="bg-white/5 border border-white/8 rounded-[20px] p-4 text-left relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-16 h-16 opacity-5 group-hover:opacity-10 transition-opacity">
                <div className={`w-full h-full rounded-full ${SUBJECT_COLORS[subject.color] || 'bg-violet-500'}`} />
              </div>
              <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center text-xl mb-3 bg-gradient-to-br ${subject.color} shadow-lg`}>
                {subject.emoji}
              </div>
              <p className="text-white font-semibold text-xs leading-tight mb-1 line-clamp-2">{subject.name}</p>
              <p className="text-white/30 text-[10px] mb-2">{subject.code}</p>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${subject.progress}%` }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.8 }}
                  className={`h-full rounded-full bg-gradient-to-r ${subject.color}`}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-white/30 text-[9px]">{subject.credits} credits</span>
                <span className="text-white/50 text-[10px] font-medium">{subject.progress}%</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
