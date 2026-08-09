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
  status: string;
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

export type AuthContextType = {
  session: import('@supabase/supabase-js').Session | null;
  role: Role;
  canManage: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  scheduleAutoLogout: () => void;
};
