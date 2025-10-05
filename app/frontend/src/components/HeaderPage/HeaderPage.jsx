import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { NotificationContext } from "../../context/NotificationContext";
import { UserCircle, LogOut, Settings, Plus, Bell, Home as HomeIcon, Search, User, Square } from "lucide-react";
import CreatePostModal from "../CreatePostModal/CreatePostModal";
import NotificationPanel from "../NotificationPanel/NotificationPanel";
import "./HeaderPage.css";

function HeaderPage() {
  const { user, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(NotificationContext);
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleMenu = () => setShowMenu((prev) => !prev);
  const handleLogout = () => {
    logout();
    setShowMenu(false);
    navigate("/login");
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <header className="header">
      <Link to={user ? "/feed" : "/"} className="nav-link">
        <img className="header-title" src="public/img/logotype_blue.png" height="100px" alt="CodeReview+" />
        <h1>CodeReview+</h1>
      </Link>

      <nav className="header-nav">
        <ul className="nav-list">
          <li>
            <Link to={user ? "/feed" : "/"} className="nav-link" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <HomeIcon size={26} />
            </Link>
          </li>

          {user && (
            <li>
              <Link to="/search" className="nav-link">
                <Search size={26} />
              </Link>
            </li>
          )}

          {user && (
            <li>
              <button
                className="nav-link"
                style={{ background: "none", border: "none", cursor: "pointer" }}
                onClick={() => setShowModal(true)}
                aria-label="Novo post"
              >
                <Plus size={30} />
              </button>
            </li>
          )}

          {user && (
            <li>
              <button
                className="nav-link notification-icon"
                style={{ background: "none", border: "none", cursor: "pointer", position: "relative" }}
                onClick={() => setShowNotifications((prev) => !prev)}
                aria-label="Notificações"
              >
                <Bell size={26} />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              {showNotifications && (
                <NotificationPanel onClose={() => setShowNotifications(false)} />
              )}
            </li>
          )}

          {!user ? (
            <>
              <li><Link to="/signup" className="nav-link">Cadastrar-se</Link></li>
              <li><Link to="/login" className="nav-link">Entrar</Link></li>
            </>
          ) : (
            <li className="user-menu" style={{ position: "relative" }}>
              <button
                onClick={toggleMenu}
                ref={buttonRef}
                className="nav-link"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
                aria-label="Menu do usuário"
              >
                {user.profile_picture ? (
                    <img
                        src={`http://localhost:5000/${user.profile_picture}`}
                        alt="Foto do usuário"
                        className="header-avatar"
                    />
                ) : (
                  <UserCircle size={70} />
                )}
              </button>

              {showMenu && (
                <ul className="dropdown-menu modern-dropdown" ref={menuRef}>
                  <li>
                    <Link to={`/profile/${user.id}`} className="dropdown-link" onClick={() => setShowMenu(false)}>
                      <UserCircle size={16} style={{ marginRight: "8px" }} /> Perfil
                    </Link>
                  </li>
                  <li>
                    <Link to={`/settings/${user.id}`} className="dropdown-link" onClick={() => setShowMenu(false)}>
                      <Settings size={16} style={{ marginRight: "8px" }} /> Configurações
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="dropdown-link logout-btn">
                      <LogOut size={16} style={{ marginRight: "8px" }} /> Sair
                    </button>
                  </li>
                </ul>
              )}
            </li>
          )}
        </ul>
      </nav>

      {showModal && <CreatePostModal onClose={() => setShowModal(false)} />}
    </header>
  );
}

export default HeaderPage;