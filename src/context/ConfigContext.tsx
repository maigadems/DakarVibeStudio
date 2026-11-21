import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { OpeningDay, PublicSettings } from '../lib/types';

interface ConfigValue {
  settings: PublicSettings;
  openingHours: OpeningDay[];
  googleClientId: string | null;
  vapidPublicKey: string | null;
  loaded: boolean;
}

// Valeurs affichées avant la réponse de l'API (coordonnées actuelles du studio)
const FALLBACK: PublicSettings = {
  studio_name: 'Westaf Records',
  contact_phone: '+221 77 860 04 82',
  contact_phone_2: '+221 33 825 79 51',
  contact_email: 'contact@westafrecords.com',
  contact_email_2: 'prod@westafrecords.com',
  address: 'Almadies, Dakar',
  maps_url: 'https://www.google.com/maps?q=14.7370071411133,-17.49489402771',
  instagram_url: 'https://www.instagram.com/westafrecords',
  snapchat_url: 'https://t.snapchat.com/Y4O4g5fy',
  facebook_url: null,
  productions_playlist_url: 'https://music.apple.com/fr/playlist/mbalax/pl.u-oZyllYaIRWNp6r8',
  booking_window_days: '30',
  min_lead_minutes: '20',
  reschedule_limit_minutes: '120'
};

const ConfigContext = createContext<ConfigValue>({ settings: FALLBACK, openingHours: [], googleClientId: null, vapidPublicKey: null, loaded: false });

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [value, setValue] = useState<ConfigValue>({ settings: FALLBACK, openingHours: [], googleClientId: null, vapidPublicKey: null, loaded: false });
  useEffect(() => {
    api<{ settings: PublicSettings; openingHours: OpeningDay[]; googleClientId: string | null; vapidPublicKey: string | null }>('/public/config', { auth: false })
      .then((r) => setValue({ settings: { ...FALLBACK, ...Object.fromEntries(Object.entries(r.settings).filter(([, v]) => v !== null && v !== '')) } as PublicSettings, openingHours: r.openingHours, googleClientId: r.googleClientId, vapidPublicKey: r.vapidPublicKey || null, loaded: true }))
      .catch(() => setValue((v) => ({ ...v, loaded: true })));
  }, []);
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

export const useConfig = () => useContext(ConfigContext);
