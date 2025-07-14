import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * Rota protegida: redireciona para /login se o usuário não estiver autenticado
 */
function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);

  // Se não estiver logado, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
