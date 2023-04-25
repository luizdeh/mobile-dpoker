const url = "http://localhost:8080/api/game";

export const createNewGame = async (gameData: {}) => {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gameData),
    });
    const game = await res.json();
    console.log(game);
    return game;
  } catch (error) {
    console.log("[ERROR] createNewGame() =>", error.message);
  }
};
