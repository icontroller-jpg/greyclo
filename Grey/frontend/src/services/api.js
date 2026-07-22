import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: `${BASE_URL}/api/`,
});

// Every request through this instance automatically carries the logged-in
// user's token, if there is one. Endpoints that don't require auth (like
// GET products/) just ignore the extra header.
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;