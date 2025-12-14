import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:9999/api",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// 🧩 Request interceptor
api.interceptors.request.use(
  (config) => {
    const directToken =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    if (directToken) {
      config.headers.Authorization = `Bearer ${directToken}`;
      return config;
    }

    const stored = localStorage.getItem("user");
    if (stored) {
      const data = JSON.parse(stored);
      const accessToken = data?.accessToken;
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🧩 Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      const stored = localStorage.getItem("user");
      if (!stored) return Promise.reject(error);

      const data = JSON.parse(stored);
      const refreshToken = data?.refreshToken;
      if (!refreshToken) return Promise.reject(error);

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        const res = await axios.post(
          "http://localhost:9999/api/auth/refresh-token",
          { refreshToken },
          { withCredentials: true }
        );

        const newAccessToken = res.data.accessToken;

        // Cập nhật token
        const updatedUser = { ...data, accessToken: newAccessToken };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        localStorage.setItem("accessToken", newAccessToken);
        sessionStorage.setItem("accessToken", newAccessToken);

        api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        // 👇 update header cũ rồi gửi lại
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        console.warn("❌ Refresh token không hợp lệ, buộc đăng nhập lại.");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
