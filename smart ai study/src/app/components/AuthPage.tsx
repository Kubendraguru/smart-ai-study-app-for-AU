import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, GraduationCap, BookOpen, ChevronRight, User, Lock, Mail, AlertCircle } from 'lucide-react';
import { signIn, signUp } from '../../lib/auth';

const DEPARTMENTS = [
  { name: 'Computer Science and Engineering', code: 'CSE' },
  { name: 'Information Technology', code: 'IT' },
  { name: 'Electronics & Communication Engg.', code: 'ECE' },
  { name: 'Electrical & Electronics Engg.', code: 'EEE' },
  { name: 'Mechanical Engineering', code: 'MECH' },
  { name: 'Civil Engineering', code: 'CIVIL' },
];

export function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    department: 'CSE', year: '2', semester: '3', rollNo: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);

    try {
      if (tab === 'login') {
        await signIn(form.email, form.password);
        navigate('/home', { replace: true });
      } else {
        if (!form.name) { setError('Full name is required.'); setLoading(false); return; }
        const dept = DEPARTMENTS.find(d => d.code === form.department) || DEPARTMENTS[0];
        await signUp(form.email, form.password, role, {
          name: form.name,
          ...(role === 'student' ? {
            department: dept.name,
            department_code: dept.code,
            roll_no: form.rollNo || '',
            year: parseInt(form.year) || 2,
            semester: parseInt(form.semester) || 3,
          } : {}),
        });
        navigate('/home', { replace: true });
      }
    } catch (err: any) {
      const msg = err?.message || 'Something went wrong. Please try again.';
      if (msg.includes('Invalid login credentials')) setError('Wrong email or password.');
      else if (msg.includes('already registered')) setError('This email is already registered. Please sign in.');
      else if (msg.includes('Password should be at least')) setError('Password must be at least 6 characters.');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08081A] flex flex-col items-center justify-center p-6 relative overflow-hidden font-[Plus_Jakarta_Sans,system-ui,sans-serif]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30 mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center leading-tight">Anna University</h1>
          <p className="text-violet-300/80 text-sm mt-1 text-center">Smart Student Platform</p>
        </div>

        {/* Role Selector */}
        <div className="flex bg-white/5 rounded-2xl p-1 mb-6 border border-white/10">
          {(['student', 'teacher'] as const).map(r => (
            <button
              key={r}
              onClick={() => { setRole(r); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-200 ${
                role === r
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                  : 'text-white/50'
              }`}
            >
              {r === 'student' ? '🎓 Student' : '👨‍🏫 Teacher'}
            </button>
          ))}
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 mb-6">
          {(['login', 'signup'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tab === t ? 'text-white border-b-2 border-violet-500' : 'text-white/40 border-b-2 border-transparent'
              }`}
            >
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 mb-4"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-xs">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'signup' && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder={role === 'teacher' ? 'Full Name (e.g. Dr. A. Kumar)' : 'Full Name'}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-11 py-3.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500/60 focus:bg-white/8 transition-all"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-11 py-3.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500/60 transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password (min 6 characters)"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-11 py-3.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500/60 transition-all"
            />
            <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {tab === 'signup' && role === 'student' && (
            <>
              <select
                value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-violet-500/60 transition-all appearance-none"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d.code} value={d.code} className="bg-[#1a1a2e] text-white">{d.name} ({d.code})</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.year}
                  onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                  className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-violet-500/60 transition-all appearance-none"
                >
                  {[1,2,3,4].map(y => <option key={y} value={y} className="bg-[#1a1a2e]">Year {y}</option>)}
                </select>
                <select
                  value={form.semester}
                  onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
                  className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-violet-500/60 transition-all appearance-none"
                >
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s} className="bg-[#1a1a2e]">Sem {s}</option>)}
                </select>
              </div>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  placeholder="Roll Number (e.g. 211CS043)"
                  value={form.rollNo}
                  onChange={e => setForm(f => ({ ...f, rollNo: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-11 py-3.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500/60 transition-all"
                />
              </div>
            </>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-4 rounded-2xl font-semibold text-sm shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {tab === 'login' ? 'Sign In' : 'Create Account'}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </motion.button>

          <p className="text-center text-white/30 text-xs py-2">
            {tab === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError(''); }} className="text-violet-400 underline">
              {tab === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
