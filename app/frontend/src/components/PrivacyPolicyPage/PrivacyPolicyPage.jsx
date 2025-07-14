import React from "react";
import "./PrivacyPolicyPage.css";

function PrivacyPolicyPage() {
  return (
    <main className="legal-page">
      <h1>Privacy Policy</h1>
      <p><strong>Last updated:</strong> [July 3, 2025]</p>

      <section>
        <h2>1. Information We Collect</h2>
        <p><strong>1.1 Personal:</strong> Name, email, and data provided upon registration.</p>
        <p><strong>1.2 Technical:</strong> IP address, browser type, operating system, and usage behavior on the platform.</p>
      </section>

      <section>
        <h2>2. How We Use the Information</h2>
        <ul>
          <li>To improve user experience;</li>
          <li>To ensure platform security;</li>
          <li>To communicate updates or support information;</li>
          <li>To generate aggregated educational statistics.</li>
        </ul>
      </section>

      <section>
        <h2>3. Data Sharing</h2>
        <p>
          We do not sell your information. We may share it with essential service providers (e.g., hosting, authentication) or with authorities when legally required.
        </p>
      </section>

      <section>
        <h2>4. Storage and Security</h2>
        <p>
          Your data is securely stored and protected using modern technical safeguards.
        </p>
      </section>

      <section>
        <h2>5. Your Rights</h2>
        <ul>
          <li>Request access or deletion of your data;</li>
          <li>Correct inaccurate information;</li>
          <li>Withdraw consent for optional uses.</li>
        </ul>
      </section>

      <section>
        <h2>6. Cookies</h2>
        <p>
          We use cookies to improve your experience. You can manage them in your browser settings.
        </p>
      </section>

      <section>
        <h2>7. Changes to This Policy</h2>
        <p>
          We may update this policy. Major changes will be communicated via the site or email.
        </p>
      </section>
    </main>
  );
}

export default PrivacyPolicyPage;