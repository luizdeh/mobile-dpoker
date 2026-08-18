import { SeatAssignment, SeatingTable } from "./types";

const POSITIONS_BY_SIZE: Record<number, string[]> = {
  9: ["DEALER", "SMALL BLIND", "BIG BLIND", "UTG", "UTG+1", "MP", "MP+1", "HJ", "CO"],
  8: ["DEALER", "SMALL BLIND", "BIG BLIND", "UTG", "UTG+1", "MP", "HJ", "CO"],
  7: ["DEALER", "SMALL BLIND", "BIG BLIND", "UTG", "MP", "HJ", "CO"],
  6: ["DEALER", "SMALL BLIND", "BIG BLIND", "UTG", "HJ", "CO"],
  5: ["DEALER", "SMALL BLIND", "BIG BLIND", "HJ", "CO"],
};

const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const assignPositions = (entrants: { id: number; name: string }[]): SeatAssignment[] => {
  const positions = POSITIONS_BY_SIZE[entrants.length];
  return entrants.map((entrant, index) => ({
    position: positions[index],
    person_id: entrant.id,
    name: entrant.name,
  }));
};

// Randomizes both table assignment and seat position, once, at tournament
// creation. Max 9 players per table, so the player pool is spread across
// ceil(n/9) tables as evenly as possible, with any remainder seated one at
// a time starting from the main table (e.g. 19 players -> 7/6/6).
export const randomizeSeating = (entrants: { id: number; name: string }[]): SeatingTable[] => {
  const shuffled = shuffle(entrants);
  const total = shuffled.length;
  const tableCount = Math.ceil(total / 9);
  const baseCount = Math.floor(total / tableCount);
  const remainder = total % tableCount;

  const tables: SeatingTable[] = [];
  let cursor = 0;
  for (let i = 0; i < tableCount; i++) {
    const count = baseCount + (i < remainder ? 1 : 0);
    tables.push({
      label: i === 0 ? "MAIN TABLE" : `TABLE ${i + 1}`,
      seats: assignPositions(shuffled.slice(cursor, cursor + count)),
    });
    cursor += count;
  }
  return tables;
};
