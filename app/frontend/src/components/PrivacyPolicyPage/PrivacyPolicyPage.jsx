import React, { useState } from "react";
import "./PrivacyPolicyPage.css";
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

export default function PrivacyPolicyPage() {
  return (
    <main className="page-container" role="main">
      <div className="legal-panel">
        <BackButton />
        <div className="legal-header">
          <div>
            <h1 className="legal-title">Privacy Policy</h1>
            <p className="kicker"><strong>Last updated:</strong> July 3, 2025</p>
          </div>
        </div>

        <nav className="toc" aria-label="Sumário">
          <details>
            <summary>Sumário</summary>
            <ul>
              <li><a href="#info">1. Information We Collect</a></li>
              <li><a href="#use">2. How We Use the Information</a></li>
              <li><a href="#sharing">3. Data Sharing</a></li>
              <li><a href="#storage">4. Storage and Security</a></li>
              <li><a href="#rights">5. Your Rights</a></li>
              <li><a href="#cookies">6. Cookies</a></li>
              <li><a href="#changes">7. Changes to This Policy</a></li>
            </ul>
          </details>
        </nav>

        <div className="legal-body">
          <Section id="info" title="1. Information We Collect">
            <p><strong>1.1 Personal:</strong> Name, email, and data provided upon registration.</p>
            <p><strong>1.2 Technical:</strong> IP address, browser type, operating system, and usage behavior on the platform.</p>
          </Section>

          <Section id="use" title="2. How We Use the Information">
            <ul>
              <li>To improve user experience;</li>
              <li>To ensure platform security;</li>
              <li>To communicate updates or support information;</li>
              <li>To generate aggregated educational statistics.</li>
            </ul>
          </Section>

          <Section id="sharing" title="3. Data Sharing">
            <p>We do not sell your information. We may share it with essential service providers (e.g., hosting, authentication) or with authorities when legally required.</p>
          </Section>

          <Section id="storage" title="4. Storage and Security">
            <p>Your data is securely stored and protected using modern technical safeguards.</p>
          </Section>

          <Section id="rights" title="5. Your Rights">
            <ul>
              <li>Request access or deletion of your data;</li>
              <li>Correct inaccurate information;</li>
              <li>Withdraw consent for optional uses.</li>
            </ul>
          </Section>

          <Section id="cookies" title="6. Cookies">
            <p>We use cookies to improve your experience. You can manage them in your browser settings.</p>
          </Section>

          <Section id="changes" title="7. Changes to This Policy" openByDefault={false}>
            <p>We may update this policy. Major changes will be communicated via the site or email.</p>
          </Section>
        </div>

        <footer className="legal-footer">
          <small>© 2025 CodeReview+</small>
          <div className="legal-links">
            <a href="/privacy">Políticas de Privacidade</a>
            <a href="/terms">Termos de Serviço</a>
            <a href="/contact">Contato</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
