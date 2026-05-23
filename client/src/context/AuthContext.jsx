import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, check if there's a valid session cookie
  // This keeps logged in after a page refresh
  useEffect(() => {
    api
      .get("/auth/me")
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null)) // no valid session
      .finally(() => setLoading(false));
  }, []);

  const login = userData => setUser(userData);

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
