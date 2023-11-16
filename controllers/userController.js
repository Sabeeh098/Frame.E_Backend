const userModel = require("../model/userModel");
const artistModel = require("../model/artistModel");
const postModel = require("../model/artistPost");
const productModel = require("../model/adminProduct");
const orderModel = require("../model/orders");
const adminOrder = require("../model/adminOrders");
const EMAIL_PASS = process.env.EMAIL_PASS;
const CLIENTURL = process.env.CLIENTURL;
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { generateToken } = require("../middlewares/auth");

const stripe = require("stripe")(process.env.STRIPEKEY);

let errMsg;

const createOrder = async (req, res) => {
  try {
    const token  = req.payload.token;
    console.log(token)
    const { id, price, productId, address , quantity } = req.body;
    console.log(req.body)
    const user = await stripe.customers.create({
      metadata: {
        price: price,
      },
    });

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "framee",
            },
            unit_amount: price * 100,
          },
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url: `${process.env.SERVERURL}paymentSuccess?price=${price}&productId=${productId}&userId=${id}&status=success&token=${token}&address=${address}&quantity=${quantity}`,
      cancel_url: `${process.env.SERVERURL}paymentFailed?status=failed&token=${token}`,
    });

    await decrementProductQuantity(productId, quantity);

    res.send({ url: session.url });
  } catch (error) {
    console.error("Error creating order:", error);
    res.redirect(`${process.env.CLIENTURL}paymentFailed`);
  }
};

const handleSuccess = async (req, res) => {
   
  const price = req.query.price;
  const productId = req.query.productId;
  const userId = req.query.userId;
  const token = req.query.token;
  const address = req.query.address;
  const quantity = req.query.quantity;
  const status = req.query.status
// console.log(price,productId,userId,token,address,quantity,status,"handlesuccesas")

  if (token) {
    try {
      if (status === "success") {
        const pricestring = price.toString();
        const newAdminOrder = new adminOrder({
          user: userId,
          products: [
            {
              product: productId,
            },
          ],
          quantity: quantity || 1,
          price: pricestring,
          address: address,
          status: 'pending',
        });

        newAdminOrder.quantity = quantity || 1;
       console.log(newAdminOrder)
        const saveOrder = await newAdminOrder.save();
        res.redirect(`${process.env.CLIENTURL}paymentSuccess`);
      } else {
        res.redirect(`${process.env.CLIENTURL}paymentFailed`);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      res.redirect(`${process.env.CLIENTURL}paymentFailed`);
    }
  } else {
    res.redirect(`${process.env.CLIENTURL}paymentFailed`);
  }
};

const handleFailed = (req, res) => {
  res.redirect(`${process.env.CLIENTURL}paymentFailed`);
};

const decrementProductQuantity = async (productId, quantity) => {
  try {
    const product = await productModel.findById(productId);

    // Check if the product exists
    if (!product) {
      console.error("Product not found");
      return;
    }

    // Check if the product has enough quantity to decrement
    if (product.quantity < quantity) {
      console.error("Insufficient product quantity");
      return;
    }

    // Decrement the product quantity
    product.quantity -= quantity;

    // Save the updated product
    await product.save();

    console.log(`Product quantity decremented for productId: ${productId}`);
  } catch (error) {
    console.error("Error decrementing product quantity:", error);
  }
};

const onlinePayment = async (req, res) => {
  try {
    const { token } = req.payload;
    const { price, id, postId, address } = req.body;

    console.log(req.body+'payments')

    const user = await stripe.customers.create({
      metadata: {
        price: price,
      },
    });
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Framee",
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.SERVERURL}paymentSuccess?price=${price}&postId=${postId}&userId=${id}&status=success&token=${token}&address=${address}`,
      cancel_url: `${process.env.SERVERURL}paymentFailed?&status=failed&token=${token}`,
    });
    console.log(session.url+'haiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii')
    res.send({ url: session.url });
  } catch (error) {
    console.log(error);
  }
};

const paymentStatus = async (req, res) => {
  const id = req.query.userId;
  const status = req.query.status;
  const amount = req.query.price;
  const postId = req.query.postId;
  const token = req.query.token;
  const address = req.query.address;

  console.log(status+'statusssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss')

  try {
    if (token) {
      if (status === "success") {
        const amountString = amount.toString();

        const newOrder = new orderModel({
          user: id,
          items: [{ post: postId }],
          amount: amountString,
          ShippingAddress: address,
          status: "pending",
        });

        const savedOrder = await newOrder.save();

        console.log(savedOrder+'saveeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')

        res.redirect(`${process.env.CLIENTURL}paymentSuccess`);
        console.log("succces aaano")
      } else {
        res.redirect(`${process.env.CLIENTURL}paymentFailed`);
        console.log("tttttttttttttttttttttttttttttttttttttttttttttt")
      }
    }
  } catch (error) {
    console.log(error);
    res.redirect(`${process.env.CLIENTURL}paymentFailed`);
    console.log("nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn")
  }
};

const sendVerifyMail = async (email, userName, userId) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Set this to true for Gmail
      auth: {
        user: "frameexplore@gmail.com",
        pass: EMAIL_PASS,
      },
    });

    const mailOption = {
      from: "frameexplore@gmail.com",
      to: email,
      subject: "Email Verification",
      html: `<p>Please click to verify your account <a href="${CLIENTURL}/emailVerify/${userId}">verify</a>.</p>`,
    };

    // Use async/await to handle the Promise returned by sendMail
    const info = await transporter.sendMail(mailOption);

    console.log("The email has been sent.", info.response);
  } catch (error) {
    console.error(error.message);
    console.log("Email cannot be sent");
  }
};


const verifyMail = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await userModel.updateOne(
      { _id: userId },
      { $set: { isEmailVerified: true } }
    );

    if (result.nModified === 1) {
      res.status(200).json({ message: "Email successfully verified" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error" });
    // Pass the error to the next middleware
    next(error);
  }
};

const userRegister = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    const exist = await userModel.find({ email });
    if (exist.length !== 0) {
      return res.status(400).json({ Errmessage: "User already exists" });
    }
    const hashpass = await bcrypt.hash(password, 10);
    const user = new userModel({ userName, email, password: hashpass });
    await user.save();
    sendVerifyMail(email, userName, user._id);
    res.status(200).json({ message: "User registered Successfully" });
  } catch (error) {
    console.error("Error Registering", error);
    res.status(500).json({ message: "Server error at registration" });
  }
};

const login = async (req, res) => {
  try {
    
    const { email, password } = req.body;
    const existUser = await userModel.findOne({ email });
    if (!existUser) return res.status(401).send({ errMsg: "User Not Found" });

    const passwordMatch = await bcrypt.compare(password, existUser.password);
    if (!passwordMatch) {
      return res.status(401).json({ errMsg: "Password didn't match" });
    }

    const token = generateToken(existUser._id, "user");

    res.status(200).json({
      message: "Login Successful",
      name: existUser?.name,
      token,
      role: "user",
      id: existUser._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errMsg: "Something Went Wrong" });
  }
};

const artistPosts = async (req, res) => {
  try {
    const artistpost = await postModel
      .find()
      .populate("artist")
      .populate("comments.user");
    res.status(200).json({ artistpost });
  } catch (error) {
    console.log("Errroorrr", error);
    res.status(500).json({ errMsg: "Error while taking posts" });
  }
};

const getArtists = async (req, res) => {
  try {
    const artist = await artistModel.find().populate("posts");
    res.status(200).json({ artist });
  } catch (error) {
    console.log("Error in getting artists", error);
  }
};

const getSpecificArtist = async (req, res) => {
  try {
    const artist = await artistModel.find().populate("posts");

    res.status(200).json({ artist });
  } catch (error) {
    console.log("Error in getting specific Artist", error);
  }
};

const likePost = async (req, res) => {
  try {
    const postId = req.body.postId;
    const userId = req.body.userId;
    const post = await postModel.findByIdAndUpdate(
      postId,
      {
        $push: {
          likes: {
            userId: userId,
            like: true, // You can set the value to 1 for a new like
          },
        },
        $inc: { totalLikes: 1 }, // Increment the totalLikes field by 1
      },
      { new: true } // Return the updated document
    );
    if (!post) {
      return res.status(404).json({ errMsg: "Post not Found" });
    }
    res.status(200).json({ likes: post.likes });
  } catch (error) {
    console.log("Error Liking post ", error);
    res.status(500).json({ errMsg: "internal server" });
  }
};

const unlikePost = async (req, res) => {
  try {
    const postId = req.body.postId;
    const userId = req.body.userId;
    const post = await postModel.findByIdAndUpdate(
      postId,
      {
        $pull: {
          likes: {
            userId: userId,
            like: false,
          },
        },
        $inc: { totalLikes: -1 },
      },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ errMsg: "Post not Found" });
    }
    res.status(200).json({ likes: post.likes });
  } catch (error) {
    console.log("Error unlicking post", error);
    res.status(500).json({ errMsg: "Internal server error" });
  }
};

const followArtist = async (req, res) => {
  try {
    const userId = req.body.userId;
    const artistId = req.body.artistId;
    const user = await userModel.findById(userId);
    const artist = await artistModel.findById(artistId);

    if (!user || !artist) {
      return res.status(400).json({ errMsg: "User or Artist doesnot exist" });
    }
    if (artist.followers.includes(userId)) {
      return res
        .status(400)
        .json({ errMsg: "User is already following this artist" });
    }
    artist.followers.push(userId);
    artist.followerCount += 1;
    await artist.save();
  } catch (error) {
    console.log("Error following artist", error);
    res.status(500).json({ errMsg: "Internal server error" });
  }
};

const unfollowArtist = async (req, res) => {
  try {
    const { userId, artistId } = req.body;
    const user = await userModel.findById(userId);
    const artist = await artistModel.findById(artistId);

    if (!user || !artist) {
      return res.status(404).json({ errMsg: "User or Artist not found" });
    }

    if (!artist.followers.includes(userId)) {
      return res
        .status(400)
        .json({ errMsg: "User is not following this artist" });
    }

    artist.followers = artist.followers.filter(
      (followerId) => followerId.toString() !== userId.toString()
    );
    artist.followerCount -= 1;
    await artist.save();

    res.status(200).json({ message: "User has unfollowed the artist" });
  } catch (error) {
    console.log("Error unfollowing artist", error);
    res.status(500).json({ errMsg: "Internal server error" });
  }
};

const getLikedPosts = async (req, res) => {
  try {
    const userId = req.body.userId;
    const likedPosts = await postModel.find({
      likes: { $elemMatch: { userId: userId, like: true } },
    });

    res.status(200).json({ likedPosts });
  } catch (error) {
    console.error("Error fetching liked posts", error);
    res.status(500).json({ errMsg: "Internal server error" });
  }
};

const addComment = async (req, res) => {
  try {
    const postId = req.body.postId;
    const userId = req.body.userId;
    const text = req.body.text;

    const post = await postModel.findById(postId).populate("comments.user");

    if (!post) {
      return res.status(404).json({ errMsg: "Post not found" });
    }

    const comment = {
      user: userId,
      text,
    };

    post.comments.push(comment);
    await post.save();
    return res.status(200).json({ message: "Comment added succefully", post });
  } catch (error) {
    console.log("error adding comment", error);
    res.status(500).json({ errMsg: "Internal Server Error" });
  }
};

const userDetails = async (req, res) => {
  try {
    const { id } = req.payload;
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({ errMsg: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error getting user details", error);
    res.status(500).json({ errMsg: "Internal server error" });
  }
};

const editProfile = async (req, res) => {
  try {
    const { id } = req.payload;
    const { userName, email, phone, address, photo } = req.body;

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ errMsg: "User Not Found" });
    }

    user.userName = userName;
    user.email = email;
    user.phone = phone;
    user.address = address;
    user.photo = photo;

    await user.save();

    res.status(200).json({ message: "Profile Updated Succesfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ errMsg: "Internal server error" });
  }
};

const adminProduct = async (req, res) => {
  try {
    const products = await productModel.find();

    res.status(200).json({ products });
  } catch (error) {
    console.error("Error getting admin products", error);
    res.status(500).json({ errMsg: "Internal server error" });
  }
};

module.exports = {
  userRegister,
  verifyMail,
  login,
  artistPosts,
  getArtists,
  getSpecificArtist,
  likePost,
  unlikePost,
  followArtist,
  unfollowArtist,
  getLikedPosts,
  addComment,
  userDetails,
  editProfile,
  adminProduct,
  onlinePayment,
  paymentStatus,
  createOrder,
  handleFailed,
  handleSuccess,
};
