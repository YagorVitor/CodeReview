import React from "react";
import { Link } from "react-router-dom";
import "./FooterPage.css";

function FooterPage() {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} CodeReview+</p>
      <nav>
        <ul className="footer-nav">
          <li><Link to="/privacy" className="footer-link">Politicas de Privacidade</Link></li>
          <li><Link to="/terms" className="footer-link">Termos de Servico</Link></li>
          <li><Link to="/contact" className="footer-link">Contato</Link></li>
        </ul>
      </nav>
    </footer>
  );
}

export default FooterPage;
