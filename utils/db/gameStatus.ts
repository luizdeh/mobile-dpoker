const url = "http://localhost:8080/api/game/";

export const gameStatus = async (gameId: number, status: string) => {
  const urlWithId = `${url}${gameId}`;
  try {
    const res = await fetch(urlWithId, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: status }),
    });
    const game = await res.json();
    return game;
  } catch (error) {
    console.log("[ERROR] gameStatus() =>", error.message);
  }
};
