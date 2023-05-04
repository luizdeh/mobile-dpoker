const url = "http://localhost:8080/api/person/";

export const updatePlayer = async (id: number, name: string) => {
  const urlWithId = `${url}${id}`;
  try {
    const res = await fetch(urlWithId, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: name }),
    });
    const success = await res.json();
    return success;
  } catch (error) {
    console.log("[ERROR] updatePlayer() =>", error.message);
  }
};
