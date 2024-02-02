const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const Users = require("../models/userModel");

const sendMessage = async (req, res) => {
  const { chatId, content } = req.body;
  if(!chatId || !content) {
    res.status(400).send('Invalid Data in request!!!');
  }

  let newMessage = {
    chat: chatId,
    sender: req.user._id,
    content,
  };

  try {
    let message = await Message.create(newMessage);
    message = await message.populate("sender", "username email");
    message = await message.populate("chat");
    message = await Users.populate(message, {
      path: "chat.users",
      select: "username email",
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });
    res.status(200).json(message);
  }
  catch (err) {
    res.status(500).send('Something went wrong in request');
    throw new Error(err);
  }
};

const allMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const messagesArray = await Message.find({chat: chatId}).populate("sender", "username email").populate("chat");
    res.status(200).json(messagesArray);
  }
  catch (err) {
    res.status(500).send('Something went wrong in request');
    throw new Error(err)
  };
};

module.exports = {
  sendMessage,
  allMessages,
}