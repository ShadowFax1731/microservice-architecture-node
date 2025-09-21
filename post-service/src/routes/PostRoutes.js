const express = require("express");
const { createPost } = require("../controllers/PostController");
const { AuthenticateRequest } = require("../middleware/AuthMiddleware");

const router = express.Router();

//middleware -> this will if the user is authenticated or not
router.use(AuthenticateRequest);

router.post("/create-post", createPost);

module.exports = router;
