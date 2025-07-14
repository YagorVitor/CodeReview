import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  return (
    <main className="home">
      <section className="home-intro">
        <h1>Bem vindo ao CodeReview+</h1>
        <p>
          CodeReview+ é uma plataforma colaborativa desenvolvida para estudantes e educadores enviarem, revisarem e aprimorarem códigos em um ambiente acadêmico ou voltado para o aprendizado. Utilizando React com Vite para um frontend rápido e modular, e um backend com Flask para uma orquestração escalável de APIs, o aplicativo oferece uma experiência full-stack coesa.
        </p>

        <button className="button" onClick={handleGetStarted}>
          Comece
        </button>
      </section>
    </main>
  );
}

export default HomePage;
