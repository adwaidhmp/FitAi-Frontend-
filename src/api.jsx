import axios from "axios";

const api2 = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1/auth/",
});

// attach access token on every request if present
api2.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

export default api2;
