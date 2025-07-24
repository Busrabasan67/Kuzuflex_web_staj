// client/src/context/AuthContext.tsx
import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate(); // ✅ navigate eklendi
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("adminToken"); // ✅ burası düzeltildi
  });

  const login = (newToken: string) => {
    localStorage.setItem("adminToken", newToken); // ✅ burası düzeltildi
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("adminToken"); // ✅ burası düzeltildi
    setToken(null);
    navigate("/admin-login"); // ✅ SPA yapısına uygun yönlendirme
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
