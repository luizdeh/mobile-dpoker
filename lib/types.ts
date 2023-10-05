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

export type PlayerWithGames = PlayerList & { games_played: number }

export type Game = {
  id: number;
  date: string;
  buy_in_value: number;
  re_buy_value: number;
  chip_value: number;
  status: string;
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
  ActiveGame: {
    game: Game;
    players: any;
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
  setGames?: (games: Game[]) => void;
  setPlayers?: (players: PlayerList[]) => void;
  setGamePlayers?: (gamesPlayed: GamePlayer[]) => void;
  stats: any[] | null;
  gamesPlayed: any[] | null;
  addNewPlayer: (name: string, callback: () => void) => void;
};