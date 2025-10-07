import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFeed } from "../context/FeedContext";
import PostCard from "../components/PostCard/PostCard";
import "./FeedPage.css";

function FeedPage() {
  const { posts, loading, error } = useFeed();
  const [viewMode, setViewMode] = useState("feed");
  const [visiblePosts, setVisiblePosts] = useState(12);
  const [filteredPosts, setFilteredPosts] = useState([]);

  useEffect(() => {
    if (posts && posts.length > 0) setFilteredPosts(posts);
  }, [posts]);

  const handleLoadMore = () => setVisiblePosts((prev) => prev + 8);
  const handleToggleView = (mode) => setViewMode(mode);

  if (loading) return <div className="feed-loading">Carregando posts...</div>;
  if (error) return <div className="error">Erro: {error}</div>;

  const displayedPosts = filteredPosts.slice(0, visiblePosts);

  // Variants para animações do Framer Motion
  const sectionVariants = {
    hidden: { opacity: 0, y: 8, scale: 0.996 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  const tileVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="feed-page">
      <header className="feed-header">
        <h2 className="feed-title">{viewMode === "feed" ? "Feed" : "Explorar"}</h2>

        <div className="feed-toggle" role="tablist" aria-label="Feed ou Explorar">
          <button
            className={`toggle-btn ${viewMode === "feed" ? "active" : ""}`}
            onClick={() => handleToggleView("feed")}
            role="tab"
            aria-selected={viewMode === "feed"}
          >
            Feed
          </button>

          <button
            className={`toggle-btn ${viewMode === "explore" ? "active" : ""}`}
            onClick={() => handleToggleView("explore")}
            role="tab"
            aria-selected={viewMode === "explore"}
          >
            Explorar
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {viewMode === "feed" && (
          <motion.section
            key="feed"
            className="feed-list"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.35, ease: [0.2, 0.9, 0.3, 1] }}
          >
            {displayedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </motion.section>
        )}

        {viewMode === "explore" && (
          <motion.section
            key="explore"
            className="explore-grid"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.35, ease: [0.2, 0.9, 0.3, 1] }}
          >
            {displayedPosts.map((post, index) => (
              <motion.div
                key={post.id}
                className="explore-tile"
                variants={tileVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.03, duration: 0.25 }}
              >
                <PostCard post={post} compact />
              </motion.div>
            ))}
          </motion.section>
        )}
      </AnimatePresence>

      <div className="explore-actions">
        {visiblePosts < filteredPosts.length ? (
          <button onClick={handleLoadMore} className="load-more-btn">
            Carregar mais
          </button>
        ) : (
          <div className="end-msg">Você chegou ao fim!</div>
        )}
      </div>
    </div>
  );
}

export default FeedPage;