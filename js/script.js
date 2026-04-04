const API_BASE = "https://api-monitor-backend-h30u.onrender.com";

async function apiRequest(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: body ? JSON.stringify(body) : null,
    });

    if (res.status === 401 || res.status === 403) {
        window.location.href = "auth.html";
        return;
    }
    return await res.json();
  } catch (error) {
    return { success: false, error: "Connection lost" };
  }
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "auth.html";
}