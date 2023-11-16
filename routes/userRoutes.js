const express = require("express");
const usercontroller = require("../controllers/userController");
const chatcontroller = require("../controllers/chatController");
const { verifyTokenUser } = require("../middlewares/auth");

const userRoute = express.Router();

userRoute.post("/signup", usercontroller.userRegister);
userRoute.get("/verifymail/:userId", usercontroller.verifyMail);
userRoute.post("/login", usercontroller.login);

userRoute.get("/home", usercontroller.artistPosts);
userRoute.get("/profile", verifyTokenUser, usercontroller.userDetails);
userRoute.get("/artists", verifyTokenUser, usercontroller.getArtists);
userRoute.get(
  "/specificartist",
  verifyTokenUser,
  usercontroller.getSpecificArtist
);
userRoute.post("/like", verifyTokenUser, usercontroller.likePost);
userRoute.post("/unlike", verifyTokenUser, usercontroller.unlikePost);
userRoute.post("/follow", verifyTokenUser, usercontroller.followArtist);
userRoute.post("/unfollow", verifyTokenUser, usercontroller.unfollowArtist);
userRoute.post("/likedposts", verifyTokenUser, usercontroller.getLikedPosts);
userRoute.post("/addComment", verifyTokenUser, usercontroller.addComment);
userRoute.post("/editProfile", verifyTokenUser, usercontroller.editProfile);
userRoute.get("/store", verifyTokenUser, usercontroller.adminProduct);


userRoute.post('/order', verifyTokenUser, usercontroller.createOrder);

userRoute.get('/paymentSuccess', usercontroller.handleSuccess);
userRoute.get('/paymentFailed', usercontroller.handleFailed);

userRoute.post("/payment", verifyTokenUser, usercontroller.onlinePayment);
userRoute.get("/paymentSuccess2", usercontroller.paymentStatus);
userRoute.get("/paymentFailed2", usercontroller.paymentStatus);


userRoute.post("/createChat",verifyTokenUser,chatcontroller.createChat)
userRoute.get("/fetchChats",verifyTokenUser,chatcontroller.fetchChats)
userRoute.post("/sendMessage",verifyTokenUser,chatcontroller.sendMessage)
userRoute.get("/openChat",verifyTokenUser,chatcontroller.fetchAllMessages)

module.exports = userRoute;
