import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";

export type ResidentProfile = {
  id: string;
  email: string;
  display_name: string;
  phone: string | null;
  account_status: string;
};

type AuthState = {
  session: Session | null;
  profile: ResidentProfile | null;
  isResident: boolean;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<ResidentProfile>) => void;
};

const AuthContext = createContext<AuthState>({
  session: null,
  profile: null,
  isResident: false,
  loading: true,
  error: null,
  updateProfile: () => undefined,
});

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ResidentProfile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!alive) return;
      if (sessionError) setError(sessionError.message);
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setProfile(null);
      setRoles([]);
      setError(null);
      setLoading(false);
    });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let alive = true;
    if (!session?.user.id) {
      setProfile(null);
      setRoles([]);
      return;
    }
    Promise.all([
      supabase
        .from("profiles")
        .select("id,display_name,phone,account_status")
        .eq("id", session.user.id)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", session.user.id),
    ]).then(([profileResult, rolesResult]) => {
      if (!alive) return;
      if (profileResult.error || rolesResult.error) {
        setError(
          profileResult.error?.message ?? rolesResult.error?.message ?? "Could not load account.",
        );
        return;
      }
      setProfile(
        profileResult.data
          ? {
              ...(profileResult.data as Omit<ResidentProfile, "email">),
              email: session.user.email ?? "",
            }
          : null,
      );
      setRoles((rolesResult.data ?? []).map((row) => row.role));
    });
    return () => {
      alive = false;
    };
  }, [session?.user.id, session?.user.email]);

  const value = useMemo(
    () => ({
      session,
      profile,
      isResident: roles.includes("resident") && profile?.account_status === "active",
      loading: loading || (!!session && !profile && !error),
      error,
      updateProfile: (updates: Partial<ResidentProfile>) => {
        setProfile((current) => (current ? { ...current, ...updates } : current));
      },
    }),
    [session, profile, roles, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
