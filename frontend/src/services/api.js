import axios from "axios";


// Set the base URL for the API
const API = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:6001",
  withCredentials: true
});

// Authentication is handled via cookies, no need for Authorization header

export default API;
