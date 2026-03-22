"use client";
import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    // eslint-disable-next-line
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = (data: any) => {
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout API call failed", err);
    }
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
