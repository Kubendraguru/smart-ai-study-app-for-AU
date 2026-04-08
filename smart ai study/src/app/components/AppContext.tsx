import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { getCurrentProfile } from '../../lib/auth';
import { updateStreak } from '../../lib/streaks';

export interface User {
  id: string;           // auth.uid()
  name: string;
  email: string;
  role: 'student' | 'teacher';
  department: string;
  departmentCode: string;
  year: number;
  semester: number;
  rollNo: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AppContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authError: string | null;
  setUser: (user: User | null) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  streak: number;
  setStreak: (s: number) => void;
  chatHistory: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [streak, setStreak] = useState(0);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        await loadUserProfile(session);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session) {
          await loadUserProfile(session);
        } else {
          setUserState(null);
          setStreak(0);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function loadUserProfile(session: Session) {
    try {
      const profile = await getCurrentProfile();
      if (profile) {
        const u: User = {
          id: session.user.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          department: profile.role === 'student' ? (profile as any).department : 'Faculty',
          departmentCode: profile.role === 'student' ? (profile as any).department_code : 'FAC',
          year: profile.role === 'student' ? (profile as any).year : 0,
          semester: profile.role === 'student' ? (profile as any).semester : 0,
          rollNo: profile.role === 'student' ? (profile as any).roll_no : '',
        };
        setUserState(u);
        // Update streak
        const s = await updateStreak(session.user.id);
        setStreak(s);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      setAuthError('Failed to load profile. Please try again.');
    }
  }

  const setUser = (u: User | null) => setUserState(u);
  const toggleDarkMode = () => setDarkMode(d => !d);
  const addChatMessage = (msg: ChatMessage) => setChatHistory(h => [...h, msg]);
  const clearChat = () => setChatHistory([]);

  return (
    <AppContext.Provider value={{
      user, session, loading, authError,
      setUser, darkMode, toggleDarkMode,
      streak, setStreak,
      chatHistory, addChatMessage, clearChat,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
