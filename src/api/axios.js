import Axios from "axios";

const instance = Axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: { Accept: "application/json" },
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message;
    if (
      error.response?.status === 403 &&
      message === "บัญชีของคุณถูกระงับการใช้งาน" &&
      !sessionStorage.getItem("banned-session-notified")
    ) {
      sessionStorage.setItem("banned-session-notified", "true");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.alert(message);
      window.location.assign("/login");
    }
    return Promise.reject(error);
  }
);

export default instance;