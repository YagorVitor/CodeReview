import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { NotificationContext } from "../../context/NotificationContext";
import "./NotificationPanel.css";

function NotificationPanel({ onClose }) {
  const {
    notifications,
    markAsRead,
    fetchNotifications,
  } = useContext(NotificationContext);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const deleteNotification = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error("Erro ao apagar notificação:", err);
    }
  };

  const clearAll = async () => {
    if (!confirm("Deseja apagar todas as notificações?")) return;
    try {
      await fetch(`http://localhost:5000/api/notifications/clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error("Erro ao limpar notificações:", err);
    }
  };

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <h3>Notificações</h3>
        <button onClick={onClose}>✖</button>
      </div>

      <ul className="notification-list">
        {notifications.length === 0 ? (
          <li className="empty">Nenhuma notificação</li>
        ) : (
          notifications.map((n) => (
            <li key={n.id} className={n.read ? "read" : "unread"}>
              {n.user?.username ? (
                <Link
                  to={`/user/${n.user.username}`}
                  className="notification-link"
                  onClick={onClose}
                >
                  {n.message}
                </Link>
              ) : (
                <span>{n.message}</span>
              )}
              <div style={{ display: "flex", gap: "6px" }}>
                {!n.read && (
                  <button onClick={() => markAsRead(n.id)}>Ler</button>
                )}
                <button onClick={() => deleteNotification(n.id)}>❌</button>
              </div>
            </li>
          ))
        )}
      </ul>

      {notifications.length > 0 && (
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <button onClick={clearAll}>Limpar todas</button>
        </div>
      )}
    </div>
  );
}

export default NotificationPanel;
