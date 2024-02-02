const mongoose= require('mongoose');

const followers = new mongoose.Schema({
    uId: String,
    username: String,
    email: String,
});

const following = new mongoose.Schema({
    uId: String,
    username: String,
    email: String,
});
const favorites = new mongoose.Schema({
    uId: String,
    username: String,
    email: String,
    postId: String,
});
const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true

    },
    email:{
        type:String,
        required:true,
        unique:true

    },
    password:{
        type:String,
        required:true
    },
    followers: [followers],
    following: [following],
    favorites: [favorites],
    date: {
        type: Date,
        default: Date.now,
    },
})
const Users= new mongoose.model("User",userSchema);

module.exports=Users;