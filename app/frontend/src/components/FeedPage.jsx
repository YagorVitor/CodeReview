import React from "react";
import { useFeed } from "../context/FeedContext";
import PostCard from "./PostCard/PostCard"
import "./FeedPage.css";

function FeedPage() {
  const { posts, loading, error } = useFeed();

  return (
    <div className="feed">
      <h2>Feed</h2>
      {loading ? (
        <p>Carregando feed...</p>
      ) : error ? (
        <p style={{ color: "red" }}>Erro: {error}</p>
      ) : posts.length === 0 ? (
        <p>Nenhum post encontrado.</p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}

export default FeedPage;