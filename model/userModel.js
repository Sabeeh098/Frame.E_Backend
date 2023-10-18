const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },

  photo: String,

  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
  },
  address: {
    type: String,
  },
  isActive: {
    default: false,
    type: Boolean,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
