import React, { useState, useContext, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import BackButton from "../BackButton/BackButton";
import "./SettingsPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ConfirmModal: exige digitar CONFIRMAR para habilitar exclusão */
function ConfirmModal({ open, title, description, confirmLabel = "CONFIRMAR", onCancel, onConfirm, loading }) {
  const [input, setInput] = useState("");
  useEffect(() => { if (!open) setInput(""); }, [open]);
  if (!open) return null;
  const ok = input.trim().toUpperCase() === confirmLabel.toUpperCase();

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="modal-card">
        <h3 id="confirm-title">{title}</h3>
        <p className="modal-desc">{description}</p>

        <div className="confirm-input-row">
          <label htmlFor="confirmText">Digite <strong>{confirmLabel}</strong> para confirmar</label>
          <input
            id="confirmText"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={confirmLabel}
            className="confirm-input"
            aria-label={`Digite ${confirmLabel} para confirmar exclusão`}
          />
        </div>

        <div className="modal-actions">
          <button className="btn ghost" onClick={onCancel} disabled={loading}>Cancelar</button>
          <button className="btn danger" onClick={onConfirm} disabled={!ok || loading}>
            {loading ? "Processando..." : "Excluir Conta"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { id } = useParams();
  const { user, logout, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fileRef = useRef();
  const dropRef = useRef();

  useEffect(() => {
    if (!user || user.id.toString() !== id) {
      navigate("/feed");
      return;
    }
    setName(user.name || "");
    setUsername(user.username || "");
    if (user.profile_picture) setPreview(`${API_URL}/${user.profile_picture}`);
  }, [user, id, navigate]);

  useEffect(() => {
    if (!profilePicture) return;
    const r = new FileReader();
    r.onload = () => setPreview(r.result);
    r.readAsDataURL(profilePicture);
    return () => r.abort && r.abort();
  }, [profilePicture]);

  const clearStatus = () => { setMessage(null); setError(null); };

  const pickFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Envie um arquivo de imagem válido.");
      return;
    }
    if (f.size > 4 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 4 MB.");
      return;
    }
    setProfilePicture(f);
    setError(null);
  };

  const handleFilePick = (e) => { clearStatus(); const f = e.target.files?.[0]; pickFile(f); };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    pickFile(f);
    dropRef.current && dropRef.current.classList.remove("drag-over");
  };
  const handleDragOver = (e) => { e.preventDefault(); dropRef.current && dropRef.current.classList.add("drag-over"); };
  const handleDragLeave = (e) => { e.preventDefault(); dropRef.current && dropRef.current.classList.remove("drag-over"); };

  const removePicture = () => {
    setProfilePicture(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleUpdateProfile = async () => {
    clearStatus();
    if (!name.trim() || !username.trim()) { setError("Nome e username são obrigatórios."); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("username", username.trim());
      if (profilePicture) formData.append("profile_picture", profilePicture);

      const res = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar perfil");

      setMessage("Perfil atualizado com sucesso.");
      setProfilePicture(null);
      if (data?.id === user.id) login(data, localStorage.getItem("token"));
    } catch (err) {
      setError(err.message || "Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    clearStatus();
    if (newPassword.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); return; }
    if (newPassword !== confirmPassword) { setError("As senhas não coincidem."); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${user.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Erro ao alterar senha"); }

      setMessage("Senha alterada com sucesso.");
      setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Erro ao alterar senha");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccountConfirmed = async () => {
    setConfirmLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Erro ao excluir conta"); }

      setConfirmOpen(false);
      logout();
      navigate("/signup");
    } catch (err) {
      setError(err.message || "Erro ao excluir conta");
    } finally {
      setConfirmLoading(false);
    }
  };

  /* Theme: persisted on documentElement/body */
  const [theme, setTheme] = useState(() => localStorage.getItem("site_theme") || "dark");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("site_theme", theme);
  }, [theme]);
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <div className="settings-page">
      <div className="settings-header">
        <BackButton label="Voltar" variant="ghost" size="md" />
        <h2>Configurações da Conta</h2>
      </div>

      <div className="settings-grid layout-side-stack">
        {/* Left column: Perfil */}
        <div className="left-col">
          <section className="card section profile-card">
            <div className="section-header">
              <h3>Perfil</h3>
              <p className="section-sub">Nome, username e foto de perfil</p>
            </div>

            <div className="field-row">
              <label htmlFor="name">Nome</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="field-row">
              <label htmlFor="username">Username</label>
              <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>

            <div className="field-row">
              <label>Foto de Perfil</label>

              <div
                ref={dropRef}
                className="profile-dropzone"
                role="button"
                tabIndex={0}
                onClick={() => fileRef.current && fileRef.current.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <img src={preview || "/default-avatar.png"} alt="Preview perfil" className="profile-preview" />
                <div className="dropzone-meta">
                  <div className="dropzone-text">
                    <strong>{profilePicture ? profilePicture.name : "Nenhum arquivo escolhido"}</strong>
                    <span className="dropzone-sub">{profilePicture ? `${Math.round(profilePicture.size/1024)} KB` : "PNG, JPG até 4 MB"}</span>
                  </div>

                  <div className="profile-pick-actions">
                    <input ref={fileRef} id="profilePicture" type="file" accept="image/*" onChange={handleFilePick} />
                    <button type="button" onClick={() => fileRef.current && fileRef.current.click()} className="btn small">Escolher</button>
                    <button type="button" onClick={removePicture} className="btn ghost small" disabled={!profilePicture && !preview}>Remover</button>
                  </div>
                </div>
              </div>

              {error && <div className="field-error">{error}</div>}
            </div>

            <div className="actions-row">
              <button className="btn primary" onClick={handleUpdateProfile} disabled={loading}>{loading ? "Salvando..." : "Salvar Perfil"}</button>
            </div>
          </section>
        </div>

        {/* Right column: Segurança (top) and Tema (below) */}
        <aside className="right-col">
          <section className="card section security-card">
            <div className="section-header">
              <h3>Segurança</h3>
              <p className="section-sub">Altere sua senha</p>
            </div>

            <div className="field-row">
              <label htmlFor="newPassword">Nova Senha</label>
              <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nova senha" />
            </div>

            <div className="field-row">
              <label htmlFor="confirmPassword">Confirmar Senha</label>
              <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar nova senha" />
            </div>

            <div className="actions-row">
              <button className="btn primary" onClick={handleChangePassword} disabled={loading}>{loading ? "Processando..." : "Alterar Senha"}</button>
            </div>
          </section>

          <section className="card section theme-card-container">
            <div className="section-header">
              <h3>Tema</h3>
              <p className="section-sub">Escolha entre tema claro e escuro</p>
            </div>

            <div className="theme-card">
              <div className="theme-visual">
                <div className={`icon-sun ${theme === "light" ? "active" : ""}`} aria-hidden>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="4" fill="#FFD54A"/>
                    <g stroke="#FFD54A" strokeWidth="1.1" strokeLinecap="round"><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/></g>
                  </svg>
                </div>

                <button
                  className={`theme-toggle ${theme === "dark" ? "dark" : "light"}`}
                  onClick={toggleTheme}
                  role="switch"
                  aria-checked={theme === "dark"}
                  aria-label="Alternar tema claro ou escuro"
                >
                  <span className="toggle-track"><span className="toggle-knob" /></span>
                </button>

                <div className={`icon-moon ${theme === "dark" ? "active" : ""}`} aria-hidden>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="#90CAF9"/>
                  </svg>
                </div>
              </div>

              <div className="theme-info-cta">
                <strong>{theme === "dark" ? "Tema Escuro" : "Tema Claro"}</strong>
                <p className="section-sub">{theme === "dark" ? "Melhor para ambientes com pouca luz" : "Melhor para ambientes claros"}</p>
              </div>
            </div>
          </section>
        </aside>

        {/* Account: full width below */}
        <section className="card section full-account">
          <div className="section-header">
            <h3>Conta</h3>
            <p className="section-sub">Excluir conta ou sair</p>
          </div>

          <div className="warning-block">
            <strong>Atenção:</strong>
            <p>Excluir sua conta é irreversível. Todos os seus posts, comentários e dados serão removidos permanentemente.</p>
          </div>

          <div className="danger-row">
            <button className="btn danger" onClick={() => setConfirmOpen(true)} disabled={loading}>Excluir Conta</button>
            <button className="btn ghost" onClick={() => { logout(); navigate("/signin"); }} disabled={loading}>Sair</button>
          </div>
        </section>
      </div>

      {(message || error) && (
        <div className={`settings-message ${error ? "error" : "success"}`} role="status">
          {error || message}
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Confirmar exclusão"
        description="Tem certeza que deseja excluir sua conta? Essa ação é irreversível e removerá todo o seu conteúdo."
        confirmLabel="CONFIRMAR"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDeleteAccountConfirmed}
        loading={confirmLoading}
      />
    </div>
  );
}