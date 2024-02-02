const Post = require("../models/postModel");
const Users = require("../models/userModel");

const createPost = async (req, res) => {
  try {
    const { caption, desc, url } = req.body;
    const { user } = req;

    if (!caption || !desc || !url) {
      res.status(400).send("Please fill all the fields");
    }

    const newPost = new Post({
      caption,
      description: desc,
      image: url,
      user,
    });

    const result = await newPost.save();

    res.status(200).send("Post created successfully");
  } catch (error) {
    res.status(500).send("Error: " + error);
  }
};

const getPosts = async (req, res) => {
  try {
    const { user } = req.body;
    const posts = await Post.find().populate("user", "_id username email");

    res.status(200).json({ posts, user });
  } catch (error) {
    res.status(500).send("Error: " + error);
  }
};

const addComment = async (req, res) => {
  try {
    const { user } = req;
    const { comment, postId } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      res.send("Post not found");
    } else {
      if (comment !== undefined || comment != "") {
        const newComment = {
          uId: user._id,
          comment: comment,
          username: user.username,
        };

        post.comments.push(newComment);
        await post.save();
        res.send({ comments: post.comments, postId });
      }
    }
  } catch (er) {
    console.log(er);
    res.send(er);
  }
};

const fetchComments = async (req, res) => {
  const { postId } = req.query;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      res.send("Post not found");
    } else {
      res.send({ comments: post.comments, postId });
    }
  } catch (er) {
    res.send(er);
  }
};

const likePost = async (req, res) => {
  try {
    const { user } = req;
    const { like, postId } = req.body;

    if (like === undefined || postId === undefined) {
      res.send("Post Id or Like must be specified");
    }

    const post = await Post.findById(postId);

    if (!post) {
      res.send("Post not found");
    } else {
      if (like) {
        const newLike = {
          uId: user._id,
        };

        post.likes.push(newLike);
        await post.save();
      } else {
        const _id = user._id.toString();
        const indexToRemove = post.likes.findIndex(
          (likeItem) => likeItem.uId === _id
        );

        if (indexToRemove !== -1) {
          post.likes.splice(indexToRemove, 1);
        }

        await post.save();
      }

      res.json(post.likes);
    }
  } catch (er) {
    res.send(er);
  }
};
const toggleFavoritePost = async (req, res) => {
  const { post_id, post_uId } = req.body;
  const { user } = req;
  try {
    const {
      _id,
    } = user;
    const userAccount = await Users.findById(_id);
    const postOwnerAccount = await Users.findById(post_uId);
    let favouritePostIdArray = userAccount.favorites.map((obj) => obj.postId);
    let messageFlag = true;
    if (favouritePostIdArray.includes(post_id)) {
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
    if (messageFlag)
      favouritePostIdArray.push(post_id)
    else
      favouritePostIdArray = favouritePostIdArray.filter(id => id !== post_id);
    const favouritePostArray = await Promise.all(
      favouritePostIdArray.map(async (postId) => {
        const post = await Post.findById(postId).populate("user", "_id username email");
        return post;
      })
    );
    res.send({ favoritePosts: favouritePostArray, favoritePostIds: userAccount.favorites, message: messageFlag ? 'Added to your favorits!!' : 'Removed from favorits!!' })
  }
  catch (err) {
    res.send(err);
  }
}

module.exports = {
  createPost,
  getPosts,
  addComment,
  fetchComments,
  likePost,
  toggleFavoritePost
};
