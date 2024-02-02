const mongoose= require('mongoose');

const commentSchema = new mongoose.Schema({
    uId: String,
    comment: String,
    username:String,
  });

const likesSchema = new mongoose.Schema({
    uId: String,
})

const userSchema=new mongoose.Schema({
    caption:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true
        
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    comments: [commentSchema],
    likes: [likesSchema],
    date: {
        type: Date,
        default: Date.now
    }
})
const Post= new mongoose.model("POST",userSchema);
module.exports=Post;