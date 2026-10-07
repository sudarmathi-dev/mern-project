import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { messagesApi, usersApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Avatar from "../components/Avatar";
import { timeAgo } from "../utils/timeAgo";
import "./ChatWindow.css";

const ChatWindow = () => {
  const { userId } = useParams();
  const location = useLocation();
  const { user: currentUser } = useAuth();
  const { socket, onlineUsers } = useSocket();

  const [otherUser, setOtherUser] = useState(location.state?.user || null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data: convData } = await messagesApi.conversation(userId);
        setMessages(convData.messages);

        // Derive other user's info from whichever side of the message isn't us
        if (convData.messages.length > 0) {
          const first = convData.messages[0];
          const info = first.sender._id === currentUser._id ? first.receiver : first.sender;
          setOtherUser(info);
        }
      } catch {
        setError("Couldn't load this conversation.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, currentUser._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for real-time messages from this specific conversation
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (msg.sender._id === userId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, userId]);

  const handleSend = useCallback(
    async (e) => {
      e.preventDefault();
      if (!text.trim() || sending) return;

      setSending(true);
      const body = text.trim();
      setText("");

      try {
        const { data } = await messagesApi.send(userId, body);
        setMessages((prev) => [...prev, data.message]);
      } catch {
        setError("Message failed to send.");
        setText(body); // restore text so user can retry
      } finally {
        setSending(false);
      }
    },
    [text, sending, userId]
  );

  const isOnline = onlineUsers.has(userId);

  return (
    <div className="chat-page">
      <header className="chat-header">
        <Link to="/messages" className="chat-back">←</Link>
        {otherUser && (
          <Link to={`/profile/${otherUser.username}`} className="chat-header-user">
            <Avatar src={otherUser.profilePic} name={otherUser.username} size={36} />
            <div>
              <div className="chat-header-name">{otherUser.username}</div>
              <div className="chat-header-status">{isOnline ? "Online" : "Offline"}</div>
            </div>
          </Link>
        )}
      </header>

      <div className="chat-messages">
        {loading && <p className="chat-status">Loading…</p>}
        {error && <p className="chat-status error-text">{error}</p>}

        {!loading && messages.length === 0 && (
          <p className="chat-status">Say hello 👋</p>
        )}

        {messages.map((m) => {
          const isMine = m.sender._id === currentUser._id || m.sender._id === currentUser.id;
          return (
            <div key={m._id} className={`chat-bubble-row ${isMine ? "mine" : ""}`}>
              <div className="chat-bubble">
                {m.text}
                <span className="chat-bubble-time">{timeAgo(m.createdAt)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
        />
        <button type="submit" className="btn btn-primary" disabled={!text.trim() || sending}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
