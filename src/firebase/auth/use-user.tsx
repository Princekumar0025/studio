'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useAuth } from '../provider';

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { isUserLoading: providerLoading, user: providerUser } = useAuthUserInternal();

  useEffect(() => {
    setUser(providerUser);
    setLoading(providerLoading);
  }, [providerUser, providerLoading]);

  // Fallback for when context isn't available
  useEffect(() => {
    if (!auth) {
      setLoading(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}

// Internal hook to safely consume context
function useAuthUserInternal() {
  try {
    const { user, isUserLoading } = useFirebase();
    return { user, isUserLoading };
  } catch (e) {
    // This can happen if used outside the provider, so we have a fallback.
    return { user: null, isUserLoading: true };
  }
}

// Re-exporting useFirebase to avoid breaking changes if it was used directly,
// though useUser should be preferred for just user state.
import { useFirebase } from '../provider';
