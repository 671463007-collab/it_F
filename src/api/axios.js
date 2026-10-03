import Axios from "axios";

const instance = Axios.create({
  // เปลี่ยนจาก "http://127.0.0.1:8000/api" เป็น "/api"
  baseURL: "/api",
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;