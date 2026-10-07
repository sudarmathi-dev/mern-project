import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { notificationsApi } from "../api/endpoints";
import { useSocket } from "../context/SocketContext";
import Avatar from "./Avatar";
import BellIcon from "./BellIcon";
import { timeAgo } from "../utils/timeAgo";
import "./NotificationsDropdown.css";

const labelFor = (n) => {
  switch (n.type) {
    case "like":
      return "liked your post";
    case "comment":
      return "commented on your post";
    case "follow":
      return "started following you";
    case "message":
      return "sent you a message";
    default:
      return "";
  }
};

const linkFor = (n) => {
  if (n.type === "follow") return `/profile/${n.sender.username}`;
  if (n.type === "message") return `/messages/${n.sender._id}`;
  if (n.post) return `/`; // no single-post page yet; feed is the safe fallback
  return "/";
};

const NotificationsDropdown = () => {
  const { socket } = useSocket();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await notificationsApi.list();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch {
        // silently fail; bell just shows no badge
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleNew = (n) => {
      setNotifications((prev) => [n, ...prev]);
      setUnreadCount((c) => c + 1);
    };
    socket.on("newNotification", handleNew);
    return () => socket.off("newNotification", handleNew);
  }, [socket]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      setUnreadCount(0);
      try {
        await notificationsApi.markAllRead();
      } catch {
        // if this fails, badge just stays cleared client-side; not critical
      }
    }
  };

  return (
    <div className="notif-container" ref={containerRef}>
      <button className="notif-bell" onClick={handleOpen} aria-label="Notifications">
        <BellIcon />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown card">
          <div className="notif-dropdown-header">Notifications</div>
          {loading && <p className="notif-status">Loading…</p>}
          {!loading && notifications.length === 0 && (
            <p className="notif-status">Nothing yet.</p>
          )}
          <ul className="notif-list">
            {notifications.map((n) => (
              <li key={n._id}>
                <Link to={linkFor(n)} className="notif-item" onClick={() => setOpen(false)}>
                  <Avatar src={n.sender.profilePic} name={n.sender.username} size={34} />
                  <div className="notif-text">
                    <span className="notif-name">{n.sender.username}</span> {labelFor(n)}
                    <div className="notif-time">{timeAgo(n.createdAt)}</div>
                  </div>
                  {!n.read && <span className="notif-dot" />}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
