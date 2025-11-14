import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { jwtDecode } from "jwt-decode";

//para centraliza la gestión de la sesión del usuario (login, logout, datos yel token JWT)
export const AuthContext = createContext({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("access"));
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  //de esta manera uso el effect para que cuando cambie el token intenta decodificarlo
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ username: decoded.username });
      } catch (e) {
        console.error("Error al decodificar token", e);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  async function login(username, password) {
    const resp = await api.post("auth/token/", { username, password });
    const access = resp.data.access;
    setToken(access);
    localStorage.setItem("access", access);
    navigate("/");
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("access");
    navigate("/login");
  }

  const value = { user, token, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
