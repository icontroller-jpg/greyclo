import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // On first load, treat a stored access token as "logged in" so refreshing
  // the page doesn't silently log the user out. There's no /me endpoint yet
  // to fetch a real profile, so this is a minimal stand-in.
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) setUser({ token });
  }, []);

  const login = (access, refresh) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    setUser({ token: access });
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};