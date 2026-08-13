import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_PREFIX = "dpoker_chip_counts_";

export type ChipCounts = Record<number, { final_chips: number; chips_counted: boolean }>;

export const loadChipCounts = async (gameId: number): Promise<ChipCounts> => {
  const stored = await AsyncStorage.getItem(`${STORAGE_PREFIX}${gameId}`);
  return stored ? JSON.parse(stored) : {};
};

export const saveChipCounts = async (gameId: number, counts: ChipCounts): Promise<void> => {
  await AsyncStorage.setItem(`${STORAGE_PREFIX}${gameId}`, JSON.stringify(counts));
};

export const clearChipCounts = async (gameId: number): Promise<void> => {
  await AsyncStorage.removeItem(`${STORAGE_PREFIX}${gameId}`);
};
