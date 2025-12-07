export type DesignType = 'preview' | 'banner' | 'avatar' | 'logo';
export type GameType = 'pubg' | 'minecraft' | 'csgo' | 'vlog' | 'gta' | 'valorant' | 'freefire' | 'roblox' | 'fifa' | 'cod' | 'dota' | 'standoff' | 'other';
export type Language = 'uz' | 'ru' | 'en';

export interface OrderFormState {
  firstName: string;
  lastName: string;
  phone: string;
  telegramUsername: string;
  comment: string;
  selectedGame: GameType;
  selectedDesign: DesignType;
}

export interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  telegramUsername?: string;
  comment?: string;
}