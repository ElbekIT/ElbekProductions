
export type DesignType = 'preview' | 'banner' | 'avatar' | 'logo';
export type GameType = 'pubg' | 'minecraft' | 'csgo' | 'vlog' | 'gta' | 'valorant' | 'freefire' | 'roblox' | 'fifa' | 'cod' | 'dota' | 'standoff' | 'other';

// Massive list of world languages covering 99% of internet users
export type Language = 
  | 'uz' | 'ru' | 'en' // Core
  | 'tr' | 'ar' | 'es' | 'fr' | 'de' | 'hi' | 'zh' | 'ja' | 'ko' // Major Global
  | 'it' | 'pt' | 'id' | 'vi' | 'th' | 'nl' | 'pl' | 'fa' // Secondary Global
  | 'uk' | 'kk' | 'ky' | 'tg' | 'az' // CIS / Central Asia
  | 'af' | 'sq' | 'am' | 'hy' | 'bn' | 'bs' | 'bg' | 'ca' // A-C
  | 'hr' | 'cs' | 'da' | 'et' | 'fi' | 'ka' | 'el' | 'gu' // D-G
  | 'he' | 'hu' | 'is' | 'ga' | 'kn' | 'km' | 'lo' | 'lv' // H-L
  | 'lt' | 'mk' | 'ms' | 'ml' | 'mr' | 'mn' | 'ne' | 'no' // L-N
  | 'ps' | 'pa' | 'ro' | 'sr' | 'si' | 'sk' | 'sl' | 'so' // P-S
  | 'sw' | 'sv' | 'ta' | 'te' | 'ur' | 'cy' | 'zu';       // S-Z

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null; // Can be null for Telegram users
  photoURL: string | null;
  telegramId?: string;
  authMethod: 'google' | 'telegram'; // NEW: Track login method
}

export interface OrderFormState {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  telegramUsername: string;
  comment: string;
  selectedGame: GameType;
  selectedDesign: DesignType;
  location?: VerifiedLocation;
}

export interface VerifiedLocation {
  country: string;
  region: string;
  city: string;
  lat: number;
  lng: number;
}

export interface BanStatus {
  isBanned: boolean;
  reason?: string;
  attempts: number;
  bannedAt?: number;
}

// User data stored in DB for Admin to see
export interface FullUserData {
  uid: string;
  profile: {
    displayName: string;
    email: string;
    photoURL: string;
    lastLogin: number;
    telegramId?: string;
    authMethod?: 'google' | 'telegram'; // NEW
  };
  security?: BanStatus;
}

export interface Order extends OrderFormState {
  id: string;
  userId: string;
  createdAt: number;
  status: 'sent' | 'processing' | 'completed' | 'busy' | 'reviewing';
  // New fields for delivery
  resultImage?: string;
  resultDescription?: string;
}

export interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  telegramUsername?: string;
  comment?: string;
}

export interface CountryData {
  name: { common: string };
  cca2: string;
  flags: { svg: string };
}
