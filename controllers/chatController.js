const mongoose = require('mongoose');

const Chat = require('../models/chatModel');
const Users = require('../models/userModel');

const accessChats = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    console.log('UserId not found!!')
    return res.status(400)
  }
  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } }
    ],
  }).populate("users", "-password -favorites -followers -following").populate("latestMessage");
  isChat = await Users.populate(isChat, {
    path: "latestMessage.sender",
    select: "username email",
  });

  if (isChat.length > 0) {
    res.status(200).send(isChat[0]);
  }
  else {
    let chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createChat._id }).populate("users", "-password");
      res.status(200).send(fullChat);
    }
    catch (err) {
      res.status(400);
      throw new Error(err.message);
    }
  }
};

const fetchChats = async (req, res) => {
  try {
    let results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password -favorites -followers -following").populate("groupAdmin", "-password -favorites -followers -following")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    results = await Users.populate(results, {
      path: "latestMessage.sender",
      select: "username email",
    });

    res.status(200).send(results);
  }
  catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
};

const createGroupChat = async (req, res) => {
  const { users, group_name } = req.body;
  // console.log(group_name, users);
  if (!users || !group_name) {
    res.status(400).send("Pleasse fill all the fields!!");
  }
  let usersArray = users;
  if (usersArray.length < 2) {
    res.status(400).send("More than 2 users are required!!!");
  }
  usersArray.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: group_name,
      groupAdmin: req.user,
      users: usersArray,
      isGroupChat: true,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password -favorites -followers -following")
      .populate("groupAdmin", "-password -favorites -followers -following");

    res.status(200).send(fullGroupChat);
  }
  catch (err) {

  }
};

const renameGroupName = async (req, res) => {
  const { updated_name, chatId } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: updated_name,
    },
    {
      new: true,
    }).populate("users", "-password -favorites -followers -following")
    .populate("groupAdmin", "-password -favorites -followers -following");

  if (!updatedChat) {
    res.status(400).send('Chat not found!!');
  }
  else {
    res.json(updatedChat);
  }
};

const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  const addUser = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId }
    },
    {
      new: true,
    }).populate("users", "-password -favorites -followers -following")
    .populate("groupAdmin", "-password -favorites -followers -following");

  if (!addUser) {
    res.status(400).send("Chat does not exist!!");
  }
  else {
    res.status(200).json(addUser);
  }
};
const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin
  // const formattedUserId = ;
  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password -favorites -followers -following")
    .populate("groupAdmin", "-password -favorites -followers -following");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
};

// const removeFromGroup = async (req, res) => {
//   const { chatId, userId } = req.body;
//   const removedUser = await Chat.findByIdAndUpdate(
//     chatId,
//     {
//       $pull: { users: userId }
//     },
//     {
//       new: true,
//     }).populate("users", "-password -favorites -followers -following")
//     .populate("groupAdmin", "-password -favorites -followers -following");

//   if (!removedUser) {
//     res.status(400).send("Chat does not exist!!");
//   }
//   else {
//     res.status(200).json(removedUser);
//   }
// };

module.exports = {
  accessChats,
  fetchChats,
  createGroupChat,
  renameGroupName,
  addToGroup,
  removeFromGroup,
};