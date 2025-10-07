// src/context/NotificationContext.jsx
import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import { apiFetch } from "../utils/api";
import { AuthContext } from "./AuthContext";

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user, loading: authLoading, logout } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleUnauthorized = useCallback(() => {
    logout?.();
  }, [logout]);

  const fetchNotifications = useCallback(async () => {
    if (authLoading) return; // espera AuthProvider inicializar
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      console.log("fetchNotifications token:", localStorage.getItem("token")); // debug temporário
      const data = await apiFetch("/api/notifications", { method: "GET" }, { onUnauthorized: handleUnauthorized });
      setNotifications(Array.isArray(data) ? data : []);
      setUnreadCount((Array.isArray(data) ? data : []).filter((n) => !n.read).length);
    } catch (err) {
      console.error("Erro ao buscar notificações", err);
      if (err.status === 401) {
        // onUnauthorized fará logout
      }
    } finally {
      setLoading(false);
    }
  }, [user, authLoading, handleUnauthorized]);

  const markAsRead = useCallback(async (id) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: "PUT" }, { onUnauthorized: handleUnauthorized });
      setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Erro ao marcar notificação como lida", err);
    }
  }, [handleUnauthorized]);

  const deleteNotification = useCallback(async (id) => {
    try {
      await apiFetch(`/api/notifications/${id}`, { method: "DELETE" }, { onUnauthorized: handleUnauthorized });
      setNotifications((prev) => prev.filter(n => n.id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Erro ao apagar notificação", err);
    }
  }, [handleUnauthorized]);

  const clearAll = useCallback(async () => {
    try {
      await apiFetch("/api/notifications/clear", { method: "DELETE" }, { onUnauthorized: handleUnauthorized });
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Erro ao limpar notificações", err);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    // busca inicial quando AuthProvider já carregou
    if (!authLoading) fetchNotifications();

    // atualizar a cada 30s somente se o usuário estiver logado
    const interval = setInterval(() => {
      if (!authLoading && user) fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [authLoading, user, fetchNotifications]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      fetchNotifications,
      markAsRead,
      deleteNotification,
      clearAll,
      loading
    }}>
      {children}
    </NotificationContext.Provider>
  );
}