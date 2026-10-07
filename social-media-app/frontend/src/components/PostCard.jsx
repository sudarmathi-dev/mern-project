import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postsApi } from "../api/endpoints";
import Avatar from "./Avatar";
import HeartIcon from "./HeartIcon";
import CommentIcon from "./CommentIcon";
import CommentSection from "./CommentSection";
import { timeAgo } from "../utils/timeAgo";
import "./PostCard.css";

const PostCard = ({ post, onRemoved }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likes.includes(user?._id));
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(post.caption || "");
  const [savingEdit, setSavingEdit] = useState(false);
  const [edited, setEdited] = useState(post.edited || false);

  const handleSaveEdit = async () => {
    if (savingEdit) return;
    setSavingEdit(true);
    try {
      const { data } = await postsApi.update(post._id, { caption });
      setCaption(data.post.caption);
      setEdited(true);
      setEditing(false);
    } catch {
      // keep edit mode open so the user can retry
    } finally {
      setSavingEdit(false);
    }
  };

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);

    // Optimistic update
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((c) => c + (nextLiked ? 1 : -1));

    try {
      await postsApi.like(post._id);
    } catch {
      // revert on failure
      setLiked(!nextLiked);
      setLikesCount((c) => c + (nextLiked ? -1 : 1));
    } finally {
      setLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      await postsApi.remove(post._id);
      onRemoved?.(post._id);
    } catch {
      // no-op; user can retry
    }
  };

  const isOwner = post.user?._id === user?._id;

  return (
    <article className="post-card card">
      <header className="post-header">
        <Link to={`/profile/${post.user?.username}`} className="post-header-user">
          <Avatar src={post.user?.profilePic} name={post.user?.username} size={40} />
          <div>
            <div className="post-author">{post.user?.username}</div>
            <div className="post-time">{timeAgo(post.createdAt)}</div>
          </div>
        </Link>
        {isOwner && (
          <div className="post-owner-actions">
            <button className="post-edit" onClick={() => setEditing((e) => !e)} aria-label="Edit post">
              ✎
            </button>
            <button className="post-delete" onClick={handleDelete} aria-label="Delete post">
              ×
            </button>
          </div>
        )}
      </header>

      {editing ? (
        <div className="post-edit-form">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            maxLength={2200}
          />
          <div className="post-edit-actions">
            <button className="btn btn-ghost" onClick={() => { setEditing(false); setCaption(post.caption || ""); }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveEdit} disabled={savingEdit}>
              {savingEdit ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      ) : (
        caption && (
          <p className="post-caption">
            {caption}
            {edited && <span className="post-edited-tag"> (edited)</span>}
          </p>
        )
      )}

      {post.image && (
        <div className="post-image-wrap">
          <img src={post.image} alt="" className="post-image" loading="lazy" />
        </div>
      )}

      <div className="post-actions">
        <button
          className={`post-action ${liked ? "liked" : ""}`}
          onClick={handleLike}
        >
          <HeartIcon filled={liked} />
          <span>{likesCount}</span>
        </button>
        <button className="post-action" onClick={() => setShowComments((s) => !s)}>
          <CommentIcon />
          <span>{comments.length}</span>
        </button>
      </div>

      {showComments && (
        <CommentSection
          postId={post._id}
          comments={comments}
          onCommentAdded={(c) => setComments((prev) => [...prev, c])}
        />
      )}
    </article>
  );
};

export default PostCard;
