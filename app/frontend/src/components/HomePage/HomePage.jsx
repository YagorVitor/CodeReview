import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();
  const handleGetStarted = () => navigate("/signup");

  const samplePosts = [
    {
      id: 1,
      user: "ricardo_nogueira",
      when: "55 min atrás",
      title: "Como utilizar contexto no React?",
      lang: "javascript",
      excerpt: `// exemplo de contexto no React
const MyContext = React.createContext();
// ...`,
      likes: 93,
      comments: 23,
    },
    {
      id: 2,
      user: "bernardo",
      when: "2 m atrás",
      title: "Como utilizar IA para análise de dados em Python?",
      lang: "python",
      excerpt: `# exemplo de uso de IA em Python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
# ...`,
      likes: 12,
      comments: 4,
    },
    {
      id: 3,
      user: "yagorvitor",
      when: "2 m atrás",
      title: "Dúvidas sobre login seguro em Java",
      lang: "java",
      excerpt: `// exemplo de sistema de login em Java
public class Login {
  private String username;
  private String password;
  // ...
}`,
      likes: 34,
      comments: 8,
    },
  ];

  const LANG_GROUPS = [
    {
      id: "programming",
      name: "Linguagens de programação",
      subtitle: "Compiladas e interpretadas",
      langs: [
        { key: "javascript", label: "JavaScript" },
        { key: "typescript", label: "TypeScript" },
        { key: "python", label: "Python" },
        { key: "java", label: "Java" },
        { key: "cpp", label: "C++" },
        { key: "csharp", label: "C#" },
        { key: "ruby", label: "Ruby" },
        { key: "go", label: "Go" },
      ],
    },
    {
      id: "markup",
      name: "Marcação e estilo",
      subtitle: "HTML, CSS e formatos de texto",
      langs: [
        { key: "html", label: "HTML" },
        { key: "css", label: "CSS" },
        { key: "markdown", label: "Markdown" },
      ],
    },
  ];

  return (
    <main className="home-surface">
      <div className="home-grid feed-like">
        <header className="hero-left">
          <div className="badge">Plataforma • Aprendizagem</div>

          <h1 className="hero-title">
            Aprenda. Compartilhe. Evolua.
            <span className="brand"> CodeReview+</span>
          </h1>

          <p className="hero-lead">
            Feed de demonstração — ilustra aparência e interações visuais. Conteúdo fictício, não funcional.
          </p>

          <div className="hero-actions">
            <button className="btn-primary" onClick={handleGetStarted}>Comece</button>
            <button className="btn-ghost" onClick={() => navigate("/about")}>Saiba mais</button>
          </div>

          <ul className="features">
            <li>Revisões guiadas</li>
            <li>Snippets por linguagem</li>
            <li>Histórico e comparações</li>
          </ul>

          <div className="supported-langs">
            <div className="langs-title">Linguagens suportadas</div>

            <div className="langs-groups">
              {LANG_GROUPS.map((group) => (
                <div key={group.id} className="lang-group" aria-hidden={false}>
                  <div className="group-name">{group.name}</div>
                  <div className="group-sub">{group.subtitle}</div>
                  <div className="langs-list">
                    {group.langs.map((l) => (
                      <div key={l.key} className={`lang-chip ${l.key}`} title={l.label} role="button" tabIndex={0}>
                        <span className="lang-dot" aria-hidden />
                        <span className="lang-label">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="langs-note muted">Observação: feed é demo visual — suporte real depende do backend</div>
          </div>
        </header>

        <section className="feed-column" aria-live="polite">
          <div className="feed-header">
            <h2>Feed (demo)</h2>
            <div className="feed-actions">
              <button className="btn-ghost" title="Novo post (demo)">Novo post</button>
              <button className="btn-ghost" onClick={() => navigate("/explore")}>Explorar</button>
            </div>
          </div>

          <div className="feed-list">
            {samplePosts.map((p) => (
              <article key={p.id} className="post-card" aria-labelledby={`post-${p.id}-title`}>
                <div className="post-top">
                  <div className="post-user">
                    <div className="avatar-initial" aria-hidden>{p.user.charAt(0).toUpperCase()}</div>
                    <div className="user-meta">
                      <div className="username">@{p.user}</div>
                      <div className="post-time">{p.when}</div>
                    </div>
                  </div>

                  <div className={`post-lang pill ${p.lang}`} aria-hidden>{p.lang}</div>
                </div>

                <div className="post-body">
                  <div id={`post-${p.id}-title`} className="post-title">{p.title}</div>
                  <pre className="post-excerpt" aria-readonly>{p.excerpt}</pre>
                </div>

                <div className="post-actions">
                  <button className="icon-btn" aria-label={`Curtir ${p.likes} vezes`} data-demo>
                    <span className="icon" aria-hidden>❤</span>
                    <span className="count">{p.likes}</span>
                  </button>

                  <button className="icon-btn" aria-label={`Comentários ${p.comments}`} data-demo>
                    <span className="icon" aria-hidden>💬</span>
                    <span className="count">{p.comments}</span>
                  </button>

                  <button className="icon-btn" onClick={() => alert("Visualização de post (demo)")}>Ver</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="home-cta">
          <div className="cta-card">
            <h3>Projetos em destaque</h3>
            <p className="muted">Conteúdo de exemplo: não funcional, apenas demonstração visual.</p>

            <div className="spotlight">
              <div className="spot-card">
                <div className="spot-meta">
                  <div className="spot-title">Algoritmos 101</div>
                  <div className="spot-sub muted">52 contribuições</div>
                </div>
                <div className="spot-action">
                  <button className="btn-ghost">Explorar</button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default HomePage;