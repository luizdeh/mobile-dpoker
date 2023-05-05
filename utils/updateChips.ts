const url = "http://localhost:8080/api/gamePlayer/";

export const updateChips = async (id: number, chips: number) => {
  const urlWithId = `${url}${id}/chips/${chips}`;
  try {
    const res = await fetch(urlWithId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const success = await res.json();
    return success;
  } catch (error) {
    console.log(`[ERROR] updateChips(${id}) => ${error.message}`);
    return { error }
  }
};
