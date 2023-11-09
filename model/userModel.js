const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },

  photo : String,

  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false, 
  },
  phone: {
    type: Number,
  },
  address: {
    type: [String],
  },
  isActive: {
    default: true,
    type: Boolean,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
