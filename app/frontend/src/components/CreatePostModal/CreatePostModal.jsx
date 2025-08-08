import React, { useState, useEffect, useRef } from "react";
import { useFeed } from "../../context/FeedContext";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import vsDark from "react-syntax-highlighter/dist/esm/styles/prism/vs-dark";
import "./CreatePostModal.css";

const LANGUAGES = [
  { label: "Texto simples", value: "plain" },
  { label: "Python", value: "python" },
  { label: "C++", value: "cpp" },
  { label: "C#", value: "csharp" },
  { label: "Java", value: "java" },
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "Go", value: "go" },
  { label: "R", value: "r" },
  { label: "Ruby", value: "ruby" },
];

function CreatePostModal({ onClose }) {
  const { fetchPosts } = useFeed();
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState(LANGUAGES[0].value);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const firstInputRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    firstInputRef.current?.focus();
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setDescription("");
    setContent("");
    setImage(null);
    setPreviewUrl(null);
    setError("");
    setSuccess(true);
    setIsSubmitting(false);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!content.trim()) {
      setError("O conteúdo do código é obrigatório.");
      return;
    }

    setIsSubmitting(true);

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("description", description);
    formData.append("content", content);
    formData.append("language", language);
    if (image) formData.append("image", image);

    try {
      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao criar post");
      }

      await fetchPosts();
      resetForm();
    } catch (err) {
      setError(err.message || "Erro desconhecido");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-button"
          onClick={onClose}
          aria-label="Fechar modal"
        >
          ×
        </button>
        <h2 id="modal-title">Novo Post</h2>
        <form onSubmit={handleSubmit} className="post-form">
            <input
            type="text"
            placeholder="Descreva seu problema"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-label="Descrição do post"
            disabled={isSubmitting}
          />
          <textarea
            ref={firstInputRef}
            placeholder="Mostre seu código (se necessário)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={8}
            aria-label="Conteúdo do código"
            disabled={isSubmitting}
          />
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            aria-label="Selecionar linguagem do código"
            disabled={isSubmitting}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview da imagem do post"
              className="post-preview-image"
            />
          )}

          
          {content.trim() && (
            <div className="code-preview-container" aria-label="Preview do código">
              &nbsp;Preview<hr />
              {language === "plain" ? (
                <div
                    style={{
                    borderRadius: "8px",
                    padding: "12px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    backgroundColor: "#1e1e1e",
                  }}
                >
                  {content}
                </div>
              ) : (
                <SyntaxHighlighter
                  language={language}
                  style={vsDark}
                  showLineNumbers
                  wrapLines
                  customStyle={{
                    borderRadius: "8px",
                    padding: "12px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    backgroundColor: "#1e1e1e",
                  }}
                > 
                  {content}
                </SyntaxHighlighter>
              )}
            </div>
          )}


          <label htmlFor="file-input" className="btn-upload-image">Escolher uma imagem</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            aria-label="Upload de imagem para o post"
            disabled={isSubmitting}
            className="file-input"
            id="file-input"
          />
          

          {error && (
            <p className="post-error" role="alert">
              {error}
            </p>
          )}
          {success && <p className="post-success">Post publicado com sucesso!</p>}

          <button
            type="submit"
            className="btn-submit"
            disabled={isSubmitting}
            aria-disabled={isSubmitting}
          >
            {isSubmitting ? "Publicando..." : "Publicar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePostModal;
