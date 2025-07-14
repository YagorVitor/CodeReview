import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useFeed } from "../../context/FeedContext";
import "./CommentSection.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function CommentSection({ post }) {
  const { user } = useContext(AuthContext);
  const { fetchPosts } = useFeed();
  const [comment, setComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

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

  const renderComment = (c, depth = 0) => (
    <div key={c.id} className="comment" style={{ marginLeft: depth * 20 }}>
      <strong>{c.author?.name || "Usuário"}:</strong>
      <span>{c.content}</span>

      <div className="comment-actions">
        {user && (
          <button
            className="reply-btn"
            onClick={() => setReplyingTo(c.id)}
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
            ❌
          </button>
        )}
      </div>

      {replyingTo === c.id && (
        <div className="reply-input-section">
          <textarea
            className="reply-input"
            placeholder="Escreva sua resposta..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <button
            className="reply-submit-btn"
            onClick={() => handleReplySubmit(c.id)}
          >
            Enviar resposta
          </button>
        </div>
      )}

      {c.replies?.length > 0 &&
        c.replies.map((reply) => renderComment(reply, depth + 1))}
    </div>
  );

  return (
    <div className="comments-section">
      {post.comments?.length > 0 ? (
        post.comments.map((c) => renderComment(c))
      ) : (
        <p className="no-comments">Nenhum comentário ainda.</p>
      )}

      <div className="comment-input-section">
        <textarea
          className="comment-input"
          placeholder="Comente algo..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button className="comment-submit-btn" onClick={handleSubmit}>
          Comentar
        </button>
      </div>
    </div>
  );
}

export default CommentSection;
