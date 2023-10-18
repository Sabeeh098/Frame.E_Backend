const express = require('express')
const usercontroller = require('../controllers/userController');
const { verifyTokenUser } = require('../middlewares/auth');

const userRoute = express.Router();


userRoute.post('/signup',usercontroller.userRegister);
userRoute.post('/login',usercontroller.login);
userRoute.get('/home',usercontroller.artistPosts);
userRoute.get('/profile',verifyTokenUser,usercontroller.userDetails)
userRoute.get('/artists',verifyTokenUser,usercontroller.getArtists);
userRoute.get('/specificartist',verifyTokenUser,usercontroller.getSpecificArtist);
userRoute.post('/like', verifyTokenUser, usercontroller.likePost);
userRoute.post('/unlike', verifyTokenUser, usercontroller.unlikePost);
userRoute.post('/follow', verifyTokenUser, usercontroller.followArtist);
userRoute.post('/unfollow', verifyTokenUser, usercontroller.unfollowArtist);
userRoute.post('/likedposts', verifyTokenUser, usercontroller.getLikedPosts);
userRoute.post('/addComment', verifyTokenUser, usercontroller.addComment);
userRoute.post('/editProfile', verifyTokenUser, usercontroller.editProfile);
userRoute.get('/store',verifyTokenUser,usercontroller.adminProduct);

module.exports = userRoute;