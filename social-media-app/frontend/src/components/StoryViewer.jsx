import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { storiesApi } from "../api/endpoints";
import Avatar from "./Avatar";
import { timeAgo } from "../utils/timeAgo";
import "./StoryViewer.css";

const STORY_DURATION = 5000;

const StoryViewer = ({ group, onClose, onDeleted }) => {
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  const current = group.stories[index];
  const isOwner = current?.user._id === user?._id;

  useEffect(() => {
    if (!current) return;

    storiesApi.view(current._id).catch(() => {});

    setProgress(0);
    const step = 100 / (STORY_DURATION / 50);

    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p + step >= 100) {
          goNext();
          return 0;
        }
        return p + step;
      });
    }, 50);

    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const goNext = () => {
    clearInterval(intervalRef.current);
    if (index < group.stories.length - 1) {
      setIndex((i) => i + 1);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    clearInterval(intervalRef.current);
    if (index > 0) setIndex((i) => i - 1);
  };

  const handleDelete = async () => {
    try {
      await storiesApi.remove(current._id);
      onDeleted?.();
      goNext();
    } catch {
      // no-op; user can retry
    }
  };

  if (!current) return null;

  return (
    <div className="story-viewer-overlay" onClick={onClose}>
      <div className="story-viewer" onClick={(e) => e.stopPropagation()}>
        <div className="story-progress-row">
          {group.stories.map((s, i) => (
            <div key={s._id} className="story-progress-track">
              <div
                className="story-progress-fill"
                style={{ width: i < index ? "100%" : i === index ? `${progress}%` : "0%" }}
              />
            </div>
          ))}
        </div>

        <div className="story-viewer-header">
          <Avatar src={current.user.profilePic} name={current.user.username} size={32} />
          <span className="story-viewer-username">{current.user.username}</span>
          <span className="story-viewer-time">{timeAgo(current.createdAt)}</span>
          {isOwner && (
            <button className="story-viewer-delete" onClick={handleDelete}>
              Delete
            </button>
          )}
          <button className="story-viewer-close" onClick={onClose}>×</button>
        </div>

        <img src={current.image} alt="" className="story-viewer-image" />

        {current.caption && <p className="story-viewer-caption">{current.caption}</p>}

        <button className="story-nav-zone left" onClick={goPrev} aria-label="Previous" />
        <button className="story-nav-zone right" onClick={goNext} aria-label="Next" />
      </div>
    </div>
  );
};

export default StoryViewer;
