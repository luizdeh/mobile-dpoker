import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  IconButton,
  Icon,
  Pressable,
  Center,
  ScrollView,
  Spinner,
} from "native-base";
import { AntDesign } from "@expo/vector-icons";
import useGamesContext from "../context/useGamesContext";
import useAuthContext from "../context/useAuthContext";
import { getExpenses } from "../utils/db/getExpenses";
import { addExpense } from "../utils/db/addExpense";
import { deleteExpense } from "../utils/db/deleteExpense";
import { getDonations } from "../utils/db/getDonations";
import { addDonation } from "../utils/db/addDonation";
import { deleteDonation } from "../utils/db/deleteDonation";
import { updateRakePaid } from "../utils/db/updateRakePaid";
import { setRakeWaived } from "../utils/db/setRakeWaived";
import { updateGameRakeValue } from "../utils/db/updateGameRakeValue";
import { Expense, Donation, Game, GamePlayer, PlayerList } from "../lib/types";
import { formatDateBR, todayBR, parseBRDateToISO } from "../lib/formatDate";
import FreePassDialog from "../components/FreePassDialog";
import EditRakeValueDialog from "../components/EditRakeValueDialog";

type Panel = "rake" | "expenses" | "players" | "donations";

// Rounds to the cent and drops a currency symbol/trailing zeros, e.g. 1015 (not "R$ 1015.00").
const formatAmount = (value: number) => (Math.round((value + Number.EPSILON) * 100) / 100).toString();

export default function Cash() {
  const { games, gamePlayers, players, setGamePlayers, setGames } = useGamesContext();
  const { canManage, role } = useAuthContext();
  const isAdmin = role === "admin";

  const [panel, setPanel] = useState<Panel>("rake");
  const [expandedGameId, setExpandedGameId] = useState<number | null>(null);
  const [showClosedRakeGames, setShowClosedRakeGames] = useState(false);
  const scrollViewRef = useRef<any>(null);

  const [freePassTarget, setFreePassTarget] = useState<Game | null>(null);
  const [isSavingFreePass, setIsSavingFreePass] = useState(false);
  const [editRakeTarget, setEditRakeTarget] = useState<Game | null>(null);
  const [isSavingRakeValue, setIsSavingRakeValue] = useState(false);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(todayBR());
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoadingDonations, setIsLoadingDonations] = useState(true);
  const [showAddDonations, setShowAddDonations] = useState(false);
  const [addDonationsDate, setAddDonationsDate] = useState(todayBR());
  const [donationAmounts, setDonationAmounts] = useState<Record<number, string>>({});
  const [isSavingDonations, setIsSavingDonations] = useState(false);
  const [expandedDonationPlayerId, setExpandedDonationPlayerId] = useState<number | null>(null);

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const loadExpenses = async () => {
    setIsLoadingExpenses(true);
    const data = await getExpenses();
    setExpenses(data);
    setIsLoadingExpenses(false);
  };

  const loadDonations = async () => {
    setIsLoadingDonations(true);
    const data = await getDonations();
    setDonations(data);
    setIsLoadingDonations(false);
  };

  useEffect(() => {
    loadExpenses();
    loadDonations();
  }, []);

  // Excludes waived games entirely — a free pass never counted toward what
  // was owed, so it shouldn't show up in any money total.
  const rakeValueByGameId = useMemo(() => {
    const map = new Map<number, number>();
    (games ?? []).forEach((game: Game) => {
      if (game.rake_value != null && !game.rake_waived) map.set(game.id, game.rake_value);
    });
    return map;
  }, [games]);

  const playerNameById = useMemo(
    () => new Map((players ?? []).map((player: PlayerList) => [player.id, player.name])),
    [players]
  );

  const rakeTrackedGames = useMemo(
    () =>
      (games ?? [])
        .filter((game: Game) => game.rake_value != null)
        .sort((a: Game, b: Game) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [games]
  );

  const rakeGamesWithStatus = useMemo(
    () =>
      rakeTrackedGames.map((game: Game) => {
        const rows = (gamePlayers ?? []).filter((gp: GamePlayer) => gp.game_id === game.id);
        const paidCount = rows.filter((gp: GamePlayer) => gp.rake_paid).length;
        const isFullyPaid = rows.length > 0 && paidCount === rows.length;
        return { game, rows, paidCount, isFullyPaid };
      }),
    [rakeTrackedGames, gamePlayers]
  );

  // Free-pass games stay in the always-visible list (that's the whole point
  // — show that the game happened and nothing was charged) rather than
  // getting lumped into the "fully collected, hide it" bucket.
  const openRakeGames = useMemo(
    () => rakeGamesWithStatus.filter((item) => item.game.rake_waived || !item.isFullyPaid),
    [rakeGamesWithStatus]
  );

  const closedRakeGames = useMemo(
    () => rakeGamesWithStatus.filter((item) => !item.game.rake_waived && item.isFullyPaid),
    [rakeGamesWithStatus]
  );

  const playerContributions = useMemo(() => {
    const map = new Map<number, { paidRake: number; unpaidRake: number; donations: number }>();
    const ensure = (id: number) => {
      if (!map.has(id)) map.set(id, { paidRake: 0, unpaidRake: 0, donations: 0 });
      return map.get(id)!;
    };
    (gamePlayers ?? []).forEach((gp: GamePlayer) => {
      const rakeValue = rakeValueByGameId.get(gp.game_id);
      if (!rakeValue) return;
      const entry = ensure(gp.person_id);
      if (gp.rake_paid) entry.paidRake += rakeValue;
      else entry.unpaidRake += rakeValue;
    });
    donations.forEach((donation) => {
      ensure(donation.person_id).donations += Number(donation.amount);
    });
    return Array.from(map.entries())
      .map(([personId, data]) => ({
        personId,
        total: data.paidRake + data.donations,
        unpaidRake: data.unpaidRake,
      }))
      .filter((item) => item.total > 0)
      .sort((a, b) =>
        (playerNameById.get(a.personId) ?? "").localeCompare(playerNameById.get(b.personId) ?? "")
      );
  }, [gamePlayers, donations, rakeValueByGameId, playerNameById]);

  const sortedPlayers = useMemo(
    () => [...(players ?? [])].sort((a: PlayerList, b: PlayerList) => a.name.localeCompare(b.name)),
    [players]
  );

  const sortedExpenses = useMemo(
    () => [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [expenses]
  );

  const donationSummaries = useMemo(() => {
    const byPlayer = new Map<number, Donation[]>();
    donations.forEach((donation) => {
      const list = byPlayer.get(donation.person_id) ?? [];
      list.push(donation);
      byPlayer.set(donation.person_id, list);
    });
    return Array.from(byPlayer.entries())
      .map(([personId, list]) => ({
        personId,
        total: list.reduce((sum, donation) => sum + Number(donation.amount), 0),
        donations: [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      }))
      .sort((a, b) =>
        (playerNameById.get(a.personId) ?? "").localeCompare(playerNameById.get(b.personId) ?? "")
      );
  }, [donations, playerNameById]);

  const totalExpectedRake = useMemo(
    () =>
      (gamePlayers ?? []).reduce((sum: number, gp: GamePlayer) => {
        const rakeValue = rakeValueByGameId.get(gp.game_id);
        return rakeValue ? sum + rakeValue : sum;
      }, 0),
    [gamePlayers, rakeValueByGameId]
  );

  const totalRakeCollected = useMemo(
    () =>
      (gamePlayers ?? []).reduce((sum: number, gp: GamePlayer) => {
        if (!gp.rake_paid) return sum;
        const rakeValue = rakeValueByGameId.get(gp.game_id);
        return rakeValue ? sum + rakeValue : sum;
      }, 0),
    [gamePlayers, rakeValueByGameId]
  );

  const totalDonations = useMemo(
    () => donations.reduce((sum, donation) => sum + Number(donation.amount), 0),
    [donations]
  );

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, expense) => sum + Number(expense.amount), 0),
    [expenses]
  );

  const cashOnHand = totalRakeCollected + totalDonations - totalExpenses;
  const collectedContributions = totalRakeCollected + totalDonations;
  const expectedContributions = totalExpectedRake + totalDonations;

  const handleToggleRakePaid = async (gamePlayer: GamePlayer) => {
    const nextPaid = !gamePlayer.rake_paid;
    setGamePlayers?.(
      (gamePlayers ?? []).map((item) =>
        item.id === gamePlayer.id ? { ...item, rake_paid: nextPaid } : item
      )
    );
    const result: any = await updateRakePaid(gamePlayer.id, nextPaid);
    if (result?.error) {
      setGamePlayers?.(
        (gamePlayers ?? []).map((item) =>
          item.id === gamePlayer.id ? { ...item, rake_paid: gamePlayer.rake_paid } : item
        )
      );
    }
  };

  const handleConfirmFreePass = async () => {
    if (!freePassTarget) return;
    const game = freePassTarget;
    const nextWaived = !game.rake_waived;
    setIsSavingFreePass(true);
    const result: any = await setRakeWaived(game.id, nextWaived);
    setIsSavingFreePass(false);
    if (result?.error) return;
    setGames?.((games ?? []).map((item) => (item.id === game.id ? { ...item, rake_waived: nextWaived } : item)));
    setFreePassTarget(null);
  };

  const handleConfirmRakeValue = async (value: number) => {
    if (!editRakeTarget) return;
    const game = editRakeTarget;
    setIsSavingRakeValue(true);
    const result: any = await updateGameRakeValue(game.id, value);
    setIsSavingRakeValue(false);
    if (result?.error) return;
    setGames?.((games ?? []).map((item) => (item.id === game.id ? { ...item, rake_value: value } : item)));
    setEditRakeTarget(null);
  };

  const handleAddExpense = async () => {
    const parsedAmount = Number(amount);
    if (!description.trim() || !amount || parsedAmount <= 0) return;
    setIsAddingExpense(true);
    const created = await addExpense(
      description.trim(),
      parsedAmount,
      parseBRDateToISO(expenseDate || todayBR())
    );
    setIsAddingExpense(false);
    if (created) {
      setExpenses((prev) => [created, ...prev]);
      setDescription("");
      setAmount("");
      setExpenseDate(todayBR());
    }
  };

  const handleDeleteExpense = async (id: number) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    const success = await deleteExpense(id);
    if (!success) loadExpenses();
  };

  const donationEntries = Object.entries(donationAmounts).filter(
    ([, value]) => value && Number(value) > 0
  );

  const handleSaveDonations = async () => {
    if (!donationEntries.length) return;
    const dateValue = parseBRDateToISO(addDonationsDate || todayBR());
    setIsSavingDonations(true);
    const results = await Promise.all(
      donationEntries.map(([playerId, value]) =>
        addDonation(Number(playerId), Number(value), dateValue)
      )
    );
    setIsSavingDonations(false);
    const created = results.filter((result): result is Donation => !!result);
    if (created.length) {
      setDonations((prev) => [...created, ...prev]);
      setDonationAmounts({});
      setAddDonationsDate(todayBR());
      setShowAddDonations(false);
    }
  };

  const handleDeleteDonation = async (id: number) => {
    setDonations((prev) => prev.filter((donation) => donation.id !== id));
    const success = await deleteDonation(id);
    if (!success) loadDonations();
  };

  const renderRakeGameCard = (item: { game: Game; rows: GamePlayer[]; paidCount: number }) => {
    const { game, rows, paidCount } = item;
    const isExpanded = expandedGameId === game.id;
    return (
      <VStack key={game.id} backgroundColor="blueGray.800" borderRadius="sm" overflow="hidden">
        <Pressable
          onPress={() => setExpandedGameId((prev) => (prev === game.id ? null : game.id))}
        >
          <HStack justifyContent="space-between" alignItems="center" px={3} py={3}>
            <Text color="white" fontSize="sm" bold>
              {formatDateBR(game.date)}
            </Text>
            {game.rake_waived ? (
              <Text fontSize="xs" color="blueGray.400" bold>
                FREE PASS
              </Text>
            ) : (
              <Text
                fontSize="xs"
                color={rows.length && paidCount === rows.length ? "teal.300" : "blueGray.400"}
              >
                {paidCount} / {rows.length}
              </Text>
            )}
          </HStack>
        </Pressable>
        {isExpanded ? (
          <VStack pb={3} pt={1} borderTopWidth={1} borderColor="blueGray.700">
            {game.rake_waived ? (
              <Text color="blueGray.400" fontSize="xs" px={3} pb={2}>
                No rake was charged for this game.
              </Text>
            ) : (
              rows.map((gp: GamePlayer, index: number) => (
                <Pressable key={gp.id} onPress={() => handleToggleRakePaid(gp)} isDisabled={!canManage}>
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    px={3}
                    py={1}
                    backgroundColor={index % 2 === 0 ? "blueGray.900" : "transparent"}
                  >
                    <Text color="white" fontSize="sm" flexShrink={1} isTruncated>
                      {(playerNameById.get(gp.person_id) ?? gp.name ?? "").toUpperCase()}
                    </Text>
                    <Icon
                      as={AntDesign}
                      name={gp.rake_paid ? "checkcircle" : "checkcircleo"}
                      size="sm"
                      color={gp.rake_paid ? "teal.300" : "blueGray.600"}
                    />
                  </HStack>
                </Pressable>
              ))
            )}
            {isAdmin ? (
              <HStack space={2} mx={3} mt={2}>
                <Button
                  flex={1}
                  variant="solid"
                  colorScheme="teal"
                  size="sm"
                  onPress={() => setFreePassTarget(game)}
                >
                  {game.rake_waived ? "UNDO FREE PASS" : "FREE PASS"}
                </Button>
                <Button
                  flex={1}
                  variant="outline"
                  colorScheme="teal"
                  size="sm"
                  onPress={() => setEditRakeTarget(game)}
                >
                  EDIT VALUE
                </Button>
              </HStack>
            ) : null}
          </VStack>
        ) : null}
      </VStack>
    );
  };

  const visiblePanels: { key: Panel; label: string }[] = [
    { key: "rake", label: "RAKE" },
    { key: "expenses", label: "EXPENSES" },
    { key: "players", label: "PLAYERS" },
    { key: "donations", label: "DONATIONS" },
  ];

  return (
    <Box backgroundColor="black" h="100%" w="100%">
      <Box flex={1} p={6} pb={3}>
        <Center mb={4}>
          <Text fontSize="3xl" color="teal.300" bold>
            {formatAmount(cashOnHand)}
          </Text>
          <HStack space={6} mt={2}>
            <VStack alignItems="center">
              <Text fontSize="10" color="blueGray.400">TOTAL EXPENSES</Text>
              <Text fontSize="sm" color="blueGray.300" bold>
                {formatAmount(totalExpenses)}
              </Text>
            </VStack>
            <VStack alignItems="center">
              <Text fontSize="10" color="blueGray.400">CONTRIBUTIONS</Text>
              <Text fontSize="sm" bold>
                <Text color={collectedContributions === expectedContributions ? "blueGray.300" : "orange.300"}>
                  {formatAmount(collectedContributions)}
                </Text>
                <Text color="blueGray.300"> / {formatAmount(expectedContributions)}</Text>
              </Text>
            </VStack>
          </HStack>
        </Center>
        <HStack space={1} mb={4}>
          {visiblePanels.map((item) => (
            <Button
              key={item.key}
              flex={1}
              px={1}
              variant="solid"
              colorScheme={panel === item.key ? "teal" : "blueGray"}
              onPress={() => setPanel(item.key)}
              _text={{ fontSize: "xs" }}
            >
              {item.label}
            </Button>
          ))}
        </HStack>
        <ScrollView ref={scrollViewRef} flex={1} showsVerticalScrollIndicator={false}>
          {panel === "rake" ? (
            <VStack space={2}>
              {openRakeGames.map((item) => renderRakeGameCard(item))}
              {!openRakeGames.length && !closedRakeGames.length ? (
                <Text color="blueGray.400" fontSize="xs" textAlign="center" mt={4}>
                  No rake-tracked games yet.
                </Text>
              ) : null}
              {closedRakeGames.length ? (
                <Pressable onPress={() => setShowClosedRakeGames((prev) => !prev)}>
                  <HStack justifyContent="center" alignItems="center" space={1} py={2}>
                    <Icon
                      as={AntDesign}
                      name={showClosedRakeGames ? "up" : "down"}
                      size="2xs"
                      color="blueGray.400"
                    />
                    <Text color="blueGray.400" fontSize="xs" bold>
                      {showClosedRakeGames ? "HIDE GAMES" : "SHOW GAMES"}
                    </Text>
                  </HStack>
                </Pressable>
              ) : null}
              {showClosedRakeGames ? (
                <>
                  {closedRakeGames.map((item) => renderRakeGameCard(item))}
                  <Pressable onPress={scrollToTop}>
                    <HStack justifyContent="center" alignItems="center" space={1} py={2}>
                      <Icon as={AntDesign} name="totop" size="2xs" color="blueGray.400" />
                      <Text color="blueGray.400" fontSize="xs" bold>
                        GO TO TOP
                      </Text>
                    </HStack>
                  </Pressable>
                </>
              ) : null}
            </VStack>
          ) : null}

          {panel === "expenses" ? (
            <VStack space={2}>
              {canManage ? (
                <VStack space={2} mb={2}>
                  <Input
                    value={description}
                    onChangeText={setDescription}
                    placeholder="DESCRIPTION"
                    color="white"
                    placeholderTextColor="blueGray.400"
                    borderColor="blueGray.700"
                    backgroundColor="blueGray.900"
                  />
                  <HStack space={2}>
                    <Input
                      flex={1}
                      value={amount}
                      onChangeText={setAmount}
                      placeholder="AMOUNT"
                      keyboardType="numeric"
                      color="white"
                      placeholderTextColor="blueGray.400"
                      borderColor="blueGray.700"
                      backgroundColor="blueGray.900"
                    />
                    <Input
                      flex={1}
                      value={expenseDate}
                      onChangeText={setExpenseDate}
                      placeholder="DD/MM/YYYY"
                      color="white"
                      placeholderTextColor="blueGray.400"
                      borderColor="blueGray.700"
                      backgroundColor="blueGray.900"
                    />
                  </HStack>
                  <Button
                    variant="solid"
                    colorScheme="blueGray"
                    isDisabled={!description.trim() || !amount || isAddingExpense}
                    isLoading={isAddingExpense}
                    onPress={handleAddExpense}
                  >
                    ADD EXPENSE
                  </Button>
                </VStack>
              ) : null}
              {isLoadingExpenses ? (
                <Center py={8}>
                  <Spinner color="emerald.600" />
                </Center>
              ) : (
                <>
                  {sortedExpenses.map((expense, index) => (
                    <HStack
                      key={expense.id}
                      justifyContent="space-between"
                      alignItems="center"
                      px={2}
                      py={2}
                      backgroundColor={index % 2 === 0 ? "blueGray.900" : "transparent"}
                    >
                      <VStack flexShrink={1}>
                        <Text fontSize="sm" color="white" isTruncated>
                          {expense.description}
                        </Text>
                        <Text fontSize="10" color="blueGray.500">
                          {formatDateBR(expense.date)}
                        </Text>
                      </VStack>
                      <HStack alignItems="center" space={2}>
                        <Text fontSize="sm" color="blueGray.300">
                          {formatAmount(Number(expense.amount))}
                        </Text>
                        {canManage ? (
                          <IconButton
                            size="sm"
                            variant="ghost"
                            colorScheme="blueGray"
                            _icon={{ as: AntDesign, name: "delete", size: "sm", color: "blueGray.500" }}
                            onPress={() => handleDeleteExpense(expense.id)}
                          />
                        ) : null}
                      </HStack>
                    </HStack>
                  ))}
                  {!expenses.length ? (
                    <Text color="blueGray.400" fontSize="xs" textAlign="center" mt={4}>
                      No expenses logged yet.
                    </Text>
                  ) : null}
                </>
              )}
            </VStack>
          ) : null}

          {panel === "players" ? (
            <VStack space={0}>
              {playerContributions.map((item, index) => (
                <HStack
                  key={item.personId}
                  justifyContent="space-between"
                  alignItems="center"
                  px={2}
                  py={2}
                  backgroundColor={index % 2 === 0 ? "blueGray.900" : "transparent"}
                >
                  <Text color="white" fontSize="sm" flexShrink={1} isTruncated>
                    {(playerNameById.get(item.personId) ?? "").toUpperCase()}
                  </Text>
                  <HStack space={2} alignItems="center">
                    {item.unpaidRake > 0 ? (
                      <>
                        <Text color="orange.400" fontSize="sm" bold>
                          {formatAmount(item.unpaidRake)}
                        </Text>
                        <Text color="blueGray.600" fontSize="sm">|</Text>
                      </>
                    ) : null}
                    <Text color="teal.300" fontSize="sm" bold>
                      {formatAmount(item.total)}
                    </Text>
                  </HStack>
                </HStack>
              ))}
              {!playerContributions.length ? (
                <Text color="blueGray.400" fontSize="xs" textAlign="center" mt={4}>
                  No players have paid anything yet.
                </Text>
              ) : null}
            </VStack>
          ) : null}

          {panel === "donations" ? (
            <VStack space={2}>
              {canManage ? (
                <VStack space={2} mb={2}>
                  <Button
                    variant="solid"
                    colorScheme={showAddDonations ? "blueGray" : "emerald"}
                    onPress={() => setShowAddDonations((prev) => !prev)}
                  >
                    {showAddDonations ? "CANCEL" : "ADD DONATIONS"}
                  </Button>
                  {showAddDonations ? (
                    <VStack space={2}>
                      <HStack alignItems="center" space={2}>
                        <Text fontSize="10" color="blueGray.400" bold>
                          DATE
                        </Text>
                        <Input
                          flex={1}
                          size="sm"
                          value={addDonationsDate}
                          onChangeText={setAddDonationsDate}
                          placeholder="DD/MM/YYYY"
                          color="white"
                          placeholderTextColor="blueGray.400"
                          borderColor="blueGray.700"
                          backgroundColor="blueGray.900"
                        />
                      </HStack>
                      {sortedPlayers.map((player: PlayerList) => (
                        <HStack key={player.id} alignItems="center" space={2}>
                          <Text color="white" fontSize="sm" flex={1} isTruncated>
                            {player.name.toUpperCase()}
                          </Text>
                          <Input
                            flex={1}
                            size="sm"
                            value={donationAmounts[player.id] ?? ""}
                            onChangeText={(val) =>
                              setDonationAmounts((prev) => ({ ...prev, [player.id]: val }))
                            }
                            placeholder="AMOUNT"
                            keyboardType="numeric"
                            color="white"
                            placeholderTextColor="blueGray.400"
                            borderColor="blueGray.700"
                            backgroundColor="blueGray.900"
                          />
                        </HStack>
                      ))}
                      <Button
                        variant="solid"
                        colorScheme="teal"
                        isDisabled={!donationEntries.length || isSavingDonations}
                        isLoading={isSavingDonations}
                        onPress={handleSaveDonations}
                      >
                        SAVE DONATIONS
                      </Button>
                    </VStack>
                  ) : null}
                </VStack>
              ) : null}
              {isLoadingDonations ? (
                <Center py={8}>
                  <Spinner color="emerald.600" />
                </Center>
              ) : (
                <>
                  {donationSummaries.map((summary) => {
                    const isExpanded = expandedDonationPlayerId === summary.personId;
                    return (
                      <VStack
                        key={summary.personId}
                        backgroundColor="blueGray.800"
                        borderRadius="sm"
                        overflow="hidden"
                      >
                        <Pressable
                          onPress={() =>
                            setExpandedDonationPlayerId((prev) =>
                              prev === summary.personId ? null : summary.personId
                            )
                          }
                        >
                          <HStack justifyContent="space-between" alignItems="center" px={3} py={3}>
                            <Text color="white" fontSize="sm" bold flexShrink={1} isTruncated>
                              {(playerNameById.get(summary.personId) ?? "").toUpperCase()}
                            </Text>
                            <Text color="teal.300" fontSize="sm" bold>
                              {formatAmount(summary.total)}
                            </Text>
                          </HStack>
                        </Pressable>
                        {isExpanded ? (
                          <VStack pb={3} pt={1} borderTopWidth={1} borderColor="blueGray.700">
                            {summary.donations.map((donation, index) => (
                              <HStack
                                key={donation.id}
                                justifyContent="space-between"
                                alignItems="center"
                                px={3}
                                py={1}
                                backgroundColor={index % 2 === 0 ? "blueGray.900" : "transparent"}
                              >
                                <Text fontSize="xs" color="blueGray.400">
                                  {formatDateBR(donation.date)}
                                </Text>
                                <HStack alignItems="center" space={2}>
                                  <Text fontSize="sm" color="blueGray.300">
                                    {formatAmount(Number(donation.amount))}
                                  </Text>
                                  {canManage ? (
                                    <IconButton
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="blueGray"
                                      _icon={{
                                        as: AntDesign,
                                        name: "delete",
                                        size: "sm",
                                        color: "blueGray.500",
                                      }}
                                      onPress={() => handleDeleteDonation(donation.id)}
                                    />
                                  ) : null}
                                </HStack>
                              </HStack>
                            ))}
                          </VStack>
                        ) : null}
                      </VStack>
                    );
                  })}
                  {!donationSummaries.length ? (
                    <Text color="blueGray.400" fontSize="xs" textAlign="center" mt={4}>
                      No donations logged yet.
                    </Text>
                  ) : null}
                </>
              )}
            </VStack>
          ) : null}
        </ScrollView>
      </Box>
      {freePassTarget ? (
        <FreePassDialog
          gameDate={formatDateBR(freePassTarget.date)}
          willWaive={!freePassTarget.rake_waived}
          isOpen={!!freePassTarget}
          onClose={() => setFreePassTarget(null)}
          onConfirm={handleConfirmFreePass}
          isSaving={isSavingFreePass}
        />
      ) : null}
      {editRakeTarget ? (
        <EditRakeValueDialog
          gameDate={formatDateBR(editRakeTarget.date)}
          currentValue={editRakeTarget.rake_value ?? 5}
          isOpen={!!editRakeTarget}
          onClose={() => setEditRakeTarget(null)}
          onConfirm={handleConfirmRakeValue}
          isSaving={isSavingRakeValue}
        />
      ) : null}
    </Box>
  );
}
