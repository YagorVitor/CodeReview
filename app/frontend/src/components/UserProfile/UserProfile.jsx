import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback
} from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Pencil } from "lucide-react";
import FollowersModal from "../../components/FollowersModal/FollowersModal";
import BackButton from "../BackButton/BackButton";
import "./UserProfile.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ---------- Utilities ---------- */

function extractUniqueMentions(text = "") {
  const regex = /@(\w+)/g;
  const mentions = new Set();
  let match;
  while ((match = regex.exec(text)) !== null) {
    mentions.add(match[1].toLowerCase());
  }
  return Array.from(mentions);
}

function renderMentions(text = "") {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, idx) =>
    part.startsWith("@") ? (
      <Link key={idx} to={`/user/${part.slice(1)}`} className="mention-link">
        {part}
      </Link>
    ) : (
      <React.Fragment key={idx}>{part}</React.Fragment>
    )
  );
}

/* ---------- Component ---------- */

function UserProfile() {
  const { user, login } = useContext(AuthContext);
  const { id, username } = useParams();
  const identifier = id || username;

  const isOwnProfile =
    !identifier ||
    (id && user?.id === parseInt(id)) ||
    (username && user?.username === username);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [picture, setPicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followerList, setFollowerList] = useState([]);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followingList, setFollowingList] = useState([]);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const suggestionsTimeoutRef = useRef(null);
  const suggestionsAbortRef = useRef(null);
  const componentMountedRef = useRef(true);
  const wrapperRef = useRef(null);

  useEffect(() => {
    componentMountedRef.current = true;
    return () => {
      componentMountedRef.current = false;
      // cleanup any pending suggestion timers / aborts
      if (suggestionsTimeoutRef.current) clearTimeout(suggestionsTimeoutRef.current);
      if (suggestionsAbortRef.current) suggestionsAbortRef.current.abort();
    };
  }, []);

  useEffect(() => {
    if (!identifier) return;

    const controller = new AbortController();
    const fetchProfile = async () => {
      try {
        setNotFound(false);
        setError(null);

        const token = localStorage.getItem("token");
        const url = id
          ? `${API_URL}/api/users/${id}`
          : `${API_URL}/api/users/by_username/${username}`;

        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });

        if (!res.ok) {
          if (res.status === 404) {
            setNotFound(true);
            return;
          }
          throw new Error("Erro ao buscar usuário");
        }
        const data = await res.json();
        if (!componentMountedRef.current) return;

        setProfile(data);
        setBio(data.bio || "");
        setPreview(
          data.profile_picture ? `${API_URL}/${data.profile_picture}?t=${Date.now()}` : null
        );
        setIsFollowing(Boolean(data.is_following));
        setNotFound(false);

        // fetch posts and follower count in parallel
        const postsPromise = fetch(`${API_URL}/api/posts/user/${data.id}`, {
          signal: controller.signal,
        }).then((r) => r.ok ? r.json() : []);

        const followersPromise = fetch(`${API_URL}/api/users/${data.id}/followers`, {
          signal: controller.signal,
        }).then((r) => r.ok ? r.json() : { count: 0 });

        const [postsData, followersData] = await Promise.all([postsPromise, followersPromise]);
        if (!componentMountedRef.current) return;

        setPosts(Array.isArray(postsData) ? postsData : postsData.posts ?? []);
        setFollowers(followersData.count ?? 0);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("fetchProfile error:", err);
        setNotFound(true);
      }
    };

    fetchProfile();
    return () => controller.abort();
  }, [id, username, identifier]);

  const validateMentions = useCallback(async (mentions) => {
    if (!mentions || mentions.length === 0) return [];
    const res = await fetch(`${API_URL}/api/users/by_usernames`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: mentions }),
    });
    if (!res.ok) throw new Error("Erro ao validar menções");
    return res.json();
  }, []);

  const fetchMentionSuggestions = useCallback((query) => {
    // debounce logic with cleanup/abort
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
      suggestionsTimeoutRef.current = null;
    }
    if (!query) {
      setMentionSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    suggestionsTimeoutRef.current = setTimeout(async () => {
      try {
        if (suggestionsAbortRef.current) suggestionsAbortRef.current.abort();
        suggestionsAbortRef.current = new AbortController();

        const res = await fetch(`${API_URL}/api/users/search?q=${encodeURIComponent(query)}`, {
          signal: suggestionsAbortRef.current.signal,
        });
        if (!res.ok) {
          setMentionSuggestions([]);
          setShowSuggestions(false);
          return;
        }
        const data = await res.json();
        setMentionSuggestions(data || []);
        setShowSuggestions(Array.isArray(data) && data.length > 0);
        setSuggestionIndex(0);
      } catch (err) {
        if (err.name === "AbortError") return;
        setMentionSuggestions([]);
        setShowSuggestions(false);
      }
    }, 260);
  }, []);

  const handleTextareaChange = (e) => {
    const val = e.target.value;
    setBio(val);

    const cursorPos = e.target.selectionStart;
    const textUntilCursor = val.slice(0, cursorPos);
    const mentionMatch = textUntilCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      fetchMentionSuggestions(mentionMatch[1]);
    } else {
      setShowSuggestions(false);
      setMentionSuggestions([]);
    }
  };

  const handleSuggestionClick = (username) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const val = bio;
    const before = val.slice(0, cursorPos);
    const after = val.slice(cursorPos);
    const newBefore = before.replace(/@(\w*)$/, `@${username} `);
    const newBio = newBefore + after;

    setBio(newBio);
    setShowSuggestions(false);
    setMentionSuggestions([]);

    // place cursor after inserted mention
    setTimeout(() => {
      textarea.setSelectionRange(newBefore.length, newBefore.length);
      textarea.focus();
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || mentionSuggestions.length === 0) return;
    const len = mentionSuggestions.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSuggestionIndex((prev) => (prev + 1) % len);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSuggestionIndex((prev) => (prev - 1 + len) % len);
    } else if (e.key === "Enter") {
      // if an item is highlighted, pick it
      if (suggestionIndex >= 0 && suggestionIndex < mentionSuggestions.length) {
        e.preventDefault();
        handleSuggestionClick(mentionSuggestions[suggestionIndex].username);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setMentionSuggestions([]);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      alert("Você precisa estar logado para seguir usuários.");
      return;
    }
    if (!profile) return;
    setFollowLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const endpoint = `${API_URL}/api/${isFollowing ? "unfollow" : "follow"}/${profile.id}`;
      const res = await fetch(endpoint, {
        method,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Erro ao atualizar follow");
      setIsFollowing((f) => !f);
      setFollowers((prev) => (isFollowing ? Math.max(0, prev - 1) : prev + 1));
    } catch (err) {
      console.error("follow error:", err);
      alert("Erro ao atualizar follow");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleEditPictureClick = () => fileInputRef.current?.click();

  const handlePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPicture(file);
    setEditing(true);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) {
      alert("Você precisa estar logado para editar o perfil.");
      return;
    }
    setLoading(true);
    setError(null);

    const mentions = extractUniqueMentions(bio);
    try {
      const validUsers = await validateMentions(mentions);
      const validUsernames = (validUsers || []).map((u) => u.username.toLowerCase());
      const invalidMentions = mentions.filter((m) => !validUsernames.includes(m));
      if (invalidMentions.length > 0) {
        alert(`Usuários não encontrados: ${invalidMentions.join(", ")}`);
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("bio", bio);
      if (picture) formData.append("profile_picture", picture);

      const res = await fetch(`${API_URL}/api/users/${user.id}/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao atualizar perfil");
      } else {
        setProfile(data);
        setEditing(false);
        setPicture(null);
        setPreview(
          data.profile_picture ? `${API_URL}/${data.profile_picture}?t=${Date.now()}` : null
        );
        //もし the logged user updated their own profile -> refresh auth context
        if (data.id === user.id) login(data, localStorage.getItem("token"));
      }
    } catch (err) {
      console.error("save profile error:", err);
      setError(err.message || "Erro ao salvar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowersClick = async () => {
    if (!profile) return;
    try {
      const res = await fetch(`${API_URL}/api/users/${profile.id}/followers`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFollowerList(data.followers || []);
      setShowFollowersModal(true);
    } catch (err) {
      console.error("fetch followers error:", err);
      alert("Erro ao buscar seguidores");
    }
  };

  const handleFollowingClick = async () => {
    if (!profile) return;
    try {
      const res = await fetch(`${API_URL}/api/users/${profile.id}/following`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFollowingList(data || []);
      setShowFollowingModal(true);
    } catch (err) {
      console.error("fetch following error:", err);
      alert("Erro ao buscar seguindo");
    }
  };

  // click outside to close suggestions
  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  if (notFound) {
    return (
      <div className="profile-container">
        <BackButton />
        <h2>Usuário não encontrado.</h2>
        <p>Verifique o link ou tente outro nome.</p>
      </div>
    );
  }

  if (!profile) return <p>Carregando perfil...</p>;

  return (
    <div className="profile-container" ref={wrapperRef}>
      <BackButton />
      <div className="profile-header" role="region" aria-label="Cabeçalho do perfil">
        <div className="avatar-wrapper" aria-hidden={!profile.profile_picture}>
          <img
            src={preview || "/default-avatar.png"}
            alt={`${profile.name || profile.username}'s avatar`}
            className="profile-avatar"
            loading="lazy"
          />
          {isOwnProfile && (
            <>
              <button
                className="edit-picture-btn"
                onClick={handleEditPictureClick}
                title="Editar foto de perfil"
                aria-label="Editar foto de perfil"
              >
                <Pencil size={18} />
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePictureChange}
                style={{ display: "none" }}
                aria-hidden
              />
            </>
          )}
        </div>

        <div className="profile-info">
          <div className="profile-info-top">
            <h2>{profile.name || profile.username}</h2>
            {!isOwnProfile ? (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`follow-btn ${isFollowing ? "following" : "not-following"}`}
                aria-pressed={isFollowing}
                aria-label={isFollowing ? "Deixar de seguir" : "Seguir"}
              >
                {followLoading ? "..." : isFollowing ? "Deixar de seguir" : "Seguir"}
              </button>
            ) : (
              <button
                onClick={() => {
                  // toggle edit mode, reset temporary errors
                  setEditing((v) => !v);
                  setError(null);
                }}
                className="edit-btn"
              >
                {editing ? "Cancelar" : "Editar perfil"}
              </button>
            )}
          </div>

          <div className="profile-follow-stats" aria-label="Estatísticas de seguidor">
            <span
              className="profile-followers clickable"
              onClick={handleFollowersClick}
              role="button"
              tabIndex={0}
              aria-label={`${followers} ${followers === 1 ? "seguidor" : "seguidores"}`}
            >
              {followers} {followers === 1 ? "seguidor" : "seguidores"}
            </span>
            <span
              className="profile-followers clickable"
              onClick={handleFollowingClick}
              role="button"
              tabIndex={0}
              aria-label={`${profile.following_count ?? 0} seguindo`}
            >
              {profile.following_count ?? 0} seguindo
            </span>
          </div>
        </div>
      </div>

      {editing ? (
        <div className="profile-edit">
          <textarea
            ref={textareaRef}
            value={bio}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua bio..."
            aria-label="Biografia"
          />
          {showSuggestions && (
            <ul
              className="suggestions-list"
              role="listbox"
              aria-label="Sugestões de menções"
              aria-activedescendant={
                mentionSuggestions[suggestionIndex] ? `mention-${mentionSuggestions[suggestionIndex].id}` : undefined
              }
            >
              {mentionSuggestions.map((u, idx) => (
                <li
                  key={u.id}
                  id={`mention-${u.id}`}
                  role="option"
                  aria-selected={idx === suggestionIndex}
                  onClick={() => handleSuggestionClick(u.username)}
                  onMouseDown={(e) => e.preventDefault()}
                  style={{
                    background: idx === suggestionIndex ? "rgba(255,255,255,0.02)" : undefined,
                  }}
                >
                  <img
                    src={u.profile_picture ? `${API_URL}/${u.profile_picture}` : "/default-avatar.png"}
                    alt={`${u.name || u.username} avatar`}
                    loading="lazy"
                  />
                  <div>
                    <div className="mention-link">@{u.username}</div>
                    <div style={{ fontSize: "13px", color: "#8b98a3" }}>{u.name}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <button onClick={handleSave} disabled={loading} className="save-btn" aria-disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
          {error && <p className="error-msg" role="alert">{error}</p>}
        </div>
      ) : (
        <p className="bio-text">{renderMentions(profile.bio || "")}</p>
      )}

      <div className="profile-posts" aria-live="polite">
        <h3>Publicações</h3>
        {posts.length === 0 ? (
          <p className="no-posts">Sem posts ainda.</p>
        ) : (
          <div className="profile-posts-grid">
            {posts.map((post) => {
              // defensive read of counts (backend may use different keys)
              const likesCount = post.likes_count ?? (Array.isArray(post.likes) ? post.likes.length : 0);
              const commentsCount = post.comments_count ?? (Array.isArray(post.comments) ? post.comments.length : 0);

              return (
                <Link
                  to={`/post/${post.id}`}
                  key={post.id}
                  className="profile-post-grid-item"
                  title={post.description || "Ver post"}
                  aria-label={post.description || `Post ${post.id}`}
                >
                  {post.image_url ? (
                    <>
                      <img
                        src={`${API_URL}/${post.image_url}`}
                        alt={post.description || "Publicação"}
                        className="profile-post-grid-image"
                        loading="lazy"
                      />
                      <div className="post-overlay" aria-hidden="true">
                        <div className="pill">❤️ {likesCount}</div>
                        <div className="pill">💬 {commentsCount}</div>
                      </div>
                    </>
                  ) : (
                    <div className="profile-post-grid-placeholder">
                      <span>{post.description || "Post sem imagem"}</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {showFollowersModal && (
        <FollowersModal
          followers={followerList}
          onClose={() => setShowFollowersModal(false)}
          title="Seguidores"
        />
      )}
      {showFollowingModal && (
        <FollowersModal
          followers={followingList}
          onClose={() => setShowFollowingModal(false)}
          title="Seguindo"
        />
      )}
    </div>
  );
}

export default UserProfile;