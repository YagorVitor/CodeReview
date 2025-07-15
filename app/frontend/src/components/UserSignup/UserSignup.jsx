import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./UserSignup.css";

function UserSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.username || !formData.email || !formData.password) {
      setError(true);
      setErrorMessage("Please fill all fields including username");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        setError(true);
        setErrorMessage(data.error || "Failed to create user");
        return;
      }

      const data = await response.json();
      console.log("User created:", data);
      navigate("/login");
    } catch (err) {
      console.error("Backend connection error:", err);
      setError(true);
      setErrorMessage("Error connecting to server");
    }
  };

  return (
    <div className={`signup-container ${error ? "shake" : ""}`}>
      <h2>Cadastrar-se</h2>
      {error && <p style={{ color: "#ff5555", marginBottom: "1rem" }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit} className="signup-form">
        <label>
          Nome:
          <input
            type="text"
            name="name"
            placeholder="Seu nome completo"
            value={formData.name}
            onChange={handleChange}
            className={error && !formData.name ? "input-error" : ""}
            required
          />
        </label>

        <label>
          Nome de Usuário:
          <input
            type="text"
            name="username"
            placeholder="Escolha um nome de usuário unico"
            value={formData.username}
            onChange={handleChange}
            className={error && !formData.username ? "input-error" : ""}
            required
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            name="email"
            placeholder="você@exemplo.com"
            value={formData.email}
            onChange={handleChange}
            className={error && !formData.email ? "input-error" : ""}
            required
          />
        </label>

        <label>
          Senha:
          <input
            type="password"
            name="password"
            placeholder="Digite sua senha"
            value={formData.password}
            onChange={handleChange}
            className={error && !formData.password ? "input-error" : ""}
            required
          />
        </label>

        <label className="terms-label">
          <input
            type="checkbox"
            name="terms"
            required
            className="custom-checkbox"
          />
          <span className="terms-text">
            Aceito os
            <span
              className="terms-link"
              onClick={() => navigate("/terms")}
            >
              termos e condições
            </span>
          </span>
        </label>


        <motion.button
          type="submit"
          className="pulse-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Criar Conta
        </motion.button>
      </form>
    </div>
  );
}

export default UserSignup;