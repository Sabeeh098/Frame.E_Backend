const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../model/userModel");
let errMsg;

module.exports = {
  generateToken: (id, role) => {
    const token = jwt.sign({ id, role }, process.env.JWT_SECRET);

    return token;
  },
  verifyTokenUser: async (req, res, next) => {
    try {
      let token = req.headers.authorization;
   
      if (!token) {
        return res.status(403).json({ errMsg: "Access Denied" });
      }

      if (token.startsWith("Bearer")) {
        token = token.slice(7, token.length).trimLeft();
      }

      const verified = jwt.verify(token, process.env.JWT_SECRET);

      
      req.payload = {token,...verified};
      const user = await User.findById(req.payload.id);
      if (user.isBanned === true)
        return res.status(403).json({ errMsg: "Access Denied" });

      if (req.payload.role === "user") {
        next();
      } else {
        return res.status(403).json({ errMsg: "Access Denied" });
      }
    } catch (err) {
        console.log("err at auth;",err)
      res.status(500).json({ errMsg: "Server Down" });
    }
  },

  verifyTokenArtist: async (req, res, next) => {
    try {
      let token = req.headers.authorization;
      console.log('heyyyyyyyyyyy')
      if (!token) {
        console.log('token errror')
        return res.status(403).json({ errMsg: "Acces denied" });
      }
      if (token.startsWith("Bearer")) {
        token = token.slice(7, token.length).trimLeft();
      }
      
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      
      if (verified.role === "artist") {
        req.payload = verified;
       
        next();
      } else {
        console.log('else errrorrrrr')
        return res.status(403).json({ errMsg: "Access denied" });
      }
    } catch (error) {
      res.status(500).json({ errMsg: "Server Error" });
    }
  },

  verifyTokenAdmin: async (req, res, next) => {
    try {
      let token = req.headers["authorization"];
      if (!token) {
        return res.status(403).json({ errMsg: "Access denied" });
      }
      if (token.startsWith("Bearer")) {
        token = token.slice(7, token.length).trimLeft();
      }
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.payload = verified;

      if (req.payload.role === "admin") {
        next();
      } else {
        return res.status(403).json({ errMsg: "Access Denied" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ errMsg: "Server Down" });
    }
  },
};
