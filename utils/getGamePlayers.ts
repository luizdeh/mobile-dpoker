const url = "http://localhost:8080/api/gamePlayers";

export const getGamePlayers = async () => {
  try {
    const res = await fetch(url);
    const list = res.json();
    return list;
  } catch (error) {
    console.log("[ERROR] getGamePlayers() =>", error.message);
  }
};
