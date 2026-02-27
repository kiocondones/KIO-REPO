import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
});

let isRefreshing = false;
let refreshQueue = [];

// ---------- REQUEST ----------
api.interceptors.request.use(
  (config) => {
    if (typeof window === "undefined") return config;

    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------- RESPONSE ----------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401){
      alert(error.response.data.message)
      return Promise.reject(error);
    }
    if (originalRequest._retry) {
      logout();
      return Promise.reject(error);
    }


    
    originalRequest._retry = true;

    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      logout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      // use raw axios to avoid interceptor recursion
      const res = await axios.post("http://127.0.0.1:5000/api/auth/refresh", {
        refreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data;

      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;

      refreshQueue.forEach((p) => p.resolve(newAccessToken));
      refreshQueue = [];

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (err) {
      refreshQueue.forEach((p) => p.reject(err));
      refreshQueue = [];
      logout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

// ---------- LOGOUT ----------
export async function logout() {
  try {
    await axios.post("http://127.0.0.1:5000/api/auth/logout");
  } catch (err) {
    // ignore server errors
  } finally {
    localStorage.clear();
    window.location.replace("/login");
  }
}
