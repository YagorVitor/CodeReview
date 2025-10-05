import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useFeed } from "../../context/FeedContext";
import { Trash } from "lucide-react";
import "./CommentSection.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* Helpers */
function renderMentions(text) {
  if (!text) return text;
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, idx) =>
    part.startsWith("@") ? (
      <Link key={idx} to={`/user/${part.slice(1)}`} className="mention-link">
        {part}
      </Link>
    ) : (
      part
    )
  );
}

export default function CommentSection({ post }) {
  const { user } = useContext(AuthContext);
  const { fetchPosts } = useFeed();
  const [comment, setComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/comments/${post.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ content: comment }),
      });
      if (!res.ok) throw new Error("Erro ao comentar");
      setComment("");
      await fetchPosts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReplySubmit = async (parentId) => {
    if (!replyContent.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/comments/${post.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          content: replyContent,
          parent_id: parentId,
        }),
      });
      if (!res.ok) throw new Error("Erro ao responder");
      setReplyContent("");
      setReplyingTo(null);
      await fetchPosts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Excluir comentário?")) return;
    try {
      const res = await fetch(`${API_URL}/api/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Erro ao excluir");
      await fetchPosts();
    } catch (err) {
      alert(err.message);
    }
  };

  const fetchMentionSuggestions = async (query) => {
    if (!query) {
      setMentionSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/users/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setMentionSuggestions(data || []);
      setShowSuggestions((data || []).length > 0);
    } catch {
      setMentionSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleCommentChange = (e) => {
    const val = e.target.value;
    setComment(val);
    const cursorPos = e.target.selectionStart;
    const t = val.slice(0, cursorPos);
    const m = t.match(/@(\w*)$/);
    if (m) fetchMentionSuggestions(m[1]);
    else {
      setShowSuggestions(false);
      setMentionSuggestions([]);
    }
  };

  const handleReplyChange = (e) => {
    const val = e.target.value;
    setReplyContent(val);
    const cursorPos = e.target.selectionStart;
    const t = val.slice(0, cursorPos);
    const m = t.match(/@(\w*)$/);
    if (m) fetchMentionSuggestions(m[1]);
    else {
      setShowSuggestions(false);
      setMentionSuggestions([]);
    }
  };

  const insertMentionInto = (setter, currentValue, username, textarea) => {
    if (!textarea) {
      setter((prev) => `${prev} @${username} `);
      setShowSuggestions(false);
      return;
    }
    const cursor = textarea.selectionStart;
    const before = currentValue.slice(0, cursor);
    const after = currentValue.slice(cursor);
    const newBefore = before.replace(/@(\w*)$/, `@${username} `);
    const newVal = newBefore + after;
    setter(newVal);
    setShowSuggestions(false);
    setTimeout(() => {
      const pos = newBefore.length;
      textarea.setSelectionRange(pos, pos);
      textarea.focus();
    }, 0);
  };

  const renderComment = (c, depth = 0) => {
    const author = c.author || { id: c.user_id, username: c.username || "user", name: "Usuário", profile_picture: null };
    const profileImage = author.profile_picture ? `${API_URL}/${author.profile_picture}` : "/default-avatar.png";

    return (
      <div key={c.id} className="comment" data-depth={Math.min(depth, 4)}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link to={`/user/${author.username}`} className="comment-author-link" title={author.name}>
            <img
              src={profileImage}
              alt={author.name}
              style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", border: "1px solid rgba(255,255,255,0.03)" }}
            />
          </Link>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Link to={`/user/${author.username}`} className="comment-author-link" style={{ fontWeight: 700, color: "inherit", textDecoration: "none" }}>
                {author.name}
              </Link>
              <Link to={`/user/${author.username}`} className="comment-username" style={{ color: "#9aa6b2", textDecoration: "none", fontSize: "0.9rem" }}>
                @{author.username}
              </Link>
            </div>

            <div className="comment-content" style={{ color: "rgba(230,238,248,0.95)" }}>
              {renderMentions(c.content)}
            </div>
          </div>
        </div>

        <div className="comment-actions" aria-hidden>
          {user && (
            <button
              className="reply-btn"
              onClick={() => {
                setReplyingTo(c.id);
                setReplyContent("");
                setShowSuggestions(false);
              }}
            >
              Responder
            </button>
          )}
          {user?.id === c.user_id && (
            <button
              className="delete-comment-btn"
              onClick={() => handleDeleteComment(c.id)}
              title="Excluir comentário"
            >
              <Trash />
            </button>
          )}
        </div>

        {replyingTo === c.id && (
          <div className="reply-input-section">
            <textarea
              className="reply-input"
              placeholder="Escreva sua resposta..."
              value={replyContent}
              onChange={handleReplyChange}
              aria-label="Resposta"
            />
            {showSuggestions && mentionSuggestions.length > 0 && (
              <ul className="suggestions-list" role="listbox">
                {mentionSuggestions.map((u) => (
                  <li
                    key={u.id}
                    role="option"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() =>
                      insertMentionInto(setReplyContent, replyContent, u.username, document.activeElement)
                    }
                  >
                    <img
                      src={u.profile_picture ? `${API_URL}/${u.profile_picture}` : "/default-avatar.png"}
                      alt={u.name}
                    />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 700 }}>{u.name}</span>
                      <small style={{ color: "#9aa6b2" }}>@{u.username}</small>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <button
              className="reply-submit-btn"
              onClick={() => handleReplySubmit(c.id)}
              aria-label="Enviar resposta"
            >
              Enviar resposta
            </button>
          </div>
        )}

        {c.replies?.length > 0 && c.replies.map((reply) => renderComment(reply, depth + 1))}
      </div>
    );
  };

  return (
    <div className="comments-section" aria-live="polite">
      {post.comments?.length > 0 ? (
        post.comments.map((c) => renderComment(c))
      ) : (
        <p className="no-comments">Nenhum comentário ainda.</p>
      )}

      <div className="comment-input-section" style={{ position: "relative" }}>
        <textarea
          className="comment-input"
          placeholder="Comente algo..."
          value={comment}
          onChange={handleCommentChange}
          aria-label="Escrever comentário"
        />
        {showSuggestions && mentionSuggestions.length > 0 && (
          <ul className="mention-suggestions" role="listbox">
            {mentionSuggestions.map((u) => (
              <li
                key={u.id}
                role="option"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  insertMentionInto(setComment, comment, u.username, document.activeElement)
                }
              >
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <img
                    src={u.profile_picture ? `${API_URL}/${u.profile_picture}` : "/default-avatar.png"}
                    alt={u.name}
                    style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }}
                  />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: 700 }}>{u.name}</span>
                    <small style={{ color: "#9aa6b2" }}>@{u.username}</small>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <button className="comment-submit-btn" onClick={handleSubmit} aria-label="Enviar comentário">
          Comentar
        </button>
      </div>
    </div>
  );
}