const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: String,
  description: {
    type: String,
  },
  artCategories: {
    type: [String],
    default: [],
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Posts',
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  followerCount: {
    type: Number,
    default: 0, 
  },
  isBlocked: {
    type: Boolean,
    default: false, 
  },
});


const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;
