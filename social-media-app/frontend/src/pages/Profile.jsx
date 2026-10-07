import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usersApi, postsApi } from "../api/endpoints";
import Avatar from "../components/Avatar";
import FollowButton from "../components/FollowButton";
import PostCard from "../components/PostCard";
import "./Profile.css";

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: profileData } = await usersApi.profile(username);
      setProfile(profileData.user);

      const { data: postsData } = await postsApi.byUser(profileData.user._id);
      setPosts(postsData.posts);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "This user doesn't exist."
          : "Couldn't load this profile."
      );
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) return <p className="profile-status">Loading profile…</p>;
  if (error) return <p className="profile-status error-text">{error}</p>;
  if (!profile) return null;

  const isOwnProfile = profile._id === currentUser?._id;
  const isFollowing = profile.followers?.some((f) => f._id === currentUser?._id);

  return (
    <div className="profile-page">
      <header className="profile-header card">
        <Avatar src={profile.profilePic} name={profile.username} size={84} />
        <div className="profile-info">
          <div className="profile-name-row">
            <h1 className="profile-username">{profile.username}</h1>
            {!isOwnProfile && (
              <div className="profile-actions">
                <FollowButton
                  userId={profile._id}
                  initiallyFollowing={isFollowing}
                  onToggled={() =>
                    setProfile((p) => ({
                      ...p,
                      followers: isFollowing
                        ? p.followers.filter((f) => f._id !== currentUser._id)
                        : [...p.followers, { _id: currentUser._id }],
                    }))
                  }
                />
                <Link
                  to={`/messages/${profile._id}`}
                  state={{ user: { _id: profile._id, username: profile.username, profilePic: profile.profilePic } }}
                  className="btn btn-ghost"
                >
                  Message
                </Link>
              </div>
            )}
          </div>

          {profile.fullName && <p className="profile-fullname">{profile.fullName}</p>}
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}

          <div className="profile-stats">
            <span><strong>{posts.length}</strong> posts</span>
            <span><strong>{profile.followers?.length || 0}</strong> followers</span>
            <span><strong>{profile.following?.length || 0}</strong> following</span>
          </div>
        </div>
      </header>

      <div className="profile-posts">
        {posts.length === 0 ? (
          <div className="profile-empty card">
            <p>{isOwnProfile ? "You haven't posted yet." : "No posts yet."}</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onRemoved={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
