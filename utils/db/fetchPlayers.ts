const url = "http://localhost:8080/api/persons";

export const getPlayers = async () => {
  try {
    const res = await fetch(url);
    const list = await res.json();
    const inactiveIds = [15, 16]
    const newList = list.map((item: any) => {
      const isInactive = inactiveIds.includes(item.id);
      const is_active = isInactive ? 0 : 1
      return { ...item, active: false, is_active }
    })
    return newList;
  } catch (error: any) {
    console.log("[ERROR] getPlayers() =>", error.message);
  }
};