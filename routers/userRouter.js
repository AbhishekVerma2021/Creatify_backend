const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const authenticate = require("../middleware/auth");

router.post("/register", UserController.registerUser);
router.post("/login", UserController.loginUser);
router.get("/validateToken", authenticate, UserController.validateToken);
router.post("/follow", authenticate, UserController.followUser);
router.get("/getUsers", authenticate, UserController.getAllUsers);
router.get("/profile", authenticate, UserController.getUserProfile);
router.get("/searchUser", authenticate, UserController.searchUser);

module.exports = router;
