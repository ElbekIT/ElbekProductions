export type DesignType = 'preview' | 'banner' | 'avatar' | 'logo';
export type GameType = 'pubg' | 'minecraft' | 'csgo' | 'vlog' | 'gta' | 'valorant' | 'freefire' | 'roblox' | 'fifa' | 'cod' | 'dota' | 'standoff' | 'other';

// Top 30 languages covering most of the world + Central Asia
export type Language = 
  | 'uz' | 'ru' | 'en' | 'tr' | 'ar' | 'es' | 'fr' | 'de' | 'hi' | 'zh' 
  | 'ja' | 'ko' | 'it' | 'pt' | 'id' | 'vi' | 'th' | 'nl' | 'pl' | 'fa'
  | 'uk' | 'kk' | 'ky' | 'tg' | 'az';

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
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
}

export interface Order extends OrderFormState {
  id: string;
  userId: string;
  createdAt: number;
  status: 'sent' | 'processing' | 'completed' | 'busy' | 'reviewing';
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