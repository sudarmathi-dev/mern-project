import { useEffect, useState, useCallback, useRef } from "react";
import { postsApi } from "../api/endpoints";
import StoriesBar from "../components/StoriesBar";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import "./Feed.css";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const sentinelRef = useRef(null);

  const loadPage = useCallback(async (pageNum) => {
    const { data } = await postsApi.feed(pageNum);
    setPosts((prev) => (pageNum === 1 ? data.posts : [...prev, ...data.posts]));
    setTotalPages(data.totalPages);
    setPage(data.page);
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError("");
      try {
        await loadPage(1);
      } catch {
        setError("Couldn't load the feed. Pull to refresh or try again shortly.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [loadPage]);

  // Infinite scroll: observe a sentinel div at the bottom of the list
  useEffect(() => {
    if (loading || page >= totalPages) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          setLoadingMore(true);
          try {
            await loadPage(page + 1);
          } catch {
            // silently stop; user can scroll again to retry
          } finally {
            setLoadingMore(false);
          }
        }
      },
      { threshold: 0.5 }
    );

    const el = sentinelRef.current;
    if (el) observer.observe(el);
    return () => el && observer.unobserve(el);
  }, [page, totalPages, loading, loadingMore, loadPage]);

  const handlePostCreated = (newPost) => setPosts((prev) => [newPost, ...prev]);
  const handlePostRemoved = (postId) =>
    setPosts((prev) => prev.filter((p) => p._id !== postId));

  return (
    <div className="feed-page">
      <StoriesBar />
      <CreatePost onCreated={handlePostCreated} />

      {loading && <p className="feed-status">Loading feed…</p>}
      {error && <p className="feed-status error-text">{error}</p>}

      {!loading && posts.length === 0 && !error && (
        <div className="feed-empty card">
          <p className="feed-empty-title">Your feed is quiet</p>
          <p className="feed-empty-sub">
            Follow people to see their posts here, or share something yourself.
          </p>
        </div>
      )}

      {posts.map((post) => (
        <PostCard key={post._id} post={post} onRemoved={handlePostRemoved} />
      ))}

      {page < totalPages && <div ref={sentinelRef} className="feed-sentinel" />}
      {loadingMore && <p className="feed-status">Loading more…</p>}
    </div>
  );
};

export default Feed;
