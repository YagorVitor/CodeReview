import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./BackButton.css";

export default function BackButton({
  label = "Voltar",
  variant = "ghost", // 'ghost' | 'solid'
  size = "md",       // 'sm' | 'md' | 'lg'
  ariaLabel,
}) {
  const navigate = useNavigate();
  const handleClick = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  const classes = [
    "back-button",
    `back-button--${variant}`,
    `back-button--${size}`,
  ].join(" ");

  return (
    <button
      type="button"
      className={classes}
      onClick={handleClick}
      aria-label={ariaLabel || label}
      title={label}
    >
      <span className="back-button__icon" aria-hidden>
        <ArrowLeft size={18} />
      </span>
      <span className="back-button__label">{label}</span>
      <span className="back-button__ripple" aria-hidden />
    </button>
  );
}