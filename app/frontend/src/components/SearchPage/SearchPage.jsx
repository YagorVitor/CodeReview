import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Debounce simples
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/users/search?q=${encodeURIComponent(query)}`
        );
        if (!res.ok) throw new Error("Erro na busca");
        const data = await res.json();
        setResults(data);
        setShowDropdown(data.length > 0);
      } catch {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300); // debounce 300ms

    return () => clearTimeout(handler);
  }, [query]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectUser = (username) => {
    setQuery("");
    setShowDropdown(false);
    navigate(`/user/${username}`);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: 250,
        marginLeft: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
      aria-label="Busca de usuários"
    >
      <h3 style={{ fontWeight: "600", color: "#00BFFF", margin: 0 }}>
        Search for users
      </h3>
      <input
        type="search"
        placeholder="Search for users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        ref={inputRef}
        style={{
          width: "100%",
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid #ccc",
          fontSize: 16,
        }}
        aria-autocomplete="list"
        aria-controls="user-search-list"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
      />
      {showDropdown && (
        <ul
          id="user-search-list"
          role="listbox"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            maxHeight: 250,
            overflowY: "auto",
            backgroundColor: "white",
            border: "1.5px solid #007bff",
            borderRadius: 10,
            marginTop: 6,
            padding: 0,
            listStyle: "none",
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {results.map((user) => (
            <li
              key={user.id}
              role="option"
              aria-selected="false"
              onMouseDown={(e) => e.preventDefault()} // evita perda do foco do input
              onClick={() => handleSelectUser(user.username)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 14px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#e6f0ff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <img
                src={
                  user.profile_picture
                    ? `http://localhost:5000/${user.profile_picture}`
                    : "/default-avatar.png"
                }
                alt={`${user.name} avatar`}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  marginRight: 12,
                  objectFit: "cover",
                  boxShadow: "0 0 5px rgba(0,0,0,0.1)",
                }}
              />
              <div>
                <div
                  style={{
                    fontWeight: "600",
                    color: "#007bff",
                    fontSize: 15,
                  }}
                >
                  @{user.username}
                </div>
                <div style={{ fontSize: 13, color: "#555" }}>{user.name}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserSearch;