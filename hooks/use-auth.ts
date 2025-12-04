import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useCallback, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { getMe } from '@/lib/api/auth';

// Simplified auth hook that trusts Better Auth as the single source of truth
export function useAuth(requireAuth = true) {
  const {
    data: session,
    isPending: sessionPending,
    error: sessionError,
  } = authClient.useSession();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Convert Better Auth session to our user format
  const user = useMemo(() => {
    if (session && 'user' in session && session.user) {
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || null,
        image: session.user.image || null,
        role: 'USER' as 'USER' | 'ADMIN', // Default role
        username: null,
        profile: userProfile,
      };
    }
    return null;
  }, [session, userProfile]);

  const isAuthenticated = !!(session && 'user' in session && session.user);
  const isLoading = sessionPending || profileLoading;
  const error = sessionError?.message || null;

  // Fetch user profile when authenticated
  useEffect(() => {
    const fetchProfile = async () => {
      if (
        session &&
        'user' in session &&
        session.user &&
        !userProfile &&
        !profileLoading
      ) {
        try {
          setProfileLoading(true);
          const profile = await getMe();
          setUserProfile(profile);
        } catch {
        } finally {
          setProfileLoading(false);
        }
      }
    };

    fetchProfile();
  }, [session, userProfile, profileLoading]);

  // Handle required auth redirect
  useEffect(() => {
    if (requireAuth && !isAuthenticated && !isLoading) {
      router.push('/auth?mode=signin');
    }
  }, [requireAuth, isAuthenticated, isLoading, router]);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await getMe();
      setUserProfile(profile);
    } catch (error) {
      throw error;
    }
  }, []);

  const clearAuth = useCallback(async () => {
    try {
      setUserProfile(null);
      await authClient.signOut();
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    refreshUser,
    clearAuth,
  };
}

export function useRequireAuth() {
  return useAuth(true);
}

export function useOptionalAuth() {
  return useAuth(false);
}

// Hook for checking auth status without redirecting
export function useAuthStatus() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Convert Better Auth session to our user format
  const user = useMemo(() => {
    if (session && 'user' in session && session.user) {
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || null,
        image: session.user.image || null,
        role: 'USER' as 'USER' | 'ADMIN',
        username: null,
        profile: userProfile,
      };
    }
    return null;
  }, [session, userProfile]);

  // Fetch user profile when authenticated
  useEffect(() => {
    const fetchProfile = async () => {
      if (
        session &&
        'user' in session &&
        session.user &&
        !userProfile &&
        !profileLoading
      ) {
        try {
          setProfileLoading(true);
          const profile = await getMe();
          setUserProfile(profile);
        } catch {
        } finally {
          setProfileLoading(false);
        }
      }
    };

    fetchProfile();
  }, [session, userProfile, profileLoading]);

  return {
    isAuthenticated: !!(session && 'user' in session && session.user),
    isLoading: sessionPending || profileLoading,
    user,
  };
}

// Hook for auth actions
export function useAuthActions() {
  const router = useRouter();
  const logout = useCallback(async () => {
    try {
      await authClient.signOut();
      router.push('/');
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    logout,
  };
}
