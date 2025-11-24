import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import WebApp from '@twa-dev/sdk';

interface TelegramContextType {
  webApp: typeof WebApp | null;
  user: {
    id: number;
    firstName: string;
    lastName?: string;
    username?: string;
    languageCode?: string;
  } | null;
  isReady: boolean;
}

const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  user: null,
  isReady: false,
});

export const useTelegram = () => useContext(TelegramContext);

interface TelegramProviderProps {
  children: ReactNode;
}

export const TelegramProvider = ({ children }: TelegramProviderProps) => {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<TelegramContextType['user']>(null);

  useEffect(() => {
    // Initialize Telegram WebApp
    WebApp.ready();
    WebApp.expand();

    // Set theme
    WebApp.setHeaderColor('#ffffff');
    WebApp.setBackgroundColor('#ffffff');

    // Get user data
    if (WebApp.initDataUnsafe.user) {
      setUser({
        id: WebApp.initDataUnsafe.user.id,
        firstName: WebApp.initDataUnsafe.user.first_name,
        lastName: WebApp.initDataUnsafe.user.last_name,
        username: WebApp.initDataUnsafe.user.username,
        languageCode: WebApp.initDataUnsafe.user.language_code,
      });
    }

    setIsReady(true);
  }, []);

  return (
    <TelegramContext.Provider value={{ webApp: WebApp, user, isReady }}>
      {children}
    </TelegramContext.Provider>
  );
};
