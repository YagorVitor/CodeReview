import React from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./FollowersModal.css";

function FollowersModal({ followers = [], onClose, title = "Seguidores" }) {
  // Mensagem vazia customizada conforme o título
  const emptyMessage = title === "Seguindo" ? "Sem usuários seguindo." : "Sem seguidores.";

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          className="followers-modal"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.25 }}
        >
          <div className="modal-header">
            <h3>{title}</h3>
            <button className="close-btn" onClick={onClose} title="Fechar">
              <X size={20} />
            </button>
          </div>
          <ul className="followers-list">
            {followers.length === 0 ? (
              <p className="empty-message">{emptyMessage}</p>
            ) : (
              followers.map((follower) => (
                <li key={follower.id} className="follower-item">
                  <img
                    src={
                      follower.profile_picture
                        ? `http://localhost:5000/${follower.profile_picture}`
                        : "/default-avatar.png"
                    }
                    alt={follower.name}
                  />
                  <div className="follower-info">
                    <Link to={`/user/${follower.username}`} className="mention-link">
                      @{follower.username}
                    </Link>
                    <div className="follower-name">{follower.name}</div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default FollowersModal;
