const url = "http://localhost:8080/api/gamePlayer/"

export const addRebuy = async (id: number) => {
  const urlWithId = `${url}${id}/rebuy`
  try {
    const res = await fetch(urlWithId, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
    });
    const addedRebuy = await res.json();
    return addedRebuy;
  } catch (error) {
    console.log("[ERROR] addRebuy() =>", error.message);
  }
};
