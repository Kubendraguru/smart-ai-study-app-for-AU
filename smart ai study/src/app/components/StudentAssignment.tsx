import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export function StudentAssignment() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08081A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return session ? <Dashboard session={session} /> : <LoginScreen />;
}

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Signup successful! You can now log in.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08081A] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          {isLogin ? 'Student Login' : 'Create Account'}
        </h2>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500/60"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500/60"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl py-3 font-semibold text-sm shadow-lg disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-white/40 text-xs mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-violet-400 underline">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

function Dashboard({ session }: { session: any }) {
  const [name, setName] = useState('');
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const uid = session?.user?.id;

  const fetchStudentData = async () => {
    if (!uid) return;
    try {
      // Fetch only the logged-in user's data from students table using RLS
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('auth_id', uid)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setStudentData(data);
      }
    } catch (err: any) {
      console.error('Fetch error:', err.message);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Assuming RLS ensures data works only if auth.uid() = auth_id
      const { data, error } = await supabase
        .from('students')
        .insert([{ auth_id: uid, name }])
        .select()
        .single();

      if (error) throw error;
      setSuccess('Student profile created successfully!');
      setName('');
      fetchStudentData();
    } catch (err: any) {
      if (err.code === '23505') {
        setError('You already have a student profile created.');
      } else {
        setError(err.message || 'Insert failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-[#08081A] p-6 text-white overflow-hidden relative font-[Plus_Jakarta_Sans,system-ui,sans-serif]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-md mx-auto relative z-10 pt-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 text-sm font-semibold bg-red-400/10 px-3 py-1.5 rounded-lg border border-red-400/20">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2">Auth Info</h2>
          <p className="text-xs text-white/40 mb-1">Email: <span className="text-white">{session.user.email}</span></p>
          <p className="text-xs text-white/40 break-all">UID: <span className="text-violet-300 font-mono">{uid}</span></p>
        </div>

        {!studentData ? (
          <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Complete Your Profile</h2>
            
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 mb-4">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <p className="text-emerald-400 text-xs">{success}</p>
              </div>
            )}

            <input
              type="text"
              placeholder="Enter your name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500/60 mb-4"
            />
            
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl py-3 font-semibold text-sm shadow-lg disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
            </button>
          </form>
        ) : (
          <div className="bg-gradient-to-br from-violet-600/20 to-purple-600/20 border border-violet-500/30 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xs font-semibold text-violet-300 uppercase tracking-widest mb-1">Student Registered</h2>
            <h3 className="text-2xl font-bold text-white mb-2">{studentData.name}</h3>
            <p className="text-xs text-white/40 bg-black/20 py-2 px-3 rounded-lg inline-block font-mono border border-white/5">
              DB ID: {studentData.id}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
