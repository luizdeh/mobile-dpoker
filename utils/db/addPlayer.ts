const url = "http://localhost:8080/api/person";

export const addPlayer = async (name: string) => {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: name }),
    });
    const person = await res.json();
    return person;
  } catch (error) {
    console.log("[ERROR] addPlayer() =>", error.message);
  }
};
