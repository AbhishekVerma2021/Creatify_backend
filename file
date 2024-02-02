const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
// import schemas
const Users = require("./models/userSchema");

const Post = require("./models/postSchema");

// connect to db
require("./db/connection");

// Import MiddleWare
const authenticate = require("./middleware/auth");
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
const port = process.env.PORT || 8000;

app.post("/api/register", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    console.log(username, email, password);
    const isExit = await Users.findOne({ email });
    if (isExit) {
      console.log("enter");
      console.log(isExit);
      res.status(400).send("User already exits");
    } else {
      const user = new Users({
        username,
        email,
      });

      bcryptjs.hash(password, 10, (err, hashedPassword) => {
        if (err) next(err);
        user.set("password", hashedPassword);
        user
          .save()
          .then(() => {
            res.status(200).send("successfully registered");
          })
          .catch((err) => {
            console.log(err);
          });
      });
    }
  } catch (error) {
    res.status(500).send("Server Error");
    console.log(error, "error");
  }
});
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  const user = await Users.findOne({ email });
  if (!user) {
    res.status(401).send("Email is in invalid");
  } else {
    const validate = await bcryptjs.compare(password, user.password);
    if (!validate) {
      res.status(401).send("Password is invalid");
    } else {
      const payload = {
        id: user._id,
        username: user.username,
      };
      const JWT_SECRET_KEY =
        process.env.JWT_SECRET_KEY || "THIS_IS_THE_SECRET_KEY_OF_JWT";
      jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: 86400 }, (err, token) => {
        if (err) {
          res.json({ message: err });
        } else {
          return res.status(200).json({ user, token });
        }
      });
    }
  }
});

app.get('/api/validateToken', authenticate, async (req, res) => {
  // console.log('ValidToken', req.user,"____________")
  const { username, email, _id, followers, following, favorites } = req.user;
  const favouritePostIdArray = favorites.map((obj) => obj.postId);
  const favouritePostArray = await Promise.all(
    favouritePostIdArray.map(async (postId) => {
      const post = await Post.findById(postId).populate("user", "_id username email");
      return post; 
    })
  );
  const user = {
    username,
    email,
    _id,
    followers,
    following,
    favorites,
  }
  res.status(200).send({user, favoritePosts: favouritePostArray});

})

app.post("/api/new-post", authenticate, async (req, res) => {
  try {
    const { caption, desc, url } = req.body;
    console.log(caption, desc, url)
    const { user } = req;
    if (!caption || !desc || !url) {
      res.status(400).send("Please fill all the fields");
    }
    const createPost = new Post({
      caption,
      description: desc,
      image: url,
      user,
    });
    console.log(createPost)
    const result = await createPost.save();
    console.log(result)
    res.status(200).send("Create post Successfully");
  } catch (error) {
    res.status(500).send("Error" + error);
  }
});

app.get("/api/profile", authenticate, async (req, res) => {
  try {
    const { user } = req;
    const { _id } = req.query;

    let userId = _id != "undefined" ? _id : user._id;

    let otherAccountFlag = user._id.toHexString() !== _id;
    const posts = await Post.find({ user: userId }).populate(
      "user",
      "username"
    );
    const userDetails = await Users.findOne({ _id: userId }).select('-password -favorites');
    res.status(200).json({ posts, userDetails, otherAccountFlag });
  } catch (error) {
    res.status(200).send(error);
  }
});

app.post("/api/posts", authenticate, async (req, res) => {
  try {
    const { user } = req.body;
    const posts = await Post.find().populate("user", "_id username email");
    console.log(req.body, user)
    res.status(200).json({ posts, user });
  } catch (error) {
    res.status(200).send(error);
  }
});

app.post("/api/comment", authenticate, async (req, res) => {
  try {
    const { user } = req;
    const { comment, postId } = req.body;
    const inpost = await Post.findById(postId);
    console.log(
      "============================================================",
      inpost
    );
    if (!inpost) {
      res.send("not send");
    } else {
      if (comment !== undefined || comment != "") {
        console.log();
        const newComment = {
          uId: user._id,
          comment: comment,
          username: user.username,
        };
        inpost.comments.push(newComment);

        await inpost.save();
        res.send({ comments: inpost.comments, postId });
      }
    }
  } catch (er) {
    console.log(er);
    res.send(er);
  }
});

app.get('/api/fetchComments', async (req, res) => {
  const { postId } = req.query;
  try {
    const inpost = await Post.findById(postId);
    if (!inpost) {
      res.send("Post Not Found");
    }
    else {
      res.send({ comments: inpost.comments, postId });
    }
  } catch (er) {
    res.send(er);
  }
});

app.post("/api/like", authenticate, async (req, res) => {
  try {
    const { user } = req;
    const { like, postId } = req.body;
    if (like === undefined || postId === undefined) {
      res.send('Post Id or Like must be specified')
    }
    const feedPost = await Post.findById(postId);
    console.log(like);
    if (!feedPost) {
      res.send("not FOUND");
    } else {
      if (like) {
        const newLike = {
          uId: user._id,
        };
        feedPost.likes.push(newLike);
        await feedPost.save();
      } else {
        const _id = user._id.toString();
        const indexToRemove = feedPost.likes.findIndex(
          (likeItem) => likeItem.uId === _id
        );
        console.log(indexToRemove, _id)
        if (indexToRemove !== -1) {
          feedPost.likes.splice(indexToRemove, 1);
        }

        await feedPost.save();
      }
      console.log(feedPost.likes);
      res.json(feedPost.likes);
    }
  } catch (er) {
    res.send(er);
  }
});

app.post('/api/favorites', authenticate,async (req, res) => {
  const { post_id, post_uId } = req.body;
  const { user } = req;
  try {
    const {
      _id,
    } = user;
    const userAccount  = await Users.findById(_id);
    const postOwnerAccount = await Users.findById(post_uId);
    const favouritePostIdArray = userAccount.favorites.map((obj) => obj.postId);
    let messageFlag = true;
    if(favouritePostIdArray.includes(post_id))
    {
      messageFlag = false;
      userAccount.favorites = userAccount.favorites.filter((item) => item.postId.toString() !== post_id);
    }
    else {
      const favouritePost = {
        uId: post_uId,
        postId: post_id,
        username: postOwnerAccount.username,
        email: postOwnerAccount.email,
      };
  
      userAccount.favorites.push(favouritePost);
    }
    await userAccount.save();
    
    const favouritePostArray = await Promise.all(
      favouritePostIdArray.map(async (postId) => {
        const post = await Post.findById(postId).populate("user", "_id username email");
        return post; 
      })
    );

    console.log(favouritePostArray)
    res.send({ favouritePosts: favouritePostArray, favouritePostIds: userAccount.favorites, message: messageFlag ? 'Added to your favorits!!' : 'Removed from favorits!!' })
  }
  catch (err) {
    res.send(err);
  }
})

app.post('/api/follow', authenticate, async (req, res) => {
  try {
    // console.log(req.body)
    const { user } = req;
    const { followedAcountId } = req.body;
    const { _id } = user;

    console.log(followedAcountId)
    if (followedAcountId === undefined)
      res.send('Mention followed account Id');

    const followedAcount = await Users.findById(followedAcountId);
    const userAccount = await Users.findById(_id);
    if (!followedAcount)
      res.send('Followed account does not exist');
    else {
      const followingArrayOfUser = userAccount.following.map((obj) => obj.uId);
      if (followingArrayOfUser.includes(followedAcountId)) {
        userAccount.following = userAccount.following.filter(
          (item) => item.uId.toString() !== followedAcountId.toString()
        );

        await userAccount.save();

        // Similarly, remove the user's ID from the followers array of followedAcount
        followedAcount.followers = followedAcount.followers.filter(
          (item) => item.uId.toString() !== _id.toString()
        );

        await followedAcount.save();

        return res.send({ followers: userAccount.followers, following: userAccount.following })
      }
      else {
        const followingOfUser = {
          uId: followedAcountId,
          username: followedAcount.username,
          email: followedAcount.email,
        }
        userAccount.following.push(followingOfUser);
        await userAccount.save();
        const followedAccountsFollower = {
          uId: _id,
          username: userAccount.username,
          email: userAccount.email,
        }
        followedAcount.followers.push(followedAccountsFollower);
        await followedAcount.save();
        res.send({ followers: userAccount.followers, following: userAccount.following })
      }

    }

  }
  catch (er) {
    console.log(er);
    res.send(er);
  }
})

app.get('/api/getUsers', authenticate, async (req, res) => {
  try {
    const allUsers = await Users.find({}, 'username email _id');
    res.send({users: allUsers});
  }
  catch (er) {
    res.send(er);
  }
})


app.listen(port, () => {
  console.log("Server is running");
});

