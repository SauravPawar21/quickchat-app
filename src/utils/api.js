import axios from "axios";

const BASE_URL = "http://192.168.0.105:5000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export { BASE_URL };
export default api;
