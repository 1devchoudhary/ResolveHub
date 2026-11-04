import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from './authContext';
import { authApi } from '../api/auth';
import { refreshSession, setAccessToken, setSessionExpiredHandler } from '../api/client';

// status: 'loading' while we check for an existing session, then 'authenticated' or 'anonymous'
export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [state, setState] = useState({ status: 'loading', user: null });

  const signedIn = useCallback(({ user, accessToken }) => {
    setAccessToken(accessToken);
    setState({ status: 'authenticated', user });
    return user;
  }, []);

  const signedOut = useCallback(() => {
    setAccessToken(null);
    // Never show one user's cached tickets to the next person on this device
    queryClient.clear();
    setState({ status: 'anonymous', user: null });
  }, [queryClient]);

  // On first load, the httpOnly refresh cookie (if any) restores the session
  useEffect(() => {
    let cancelled = false;
    refreshSession()
      .then((data) => !cancelled && signedIn(data))
      .catch(() => !cancelled && setState({ status: 'anonymous', user: null }));
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  // A failed background refresh (session revoked or expired) signs the user out everywhere
  useEffect(() => {
    setSessionExpiredHandler(signedOut);
  }, [signedOut]);

  const value = useMemo(
    () => ({
      ...state,
      isAuthenticated: state.status === 'authenticated',
      login: async (credentials) => signedIn(await authApi.login(credentials)),
      register: async (input) => signedIn(await authApi.register(input)),
      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          signedOut();
        }
      },
      // After a profile update, keep the header/sidebar in sync
      setUser: (user) => setState((current) => ({ ...current, user })),
    }),
    [state, signedIn, signedOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
