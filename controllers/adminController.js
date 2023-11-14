const { generateToken } = require("../middlewares/auth");
const adminModel = require("../model/adminModel");
const Product = require("../model/adminProduct");
const userModel = require("../model/userModel");
const artistModel = require("../model/artistModel");
const postModel = require("../model/artistPost");
const adminOrder = require("../model/adminOrders")
// const bcrypt = require("bcrypt");
let errMsg;

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await adminModel.findOne({ email: email });

    if (!admin) {
      return res.status(401).json({ errMsg: "Admin not found" });
    }

    const passwordMatch = await adminModel.findOne({
      _id: admin._id,
      password: password,
    });

    if (!passwordMatch) {
      return res.status(401).json({ errMsg: "Password didn't match" });
    }

    const token = generateToken(passwordMatch._id, "admin");
    res.status(200).json({
      message: "Login Successful",
      name: passwordMatch?.name,
      token,
      role: "admin",
      id: passwordMatch._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errMsg: "Something Went Wrong" });
  }
};

const users = async (req, res) => {
  try {
    const userData = await userModel.find();
    res.status(200).json({ userData });
  } catch (error) {
    res.status(500).json({ errMsg: "Something went Wrong" });
  }
};

const artists = async (req, res) => {
  const { page, pageSize } = req.query;
  const pageNumber = parseInt(page) || 1;
  const limit = parseInt(pageSize) || 10;
  
  if (pageNumber <= 0 || limit <= 0) {
    return res.status(400).json({ errMsg: "Invalid page or pageSize" });
  }

  try {
    const skip = (pageNumber - 1) * limit;
    const artistData = await artistModel
      .find()
      .skip(skip)
      .limit(limit);

    return res.status(200).json({ artistData });
  } catch (error) {
    console.error("Error fetching artists:", error);
    return res.status(500).json({ errMsg: "Something went wrong" });
  }
};

const blockArtist = async (req,res) => {
  try {
    const {artistId} = req.body;
    const artist = await artistModel.findById(artistId);
    if(!artist) {
      return res.status(400).json({errMsg:"Artist not found"})
    }
    artist.isBlocked = true;
    await artist.save();
    return res.status(200).json({msg:"Artist blocked successfully"});
  } catch (error) {
    console.error("Error blocking artist: ", error);
  }
}

const unblockArtist = async (req,res) => {
  try {
    const {artistId} = req.body;
    const artist = await artistModel.findById(artistId);
    if(!artist){
      return res.status(400).json({errMsg:"Artist not found"})
    }
    artist.isBlocked = false;
    await artist.save();
    return res.status(200).json({msg:"Artist unblocked successfully"});
  } catch (error) {
    console.error("Error unblocking artist: ", error);
  }
}
const blockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({ errMsg: "User Not found" });
    }
    user.isActive = false;
    user.save();
    return res.status(200).json({ message: "Blocked Succeffully" });
  } catch (error) {
    return res.status(500).json({ errMsg: "something went wrong" });
  }
};

const unblockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({ errMsg: "User not found" });
    }
    user.isActive = true;
    user.save();
    return res.status(200).json({ message: "unblocked" });
  } catch (error) {}
};

const addProduct = async (req, res) => {
  try {
    const { name, category, price, quantity, photo } = req.body;

    const newProduct = new Product({
      name,
      category,
      price,
      quantity,
      status: quantity > 0 ? "In Stock" : "No Stock",
      photo,
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json(savedProduct);
  } catch (error) {
    console.log("Error Adding Product", error);
    return res.status(500).json({ errMsg: "Internal Server Error" });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.log("Error Fetching Products", error);
    res.status(500).json({ errMsg: "Internal Server Error" });
  }
};

const editProducts = async (req, res) => {
  try {
    const productId = req.params.productId;

    const { name, category, price, quantity, photo } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ errMsg: "Product not found" });
    }
    product.name = name;
    product.category = category;
    product.price = price;
    product.quantity = quantity;
    product.status = quantity > 0 ? "In Stock" : "No Stock";
    product.photo = photo;

    const updatedProduct = await product.save();

    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.log("Error editing product", error);
    return res.status(500).json({ errMsg: "Internal server Error" });
  }
};
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ errMsg: "Product not found" });
    }
    if (product.deleted) {
      return res.status(400).json({ errMsg: "Product is already deleted" });
    }

    product.deleted = true;

    const updatedProduct = await product.save();

    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.log("Error Deleting product", error);
    return res.status(500).json({ errMsg: "Internal Server Error" });
  }
};
const getStatistics = async(req,res) => {
  try{
    const totalUsers = await userModel.countDocuments();
    const totalArtists = await artistModel.countDocuments();

    res.status(200).json({
      usersCount:totalUsers,
      artistsCount:totalArtists
    })
  }
  catch(error){
    console.log('Error getting statistics', error);
    res.status(500).send({errMsg:'Server Error'})
  }
}

const postComments = async(req,res) => {
  try {
    const postsWithComments = await postModel.find().populate("comments");
    res.status(200).json({postsWithComments})
  } catch (error) {
    console.log('Error populating comments', error);
    res.status(500).send({errMsg:"Server Error"});
  }
}
const getAdminOrders = async (req, res) => {
  try {
    const adminOrders = await adminOrder.find()
      .populate({
        path: 'user',
        model: 'User',
        select: 'address', 
      })
      .populate({
        path: 'products.product',
        model: 'Products', // Replace 'Product' with your actual product model name
      });

    res.status(200).json({ adminOrders });
  } catch (error) {
    console.error('Error getting admin orders:', error);
    res.status(500).json({ errMsg: 'Internal server error' });
  }
};

module.exports = {
  adminLogin,
  users,
  artists,
  blockUser,
  unblockUser,
  addProduct,
  getProducts,
  editProducts,
  deleteProduct,
  blockArtist,
  unblockArtist,
  getStatistics,
  postComments,
  getAdminOrders,
};
