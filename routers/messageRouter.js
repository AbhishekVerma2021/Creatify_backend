const express = require("express");
const router = express.Router();
const MessageController = require("../controllers/messageContrller");
const authenticate = require("../middleware/auth");

router.post('/sendMessage', authenticate, MessageController.sendMessage);
router.get('/:chatId', authenticate, MessageController.allMessages);

module.exports = router;