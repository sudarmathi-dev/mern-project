import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { usersApi, postsApi } from "../api/endpoints";
import Avatar from "../components/Avatar";
import PostCard from "../components/PostCard";
import "./Search.css";

const Search = () => {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("people"); // people | posts
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setUsers([]);
      setPosts([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const [usersRes, postsRes] = await Promise.all([
          usersApi.search(query),
          postsApi.search(query),
        ]);
        setUsers(usersRes.data.users);
        setPosts(postsRes.data.posts);
      } catch {
        // keep previous results on failure
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div className="search-page">
      <input
        className="search-input"
        type="text"
        placeholder="Search people or posts…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />

      {query.trim() && (
        <div className="search-tabs">
          <button
            className={tab === "people" ? "active" : ""}
            onClick={() => setTab("people")}
          >
            People {users.length > 0 && `(${users.length})`}
          </button>
          <button
            className={tab === "posts" ? "active" : ""}
            onClick={() => setTab("posts")}
          >
            Posts {posts.length > 0 && `(${posts.length})`}
          </button>
        </div>
      )}

      {loading && <p className="search-status">Searching…</p>}

      {!loading && tab === "people" && (
        <ul className="search-user-list">
          {users.map((u) => (
            <li key={u._id}>
              <Link to={`/profile/${u.username}`} className="search-user-item card">
                <Avatar src={u.profilePic} name={u.username} size={44} />
                <div>
                  <div className="search-user-name">{u.username}</div>
                  {u.fullName && <div className="search-user-fullname">{u.fullName}</div>}
                </div>
              </Link>
            </li>
          ))}
          {query.trim() && users.length === 0 && (
            <p className="search-status">No people found.</p>
          )}
        </ul>
      )}

      {!loading && tab === "posts" && (
        <div className="search-post-list">
          {posts.map((p) => (
            <PostCard key={p._id} post={p} onRemoved={() => {}} />
          ))}
          {query.trim() && posts.length === 0 && (
            <p className="search-status">No posts found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
