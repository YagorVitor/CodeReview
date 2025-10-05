import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./TermsPage.css";
import BackButton from "../BackButton/BackButton";

function Section({ id, title, children, openByDefault = true }) {
  const [open, setOpen] = useState(openByDefault);
  return (
    <section id={id} className="legal-section" aria-labelledby={`${id}-title`}>
      <button
        className="section-toggle"
        aria-expanded={open}
        aria-controls={`${id}-content`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="section-marker" aria-hidden />
        <h3 id={`${id}-title`}>{title}</h3>
        <span className="chev" aria-hidden>{open ? "▾" : "▸"}</span>
      </button>

      <div id={`${id}-content`} className={`section-content ${open ? "open" : "closed"}`} role="region">
        {children}
      </div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <main className="page-container" role="main">
      <div className="legal-panel">
        <BackButton label="Voltar" variant="ghost" />
        <div className="legal-header">
          <div>
            <h1 className="legal-title">Terms of Use</h1>
            <p className="kicker"><strong>Last updated:</strong> July 3, 2025</p>
          </div>
        </div>

        <nav className="toc" aria-label="Sumário">
          <details>
            <summary>Sumário</summary>
            <ul>
              <li><a href="#acceptance">1. Acceptance of Terms</a></li>
              <li><a href="#purpose">2. Purpose of the Platform</a></li>
              <li><a href="#eligibility">3. Eligibility</a></li>
              <li><a href="#content">4. User Content</a></li>
              <li><a href="#prohibited">5. Prohibited Conduct</a></li>
              <li><a href="#privacy">6. Privacy</a></li>
              <li><a href="#modifications">7. Modifications</a></li>
              <li><a href="#termination">8. Termination</a></li>
              <li><a href="#liability">9. Limitation of Liability</a></li>
            </ul>
          </details>
        </nav>

        <div className="legal-body">
          <Section id="acceptance" title="1. Acceptance of Terms">
            <p>By accessing or using this platform, you agree to be bound by these Terms. If you do not agree, please do not use the service.</p>
          </Section>

          <Section id="purpose" title="2. Purpose of the Platform">
            <p>CodeReview+ is an educational platform designed for submitting and reviewing code for academic purposes. Any illegal or unauthorized commercial use is prohibited.</p>
          </Section>

          <Section id="eligibility" title="3. Eligibility">
            <p>You must be at least 13 years old or have permission from a legal guardian to use the platform.</p>
          </Section>

          <Section id="content" title="4. User Content">
            <p>You are responsible for the code and content you submit. By submitting, you grant CodeReview+ a non-exclusive license to store and display your content for educational purposes.</p>
          </Section>

          <Section id="prohibited" title="5. Prohibited Conduct">
            <ul>
              <li>Submitting malicious or copyrighted code without authorization;</li>
              <li>Violating the security of the platform;</li>
              <li>Reverse engineering or exploiting system vulnerabilities.</li>
            </ul>
          </Section>

          <Section id="privacy" title="6. Privacy">
            <p>By using CodeReview+, you also agree to our <Link to="/privacy">Privacy Policy</Link>.</p>
          </Section>

          <Section id="modifications" title="7. Modifications">
            <p>We reserve the right to change these Terms at any time. Significant changes will be communicated.</p>
          </Section>

          <Section id="termination" title="8. Termination">
            <p>We may suspend or terminate your account if you violate these Terms or applicable laws.</p>
          </Section>

          <Section id="liability" title="9. Limitation of Liability" openByDefault={false}>
            <p>This service is provided "as is" without warranties. We are not liable for any damages resulting from the use of the platform.</p>
          </Section>
        </div>

        <footer className="legal-footer">
          <small>© 2025 CodeReview+</small>
          <div className="legal-links">
            <Link to="/privacy">Políticas de Privacidade</Link>
            <Link to="/terms">Termos de Serviço</Link>
            <Link to="/contact">Contato</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}