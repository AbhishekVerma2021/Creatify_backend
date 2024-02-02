// Import necessary modules
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Server } = require("socket.io"); // Import Socket.io Server
const http = require('http');  // Import http module
const app = express();

// Connect to the database
require("./db/connection");

// Import Middleware
const authenticate = require("./middleware/auth");

// Set up middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// Import Routers
const userRouter = require("./routers/userRouter");
const postRouter = require("./routers/postRouter");
const chatRouter = require("./routers/chatRouter");
const messageRouter = require("./routers/messageRouter");

// Set up port
const port = process.env.PORT || 8000;

// Use Routers for specific routes
app.use("/api", userRouter);
app.use("/api", postRouter);
app.use("/api", chatRouter);
app.use("/api", messageRouter);

// Initialize Socket.io Server
const server = http.createServer(app);  // Create HTTP server
const io = new Server(server, {
  cors: {
    pingTimeout: 60000,
    origin: 'https://creatify-nine.vercel.app/',
  }
});  // Attach Socket.io to HTTP server

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('setup', (userData) => {
    console.log(userData._id);
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on('join room', (roomId) => {
    console.log('Joined : ', roomId);
    // Leave the previously joined room (if any)
    Object.keys(socket.rooms).forEach((room) => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });
    socket.join(roomId);
    socket.emit("Room Joined");
  });

  
  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });
  socket.on('new message', (newMessageRecieved) => {
    // console.log('newMessageRecieved!',newMessageRecieved);
    let chat = newMessageRecieved.chat;
    if(!chat.users) console.log('chat.users is empty!!');
    chat.users.map(user => {
      if(user._id === newMessageRecieved.sender._id) return;
      console.log(newMessageRecieved)
      socket.in(user._id).emit('message recieved', newMessageRecieved);
    });
  });

  socket.off('setup', (userData) => {
    console.log('User Disconnected');
    socket.leave(userData._id)
  });

});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
