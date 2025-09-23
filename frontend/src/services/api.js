import axios from "axios";

const API = axios.create({
  baseURL: "animated-space-umbrella-g4x9q94q5gv53p47-6001.app.github.dev",
});

// Add token automatically if available
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
