const cloudinary = require("../config/cloudinary");

const streamUpload = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(buffer);
  });
};

// @desc    Upload an image (post image, profile pic, or story)
// @route   POST /api/upload
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const folder = req.body.type === "story" ? "threadline/stories" : "threadline/posts";
    const result = await streamUpload(req.file.buffer, folder);

    res.status(201).json({ url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadImage };
