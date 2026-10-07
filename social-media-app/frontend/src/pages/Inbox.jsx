import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { messagesApi } from "../api/endpoints";
import Avatar from "../components/Avatar";
import { timeAgo } from "../utils/timeAgo";
import "./Inbox.css";

const Inbox = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await messagesApi.inbox();
        setConversations(data.conversations);
      } catch {
        setError("Couldn't load messages.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="inbox-status">Loading…</p>;
  if (error) return <p className="inbox-status error-text">{error}</p>;

  return (
    <div className="inbox-page">
      <h1 className="inbox-title">Messages</h1>

      {conversations.length === 0 ? (
        <div className="inbox-empty card">
          <p>No conversations yet. Visit someone's profile to start one.</p>
        </div>
      ) : (
        <ul className="conversation-list">
          {conversations.map((c) => (
            <li key={c.user._id}>
              <Link to={`/messages/${c.user._id}`} className="conversation-item card">
                <Avatar src={c.user.profilePic} name={c.user.username} size={48} />
                <div className="conversation-body">
                  <div className="conversation-top">
                    <span className="conversation-name">{c.user.username}</span>
                    <span className="conversation-time">{timeAgo(c.lastMessage.createdAt)}</span>
                  </div>
                  <p className="conversation-preview">{c.lastMessage.text}</p>
                </div>
                {c.unreadCount > 0 && <span className="conversation-badge">{c.unreadCount}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Inbox;
