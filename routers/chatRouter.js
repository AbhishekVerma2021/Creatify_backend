const express = require("express");
const router = express.Router();
const ChatController = require("../controllers/chatController");
const authenticate = require("../middleware/auth");

router.post('/chat', authenticate, ChatController.accessChats);
router.get('/getUserChats', authenticate, ChatController.fetchChats);
router.post('/createGroup', authenticate, ChatController.createGroupChat);
router.post('/renameGroup', authenticate, ChatController.renameGroupName);
router.post('/addToGroup', authenticate, ChatController.addToGroup);
router.post('/removeFromGroup', authenticate, ChatController.removeFromGroup);


module.exports = router;