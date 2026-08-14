import React, { useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Box, Button, Center, HStack, Select, Text, VStack } from 'native-base';
import { ScrollView } from 'react-native';
import { GamesContext } from '../context/GamesContext';
import { getActivePlayerIds, makePlayerCard, ranking } from '../utils/stats';
import { PlayerList, Stats } from '../lib/types';
import ActivePlayersToggle from '../components/ActivePlayersToggle';
import { formatDateBR } from '../lib/formatDate';

const formatMoney = (value: number) => value.toFixed(2);
const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

function SectionHeader({ title }: { title: string }) {
  return (
    <Box backgroundColor="blueGray.800" borderRadius="sm" px={2} py={1} mb={3} alignSelf="flex-start">
      <Text fontSize="xs" color="teal.300" bold letterSpacing="lg">{title}</Text>
    </Box>
  );
}

// Compact label/value tile, two per row, used on the individual player card
// so the whole card fits on screen without scrolling.
function StatTile({ label, value, color = 'white' }: { label: string; value: string; color?: string }) {
  return (
    <Box width="48%" mb={4}>
      <Text color="blueGray.400" fontSize="11">{label}</Text>
      <Text color={color} fontSize="sm" bold>{value}</Text>
    </Box>
  );
}

// STREAKS title shares its row with the CURRENT/LONGEST column headers
// (same flex widths as StreakRow below) instead of sitting on its own line —
// a compact 4-line table instead of a title line plus 3 separate rows.
function StreakTableHeader() {
  return (
    <HStack
      justifyContent="space-between"
      alignItems="center"
      backgroundColor="blueGray.800"
      borderRadius="sm"
      px={2}
      py={1}
      mb={2}
    >
      <Text flex={1.2} fontSize="xs" lineHeight="16" color="teal.300" bold letterSpacing="lg">STREAKS</Text>
      <Text flex={1} fontSize="9" lineHeight="16" color="blueGray.400" bold letterSpacing="md" textAlign="right">CURRENT</Text>
      <Text flex={1} fontSize="9" lineHeight="16" color="blueGray.400" bold letterSpacing="md" textAlign="right">LONGEST</Text>
    </HStack>
  );
}

function StreakRow({
  label,
  current,
  longest,
  color = 'white',
}: {
  label: string;
  current: string;
  longest: string;
  color?: string;
}) {
  return (
    <HStack justifyContent="space-between" alignItems="center" py={1}>
      <Text flex={1.2} color="blueGray.400" fontSize="xs">{label}</Text>
      <Text flex={1} color={color} fontSize="sm" bold textAlign="right">{current}</Text>
      <Text flex={1} color={color} fontSize="sm" bold textAlign="right">{longest}</Text>
    </HStack>
  );
}

function TopPerformerRow({
  category,
  entries,
  valueColor,
}: {
  category: string;
  entries: { name: string; value?: string }[];
  valueColor?: string;
}) {
  if (!entries.length) return null;
  const names = entries.map((entry) => entry.name.toUpperCase()).join(', ');
  const value = entries[0].value;
  return (
    <VStack py={1.5} borderBottomWidth={1} borderColor="blueGray.800">
      <Text color="blueGray.400" fontSize="xs">{category}</Text>
      <HStack justifyContent="space-between" alignItems="baseline">
        <Text color="teal.300" fontSize="sm" bold flexShrink={1} pr={2}>{names}</Text>
        {value ? (
          <Text color={valueColor ?? 'blueGray.400'} fontSize="sm" bold>{value}</Text>
        ) : null}
      </HStack>
    </VStack>
  );
}

export default function PlayerStatsScreen({ navigation }: { navigation: any }) {
  const { games, players, gamePlayers, stats } = useContext(GamesContext);

  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  const [onlyActive, setOnlyActive] = useState(true);

  const activePlayerIds = useMemo(
    () => getActivePlayerIds(games ?? [], gamePlayers ?? [], players ?? []),
    [games, gamePlayers, players]
  );

  const eligiblePlayers = useMemo(
    () => (onlyActive ? (players ?? []).filter((player: PlayerList) => activePlayerIds.has(player.id)) : players ?? []),
    [players, onlyActive, activePlayerIds]
  );

  const sortedPlayers = useMemo(
    () => [...eligiblePlayers].sort((a: PlayerList, b: PlayerList) => a.name.localeCompare(b.name)),
    [eligiblePlayers]
  );

  useEffect(() => {
    if (selectedPlayerId !== null && onlyActive && !activePlayerIds.has(selectedPlayerId)) {
      setSelectedPlayerId(null);
    }
  }, [selectedPlayerId, onlyActive, activePlayerIds]);

  const card = useMemo(() => {
    if (!selectedPlayerId || !games?.length || !gamePlayers?.length || !players?.length) return null;
    return makePlayerCard(selectedPlayerId, games, gamePlayers, players);
  }, [selectedPlayerId, games, gamePlayers, players]);

  const rankedPlayers = useMemo(() => {
    if (!stats?.length || !eligiblePlayers.length) return [];
    return ranking(stats, eligiblePlayers);
  }, [stats, eligiblePlayers]);

  const rankIndex = card ? rankedPlayers.findIndex((item: any) => item.id === card.id) : -1;

  const topPerformers = useMemo(() => {
    if (!eligiblePlayers.length || !gamePlayers?.length || !stats?.length) return null;

    const gamesPlayedCounts = eligiblePlayers.map((player: PlayerList) => ({
      name: player.name,
      stat: gamePlayers.filter((gp: any) => gp.person_id === player.id).length,
    }));
    const sortedGamesPlayed = [...gamesPlayedCounts].sort((a, b) => b.stat - a.stat);
    const topGamesStat = sortedGamesPlayed[0]?.stat;
    const mostGames = topGamesStat !== undefined
      ? sortedGamesPlayed.filter((item) => item.stat === topGamesStat)
      : [];

    const topRankStat = (rankedPlayers[0] as any)?.averagePosition;
    const topRanked = topRankStat !== undefined
      ? rankedPlayers.filter((item: any) => item.averagePosition === topRankStat)
      : [];

    // Returns every player tied for the top (or bottom, for makeBottom-based
    // categories) value in a leaderboard, not just the first one. Streak
    // leaderboards list every individual run, so a player can hold several
    // runs tied at the same length — dedupe down to one line per player.
    const topOf = (categoryName: string): { name: string; stat: number; date?: string }[] => {
      const fullList = stats.find((item: Stats) => item.name === categoryName)?.stats ?? [];
      const list = onlyActive ? fullList.filter((row: any) => activePlayerIds.has(row.person_id)) : fullList;
      if (!list.length) return [];
      const topStat = list[0].stat;
      const seen = new Set<number>();
      return list.filter((row: any) => {
        if (row.stat !== topStat || seen.has(row.person_id)) return false;
        seen.add(row.person_id);
        return true;
      });
    };

    return {
      mostGames,
      topRanked,
      totalProfit: topOf('all-time profits'),
      averageProfit: topOf('profit per game'),
      averageEquity: topOf('average equity'),
      longestWinStreak: topOf('longest win streak'),
      longestLossStreak: topOf('longest loss streak'),
      bestGame: topOf('top profits in a game'),
      worstGame: topOf('top losses in a game'),
    };
  }, [eligiblePlayers, gamePlayers, stats, rankedPlayers, onlyActive, activePlayerIds]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        selectedPlayerId ? (
          <Button variant="ghost" size="sm" colorScheme="teal" onPress={() => setSelectedPlayerId(null)}>
            CLEAR
          </Button>
        ) : (
          <ActivePlayersToggle value={onlyActive} onChange={setOnlyActive} />
        ),
    });
  }, [navigation, selectedPlayerId, onlyActive]);

  return (
    <Box h="100%" backgroundColor="black" px={4} py={4}>
      <VStack space={1} mb={4}>
        <Text fontSize="10" color="blueGray.400" ml={1}>PLAYER</Text>
        <Select
          color="white"
          placeholderTextColor="blueGray.400"
          selectedValue={selectedPlayerId !== null ? String(selectedPlayerId) : ''}
          placeholder="SELECT A PLAYER"
          onValueChange={(value) => setSelectedPlayerId(value ? Number(value) : null)}
        >
          {sortedPlayers.map((player: PlayerList) => (
            <Select.Item key={player.id} label={player.name.toUpperCase()} value={String(player.id)} />
          ))}
        </Select>
      </VStack>

      {!card ? (
        !topPerformers ? (
          <Center flex={1}>
            <Text color="blueGray.500">Not enough data yet.</Text>
          </Center>
        ) : (
          <ScrollView>
            <VStack space={3}>
              <Text color="white" fontSize="md" bold textAlign="center" mb={1}>
                TOP PERFORMERS
              </Text>
              <TopPerformerRow
                category="OVERALL RANK"
                entries={topPerformers.topRanked.map((item: any) => ({ name: item.name }))}
              />
              <TopPerformerRow
                category="GAMES PLAYED"
                entries={topPerformers.mostGames.map((item) => ({ name: item.name, value: String(item.stat) }))}
              />
              <TopPerformerRow
                category="TOTAL PROFIT"
                entries={topPerformers.totalProfit.map((item) => ({ name: item.name, value: formatMoney(item.stat) }))}
                valueColor="emerald.400"
              />
              <TopPerformerRow
                category="AVERAGE PROFIT"
                entries={topPerformers.averageProfit.map((item) => ({ name: item.name, value: formatMoney(item.stat) }))}
                valueColor="emerald.400"
              />
              <TopPerformerRow
                category="AVERAGE EQUITY"
                entries={topPerformers.averageEquity.map((item) => ({ name: item.name, value: formatMoney(item.stat) }))}
              />
              <TopPerformerRow
                category="LONGEST WIN STREAK"
                entries={topPerformers.longestWinStreak.map((item) => ({ name: item.name, value: String(item.stat) }))}
                valueColor="emerald.400"
              />
              <TopPerformerRow
                category="LONGEST LOSS STREAK"
                entries={topPerformers.longestLossStreak.map((item) => ({ name: item.name, value: String(item.stat) }))}
                valueColor="red.400"
              />
              <TopPerformerRow
                category="BEST GAME"
                entries={topPerformers.bestGame.map((item) => ({
                  name: item.name,
                  value: `${formatMoney(item.stat)} (${item.date ? formatDateBR(item.date) : ''})`,
                }))}
                valueColor="emerald.400"
              />
              <TopPerformerRow
                category="WORST GAME"
                entries={topPerformers.worstGame.map((item) => ({
                  name: item.name,
                  value: `${formatMoney(item.stat)} (${item.date ? formatDateBR(item.date) : ''})`,
                }))}
                valueColor="red.400"
              />
            </VStack>
          </ScrollView>
        )
      ) : (
        <VStack space={6} flex={1}>
          <VStack space={1}>
            <Text color="white" fontSize="lg" bold textAlign="center">
              {card.name.toUpperCase()}
            </Text>
            {rankIndex >= 0 ? (
              <HStack space={1} justifyContent="center" alignItems="baseline">
                <Text color="blueGray.500" fontSize="10">OVERALL RANK</Text>
                <Text color="teal.300" fontSize="sm" bold>#{rankIndex + 1}</Text>
                <Text color="blueGray.500" fontSize="10">OF {rankedPlayers.length}</Text>
              </HStack>
            ) : (
              <Text color="blueGray.500" fontSize="10" textAlign="center">NOT ENOUGH GAMES TO RANK</Text>
            )}
          </VStack>

          <VStack>
            <SectionHeader title="OVERVIEW" />
            <HStack flexWrap="wrap" justifyContent="space-between">
              <StatTile label="GAMES PLAYED" value={String(card.games_played)} />
              <StatTile
                label="TOTAL PROFIT"
                value={formatMoney(card.profit)}
                color={card.profit > 0 ? 'emerald.400' : card.profit < 0 ? 'red.400' : 'white'}
              />
              <StatTile label="AVERAGE EQUITY" value={formatMoney(card.average_equity)} />
              <StatTile
                label="AVERAGE PROFIT"
                value={formatMoney(card.average_profit)}
                color={card.average_profit > 0 ? 'emerald.400' : card.average_profit < 0 ? 'red.400' : 'white'}
              />
              <StatTile
                label="POSITIVE GAMES"
                value={`${card.positive_games}/${card.games_played} (${formatPercent(card.positive_ratio)})`}
              />
              <StatTile
                label="ATTENDANCE RATE"
                value={`${formatPercent(card.attendance_rate)} (${card.games_played}/${card.games_since_joined})`}
              />
              <StatTile label="REBUYS PER GAME" value={formatMoney(card.rebuys_per_game)} />
            </HStack>
          </VStack>

          <VStack>
            <StreakTableHeader />
            <StreakRow
              label="ATTENDANCE"
              current={String(card.attendance_current)}
              longest={String(card.attendance_longest)}
            />
            <StreakRow
              label="WIN"
              current={`${card.win_current} (${formatMoney(card.win_current_profit)})`}
              longest={`${card.win_longest} (${formatMoney(card.win_longest_profit)})`}
              color="emerald.400"
            />
            <StreakRow
              label="LOSS"
              current={`${card.loss_current} (${formatMoney(card.loss_current_profit)})`}
              longest={`${card.loss_longest} (${formatMoney(card.loss_longest_profit)})`}
              color="red.400"
            />
          </VStack>

          <VStack>
            <SectionHeader title="RECORDS" />
            <HStack flexWrap="wrap" justifyContent="space-between">
              <StatTile
                label="BEST GAME"
                value={card.best_game ? `${formatMoney(card.best_game.profit)} (${formatDateBR(card.best_game.date)})` : 'N/A'}
                color="emerald.400"
              />
              <StatTile
                label="WORST GAME"
                value={card.worst_game ? `${formatMoney(card.worst_game.profit)} (${formatDateBR(card.worst_game.date)})` : 'N/A'}
                color="red.400"
              />
            </HStack>
          </VStack>
        </VStack>
      )}
    </Box>
  );
}
