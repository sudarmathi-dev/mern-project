import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { postsApi, uploadApi } from "../api/endpoints";
import Avatar from "./Avatar";
import "./CreatePost.css";

const CreatePost = ({ onCreated }) => {
  const { user } = useAuth();
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const { data } = await uploadApi.image(file, "post");
      setImage(data.url);
    } catch {
      setError("Image upload failed. Try a different image.");
      setPreview("");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImage("");
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption.trim() && !image) {
      setError("Write something or add a photo first.");
      return;
    }
    if (uploading) {
      setError("Hang on, your image is still uploading.");
      return;
    }
    setError("");
    setPosting(true);
    try {
      const { data } = await postsApi.create({ caption, image });
      onCreated(data.post);
      setCaption("");
      removeImage();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't post that. Try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <form className="create-post card" onSubmit={handleSubmit}>
      <div className="create-post-row">
        <Avatar src={user?.profilePic} name={user?.username} size={40} />
        <textarea
          placeholder="What's happening?"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={2}
          maxLength={2200}
        />
      </div>

      {preview && (
        <div className="create-post-preview-wrap">
          <img src={preview} alt="" className="create-post-preview" />
          {uploading && <div className="create-post-uploading">Uploading…</div>}
          <button type="button" className="create-post-remove-img" onClick={removeImage}>
            ×
          </button>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      <div className="create-post-actions">
        <label className="btn btn-ghost create-post-image-toggle">
          Add photo
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            hidden
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={posting || uploading}>
          {posting ? "Posting…" : "Post"}
        </button>
      </div>
    </form>
  );
};

export default CreatePost;
