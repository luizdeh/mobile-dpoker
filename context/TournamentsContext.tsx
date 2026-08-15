import { createContext, useEffect, useState } from 'react';
import { Tournament, TournamentPlayer, TournamentPayout, PlayerList, TournamentsContextType } from '../lib/types';
import { getPlayers } from '../utils/db/fetchPlayers';
import { getAllTournaments } from '../utils/db/getAllTournaments';
import { getTournamentPlayers } from '../utils/db/getTournamentPlayers';
import { getTournamentPayouts } from '../utils/db/getTournamentPayouts';
import { getTournamentsPlayed, makeOverallTournamentStats } from '../utils/tournamentStats';

export const TournamentsContext = createContext<TournamentsContextType>({
  tournaments: null,
  tournamentPlayers: null,
  tournamentPayouts: null,
  fetchTournaments: () => { },
  fetchTournamentPlayers: () => { },
  fetchTournamentPayouts: () => { },
  tournamentsPlayed: null,
  tournamentStats: null,
});

export const TournamentsContextProvider = ({ children }: any) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [tournamentPlayers, setTournamentPlayers] = useState<TournamentPlayer[]>([]);
  const [tournamentPayouts, setTournamentPayouts] = useState<TournamentPayout[]>([]);
  const [players, setPlayers] = useState<PlayerList[]>([]);
  const [initialFetch, setInitialFetch] = useState(false);
  const [tournamentsPlayed, setTournamentsPlayed] = useState<any[]>([]);
  const [tournamentStats, setTournamentStats] = useState<any[]>([]);

  const fetchPlayers = async () => {
    const fetched = await getPlayers();
    if (fetched.length) setPlayers(fetched);
  };

  const fetchTournaments = async () => {
    const fetched = await getAllTournaments();
    if (fetched.length) setTournaments(fetched.filter((tournament: Tournament) => tournament.status === 'CLOSED'));
  };

  const fetchTournamentPlayers = async () => {
    const fetched = await getTournamentPlayers();
    if (fetched.length) setTournamentPlayers(fetched);
  };

  const fetchTournamentPayouts = async () => {
    const fetched = await getTournamentPayouts();
    if (fetched.length) setTournamentPayouts(fetched);
  };

  useEffect(() => {
    (async () => {
      await fetchPlayers();
      await fetchTournaments();
      await fetchTournamentPlayers();
      await fetchTournamentPayouts();
    })();
  }, []);

  useEffect(() => {
    if (players.length && tournaments.length && tournamentPlayers.length) {
      setInitialFetch(true);
    }
  }, [players, tournaments, tournamentPlayers]);

  useEffect(() => {
    if (initialFetch) {
      setTournamentsPlayed(getTournamentsPlayed(tournaments, tournamentPlayers, players));
      setTournamentStats(makeOverallTournamentStats(tournaments, tournamentPlayers, players));
    }
  }, [initialFetch, tournaments, tournamentPlayers, players]);

  const value = {
    tournaments,
    tournamentPlayers,
    tournamentPayouts,
    fetchTournaments,
    fetchTournamentPlayers,
    fetchTournamentPayouts,
    setTournaments,
    setTournamentPlayers,
    setTournamentPayouts,
    tournamentsPlayed,
    tournamentStats,
  };

  return <TournamentsContext.Provider value={value}>{children}</TournamentsContext.Provider>;
};
