import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { fetchProfile, supabase } from "./supabase";
import type { Profile } from "./types";

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoadedFor, setProfileLoadedFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
      },
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user.id ?? null;

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setProfileLoadedFor(null);
      return;
    }

    let active = true;

    void fetchProfile(userId).then((next) => {
      if (!active) return;
      setProfile(next);
      setProfileLoadedFor(userId);
    });

    return () => {
      active = false;
    };
  }, [userId]);

  // Derived rather than state so a freshly restored session never renders
  // "no profile" for one frame (which would mis-route role-guarded pages).
  const profileLoading = Boolean(userId) && profileLoadedFor !== userId;

  const refreshProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      return;
    }
    setProfile(await fetchProfile(userId));
  }, [userId]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setProfileLoadedFor(null);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      profileLoading,
      refreshProfile,
      signOut,
    }),
    [session, profile, loading, profileLoading, refreshProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
