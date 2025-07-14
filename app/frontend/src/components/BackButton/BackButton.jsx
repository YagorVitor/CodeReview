import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./BackButton.css";

function BackButton({ label = "Voltar" }) {
  const navigate = useNavigate();

  return (
    <button className="back-button" onClick={() => navigate(-1)}>
      <ArrowLeft size={20} />
      <span>{label}</span>
    </button>
  );
}

export default BackButton;