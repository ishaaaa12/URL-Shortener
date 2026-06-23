import axios from "axios";

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

export default api;