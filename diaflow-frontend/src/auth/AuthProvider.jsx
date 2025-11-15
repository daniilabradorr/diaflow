import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";

export const AuthContext = createContext({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("access") || null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Cargar perfil de usuario cuando hay token
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const resp = await api.get("paciente/me/");
        const perfil = resp.data;
        // Combinar datos del perfil con info del token (username/email)
        const decoded = jwtDecode(token);
        setUser({
          username: decoded.username,
          name: perfil.nombre || decoded.username,
          email: decoded.username, // asumimos username es el email
          // ...podríamos incluir más campos si existieran (ej: objetivos glucosa)
        });
      } catch (e) {
        console.error("Error al cargar perfil del usuario", e);
        setUser({ username: jwtDecode(token).username });
      }
    };

    if (token) {
      fetchProfile();
    } else {
      setUser(null);
    }
  }, [token]);

  // Iniciar sesión: obtiene token y perfil
  async function login(username, password) {
    // Hacer login contra la API
    const resp = await api.post("auth/token/", { username, password });
    const accessToken = resp.data.access;
    // Guardar token
    setToken(accessToken);
    localStorage.setItem("access", accessToken);
    // Opcional: cargar perfil inmediatamente
    try {
      const profileResp = await api.get("paciente/me/");
      const perfil = profileResp.data;
      setUser({
        username: username,
        name: perfil.nombre || username,
        email: perfil.email || username,
      });
    } catch {
      // Si falla cargar perfil, al menos decodificar el token para username
      setUser({ username });
    }
    navigate("/");
  }

  // Cerrar sesión: limpiar datos
  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("access");
    navigate("/login");
  }

  const value = { user, token, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}