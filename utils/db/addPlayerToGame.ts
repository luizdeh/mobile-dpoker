const url = "http://localhost:8080/api/game/";

export const addPlayerToGame = async (gameId: number, personId: number) => {
  const urlWithIds = `${url}${gameId}/person/${personId}`;
  try {
    const res = await fetch(urlWithIds, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const game = await res.json();
    return game;
  } catch (error) {
    console.log("[ERROR] addPlayerToGame() =>", error.message);
  }
};
