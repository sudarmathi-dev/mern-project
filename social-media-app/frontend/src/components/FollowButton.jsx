import { useState } from "react";
import { usersApi } from "../api/endpoints";

const FollowButton = ({ userId, initiallyFollowing, onToggled }) => {
  const [following, setFollowing] = useState(initiallyFollowing);
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);

    const next = !following;
    setFollowing(next);

    try {
      const { data } = await usersApi.follow(userId);
      onToggled?.(data);
    } catch {
      setFollowing(!next); // revert on failure
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      className={`btn ${following ? "btn-ghost" : "btn-primary"}`}
      onClick={handleClick}
      disabled={busy}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
};

export default FollowButton;
