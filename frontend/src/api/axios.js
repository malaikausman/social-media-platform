import axios from "axios";

const api = axios.create({
  baseURL: "https://social-media-platform-backend-oxp3.onrender.com/api",
});

export default api;