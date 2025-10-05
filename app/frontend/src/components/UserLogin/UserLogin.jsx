import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";
import "./UserLogin.css";

function UserLogin() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (error) setError(false);
    if (name === "password") setPasswordStrength(calcStrength(value));
  };

  const calcStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0..4
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError(true);
      setErrorMessage("Preencha todos os campos");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(true);
        setErrorMessage(data.error || "Credenciais inválidas");
        setLoading(false);
        return;
      }

      const data = await response.json();
      login(data.user, data.token);
      navigate("/feed");
    } catch (err) {
      console.error("Backend connection error:", err);
      setError(true);
      setErrorMessage("Erro ao conectar com o servidor");
      setLoading(false);
    }
  };

  return (
    <motion.section
      className={`login-panel ${error ? "shake" : ""}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      aria-labelledby="login-heading"
      role="main"
    >
      <div className="panel-inner">
        <div className="brand-row">
          <img src="/public/img/logotype_blue.png" alt="CodeReview+" className="brand-logo" />
          <div className="brand-text">
            <h1 id="login-heading">Entrar</h1>
            <div className="sub">Acesse sua conta e comece a revisar código</div>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="floating input-wrap">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder=" "
              autoComplete="email"
              aria-label="Email"
              required
            />
            <span className="float-label">Email</span>
            <span className="field-suffix">@</span>
          </div>

          <div className="floating input-wrap">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder=" "
              autoComplete="current-password"
              aria-label="Senha"
              required
            />
            <span className="float-label">Senha</span>
            <button
              type="button"
              className="show-btn"
              onClick={() => setShowPassword((s) => !s)}
              aria-pressed={showPassword}
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>

            <div className={`pwd-strength s-${passwordStrength}`}>
              <div className="bar" />
              <div className="bar" />
              <div className="bar" />
              <div className="bar" />
              <div className="label">Força da senha</div>
            </div>
          </div>

          {error && <div className="error-block" role="alert">{errorMessage}</div>}

          <div className="row-between">
            <label className="remember">
              <input type="checkbox" name="remember" />
              Lembrar de mim
            </label>

            <Link to="/forgot" className="forgot-link">Esqueci a senha</Link>
          </div>

          <motion.button
            type="submit"
            className="cta"
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? <span className="loader" aria-hidden /> : "Entrar"}
          </motion.button>
        </form>

        <div className="form-foot">
          <div className="signup-line">Não tem conta? <Link to="/signup">Cadastre-se</Link></div>
          <div className="legal">© 2025 CodeReview+ — Demo visual</div>
        </div>
      </div>
    </motion.section>
  );
}

export default UserLogin;