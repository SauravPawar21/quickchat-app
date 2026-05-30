import axios from "axios";

const BASE_URL = "https://quickchat-backend-roey.onrender.com";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export { BASE_URL };
export default api;
