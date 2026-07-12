const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog.controller");
const { verifyToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/authorizeRoles.middleware");

// Public Routes
router.get("/", blogController.getAllBlogs);
router.get("/latest", blogController.getLatestBlogs);
router.get("/:id", blogController.getBlogById);

// Protected Routes (Admin only for creating blogs)
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  blogController.createBlog
);
router.get(
  "/admin/all",
  verifyToken,
  authorizeRoles("admin"),
  blogController.getAdminBlogs
);
router.put(
  "/:id/visibility",
  verifyToken,
  authorizeRoles("admin"),
  blogController.toggleVisibility
);

router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  blogController.updateBlog
);

router.post(
  "/upload-cover",
  verifyToken,
  authorizeRoles("admin"),
  blogController.uploadBlogCover
);

router.delete(
  "/delete-cover",
  verifyToken,
  authorizeRoles("admin"),
  blogController.deleteBlogCover
);

router.put(
  "/update-cover",
  verifyToken,
  authorizeRoles("admin"),
  blogController.updateBlogCover
);

module.exports = router;
