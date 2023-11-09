const mongoose = require("mongoose");

const artistPostSchema = new mongoose.Schema({
  postName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Artist",
  },
   likes: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      like :{
        type : Boolean,
        default:false,
      }
    }
   ],
   totalLikes: {
    type: Number,
   },
   comments : [
    {
      user: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      text :{
        type:String,
        required:true,
      },
    },
   ],
});

const ArtistPost = mongoose.model("Posts", artistPostSchema);

module.exports = ArtistPost;
