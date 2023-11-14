const express = require("express");

const admincontroller = require("../controllers/adminController");
const { verifyTokenAdmin } = require("../middlewares/auth");

const adminRoutes = express.Router();

adminRoutes.post("/login", admincontroller.adminLogin);
adminRoutes.get("/users", admincontroller.users);
adminRoutes.patch("/block", admincontroller.blockUser);
adminRoutes.patch("/unblock", admincontroller.unblockUser);
adminRoutes.get("/artists",admincontroller.artists)
adminRoutes.patch("/blockArtist",admincontroller.blockArtist)
adminRoutes.patch("/unblockArtist",admincontroller.unblockArtist)
adminRoutes.post("/products", admincontroller.addProduct);
adminRoutes.get("/products", admincontroller.getProducts);
adminRoutes.put("/products/:productId", admincontroller.editProducts);
adminRoutes.delete("/products/:productId", admincontroller.deleteProduct);
adminRoutes.get("/statistics",admincontroller.getStatistics)
adminRoutes.get("/postComments",admincontroller.postComments)
adminRoutes.get("/orders",admincontroller.getAdminOrders)


module.exports = adminRoutes;
