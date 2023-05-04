const url = "http://localhost:8080/api/game/finalize/"

export const endGame = async (id: number) => {
  const urlWithId = `${url}${id}`
  try {
    const res = await fetch(urlWithId, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
    });
    const end = await res.json();
    return end;
  } catch (error) {
    console.log("[ERROR] endGame() =>", error.message);
  }
};
