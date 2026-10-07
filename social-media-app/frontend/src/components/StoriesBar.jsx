import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { storiesApi, uploadApi } from "../api/endpoints";
import Avatar from "./Avatar";
import StoryViewer from "./StoryViewer";
import "./StoriesBar.css";

const StoriesBar = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewingGroup, setViewingGroup] = useState(null);
  const fileInputRef = useRef(null);

  const loadStories = async () => {
    try {
      const { data } = await storiesApi.feed();
      setGroups(data.storyGroups);
    } catch {
      // silently fail; bar just stays empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  const myGroup = groups.find((g) => g.user._id === user?._id);
  const otherGroups = groups.filter((g) => g.user._id !== user?._id);

  const handleAddStory = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: uploadData } = await uploadApi.image(file, "story");
      await storiesApi.create({ image: uploadData.url });
      await loadStories();
    } catch {
      // if this fails, the user can just retry the add-story tap
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) return null;

  return (
    <>
      <div className="stories-bar">
        <div className="story-ring-wrap">
          <button
            className={`story-ring ${myGroup ? "has-story" : "add-story"}`}
            onClick={() => (myGroup ? setViewingGroup(myGroup) : fileInputRef.current?.click())}
          >
            <Avatar src={user?.profilePic} name={user?.username} size={58} />
            {!myGroup && <span className="story-plus">+</span>}
          </button>
          <span className="story-label">Your story</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleAddStory}
          />
        </div>

        {uploading && (
          <div className="story-ring-wrap">
            <div className="story-ring uploading">
              <Avatar name={user?.username} size={58} />
            </div>
            <span className="story-label">Uploading…</span>
          </div>
        )}

        {otherGroups.map((group) => (
          <div className="story-ring-wrap" key={group.user._id}>
            <button className="story-ring has-story" onClick={() => setViewingGroup(group)}>
              <Avatar src={group.user.profilePic} name={group.user.username} size={58} />
            </button>
            <span className="story-label">{group.user.username}</span>
          </div>
        ))}
      </div>

      {viewingGroup && (
        <StoryViewer
          group={viewingGroup}
          onClose={() => setViewingGroup(null)}
          onDeleted={loadStories}
        />
      )}
    </>
  );
};

export default StoriesBar;
