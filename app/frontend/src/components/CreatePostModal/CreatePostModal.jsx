import React, { useState, useEffect, useRef } from "react";
import { useFeed } from "../../context/FeedContext";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import vsDark from "react-syntax-highlighter/dist/esm/styles/prism/vs-dark";
import "./CreatePostModal.css";

/* Minimal set of languages + labels */
const LANGUAGES = [
  { label: "Texto simples", value: "plain" },
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
  { label: "C#", value: "csharp" },
  { label: "Ruby", value: "ruby" },
  { label: "Go", value: "go" },
  { label: "CSS", value: "css" },
  { label: "HTML", value: "html" },
];

/* Inline SVG icons keyed by language value */
const ICONS = {
  plain: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 9h10M7 13h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  javascript: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.8 16.2c.5.9 1.1 1.6 2.4 1.6 1.2 0 2-.6 2-1.5 0-1.1-.9-1.5-2.6-2.2-1-.4-1.6-.8-1.6-1.6 0-.8.6-1.4 1.6-1.4.9 0 1.5.4 1.9 1.3l1.5-.9c-.8-1.4-2.3-2-4-2-2.4 0-4.1 1.5-4.1 3.7 0 1.8 1 2.8 2.9 3.5z" fill="currentColor" />
    </svg>
  ),
  typescript: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <path d="M8 7h8M8 12h8M8 17h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  python: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M7 3.5h6v2H9.5a2.5 2.5 0 0 0-2.5 2.5v1.5H7V13h6v-1.5a2.5 2.5 0 0 0-2.5-2.5H9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="9" cy="6" r="0.8" fill="currentColor" />
      <circle cx="15" cy="18" r="0.8" fill="currentColor" />
    </svg>
  ),
  java: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M8 6s2-1 4 0 4 0 4 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M6 12c0-2 3-3 6-3s6 1 6 3-3 3-6 3-6-1-6-3z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  cpp: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <circle cx="8" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <path d="M16 10l3 2-3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  csharp: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="2.2" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <text x="7" y="15.2" fontSize="9" fill="currentColor" fontWeight="700">C#</text>
    </svg>
  ),
  ruby: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 4l6 5-6 7-6-7 6-5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  go: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="6.2" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path d="M8 13c2-2 6-2 8 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  css: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M4 3h16l-1 14-7 3-7-3L4 3z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M8.5 8.5h7l-1 7-5 2-1-7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  html: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M4 3h16l-1 14-7 3-7-3L4 3z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M8.5 8.5h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
};

/* Lightweight formatter: trims, normalizes indentation, JSON pretty for JSON language */
function lightweightFormat(code, lang) {
  if (!code) return code;
  let s = code.replace(/\r\n/g, "\n").replace(/\t/g, "  ");
  // remove trailing spaces on each line
  s = s.split("\n").map((l) => l.replace(/\s+$/g, "")).join("\n");
  // ensure single trailing newline
  s = s.replace(/\n+$/g, "\n");
  // language-specific small rules
  try {
    if (lang === "json") {
      const parsed = JSON.parse(s);
      return JSON.stringify(parsed, null, 2) + "\n";
    }
    if (lang === "html" || lang === "css") {
      // minimal: ensure indentation for nested tags/blocks is preserved by normalizing spaces
      return s.replace(/\n{3,}/g, "\n\n");
    }
    if (lang === "javascript" || lang === "typescript") {
      // very small heuristics: ensure semicolons on single-line statements when missing (non-invasive)
      const lines = s.split("\n").map(l => l.trimEnd());
      return lines.join("\n").replace(/;?\s*$/gm, (m) => m).replace(/\n{3,}/g, "\n\n");
    }
  } catch {
    return s;
  }
  return s;
}

export default function CreatePostModal({ onClose }) {
  const { fetchPosts } = useFeed();
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState(LANGUAGES[0].value);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [langOpen, setLangOpen] = useState(false);
  const [langFilter, setLangFilter] = useState("");
  const [langHighlight, setLangHighlight] = useState(0);

  const firstInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const langButtonRef = useRef(null);
  const langListRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstInputRef.current?.focus();
    const onEsc = (e) => {
      if (e.key === "Escape") {
        if (langOpen) setLangOpen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("keydown", onEsc);
      document.body.style.overflow = prev || "auto";
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [onClose, previewUrl, langOpen]);

  useEffect(() => {
    const onClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setDescription("");
    setContent("");
    setImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError("");
    setSuccess(true);
    setIsSubmitting(false);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!content.trim()) {
      setError("O conteúdo do código é obrigatório.");
      return;
    }
    if (isSubmitting) return;
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
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        let data;
        try {
          data = await response.json();
        } catch {
          const text = await response.text();
          throw new Error(text || "Erro ao criar post");
        }
        throw new Error(data.error || data.message || "Erro ao criar post");
      }

      await fetchPosts();
      resetForm();
    } catch (err) {
      setError(err.message || "Erro desconhecido");
      setIsSubmitting(false);
    }
  };

  const filteredLangs = LANGUAGES.filter((l) =>
    l.label.toLowerCase().includes(langFilter.trim().toLowerCase())
  );

  useEffect(() => {
    if (langOpen) {
      setTimeout(() => {
        const highlighted = langListRef.current?.querySelector('[data-highlight="true"]');
        highlighted?.scrollIntoView({ block: "nearest" });
      }, 0);
    }
  }, [langOpen, langHighlight]);

  const onLangKeyDown = (e) => {
    if (!langOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      setLangOpen(true);
      setLangHighlight(0);
      return;
    }
    if (!langOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setLangHighlight((h) => Math.min(h + 1, filteredLangs.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setLangHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const sel = filteredLangs[langHighlight];
      if (sel) {
        setLanguage(sel.value);
        setLangOpen(false);
      }
    } else if (e.key === "Escape") {
      setLangOpen(false);
    }
  };

  const onFormat = () => {
    const formatted = lightweightFormat(content, language);
    setContent(formatted);
    firstInputRef.current?.focus();
  };

  return (
    <div
      className="modal-overlay modern from-profile"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="modal-card modern from-profile"
        onClick={(e) => e.stopPropagation()}
        role="document"
        ref={modalRef}
      >
        <div className="modal-header">
          <div>
            <h2 id="modal-title">Novo post</h2>
            <p className="modal-sub">Compartilhe um snippet, dúvida ou solução</p>
          </div>
          <button className="modal-close-button" onClick={onClose} aria-label="Fechar modal">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="post-form modern">
          <div className="form-row">
            <label className="field-label">Resumo</label>
            <input
              type="text"
              placeholder="Descreva seu problema (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-label="Descrição do post"
              disabled={isSubmitting}
              className="field-input profile-style"
            />
          </div>

          <div className="form-row">
            <div className="row-split">
              <div className="row-left">
                <label className="field-label">Código</label>
              </div>

              <div className="row-right">
                <div
                  className={`custom-select modern profile-style ${langOpen ? "open" : ""}`}
                  onKeyDown={onLangKeyDown}
                >
                  <button
                    type="button"
                    className="custom-select-button"
                    onClick={() => {
                      setLangOpen((s) => !s);
                      setLangFilter("");
                      setLangHighlight(0);
                    }}
                    ref={langButtonRef}
                    aria-haspopup="listbox"
                    aria-expanded={langOpen}
                  >
                    <span className="custom-select-left">
                      <span className="select-icon">{ICONS[language] ?? ICONS.plain}</span>
                      <span className="custom-select-value">
                        {LANGUAGES.find((l) => l.value === language)?.label}
                      </span>
                    </span>

                    <span className="custom-select-caret">▾</span>
                  </button>

                  {langOpen && (
                    <div className="custom-select-panel" role="listbox" aria-label="Linguagens" ref={langListRef}>
                      <input
                        className="custom-select-search"
                        placeholder="Filtrar linguagens..."
                        value={langFilter}
                        onChange={(e) => {
                          setLangFilter(e.target.value);
                          setLangHighlight(0);
                        }}
                        autoFocus
                        aria-label="Filtrar linguagens"
                      />
                      <ul className="custom-select-list">
                        {filteredLangs.length === 0 && <li className="empty">Nenhuma linguagem</li>}
                        {filteredLangs.map((l, idx) => (
                          <li
                            key={l.value}
                            role="option"
                            aria-selected={language === l.value}
                            className={`custom-select-item ${langHighlight === idx ? "highlight" : ""} ${language === l.value ? "selected" : ""}`}
                            data-highlight={langHighlight === idx}
                            onMouseEnter={() => setLangHighlight(idx)}
                            onClick={() => {
                              setLanguage(l.value);
                              setLangOpen(false);
                              langButtonRef.current?.focus();
                            }}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ width: 18, height: 18 }}>{ICONS[l.value] ?? ICONS.plain}</span>
                              <span className="lang-label">{l.label}</span>
                            </span>
                            {language === l.value && <span className="lang-check">✓</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <textarea
                ref={firstInputRef}
                placeholder="Cole seu código aqui..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={8}
                aria-label="Conteúdo do código"
                disabled={isSubmitting}
                className="field-textarea profile-style"
                style={{ flex: 1 }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button type="button" className="btn-ghost profile-style" onClick={onFormat} title="Formatar código">
                  Format
                </button>
                <button type="button" className="btn-ghost profile-style" onClick={() => { setContent(""); firstInputRef.current?.focus(); }}>
                  Limpar
                </button>
              </div>
            </div>
          </div>

          <div className="form-row image-row">
            <div className="image-controls">
              <label
                htmlFor="file-input"
                className="btn-upload-image modern profile-style"
                tabIndex={0}
                role="button"
                onKeyPress={(e) => {
                  if (e.key === "Enter") fileInputRef.current?.click();
                }}
              >
                Carregar imagem
              </label>
              <input
                ref={fileInputRef}
                id="file-input"
                className="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isSubmitting}
              />
              <span className="hint">PNG, JPG — recomendado até 4MB</span>
            </div>

            <div className="preview-column">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="post-preview-image modern" />
              ) : (
                <div className="preview-empty">Preview da imagem</div>
              )}
            </div>
          </div>

          {content.trim() && (
            <div className="code-preview-wrapper">
              <div className="preview-title">Preview do código</div>
              {language === "plain" ? (
                <div className="code-block plain">{content}</div>
              ) : (
                <SyntaxHighlighter
                  language={language}
                  style={vsDark}
                  showLineNumbers
                  wrapLines
                  customStyle={{
                    borderRadius: 12,
                    padding: 14,
                    maxHeight: 420,
                    overflowY: "auto",
                    backgroundColor: "#070708",
                    boxSizing: "border-box",
                  }}
                >
                  {content}
                </SyntaxHighlighter>
              )}
            </div>
          )}

          {error && <div className="post-error" role="alert">{error}</div>}
          {success && <div className="post-success">Post publicado com sucesso</div>}

          <div className="form-actions">
            <button type="button" className="btn-ghost profile-style" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
            <button type="submit" className="btn-primary profile-style" disabled={isSubmitting}>{isSubmitting ? "Publicando..." : "Publicar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}