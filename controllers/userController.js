const userModel = require("../model/userModel");
const artistModel = require("../model/artistModel");
const postModel = require("../model/artistPost");
const productModel = require("../model/adminProduct");
const orderModel = require("../model/orders");
const adminOrder = require("../model/adminOrders")
const EMAIL_PASS = process.env.EMAIL_PASS;
const CLIENTURL = process.env.CLIENTURL;
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { generateToken } = require("../middlewares/auth");

const stripe = require("stripe")(process.env.STRIPEKEY);

let errMsg;

// const createOrder = async (req, res) => {
//   try {
//     console.log("admin order create")
//     const { token } = req.payload;
//     const { price, id, productId, address } = req.body;
//     // console.log(price,"pricee");
//     // console.log(id,"id");
//     // console.log(productId,"productId");
//     // console.log(address,"Address");

//     const user = await stripe.customers.create({
//       metadata: {
//         price: price,
//       },
//     });
//     const session = await stripe.checkout.sessions.create({
//       line_items: [
//         {
//           price_data: {
//             currency: "inr",
//             product_data: {
//               name: "framee",
//             },
//             unit_amount: price * 100,
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       success_url: `${process.env.SERVERURL}success?price=${price}&productId=${productId}&userId=${id}&status=success&token=${token}&address=${address}`,
//       // cancel_url: `${process.env.SERVERURL}failed?&status=failed&token=${token}`,
//       cancel_url: `${process.env.SERVERURL}failed?&status=failed&token=${token}`,

//     });
//     console.log(session)
//     res.send({ url: session.url });
//   } catch (error) {
//     console.log(error);
//   }
// };
// const adminOrderStatus = async (req, res) => {
//   const id = req.query.userId;
//   const status = req.query.status;
//   const price = req.query.price;
//   const productId = req.query.productId;
//   const token = req.query.token;
//   const address = req.query.address;
//   console.log(id,status,price,productId,token,address)
//   try{
//     if(token) {
//       if(status === "success"){
//         const pricestring = price.toString();
//         const newadminOrder = new adminOrder({
//           user: id,
//           products: [
//             {
//               product: productId,
//               quantity: 1,
//             },
//           ],
//           price:pricestring,
//           address:address,
//           status:"pending",
//         });
//         const saveOrder = await newadminOrder.save();
//         console.log("New order saved:bfbcfb", saveOrder);
//         res.redirect(`${process.env.CLIENTURL}paymentSuccess`);
//       } else {
//         res.redirect(`${process.env.CLIENTURL}paymentFailed`);
//       }
//       }
//     } catch (error) {
//       console.log(error);
//       res.redirect(`${process.env.CLIENTURL}paymentFailed`);
//     }
//   }


const createOrder = async (req, res) => {
  try {
    const { token } = req.payload;
    const { price, id, productId, address } = req.body;

    // Create a customer in Stripe
    const user = await stripe.customers.create({
      metadata: {
        price: price,
      },
    });

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'framee',
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.SERVERURL}success?price=${price}&productId=${productId}&userId=${id}&status=success&token=${token}&address=${address}`,
      cancel_url: `${process.env.SERVERURL}failed?status=failed&token=${token}`,
    });

    // Redirect to the Stripe checkout page
    res.send({ url: session.url });
  } catch (error) {
    console.error('Error creating order:', error);
    res.redirect(`${process.env.CLIENTURL}paymentFailed`);
  }
};

// Handle the success route and update order status
const handleSuccess = async (req, res) => {
  const { userId, status, price, productId, token, address } = req.query;

  if (token) {
    try {
      if (status === 'success') {
        const pricestring = price.toString();
        const newAdminOrder = new adminOrder({
          user: userId,
          products: [
            {
              product: productId,
              quantity: 1,
            },
          ],
          price: pricestring,
          address: address,
          status: 'pending',
        });
        const saveOrder = await newAdminOrder.save();
        res.redirect(`${process.env.CLIENTURL}paymentSuccess`);
      } else {
        res.redirect(`${process.env.CLIENTURL}paymentFailed`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      res.redirect(`${process.env.CLIENTURL}paymentFailed`);
    }
  } else {
    // Handle cases where token is not provided
    res.redirect(`${process.env.CLIENTURL}paymentFailed`);
  }
};

const handleFailed = (req, res) => {
  // Handle cases when payment has failed
  res.redirect(`${process.env.CLIENTURL}paymentFailed`);
};


const onlinePayment = async (req, res) => {
  try {
   
    const { token } = req.payload;
    const { price, id, postId, address } = req.body;
  
   
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

        res.redirect(`${process.env.CLIENTURL}paymentSuccess`);
      } else {
        res.redirect(`${process.env.CLIENTURL}paymentFailed`);
      }
    }
  } catch (error) {
    console.log(error);
    res.redirect(`${process.env.CLIENTURL}paymentFailed`);
  }
};

const sendVerifyMail = async (email, userName, userId) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: false,
      requireTLS: true,
      auth: {
        user: "frameexplore@gmail.com",
        pass: EMAIL_PASS,
      },
    });
    const mailOption = {
      from: "frameexplore@gmail.com",
      to: email,
      subject: "Email Verification",
      html: `<p>Please click to verif your account <a href="${CLIENTURL}/emailVerify/${userId}">verify</a>.</p>`,
    };

    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("The email has been sent.", info.response);
      }
    });
  } catch (error) {
    console.log(err.message);
    console.log("Email cannot be sent");
  }
};

const verifyMail = async (req, res) => {
  try {
    const { userId } = req.params;
    await userModel.updateOne(
      { _id: userId },
      { $set: { isEmailVerified: true } }
    );
    res.status(200).json({ message: "Email verified Sucessfuly verified " });
  } catch (error) {
    next(err.message);
    console.log(error.message);
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
  // adminOrderStatus,
};
