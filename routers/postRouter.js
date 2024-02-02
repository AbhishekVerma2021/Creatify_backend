const express = require("express");
const router = express.Router();
const PostController = require("../controllers/postController");
const authenticate = require("../middleware/auth");

router.post("/new-post", authenticate, PostController.createPost);

router.post("/posts", authenticate, PostController.getPosts);
router.post("/comment", authenticate, PostController.addComment);
router.get("/fetchComments", PostController.fetchComments);
router.post("/like", authenticate, PostController.likePost);
router.post("/toggleFavorite", authenticate, PostController.toggleFavoritePost);

module.exports = router;
