import React, {
  useState,
  useEffect,
  useContext,
  useRef
} from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Pencil } from "lucide-react";
import FollowersModal from "../../components/FollowersModal/FollowersModal";
import BackButton from "../BackButton/BackButton";
import "./UserProfile.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Utilidades de menções
function extractUniqueMentions(text) {
  const regex = /@(\w+)/g;
  const mentions = new Set();
  let match;
  while ((match = regex.exec(text)) !== null) {
    mentions.add(match[1].toLowerCase());
  }
  return Array.from(mentions);
}

function renderMentions(text) {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, idx) =>
    part.startsWith("@") ? (
      <Link key={idx} to={`/user/${part.slice(1)}`} className="mention-link">
        {part}
      </Link>
    ) : (
      part
    )
  );
}

function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

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

  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followerList, setFollowerList] = useState([]);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followingList, setFollowingList] = useState([]);

  const textareaRef = useRef();
  const fileInputRef = useRef();

  useEffect(() => {
    if (!identifier) return;

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const url = id
          ? `${API_URL}/api/users/${id}`
          : `${API_URL}/api/users/by_username/${username}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Usuário não encontrado");
        const data = await res.json();

        setProfile(data);
        setBio(data.bio || "");
        setPreview(
          data.profile_picture
            ? `${API_URL}/${data.profile_picture}?t=${Date.now()}`
            : null
        );
        setIsFollowing(data.is_following || false);
        setNotFound(false);

        const postsRes = await fetch(`${API_URL}/api/posts/user/${data.id}`);
        setPosts(await postsRes.json());

        const followersRes = await fetch(`${API_URL}/api/users/${data.id}/followers`);
        const followersData = await followersRes.json();
        setFollowers(followersData.count ?? 0);
      } catch {
        setNotFound(true);
      }
    };

    fetchProfile();
  }, [id, username, identifier]);

  const validateMentions = async (mentions) => {
    if (mentions.length === 0) return [];
    const res = await fetch(`${API_URL}/api/users/by_usernames`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: mentions }),
    });

    if (!res.ok) throw new Error("Erro ao validar menções");
    return res.json();
  };

  const fetchMentionSuggestions = debounce(async (query) => {
    if (!query) {
      setMentionSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/users/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setMentionSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch {
      setMentionSuggestions([]);
      setShowSuggestions(false);
    }
  }, 300);

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

    setTimeout(() => {
      textarea.setSelectionRange(newBefore.length, newBefore.length);
      textarea.focus();
    }, 0);
  };

  const handleFollowToggle = async () => {
    if (!user) {
      alert("Você precisa estar logado para seguir usuários.");
      return;
    }
    setFollowLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const endpoint = `${API_URL}/api/${isFollowing ? "unfollow" : "follow"}/${profile.id}`;
      const res = await fetch(endpoint, {
        method,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error();
      setIsFollowing(!isFollowing);
      setFollowers((prev) => (isFollowing ? prev - 1 : prev + 1));
    } catch {
      alert("Erro ao atualizar follow");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleEditPictureClick = () => fileInputRef.current?.click();

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPicture(file);
    setEditing(true);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    const mentions = extractUniqueMentions(bio);
    try {
      const validUsers = await validateMentions(mentions);
      const validUsernames = validUsers.map((u) => u.username.toLowerCase());
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
          data.profile_picture
            ? `${API_URL}/${data.profile_picture}?t=${Date.now()}`
            : null
        );
        if (data.id === user.id) login(data, localStorage.getItem("token"));
      }
    } catch (err) {
      setError(err.message || "Erro ao salvar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowersClick = async () => {
    if (!profile) return;
    try {
      const res = await fetch(`${API_URL}/api/users/${profile.id}/followers`);
      const data = await res.json();
      setFollowerList(data.followers || []);
      setShowFollowersModal(true);
    } catch {
      alert("Erro ao buscar seguidores");
    }
  };

  const handleFollowingClick = async () => {
    if (!profile) return;
    try {
      const res = await fetch(`${API_URL}/api/users/${profile.id}/following`);
      const data = await res.json();
      setFollowingList(data);
      setShowFollowingModal(true);
    } catch {
      alert("Erro ao buscar seguindo");
    }
  };

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
    <div className="profile-container">
      <BackButton />
      <div className="profile-header">
        <div className="avatar-wrapper">
          <img
            src={preview || "/default-avatar.png"}
            alt="Avatar"
            className="profile-avatar"
          />
          {isOwnProfile && (
            <>
              <button
                className="edit-picture-btn"
                onClick={handleEditPictureClick}
                title="Editar foto de perfil"
              >
                <Pencil size={20} />
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePictureChange}
                style={{ display: "none" }}
              />
            </>
          )}
        </div>

        <div className="profile-info">
          <div className="profile-info-top">
            <h2>{profile.name}</h2>
            {!isOwnProfile ? (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`follow-btn ${isFollowing ? "following" : "not-following"}`}
              >
                {followLoading ? "..." : isFollowing ? "Deixar de seguir" : "Seguir"}
              </button>
            ) : (
              <button onClick={() => setEditing(!editing)} className="edit-btn">
                {editing ? "Cancelar" : "Editar perfil"}
              </button>
            )}
          </div>

          <div className="profile-follow-stats">
            <span className="profile-followers clickable" onClick={handleFollowersClick}>
              {followers} {followers === 1 ? "seguidor" : "seguidores"}
            </span>
            <span className="profile-followers clickable" onClick={handleFollowingClick}>
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
            placeholder="Digite sua bio..."
          />
          {showSuggestions && (
            <ul className="suggestions-list">
              {mentionSuggestions.map((u) => (
                <li
                  key={u.id}
                  onClick={() => handleSuggestionClick(u.username)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <img
                    src={u.profile_picture ? `${API_URL}/${u.profile_picture}` : "/default-avatar.png"}
                    alt={u.name}
                  />
                  <div>
                    <div className="mention-link">@{u.username}</div>
                    <div style={{ fontSize: "13px", color: "#555" }}>{u.name}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <button onClick={handleSave} disabled={loading} className="save-btn">
            {loading ? "Salvando..." : "Salvar"}
          </button>
          {error && <p className="error-msg">{error}</p>}
        </div>
      ) : (
        <p className="bio-text">{renderMentions(profile.bio || "")}</p>
      )}

      <div className="profile-posts">
        <h3>Publicações</h3>
        {posts.length === 0 ? (
          <p className="no-posts">Sem posts ainda.</p>
        ) : (
          <div className="profile-posts-grid">
            {posts.map((post) => (
              <Link
                to={`/post/${post.id}`}
                key={post.id}
                className="profile-post-grid-item"
                title={post.description || "Ver post"}
              >
                {post.image_url ? (
                  <img
                    src={`${API_URL}/${post.image_url}`}
                    alt="Post"
                    className="profile-post-grid-image"
                  />
                ) : (
                  <div className="profile-post-grid-placeholder">
                    <span>{post.description || "Post sem imagem"}</span>
                  </div>
                )}
              </Link>
            ))}
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
