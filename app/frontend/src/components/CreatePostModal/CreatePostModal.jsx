// src/components/CreatePostModal/CreatePostModal.jsx
import React, { useState, useEffect } from "react";
import { useFeed } from "../../context/FeedContext";
import "./CreatePostModal.css";

function CreatePostModal({ onClose }) {
  const { fetchPosts } = useFeed();
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
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
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("description", description);
    formData.append("content", content);
    if (image) formData.append("image", image);

    try {
      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Erro ao criar post");

      await fetchPosts();
      resetForm();
    } catch (err) {
      setError(err.message || "Erro desconhecido");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>×</button>
        <h2>New Post</h2>
        <form onSubmit={handleSubmit} className="post-form">
          <textarea
            placeholder="Assunto, ex: 'Duvida sobre React'"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <input type="file" accept="image/*" onChange={handleFileChange} />

          {previewUrl && <img src={previewUrl} alt="Preview" className="post-preview-image" />}
          {error && <p className="post-error">{error}</p>}
          {success && <p className="post-success">Post publicado com sucesso!</p>}

          <button type="submit">Publicar</button>
        </form>
      </div>
    </div>
  );
}

export default CreatePostModal;
