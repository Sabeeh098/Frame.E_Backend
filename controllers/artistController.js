const { generateToken } = require("../middlewares/auth");
const artistModel = require("../model/artistModel");
const ArtistPost = require("../model/artistPost");
const bcrypt = require("bcrypt");

let errMsg;

const artistRegister = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const exist = await artistModel.find({ email });
    if (exist.length !== 0) {
      return res.status(400).json({ errMsg: "You are already exist" });
    }
    const hashpass = await bcrypt.hash(password, 10);
    const artist = new artistModel({ name, email, password: hashpass });
    await artist.save();

    res.status(200).json({ message: "Artist Registered Successful" });
  } catch (error) {
    console.log("Error Registering", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const artistLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const artist = await artistModel.findOne({ email });

    if (!artist) {
      return res.status(401).json({ errMsg: "Please register first" });
    }
    const passwordMatch = await bcrypt.compare(password, artist.password);

    if (!passwordMatch) {
      return res.status(401).json({ errMsg: "Password doesn't match" });
    }
    const token = generateToken(artist._id, "artist"); // Pass artist._id instead

    res.status(200).json({
      message: "Login Successful",
      name: artist?.name,
      token,
      role: "artist",
      id: artist?._id,
    });
  } catch (error) {
    res.status(500).json({ errMsg: "Something went wrong" });
  }
};

const getArtistDetails = async (req, res) => {
  try {
    const { id } = req.payload;

    const artist = await artistModel.findById(id).populate("posts");
    if (!artist) {
      return res.status(404).send("No Artist Found");
    }

    return res.status(200).json({ artist });
  } catch (error) {
    console.log("Error getting details of artist", error);
    res.status(500).json({ errMsg: "Server error" });
  }
};

const createArtistPost = async (req, res) => {
  try {
    const { postName, description, price, photo } = req.body;
    const { id } = req.payload;
    const artist = await artistModel.findById(id);

    if (!artist) {
      return res.status(404).json({ errMsg: "Artist not Found" });
    }

    const newPost = await ArtistPost.create({
      postName,
      description,
      price,
      photo,
      artist: id,
    });

    artist.posts.push(newPost);
    await artist.save();
    res.status(201).json({ message: "Post created successfully" });
  } catch (error) {
    console.log("Something error:", error);
    res.status(500).json({ errMsg: "Server Error" });
  }
};

const editArtistProfile = async (req, res) => {
  try {
    const { id } = req.payload;
    const artist = await artistModel.findById(id);

    if (!artist) {
      return res.status(404).json({ errMsg: "Artist Not Found" });
    }

    artist.name = req.body.name;
    artist.email = req.body.email;
    artist.description = req.body.description;
    artist.artCategories = JSON.parse(req.body.artCategories); // Parse the JSON string
    artist.profilePicture = req.body.profilePicture;

    await artist.save();

    return res.status(200).json({ message: "Artist Profile updated" });
  } catch (error) {
    console.log("Something went wrong", error);
    res.status(500).json({ errMsg: "Server Error" });
  }
};

module.exports = {
  artistRegister,
  artistLogin,
  getArtistDetails,
  createArtistPost,
  editArtistProfile,
};
