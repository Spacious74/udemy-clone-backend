const Blog = require("../models/Blog");
const cloudinary = require("cloudinary").v2;

// Create a new blog
exports.createBlog = async (req, res) => {
  try {
    const { title, content, tags, coverImage } = req.body;
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const blog = new Blog({
      title,
      content,
      tags,
      coverImage,
      author: req.user.uid, // Set by verifyToken middleware
    });

    await blog.save();

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true })
      .populate("author", "firstName lastName email") // Adjust fields based on User model
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      blogs,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get latest 5 blogs for homepage
exports.getLatestBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true })
      .populate("author", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      blogs,
    });
  } catch (error) {
    console.error("Error fetching latest blogs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get a single blog by ID or Slug
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Support fetching by either Mongo ID or Slug
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
    
    const blog = await Blog.findOne(query).populate("author", "firstName lastName bio profileImage");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all blogs for admin (including unpublished)
exports.getAdminBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find()
      .populate("author", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments();

    res.status(200).json({
      success: true,
      blogs,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error fetching admin blogs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Toggle blog visibility
exports.toggleVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    blog.isPublished = !blog.isPublished;
    await blog.save();

    res.status(200).json({
      success: true,
      message: `Blog is now ${blog.isPublished ? 'published' : 'hidden'}`,
      blog,
    });
  } catch (error) {
    console.error("Error toggling visibility:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Upload Blog Cover Image
exports.uploadBlogCover = async (req, res) => {
  try {
    const file = req.files?.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded.", success: false });
    }
    const base64Data = `data:${file.mimetype};base64,${file.data.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: "SkillUp_BlogCover",
    });

    return res.status(200).json({
      success: true,
      coverImage: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });
  } catch (error) {
    console.error("Error uploading blog cover:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during image upload.",
      error: error.message,
    });
  }
};

// Delete Blog Cover Image
exports.deleteBlogCover = async (req, res) => {
  try {
    const { public_id } = req.body;
    if (!public_id) {
      return res.status(400).json({ success: false, message: "Public ID is required" });
    }

    const result = await cloudinary.uploader.destroy(public_id);
    if (result.result === "ok" || result.result === "not found") {
      return res.status(200).json({ success: true, message: "Image deleted successfully." });
    } else {
      return res.status(400).json({ success: false, message: "Image deletion failed.", result });
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    return res.status(500).json({ success: false, message: "An error occurred during image deletion.", error: error.message });
  }
};

// Update Blog Cover Image
exports.updateBlogCover = async (req, res) => {
  try {
    const { old_public_id } = req.body;
    const file = req.files?.file;

    if (old_public_id) {
      await cloudinary.uploader.destroy(old_public_id);
    }

    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const base64Data = `data:${file.mimetype};base64,${file.data.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: "SkillUp_BlogCover",
    });

    return res.status(200).json({
      success: true,
      coverImage: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });
  } catch (error) {
    console.error("Error updating blog cover:", error);
    return res.status(500).json({ success: false, message: "An error occurred during image update.", error: error.message });
  }
};

// Update Blog
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags, coverImage } = req.body;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    if (title) blog.title = title;
    if (content) blog.content = content;
    if (tags) blog.tags = tags;
    if (coverImage) blog.coverImage = coverImage;

    await blog.save();

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
