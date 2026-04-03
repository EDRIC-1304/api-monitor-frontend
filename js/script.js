const API_BASE = "http://localhost:5000/api";

async function apiRequest(endpoint, method = "GET", body = null) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
    });

    return await res.json();
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, error: "Server not reachable" };
  }
}