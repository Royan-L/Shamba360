import { createContext, useState } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  const login = async (email, password) => {
    const user = await authService.login(email, password);
    setCurrentUser(user);
    return user;
  };

  const signup = async (payload) => {
    return authService.signup(payload);
  };

  const updateCurrentUser = (patch) => {
    setCurrentUser((previous) => {
      if (!previous) return previous;
      const updated = { ...previous, ...patch };
      authService.setCurrentUser(updated);
      return updated;
    });
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    signup,
    updateCurrentUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export { AuthContext };
