// TODO: create the needed objects with extend from base

export type Player = {
  id: number;
  chips: number;
  game_id: number;
  name: string;
  person_id: number;
  quantity_rebuy: number;
  re_buy_value: number;
  buy_in_value: number;
  final_chips: number;
  chips_counted?: boolean;
};

export type PlayerList = {
  id: number;
  name: string;
  is_active: 0 | 1;
  active?: boolean;
};

export type PlayerWithGames = PlayerList & { games_played: number; hasGameRecord?: boolean }

export type Game = {
  id: number;
  date: string;
  buy_in_value: number;
  re_buy_value: number;
  chip_value: number;
  rake_value: number | null;
  rake_waived: boolean;
  status: string;
  locked_by?: string | null;
  locked_at?: string | null;
  created_by?: string | null;
};

export type GamePlayer = {
  id: number;
  game_id: number;
  person_id: number;
  quantity_rebuy: number;
  chips: number;
  rake_paid: boolean;
  name?: string;
};

export type GameParamsNavigation = {
  Home: undefined;
  ActiveGame: {
    game: Game;
    players: any;
  };
  OpenGame: {
    game: Game;
  };
};

export type GameParams = {
  buy_in_value: number;
  re_buy_value: number;
  chip_value: number;
  rake_value: number;
  status: string;
};

export type Expense = {
  id: number;
  description: string;
  amount: number;
  date: string;
  created_by?: string | null;
  created_at: string;
};

export type Donation = {
  id: number;
  person_id: number;
  amount: number;
  date: string;
  created_by?: string | null;
  created_at: string;
};

export type DataContextType = {
  games: Game[] | null;
  players: PlayerList[] | null;
  gamePlayers: GamePlayer[] | null;
  fetchGames: () => void;
  fetchPlayers: () => void;
  fetchGamePlayers: () => void;
  setGames?: (games: Game[]) => void;
  setPlayers?: (players: PlayerList[]) => void;
  setGamePlayers?: (gamesPlayed: GamePlayer[]) => void;
  stats: any[] | null;
  gamesPlayed: any[] | null;
  addNewPlayer: (name: string, callback: () => void) => void;
};

export type Stats = {
  name: string;
  stats: any[];
  type: string;
  category: string;
  show: boolean;
  limit?: number;
  decimals?: number;
  currentOnly?: boolean;
}

export type Role = 'admin' | 'operator' | null;

export interface Profile {
  id: string;
  role: 'admin' | 'operator';
  display_name: string | null;
  email: string | null;
  created_at: string;
}

export type AuthContextType = {
  session: import('@supabase/supabase-js').Session | null;
  role: Role;
  canManage: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  changePassword: (password: string) => Promise<{ error: string | null }>;
  scheduleAutoLogout: () => void;
};
