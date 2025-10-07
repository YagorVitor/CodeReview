// src/context/FeedContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { apiFetch } from "../utils/api";

const FeedContext = createContext();

export function FeedProvider({ children }) {
  const { user, loading: authLoading, logout } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleUnauthorized = () => {
    // limpa sessão se o token for inválido/expirar
    logout?.();
  };

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Se seu endpoint /api/posts exige autenticação, só busque quando houver user
      if (!user) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const data = await apiFetch("/api/posts", { method: "GET" }, { onUnauthorized: handleUnauthorized });
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchPosts error:", err);
      if (err.status === 401) {
        // tratada em handleUnauthorized
      } else {
        setError(err.message || "Erro ao buscar posts");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // só tenta buscar quando AuthProvider já terminou de carregar (evita 401 prematuro)
    if (authLoading) return;
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  return (
    <FeedContext.Provider value={{ posts, loading, error, fetchPosts }}>
      {children}
    </FeedContext.Provider>
  );
}

export function useFeed() {
  return useContext(FeedContext);
}