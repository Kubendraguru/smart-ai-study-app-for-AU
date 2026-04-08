import { useLocation, useNavigate } from 'react-router';
import { Home, FolderOpen, Brain, Newspaper, Bell } from 'lucide-react';
import { motion } from 'motion/react';

const NAV_ITEMS = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/materials', label: 'Materials', icon: FolderOpen },
  { path: '/ai-study', label: 'AI Study', icon: Brain },
  { path: '/news', label: 'News', icon: Newspaper },
  { path: '/reminders', label: 'Alerts', icon: Bell },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
      <div className="mx-3 mb-3 bg-[#12121E]/90 backdrop-blur-2xl border border-white/10 rounded-[28px] px-2 py-2 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/home' && location.pathname === '/');
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl relative transition-all duration-200"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-gradient-to-r from-violet-600/30 to-purple-600/30 rounded-2xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 relative z-10 ${
                    isActive ? 'text-violet-400' : 'text-white/35'
                  }`}
                />
                <span
                  className={`text-[10px] font-semibold transition-colors duration-200 relative z-10 ${
                    isActive ? 'text-violet-300' : 'text-white/25'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
