import api from "./api";

const USER_KEY = "shamba360_user";

export async function login(email, password, portal) {
  const response = await api.post("/auth/login/", { email, password, portal });
  localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
  return response.data.user;
}

export function getCurrentUser() {
  const storedUser = localStorage.getItem(USER_KEY);
  return storedUser ? JSON.parse(storedUser) : null;
}

export function logout() {
  localStorage.removeItem(USER_KEY);
}
