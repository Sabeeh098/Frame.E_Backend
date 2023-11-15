const { generateToken } = require("../middlewares/auth");
const artistModel = require("../model/artistModel");
const ArtistPost = require("../model/artistPost");
const bcrypt = require("bcrypt");

let errMsg;

const artistRegister = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    console.log("first", req.body);
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
    console.log("first")
    const { email, password } = req.body;

    const artist = await artistModel.findOne({ email });

    if (!artist) {
      return res.status(401).json({ errMsg: "Please register first" });
    }
    const passwordMatch = await bcrypt.compare(password, artist.password);

    if (!passwordMatch) {
      return res.status(401).json({ errMsg: "Password doesn't match" });
    }
    const token = generateToken(artist._id, "artist"); 

    res.status(200).json({
      message: "Login Successful",
      name: artist?.name,
      token,
      role: "artist",
      id: artist?._id,
    });
  } catch (error) {
    console.log(error)
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

const getArtistCategoryPosts = async (req, res) => {
  try {
    const { id } = req.payload;
    const { category } = req.query;

    const artist = await artistModel.findById(id).populate({
      path: "posts",
      match: { category },
    });

    if (!artist) {
      return res.status(404).json({ errMsg: "No Artist Found" });
    }

    const categoryPosts = artist.posts;

    return res.status(200).json({ categoryPosts });
  } catch (error) {
    console.log("Error getting category posts of the artist", error);
    res.status(500).json({ errMsg: "Server error" });
  }
};

const deleteArtistPost = async (req, res) => {
  try {
    const { id } = req.payload;
    const { postId } = req.params;


    const post = await ArtistPost.findOne({ _id: postId, artist: id });

    if (!post) {
      return res.status(404).json({ errMsg: "Post not found" });
    }


    const deleteResult = await ArtistPost.deleteOne({ _id: postId, artist: id });

    if (deleteResult.deletedCount === 1) {
   
      return res.status(200).json({ message: "Post deleted successfully" });
    } else {
  
      return res.status(404).json({ errMsg: "Post not found" });
    }
  } catch (error) {
    console.log('Error deleting artist post', error);
    res.status(500).json({ errMsg: 'Server Error' });
  }
};



const createArtistPost = async (req, res) => {
  try {
    const { postName, description, price, photo, category } = req.body;
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
      category,
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
  getArtistCategoryPosts,
  createArtistPost,
  deleteArtistPost,
  editArtistProfile,
};
