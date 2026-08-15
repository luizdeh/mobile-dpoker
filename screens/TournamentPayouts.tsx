import React, { useEffect, useMemo, useState } from "react";
import { Text, HStack, Box, VStack, Divider, Button, IconButton, Input, ScrollView, useToast } from "native-base";
import { AntDesign } from "@expo/vector-icons";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getTournamentPlayers } from "../utils/db/getTournamentPlayers";
import { setTournamentPayouts } from "../utils/db/setTournamentPayouts";
import { setTournamentPrize } from "../utils/db/setTournamentPrize";
import { endTournament } from "../utils/db/endTournament";
import { releaseTournamentLock } from "../utils/db/releaseTournamentLock";
import { TournamentPlayer, TournamentParamsNavigation } from "../lib/types";
import { ordinal } from "../lib/ordinal";
import useGamesContext from "../context/useGamesContext";
import useTournamentsContext from "../context/useTournamentsContext";

export default function TournamentPayouts() {
  const { players } = useGamesContext();
  const { fetchTournaments, fetchTournamentPlayers, fetchTournamentPayouts } = useTournamentsContext();
  const toast = useToast();

  const route = useRoute<RouteProp<TournamentParamsNavigation, "TournamentPayouts">>();
  const tournament = route.params.tournament;

  const navigation = useNavigation<NativeStackNavigationProp<TournamentParamsNavigation>>();

  const [entries, setEntries] = useState<TournamentPlayer[]>([]);
  const [payoutPositions, setPayoutPositions] = useState<{ position: number; percentage: string }[]>([
    { position: 1, percentage: "50" },
    { position: 2, percentage: "30" },
    { position: 3, percentage: "20" },
  ]);
  const [prizes, setPrizes] = useState<Record<number, string>>({});
  const [splits, setSplits] = useState<Record<number, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const tournamentPlayers = await getTournamentPlayers();
      const withNames = (tournamentPlayers ?? [])
        .filter((item: any) => item.tournament_id === tournament.id)
        .map((item: any) => ({
          ...item,
          name: (players ?? []).find((player: any) => player.id === item.person_id)?.name ?? "",
        }))
        .sort((a: any, b: any) => (a.finish_position ?? Infinity) - (b.finish_position ?? Infinity));
      setEntries(withNames);
    })();
  }, [tournament]);

  const entrantCount = entries.length;
  const totalPool = useMemo(
    () => entries.reduce((sum, entry) => sum + tournament.buy_in_value + entry.quantity_rebuy * tournament.re_buy_value, 0),
    [entries, tournament]
  );

  const totalPercentage = payoutPositions.reduce((sum, item) => sum + (Number(item.percentage) || 0), 0);

  // The prize a position is entitled to under the current payout structure,
  // ignoring any manual edits sitting in the `prizes` input state — this is
  // what decides split eligibility and what a split group's pot is made of.
  const basePrizeFor = (entry: TournamentPlayer) => {
    const payout = payoutPositions.find((p) => p.position === entry.finish_position);
    const pct = payout ? Number(payout.percentage) || 0 : 0;
    return (pct / 100) * totalPool;
  };

  const handlePercentageChange = (position: number, value: string) => {
    setPayoutPositions((prev) => prev.map((item) => (item.position === position ? { ...item, percentage: value } : item)));
  };

  const addPayoutPosition = () => {
    setPayoutPositions((prev) => [...prev, { position: prev.length + 1, percentage: "0" }]);
  };

  const removePayoutPosition = () => {
    setPayoutPositions((prev) => prev.slice(0, -1));
  };

  const applyStructure = () => {
    const nextPrizes: Record<number, string> = {};
    entries.forEach((entry) => {
      nextPrizes[entry.id] = basePrizeFor(entry).toFixed(2);
    });
    const groupIds = entries.filter((e) => splits[e.id]).map((e) => e.id);
    if (groupIds.length >= 2) {
      const groupEntries = entries.filter((e) => groupIds.includes(e.id));
      const total = groupEntries.reduce((sum, e) => sum + basePrizeFor(e), 0);
      const share = (total / groupIds.length).toFixed(2);
      groupIds.forEach((id) => {
        nextPrizes[id] = share;
      });
    }
    setPrizes(nextPrizes);
  };

  // Split only makes sense between two-or-more paid positions: toggling
  // recomputes just the entries that were in the old or new group, averaging
  // the paid group's combined base prize evenly and reverting anyone who
  // dropped out (or a lone leftover member) back to their own base prize.
  const toggleSplit = (id: number) => {
    const targetEntry = entries.find((e) => e.id === id);
    if (targetEntry && basePrizeFor(targetEntry) <= 0) return;

    const nextSplits = { ...splits, [id]: !splits[id] };
    const oldGroupIds = new Set(entries.filter((e) => splits[e.id]).map((e) => e.id));
    const newGroupIds = new Set(entries.filter((e) => nextSplits[e.id]).map((e) => e.id));
    const affectedIds = new Set([...oldGroupIds, ...newGroupIds]);

    setPrizes((prevPrizes) => {
      const nextPrizes = { ...prevPrizes };
      if (newGroupIds.size >= 2) {
        const groupEntries = entries.filter((e) => newGroupIds.has(e.id));
        const total = groupEntries.reduce((sum, e) => sum + basePrizeFor(e), 0);
        const share = (total / newGroupIds.size).toFixed(2);
        newGroupIds.forEach((gid) => {
          nextPrizes[gid] = share;
        });
      }
      affectedIds.forEach((aid) => {
        if (!newGroupIds.has(aid) || newGroupIds.size === 1) {
          const entry = entries.find((e) => e.id === aid);
          if (entry) nextPrizes[aid] = basePrizeFor(entry).toFixed(2);
        }
      });
      return nextPrizes;
    });

    setSplits(nextSplits);
  };

  const totalPrizesAssigned = entries.reduce((sum, entry) => sum + (Number(prizes[entry.id]) || 0), 0);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    const payoutsResult: any = await setTournamentPayouts(
      tournament.id,
      payoutPositions.map((p) => ({ position: p.position, percentage: Number(p.percentage) || 0 }))
    );
    if (payoutsResult?.error) {
      setIsSaving(false);
      setSaveError("Failed to save the payout structure. Please try again.");
      return;
    }

    const failedPrizes: string[] = [];
    for (const entry of entries) {
      const prizeAmount = Number(prizes[entry.id]) || 0;
      const result: any = await setTournamentPrize(entry.id, prizeAmount, !!splits[entry.id]);
      if (result?.error) failedPrizes.push(entry.name ?? "");
    }
    if (failedPrizes.length) {
      setIsSaving(false);
      setSaveError(`Failed to save prizes for: ${failedPrizes.join(", ")}. Please try again.`);
      return;
    }

    const closed = await endTournament(tournament.id);
    if (!closed) {
      setIsSaving(false);
      setSaveError("Failed to close the tournament. Please try again.");
      return;
    }

    await Promise.all([fetchTournaments(), fetchTournamentPlayers(), fetchTournamentPayouts(), releaseTournamentLock(tournament.id)]);
    setIsSaving(false);
    toast.show({ description: "Tournament closed and prizes saved." });
    navigation.navigate("Home");
  };

  return (
    <Box backgroundColor="black" h="100%" w="100%">
      <Box flex={1} p={6} pb={3}>
        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          <VStack space={1} mb={4}>
            <Text fontSize="10" color="blueGray.400" bold>
              TOTAL POOL
            </Text>
            <Text fontSize="2xl" color="teal.300" bold>
              {totalPool.toFixed(2)}
            </Text>
            <Text fontSize="10" color="blueGray.500">
              {entrantCount} ENTRANTS
            </Text>
          </VStack>

          <Text fontSize="10" color="blueGray.400" bold mb={1}>
            PAYOUT STRUCTURE (%)
          </Text>
          <Divider mb="2" backgroundColor="blueGray.800" />
          <VStack space={2} mb={2}>
            {payoutPositions.map((item) => (
              <HStack key={item.position} alignItems="center" space={2}>
                <Text color="white" fontSize="sm" flex={1}>
                  {ordinal(item.position)}
                </Text>
                <Input
                  flex={1}
                  size="sm"
                  textAlign="center"
                  keyboardType="numeric"
                  value={item.percentage}
                  onChangeText={(val) => handlePercentageChange(item.position, val)}
                  color="teal.400"
                  backgroundColor="blueGray.800"
                  borderColor="blueGray.700"
                />
              </HStack>
            ))}
          </VStack>
          <HStack justifyContent="space-between" alignItems="center" mb={2}>
            <HStack space={2}>
              <IconButton
                size="sm"
                variant="ghost"
                _icon={{ as: AntDesign, name: "plus", size: "sm", color: "blueGray.400" }}
                onPress={addPayoutPosition}
              />
              <IconButton
                size="sm"
                variant="ghost"
                isDisabled={payoutPositions.length <= 1}
                _icon={{ as: AntDesign, name: "minus", size: "sm", color: "blueGray.400" }}
                onPress={removePayoutPosition}
              />
            </HStack>
            <Text fontSize="xs" color={totalPercentage === 100 ? "teal.300" : "orange.300"} bold>
              {totalPercentage}% OF POOL
            </Text>
          </HStack>
          <Button variant="outline" colorScheme="teal" size="sm" mb={4} onPress={applyStructure}>
            APPLY TO PLACEMENTS
          </Button>

          <Text fontSize="10" color="blueGray.400" bold mb={1}>
            PLACEMENTS
          </Text>
          <Divider mb="2" backgroundColor="blueGray.800" />
          <VStack space={2} mb={4}>
            {entries.map((entry, index) => {
              const eligibleForSplit = basePrizeFor(entry) > 0;
              return (
                <HStack
                  key={entry.id}
                  alignItems="center"
                  space={2}
                  px={2}
                  py={1}
                  backgroundColor={index % 2 === 0 ? "blueGray.900" : "transparent"}
                >
                  <VStack flex={2}>
                    <Text color="white" fontSize="sm" isTruncated>
                      {(entry.name ?? "").toUpperCase()}
                    </Text>
                    <Text color="blueGray.500" fontSize="10">
                      {entry.finish_position ? ordinal(entry.finish_position) : "—"}
                    </Text>
                  </VStack>
                  <Input
                    flex={2}
                    size="sm"
                    textAlign="center"
                    keyboardType="numeric"
                    value={prizes[entry.id] ?? ""}
                    onChangeText={(val) => setPrizes((prev) => ({ ...prev, [entry.id]: val }))}
                    color="teal.300"
                    backgroundColor="blueGray.800"
                    borderColor="blueGray.700"
                    placeholder="0.00"
                    placeholderTextColor="blueGray.600"
                  />
                  <IconButton
                    size="sm"
                    variant="ghost"
                    isDisabled={!eligibleForSplit}
                    onPress={() => toggleSplit(entry.id)}
                    _icon={{
                      as: AntDesign,
                      name: "team",
                      size: "sm",
                      color: splits[entry.id] ? "teal.300" : eligibleForSplit ? "blueGray.700" : "blueGray.900",
                    }}
                  />
                </HStack>
              );
            })}
            {!entries.length ? (
              <Text color="blueGray.400" fontSize="xs" textAlign="center" mt={2}>
                No entries found for this tournament.
              </Text>
            ) : null}
          </VStack>

          <HStack justifyContent="space-between" mb={2}>
            <Text fontSize="xs" color="blueGray.400">
              TOTAL PRIZES ASSIGNED
            </Text>
            <Text fontSize="xs" color={totalPrizesAssigned <= totalPool ? "blueGray.300" : "orange.300"} bold>
              {totalPrizesAssigned.toFixed(2)} / {totalPool.toFixed(2)}
            </Text>
          </HStack>
          {saveError ? (
            <Text color="red.400" fontSize="xs" textAlign="center" mb={2}>
              {saveError}
            </Text>
          ) : null}
        </ScrollView>
      </Box>
      <Box safeArea>
        <Button
          variant="solid"
          colorScheme="blueGray"
          width="100%"
          mb="0"
          minHeight="12"
          borderRadius="none"
          isDisabled={!entries.length || isSaving}
          isLoading={isSaving}
          onPress={handleSave}
        >
          SAVE & CLOSE TOURNAMENT
        </Button>
      </Box>
    </Box>
  );
}
