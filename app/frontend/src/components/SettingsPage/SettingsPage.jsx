import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./SettingsPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function SettingsPage() {
  const { id } = useParams();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user || user.id.toString() !== id) {
      navigate("/feed");
    } else {
      setName(user.name || "");
      setUsername(user.username || "");
    }
  }, [user, id, navigate]);

  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);
    if (profilePicture) formData.append("profile_picture", profilePicture);

    try {
      const res = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Erro ao atualizar perfil");
      setMessage("Perfil atualizado com sucesso!");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      setMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("As senhas não coincidem.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/users/${user.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!res.ok) throw new Error("Erro ao alterar senha");
      setMessage("Senha alterada com sucesso!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Tem certeza que deseja excluir sua conta? Essa ação é irreversível.")) return;

    try {
      const res = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Erro ao excluir conta");
      logout();
      navigate("/signup");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="settings-page">
      <h2>Configurações da Conta</h2>

      <div className="settings-form">
        <label>Nome</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />

        <label>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />

        <label>Foto de Perfil</label>
        <input type="file" accept="image/*" onChange={(e) => setProfilePicture(e.target.files[0])} />

        <button onClick={handleUpdate}>Salvar Alterações</button>

        <hr />

        <label>Nova Senha</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Nova senha"
        />

        <label>Confirmar Senha</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirmar nova senha"
        />

        <button onClick={handlePasswordChange}>Alterar Senha</button>

        <hr />

        <button className="delete-account-btn" onClick={handleDeleteAccount}>
          Excluir Conta
        </button>

        {message && <p className="settings-message">{message}</p>}
      </div>
    </div>
  );
}

export default SettingsPage;
