// src/api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api", 
  timeout: 15000,
  // headers: {
  //   "Content-Type": "application/json",
  // },
   withCredentials: true, 
});

const getAccessToken = () => localStorage.getItem("accessToken") || "";

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export default api;
