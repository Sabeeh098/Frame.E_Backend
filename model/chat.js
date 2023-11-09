const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist', // Reference to Artist model
  },

  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Messages', // Reference to Message model
  },
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
