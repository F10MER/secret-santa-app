import { useState, useEffect } from 'react';
import { useTelegram } from '../contexts/TelegramContext';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  error: string | null;
}

export function useAuth() {
  const { webApp, user, isReady } = useTelegram();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    token: null,
    error: null,
  });

  useEffect(() => {
    if (!isReady || !webApp) {
      return;
    }

    const authenticate = async () => {
      try {
        // Get initData from Telegram WebApp
        const initData = webApp.initData;
        
        if (!initData) {
          // Development mode or not in Telegram
          console.warn('No initData available, using mock auth');
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            token: 'mock-token',
            error: null,
          });
          return;
        }

        // Send initData to backend for validation
        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ initData }),
        });

        if (!response.ok) {
          throw new Error('Authentication failed');
        }

        const data = await response.json();
        
        // Store token
        localStorage.setItem('auth_token', data.token);
        
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          token: data.token,
          error: null,
        });
      } catch (error) {
        console.error('Auth error:', error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          token: null,
          error: error instanceof Error ? error.message : 'Authentication failed',
        });
      }
    };

    authenticate();
  }, [isReady, webApp]);

  const logout = () => {
    localStorage.removeItem('auth_token');
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      token: null,
      error: null,
    });
  };

  return {
    ...authState,
    user,
    logout,
  };
}
