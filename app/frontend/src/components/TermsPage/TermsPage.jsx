import React from "react";
import { Link } from "react-router-dom";
import "./TermsPage.css";

function TermsPage() {
  return (
    <main className="legal-page">
      <h1>Terms of Use</h1>
      <p><strong>Last updated:</strong> [July 3, 2025]</p>

      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using this platform, you agree to be bound by these Terms. If you do not agree, please do not use the service.
        </p>
      </section>

      <section>
        <h2>2. Purpose of the Platform</h2>
        <p>
          CodeReview+ is an educational platform designed for submitting and reviewing code for academic purposes. Any illegal or unauthorized commercial use is prohibited.
        </p>
      </section>

      <section>
        <h2>3. Eligibility</h2>
        <p>
          You must be at least 13 years old or have permission from a legal guardian to use the platform.
        </p>
      </section>

      <section>
        <h2>4. User Content</h2>
        <p>
          You are responsible for the code and content you submit. By submitting, you grant CodeReview+ a non-exclusive license to store and display your content for educational purposes.
        </p>
      </section>

      <section>
        <h2>5. Prohibited Conduct</h2>
        <ul>
          <li>Submitting malicious or copyrighted code without authorization;</li>
          <li>Violating the security of the platform;</li>
          <li>Reverse engineering or exploiting system vulnerabilities.</li>
        </ul>
      </section>

      <section>
        <h2>6. Privacy</h2>
        <p>
          By using CodeReview+, you also agree to our{" "}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </section>

      <section>
        <h2>7. Modifications</h2>
        <p>
          We reserve the right to change these Terms at any time. Significant changes will be communicated.
        </p>
      </section>

      <section>
        <h2>8. Termination</h2>
        <p>
          We may suspend or terminate your account if you violate these Terms or applicable laws.
        </p>
      </section>

      <section>
        <h2>9. Limitation of Liability</h2>
        <p>
          This service is provided "as is" without warranties. We are not liable for any damages resulting from the use of the platform.
        </p>
      </section>
    </main>
  );
}

export default TermsPage;
