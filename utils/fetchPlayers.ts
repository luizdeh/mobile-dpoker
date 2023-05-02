const url = "http://localhost:8080/api/persons";

export const getPlayers = async () => {
  try {
    const res = await fetch(url);
    const list = await res.json();
    const newList = list.map((item: any) => { return { ...item, active: false } })
    return newList;
  } catch (error) {
    console.log("[ERROR] getPlayers() =>", error.message);
  }
};
