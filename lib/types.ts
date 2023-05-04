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
  active: boolean;
};

export type Game = {
  id: number;
  date: string;
  buy_in_value: number;
  re_buy_value: number;
  chip_value: number;
  status: string;
};

export type ParamsList = {
  Info: {
    game: any;
    players: any;
  };
};
