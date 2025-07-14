import React, { useContext, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useFeed } from "../../context/FeedContext"; // ✅ Adicionado
import CommentSection from "../CommentSection/CommentSection";
import { motion } from "framer-motion";
import "./PostCard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function PostCard({ post }) {
  const { user } = useContext(AuthContext);
  const { fetchPosts } = useFeed(); // ✅ Usado para atualizar o feed
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [likedByUser, setLikedByUser] = useState(post.liked_by_user);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [likers, setLikers] = useState([]);
  const [showLikers, setShowLikers] = useState(false);
  const menuRef = useRef();

  const author = post.author || {
    id: post.user_id,
    name: "Usuário",
    username: "username",
    profile_picture: null,
  };

  const profileImage = author.profile_picture
    ? `${API_URL}/${author.profile_picture}`
    : "/default-profile.png";

  const handleDeletePost = async () => {
    if (!confirm("Deseja excluir este post?")) return;

    try {
      const res = await fetch(`${API_URL}/api/posts/${post.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!res.ok) throw new Error("Erro ao excluir post");
      alert("Post excluído com sucesso.");
      await fetchPosts(); // ✅ Atualiza o feed automaticamente
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLikeToggle = async () => {
    try {
      const method = likedByUser ? "DELETE" : "POST";
      const res = await fetch(`${API_URL}/api/posts/${post.id}/like`, {
        method,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!res.ok) throw new Error("Erro ao curtir/descurtir");

      setLikeAnimating(true);
      setTimeout(() => setLikeAnimating(false), 500);

      setLikedByUser(!likedByUser);
      setLikesCount((prev) => (likedByUser ? prev - 1 : prev + 1));
      setShowLikers(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleLikers = async () => {
    if (showLikers) {
      setShowLikers(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado para ver quem curtiu.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/likes/post/${post.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao buscar curtidas");
      const data = await res.json();
      setLikers(data);
      setShowLikers(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const renderDescription = () => {
    const maxLength = 100;
    const desc = post.description?.trim() || "";

    if (!desc) return null;

    const label = <span className="description-label">Descrição:</span>;

    if (desc.length <= maxLength || showFullDescription) {
      return (
        <div className="post-description-block">
          {label}
          <p className="post-description">{desc}</p>
          {desc.length > maxLength && (
            <button
              className="toggle-description-btn"
              onClick={() => setShowFullDescription(false)}
            >
              Ver menos
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="post-description-block">
        {label}
        <p className="post-description">{desc.slice(0, maxLength)}...</p>
        <button
          className="toggle-description-btn"
          onClick={() => setShowFullDescription(true)}
        >
          Ver mais
        </button>
      </div>
    );
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="post-card">
      <div className="post-header">
        <img src={profileImage} alt={author.name} className="post-author-photo" />
        <div className="post-author-info">
          <strong>{author.name}</strong>
          <span className="post-username">
            <Link to={`/user/${author.username}`}>@{author.username}</Link>
          </span>
        </div>

        {user?.id === author.id && (
          <div className="post-menu-wrapper" ref={menuRef}>
            <button
              className="post-menu-btn"
              onClick={() => setMenuOpen((prev) => !prev)}
              title="Mais opções"
            >
              ⋯
            </button>
            {menuOpen && (
              <div className="post-menu">
                <button className="post-menu-item" onClick={handleDeletePost}>
                  ❌ Excluir post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Link to={`/post/${post.id}`} className="post-card-clickable">
        {post.content && <p className="post-content">{post.content}</p>}

        {post.image_url ? (
          <div className="post-card-image-wrapper">
            <img
              src={`${API_URL}/${post.image_url}`}
              alt="Post"
              className="post-card-image"
            />
          </div>
        ) : null}
      </Link>

      {renderDescription()}

      <div className="post-actions">
        <motion.button
          className={`like-btn ${likedByUser ? "liked" : ""}`}
          onClick={handleLikeToggle}
          title={likedByUser ? "Descurtir" : "Curtir"}
          animate={likeAnimating ? { scale: [1, 1.4, 1] } : {}}
          transition={{ duration: 0.4 }}
        >
          {likedByUser ? "❤️" : "🤍"} {likesCount}
        </motion.button>

        <button
          className="comments-toggle-btn"
          onClick={() => setCommentsOpen(!commentsOpen)}
        >
          {commentsOpen ? "Ocultar comentários" : "Ver todos os comentários"}
        </button>

        {likesCount > 0 && (
          <button className="likers-btn" onClick={handleToggleLikers}>
            {showLikers ? "Ocultar curtidas" : "Ver quem curtiu"}
          </button>
        )}
      </div>

      {showLikers && (
        <div className="likers-list">
          <h4>Quem curtiu:</h4>
          <ul>
            {likers.map((user) => (
              <li key={user.id}>
                <img
                  src={`${API_URL}/${user.profile_picture || "default-profile.png"}`}
                  alt={user.name}
                />
                <Link to={`/user/${user.username}`}>{user.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {commentsOpen && <CommentSection post={post} />}
    </div>
  );
}

export default PostCard;
