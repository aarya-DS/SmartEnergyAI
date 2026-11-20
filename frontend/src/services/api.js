const API_URL = "http://127.0.0.1:8000";

export async function checkHealth() {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.status === "ok";
  } catch (error) {
    return false;
  }
}

export async function predictEnergy(inputData) {
  try {
    const response = await fetch(`${API_URL}/predict/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.detail?.message ||
        data?.detail ||
        "Prediction request failed."
      );
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    if (error.message.includes("Failed to fetch") || error.name === "TypeError") {
      throw new Error("AI backend is currently offline. Start the FastAPI server and try again.");
    }
    throw error;
  }
}