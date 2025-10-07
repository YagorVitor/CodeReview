import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import "./DMPage.css";

/**
 * DMPage.jsx
 * Página dedicada de Mensagens (estilo Instagram DM). Reaproveita DMPanel.css.
 *
 * Props: none
 * - navegação para /dm/:id ao clicar em conversa
 * - botão "Voltar" que usa Link para Feed
 */

export default function DMPage() {
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // sample data (substitua por fetch/context quando integrar)
  const conversations = [
    { id: "1", name: "Luiz", last: "Ei, você pode revisar meu PR?", unread: 2 },
    { id: "2", name: "Bernardo", last: "Conseguimos conversar mais tarde?", unread: 0 },
    { id: "3", name: "Yagor", last: "Sobre aquele fetch com Flask...", unread: 1 },
  ];

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const openConversation = (id) => {
    navigate(`/dm/${id}`);
  };

  return (
    <main className="feed-page section-transition active" style={{ paddingTop: 12 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 20 }}>
        {/* Left column: conversations list (DM panel) */}
        <aside className="dm-panel section-transition active" style={{ marginLeft: 0 }}>
          <header className="dm-header">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Link to="/feed" className="dm-back" aria-label="Voltar para o feed" style={{ color: "#475569", textDecoration: "none", fontWeight: 700 }}>
                ←
              </Link>
              <strong className="dm-title">Mensagens</strong>
            </div>
            <Link to="/feed" className="dm-close" aria-label="Fechar">
              <X size={18} />
            </Link>
          </header>

          <div className="dm-search">
            <input
              ref={searchRef}
              className="dm-search-input"
              placeholder="Pesquisar"
              aria-label="Pesquisar conversas"
            />
          </div>

          <nav className="dm-list" aria-label="Lista de conversas">
            {conversations.map((c) => (
              <button
                key={c.id}
                className="dm-item"
                onClick={() => openConversation(c.id)}
                type="button"
                aria-pressed="false"
              >
                <div className="dm-item-avatar" aria-hidden="true" />
                <div className="dm-item-body">
                  <div className="dm-item-top">
                    <span className="dm-item-name">{c.name}</span>
                    {c.unread > 0 && <span className="dm-item-unread">{c.unread}</span>}
                  </div>
                  <div className="dm-item-last">{c.last}</div>
                </div>
              </button>
            ))}
          </nav>

          <footer className="dm-footer">
            <Link to="/dm" className="dm-view-all">Ver todas as mensagens</Link>
          </footer>
        </aside>

        {/* Right column: placeholder de conversa selecionada */}
        <section style={{ flex: 1, minHeight: 480, background: "#fff", borderRadius: 12, border: "1px solid rgba(15,20,25,0.06)", boxShadow: "0 12px 34px rgba(11,20,45,0.06)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: 14, borderBottom: "1px solid rgba(15,20,25,0.03)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg,#0ea5ff,#0369a1)" }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Selecione uma conversa</div>
                <div style={{ color: "#64748b", fontSize: 13 }}>Inicie uma nova conversa ou escolha uma existente</div>
              </div>
            </div>
            <div>
              <Link to="/dm/new" style={{ color: "#1da1f2", fontWeight: 700, textDecoration: "none" }}>Nova mensagem</Link>
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontWeight: 700 }}>
            Visualização de conversa — selecione uma conversa à esquerda
          </div>
        </section>
      </div>
    </main>
  );
}
