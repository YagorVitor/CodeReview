import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import CommentSection from "../CommentSection/CommentSection";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import BackButton from "../BackButton/BackButton";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import vsDark from "react-syntax-highlighter/dist/esm/styles/prism/vs-dark";
import "./PostPage.css";

dayjs.extend(utc);
dayjs.extend(timezone);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function PostPage() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`${API_URL}/api/posts/${id}`);
        if (!res.ok) throw new Error("Post não encontrado");
        const data = await res.json();
        setPost(data);
        setNotFound(false);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) return <div className="post-page">Carregando post...</div>;
  if (notFound || !post) return <div className="post-page">Post não encontrado.</div>;

  const author = post.author || {
    id: post.user_id,
    name: "Usuário",
    username: "username",
    profile_picture: null,
  };

  const profileImage = author.profile_picture
    ? `${API_URL}/${author.profile_picture}`
    : "/default-profile.png";

  const formattedDate = dayjs
    .utc(post.created_at)
    .tz("America/Sao_Paulo")
    .format("DD/MM/YYYY HH:mm");

  return (
    <div className="post-page">
      <div className="post-card">
        <BackButton />

        <div className="post-header">
          <img src={profileImage} alt={author.name} className="post-author-photo" />
          <div className="post-author-info">
            <strong>{author.name}</strong>
            <span className="post-username">
              <Link to={`/user/${author.username}`}>@{author.username}</Link>
            </span>
          </div>
        </div>

        {post.content && (
          <div className="post-code-block">
            {post.language === "plain" ? (
              <div
                style={{
                  borderRadius: "8px",
                  padding: "12px",
                  maxHeight: "400px",
                  overflowY: "auto",
                  backgroundColor: "#fff",
                  color: "#333",
                  whiteSpace: "normal",
                  wordWrap: "break-word",
                  fontFamily: "inherit",
                  fontSize: "1rem",
                  lineHeight: "1.4",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
              >
                {post.content}
              </div>
            ) : (
              <SyntaxHighlighter
                language={post.language || "javascript"}
                style={vsDark}
                wrapLongLines={true}
                showLineNumbers
              >
                {post.content}
              </SyntaxHighlighter>
            )}
          </div>
        )}

        {post.image_url && (
          <div className="post-image-wrapper">
            <img
              src={`${API_URL}/${post.image_url}`}
              alt="Post"
              className="post-image"
            />
          </div>
        )}

        {post.description && (
          <div className="post-description-block">
            <span className="description-label">Descrição:</span>
            <p className="post-description">{post.description}</p>
          </div>
        )}

        <p className="post-date">Publicado em {formattedDate}</p>

        <CommentSection post={post} />
      </div>
    </div>
  );
}

export default PostPage;