const express = require("express");
const artistcontroller = require("../controllers/artistController");
const { verifyTokenArtist } = require("../middlewares/auth");

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


module.exports = artistRoutes;
