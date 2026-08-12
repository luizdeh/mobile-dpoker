import { createContext, useEffect, useRef, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthContextType, Role } from '../lib/types';

const AUTO_LOGOUT_DELAY_MS = 5 * 60 * 1000;

export const AuthContext = createContext<AuthContextType>({
  session: null,
  role: null,
  canManage: false,
  signIn: async () => ({ error: 'not ready' }),
  signOut: async () => { },
  changePassword: async () => ({ error: 'not ready' }),
  scheduleAutoLogout: () => { },
});

export const AuthContextProvider = ({ children }: any) => {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role>(null);
  const autoLogoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAutoLogoutTimer = () => {
    if (autoLogoutTimer.current) {
      clearTimeout(autoLogoutTimer.current);
      autoLogoutTimer.current = null;
    }
  };

  const scheduleAutoLogout = () => {
    clearAutoLogoutTimer();
    autoLogoutTimer.current = setTimeout(() => {
      supabase.auth.signOut();
    }, AUTO_LOGOUT_DELAY_MS);
  };

  const fetchRole = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    setRole((data?.role as Role) ?? null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchRole(session.user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session) {
        fetchRole(session.user.id);
        // A fresh, explicit sign-in cancels any auto-logout left over from a
        // prior session — don't let a background token refresh cancel it too.
        if (event === 'SIGNED_IN') clearAutoLogoutTimer();
      } else {
        setRole(null);
        clearAutoLogoutTimer();
      }
    });

    return () => {
      listener.subscription.unsubscribe();
      clearAutoLogoutTimer();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    clearAutoLogoutTimer();
    await supabase.auth.signOut();
  };

  const changePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message ?? null };
  };

  const value = {
    session,
    role,
    canManage: role === 'admin' || role === 'operator',
    signIn,
    signOut,
    changePassword,
    scheduleAutoLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
