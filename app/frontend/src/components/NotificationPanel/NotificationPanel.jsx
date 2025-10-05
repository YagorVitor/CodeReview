import React, { useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { NotificationContext } from "../../context/NotificationContext";
import { Trash, Check, X } from "lucide-react";
import "./NotificationPanel.css";

function NotificationPanel({ onClose }) {
  const {
    notifications,
    markAsRead,
    fetchNotifications,
  } = useContext(NotificationContext);

  const token = localStorage.getItem("token");
  const panelRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    const onClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClickOutside);
    };
  }, [onClose]);

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
    <div className="notification-panel" role="dialog" aria-label="Painel de notificações" ref={panelRef}>
      <div className="notification-header">
        <div className="header-left">
          <h3>Notificações</h3>
          <span className="header-count">{notifications.length}</span>
        </div>

        <div className="header-actions">
          {notifications.length > 0 && (
            <button className="clear-all-btn" onClick={clearAll} title="Limpar todas as notificações">
              Limpar todas
            </button>
          )}
          <button className="close-btn" onClick={onClose} aria-label="Fechar painel">
            <X size={16} />
          </button>
        </div>
      </div>

      <ul className="notification-list" role="list">
        {notifications.length === 0 ? (
          <li className="empty">Nenhuma notificação</li>
        ) : (
          notifications.map((n) => (
            <li key={n.id} className={`notification-item ${n.read ? "read" : "unread"}`} role="listitem">
              <div className="notification-main">
                <div className="notification-avatar">
                  {/* small neutral avatar/initial */}
                  {n.user?.username ? (
                    <div className="avatar-initial">{n.user.username.slice(0, 1).toUpperCase()}</div>
                  ) : (
                    <div className="avatar-icon">🔔</div>
                  )}
                </div>

                <div className="notification-body">
                  {n.user?.username ? (
                    <Link to={`/user/${n.user.username}`} className="notification-link" onClick={onClose}>
                      <span className="notification-message">{n.message}</span>
                    </Link>
                  ) : (
                    <span className="notification-message">{n.message}</span>
                  )}
                  <div className="notification-meta">
                    <span className="time">{n.time || n.createdAt || ""}</span>
                    {!n.read && <span className="badge">Novo</span>}
                  </div>
                </div>
              </div>

              <div className="notification-actions" aria-hidden={false}>
                {!n.read && (
                  <button
                    className="icon-btn mark-read"
                    onClick={() => markAsRead(n.id)}
                    title="Marcar como lida"
                  >
                    <Check size={14} />
                  </button>
                )}
                <button
                  className="icon-btn delete"
                  onClick={() => deleteNotification(n.id)}
                  title="Apagar notificação"
                >
                  <Trash size={14} />
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default NotificationPanel;