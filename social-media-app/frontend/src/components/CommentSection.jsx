import { useState } from "react";
import { postsApi } from "../api/endpoints";
import Avatar from "./Avatar";
import { timeAgo } from "../utils/timeAgo";
import "./CommentSection.css";

const CommentSection = ({ postId, comments, onCommentAdded }) => {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await postsApi.comment(postId, text.trim());
      onCommentAdded(data.comment);
      setText("");
    } catch {
      // silently ignore; comment box just keeps the typed text
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comment-section">
      {comments.length > 0 && (
        <ul className="comment-list">
          {comments.map((c) => (
            <li key={c._id} className="comment-item">
              <Avatar src={c.user?.profilePic} name={c.user?.username} size={28} />
              <div className="comment-body">
                <span className="comment-author">{c.user?.username}</span>{" "}
                <span className="comment-text">{c.text}</span>
                <div className="comment-time">{timeAgo(c.createdAt)}</div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="comment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Add a comment…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
        />
        <button type="submit" disabled={submitting || !text.trim()}>
          Post
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
