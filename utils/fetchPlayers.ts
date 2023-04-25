const url = "http://localhost:8080/api/persons";

export const getPlayers = async () => {
  try {
    const res = await fetch(url);
    const list = res.json();
    return list;
  } catch (error) {
    console.log("[ERROR] getPlayers() =>", error.message);
  }
};
