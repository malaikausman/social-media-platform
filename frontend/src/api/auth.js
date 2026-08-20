import api from "./axios";

export const getCurrentUser = (token) => {
  return api.get("/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};