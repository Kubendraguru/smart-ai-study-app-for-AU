import { Outlet, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { BottomNav } from './BottomNav';
import { useApp } from './AppContext';

export function RootLayout() {
  const { session, loading } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate('/auth', { replace: true });
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08081A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30 animate-pulse">
            <span className="text-2xl">🎓</span>
          </div>
          <div className="w-5 h-5 border-2 border-white/20 border-t-violet-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="relative max-w-[430px] mx-auto">
      <Outlet />
      <BottomNav />
    </div>
  );
}
