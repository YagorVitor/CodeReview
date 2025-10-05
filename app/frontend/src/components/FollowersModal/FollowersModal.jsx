import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./FollowersModal.css";

function FollowersModal({ followers = [], onClose, title = "Seguidores" }) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);

  const emptyMessage = title === "Seguindo" ? "Sem usuários seguindo." : "Sem seguidores.";

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    const onFocusTrap = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        panelRef.current.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("focusin", onFocusTrap);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("focusin", onFocusTrap);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <div
        className="fm-modal-overlay"
        ref={overlayRef}
        onClick={onClose}
        aria-hidden="false"
      >
        <motion.div
          className="fm-followers-modal"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: -18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          ref={panelRef}
          tabIndex={-1}
        >
          <div className="fm-modal-header">
            <div className="fm-title-wrap">
              <h3 className="fm-title">{title}</h3>
              <span className="fm-subcount">{followers.length}</span>
            </div>
            <button className="fm-close-btn" onClick={onClose} aria-label="Fechar">
              <X size={18} />
            </button>
          </div>

          <div className="fm-list-wrap">
            {followers.length === 0 ? (
              <p className="fm-empty">{emptyMessage}</p>
            ) : (
              <ul className="fm-followers-list" role="list">
                {followers.map((f) => (
                  <li key={f.id} className="fm-follower-item">
                    <div className="fm-avatar">
                      <img
                        src={
                          f.profile_picture
                            ? `http://localhost:5000/${f.profile_picture}`
                            : "/default-avatar.png"
                        }
                        alt={f.name || f.username}
                        loading="lazy"
                      />
                    </div>

                    <div className="fm-info">
                      <Link to={`/user/${f.username}`} className="fm-mention" onClick={onClose}>
                        @{f.username}
                      </Link>
                      <div className="fm-name">{f.name}</div>
                    </div>

                    <div className="fm-actions">
                      {/* placeholder for potential follow/unfollow button */}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default FollowersModal;