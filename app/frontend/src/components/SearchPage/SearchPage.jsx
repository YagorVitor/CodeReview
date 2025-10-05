import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./UserSearch.css";

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  const navigate = useNavigate();
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  // detect current username (best-effort): window.APP_USER.username or localStorage.currentUser.username or plain string
  const getCurrentUsername = () => {
    try {
      if (typeof window !== "undefined" && window.APP_USER && window.APP_USER.username) return String(window.APP_USER.username).toLowerCase();
      const ls = localStorage.getItem("currentUser") || localStorage.getItem("user") || localStorage.getItem("CURRENT_USER");
      if (ls) {
        try {
          const parsed = JSON.parse(ls);
          if (parsed && parsed.username) return String(parsed.username).toLowerCase();
        } catch {
          return String(ls).toLowerCase();
        }
      }
    } catch {}
    return null;
  };

  const currentUsername = getCurrentUsername();

  // helper: highlight matching substring (used in render)
  const highlightMatch = (text = "", q = "") => {
    if (!q) return text;
    const lower = text.toLowerCase();
    const qlower = q.toLowerCase();
    const idx = lower.indexOf(qlower);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <strong className="us-highlight">{text.slice(idx, idx + q.length)}</strong>
        {text.slice(idx + q.length)}
      </>
    );
  };

  // Debounce + aborting fetch
  useEffect(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    const q = (query || "").trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        abortRef.current = new AbortController();
        const res = await fetch(
          `http://localhost:5000/api/users/search?q=${encodeURIComponent(q)}`,
          { signal: abortRef.current.signal }
        );
        if (!res.ok) throw new Error("Erro na busca");
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setOpen(Array.isArray(data) && data.length > 0);
        setHighlight(-1);
      } catch (err) {
        if (!abortRef.current?.signal?.aborted) {
          setResults([]);
          setOpen(false);
        }
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    }, 260);

    return () => {
      clearTimeout(timer);
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setHighlight(-1);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  // Keyboard navigation (arrow keys, enter, escape)
  useEffect(() => {
    const onKey = (e) => {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
      } else if (e.key === "Enter") {
        if (highlight >= 0 && results[highlight]) {
          e.preventDefault();
          goTo(results[highlight].username);
        }
      } else if (e.key === "Escape") {
        setOpen(false);
        setHighlight(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, highlight]);

  const goTo = (username) => {
    setQuery("");
    setResults([]);
    setOpen(false);
    setHighlight(-1);
    navigate(`/user/${username}`);
  };

  const toggleFollow = (e, user) => {
    e.stopPropagation();
    setResults((prev) =>
      prev.map((r) => (r.id === user.id ? { ...r, isFollowing: !r.isFollowing } : r))
    );
    // Replace with API call as needed
  };

  return (
    <div className="usersearch" ref={containerRef} aria-label="Busca de usuários">
      <div className="usersearch-bar">
        <div className="usersearch-input-wrap">
          <svg className="usersearch-icon" viewBox="0 0 24 24" aria-hidden>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
          </svg>

          <input
            ref={inputRef}
            className="usersearch-input"
            type="text"
            placeholder="Buscar por nome ou @username"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            onFocus={() => {
              if (results.length) setOpen(true);
            }}
            aria-autocomplete="list"
            aria-controls="user-search-list"
            aria-expanded={open}
            aria-haspopup="listbox"
          />

          {query ? (
            <button
              className="usersearch-clear"
              onClick={() => {
                setQuery("");
                setResults([]);
                setOpen(false);
                inputRef.current?.focus();
              }}
              aria-label="Limpar"
              title="Limpar"
            >
              ×
            </button>
          ) : null}
        </div>
      </div>

      {open && (
        <div className="usersearch-dropdown" role="application">
          <ul id="user-search-list" role="listbox" className="usersearch-list" aria-label="Resultados da busca">
            {loading && <li className="usersearch-empty">Buscando...</li>}

            {!loading && results.length === 0 && <li className="usersearch-empty">Nenhum usuário encontrado</li>}

            {!loading &&
              results.map((user, idx) => {
                const username = (user.username ?? user.user ?? "").toString();
                const isSelf = currentUsername && username.toLowerCase() === currentUsername;
                return (
                  <li
                    key={user.id ?? user._id ?? user.username}
                    role="option"
                    aria-selected={highlight === idx}
                    className={`usersearch-item ${highlight === idx ? "is-highlight" : ""}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => goTo(user.username)}
                    onMouseEnter={() => setHighlight(idx)}
                  >
                    <img
                      className="usersearch-avatar"
                      src={user.profile_picture ? `http://localhost:5000/${user.profile_picture}` : "/default-avatar.png"}
                      alt={user.name || user.username}
                      loading="lazy"
                      width="64"
                      height="64"
                    />

                    <div className="usersearch-info">
                      <div className="usersearch-top">
                        <div className="usersearch-handle">
                          @{typeof user.username === "string" ? highlightMatch(user.username, query) : user.username}
                        </div>

                        {user.verified && <span className="usersearch-verified" title="Verificado">✔︎</span>}
                        <div className="usersearch-fullname">{user.name}</div>
                      </div>

                      {user.bio && <div className="usersearch-bio">{user.bio}</div>}

                      <div className="usersearch-meta" aria-hidden>
                        {user.followersCount !== undefined && <span>{user.followersCount} seguidores</span>}
                        {user.postsCount !== undefined && <span>· {user.postsCount} posts</span>}
                      </div>
                    </div>

                    <div className="usersearch-controls" onClick={(e) => e.stopPropagation()}>
                      {isSelf ? (
                        <button className="us-btn outline" disabled aria-label="É você">
                          Você
                        </button>
                      ) : (
                        <button
                          className={`us-btn ${user.isFollowing ? "outline" : "primary"}`}
                          onClick={(e) => toggleFollow(e, user)}
                          aria-pressed={user.isFollowing}
                        >
                          {user.isFollowing ? "Seguindo" : "Seguir"}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}

            {results.length > 0 && (
              <li className="usersearch-footer">
                <button
                  className="us-link"
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(query)}`);
                    setOpen(false);
                  }}
                >
                  Ver todos os resultados
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}