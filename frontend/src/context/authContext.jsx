import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    api.get("/me")
      .then((res) => {
        setUser(res.data.data);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });

  }, []);

  const login = async (email, password) => {
    const res = await api.post("/login", { email, password });

    const userData = res.data.data.user;
    const token = res.data.data.token;

    localStorage.setItem("token", token);
    setUser(userData);

    return userData.role;
  };

  const register = async (formData) => {
    const res = await api.post("/register", formData);

    const userData = res.data.data.user;
    const token = res.data.data.token;

    localStorage.setItem("token", token);
    setUser(userData);

    return userData.role;
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {}

    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};