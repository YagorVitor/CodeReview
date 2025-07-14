import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";
import "../UserSignup/UserSignup.css";

function UserLogin() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError(true);
      setErrorMessage("Please fill all fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(true);
        setErrorMessage(data.error || "Invalid credentials");
        return;
      }

      const data = await response.json();
      login(data.user, data.token);
      navigate("/feed");
    } catch (err) {
      console.error("Backend connection error:", err);
      setError(true);
      setErrorMessage("Error connecting to server");
    }
  };

  return (
    <div className={`signup-container ${error ? "shake" : ""}`}>
      <h2>Login</h2>
      {error && <p style={{ color: "#ff5555", marginBottom: "1rem" }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit} className="signup-form">
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

        <motion.button
          type="submit"
          className="pulse-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Entrar
        </motion.button>
      </form>
    </div>
  );
}

export default UserLogin;
