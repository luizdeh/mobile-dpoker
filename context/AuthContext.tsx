import { createContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthContextType, Role } from '../lib/types';

export const AuthContext = createContext<AuthContextType>({
  session: null,
  role: null,
  canManage: false,
  signIn: async () => ({ error: 'not ready' }),
  signOut: async () => { },
});

export const AuthContextProvider = ({ children }: any) => {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role>(null);

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

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchRole(session.user.id);
      } else {
        setRole(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    role,
    canManage: role === 'admin' || role === 'operator',
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
