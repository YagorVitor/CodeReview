import React from "react";
import "./ContactPage.css";

function ContactPage() {
  return (
    <main className="legal-page">
      <h1>Contact Us</h1>
      <p>
        If you have any questions, feedback, or need support, feel free to reach out.
      </p>

      <section>
        <h2>Email</h2>
        <p>
          <a href="mailto:project_codereview+@example.com">
            project_codereview+@gmail.com
          </a>
        </p>
      </section>
    </main>
  );
}

export default ContactPage;