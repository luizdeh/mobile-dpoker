const url = "http://localhost:8080/api/games";

export const getAllGames = async () => {
  try {
    const res = await fetch(url);
    const list = res.json();
    return list;
  } catch (error) {
    console.log("[ERROR] getAllGames() =>", error.message);
  }
};
