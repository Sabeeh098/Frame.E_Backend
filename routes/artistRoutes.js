const express = require("express");
const artistcontroller = require("../controllers/artistController");
const { verifyTokenArtist } = require("../middlewares/auth");
const chatcontroller = require("../controllers/chatController");

const artistRoutes = express.Router();

artistRoutes.post("/signup", artistcontroller.artistRegister);
artistRoutes.post("/login", artistcontroller.artistLogin);
artistRoutes.get(
  "/profile",
  verifyTokenArtist,
  artistcontroller.getArtistDetails
);
artistRoutes.post(
  "/profile",
  verifyTokenArtist,
  artistcontroller.createArtistPost
);
artistRoutes.post(
  "/editprofile",
  verifyTokenArtist,
  artistcontroller.editArtistProfile
);

artistRoutes.get(
  "/posts",
  verifyTokenArtist,
  artistcontroller.getArtistCategoryPosts
);

artistRoutes.delete(
  "/deletepost/:postId",
  verifyTokenArtist,
  artistcontroller.deleteArtistPost
);



artistRoutes.post("/fetchChat", verifyTokenArtist, chatcontroller.createChat);
artistRoutes.get("/fetchChats", verifyTokenArtist, chatcontroller.fetchChats);
artistRoutes.post("/sendMessage", verifyTokenArtist, chatcontroller.sendMessage);
artistRoutes.get("/openChat", verifyTokenArtist, chatcontroller.fetchAllMessages);




module.exports = artistRoutes;
