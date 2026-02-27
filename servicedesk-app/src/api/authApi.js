import { api } from "./axios";

export async function login(email, password) {
  try {
    const res = await api.post("/auth/login", { email, password });
    const data = res.data;

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  } catch (err) {
    console.error("Login failed:", err);
    throw err; 
  }
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch (err) {
    // ignore server errors
  } finally {
    localStorage.clear();
    window.location.replace("/login");
  }
}
