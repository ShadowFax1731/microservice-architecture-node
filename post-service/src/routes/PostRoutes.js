const express = require("express");
const {
  createPost,
  getAllPosts,
  getPost,
  deletePost,
} = require("../controllers/PostController");
const { AuthenticateRequest } = require("../middleware/AuthMiddleware");

const router = express.Router();

//middleware -> this will if the user is authenticated or not
router.use(AuthenticateRequest);

router.post("/create-post", createPost);
router.get("/all-posts", getAllPosts);
router.get("/:id", getPost);
router.delete("/:id", deletePost);

module.exports = router;
