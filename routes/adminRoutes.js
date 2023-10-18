const express = require("express");

const admincontroller = require("../controllers/adminController");

const adminRoutes = express.Router();

adminRoutes.post("/login", admincontroller.adminLogin);
adminRoutes.get("/users", admincontroller.users);
adminRoutes.patch("/status", admincontroller.blockUser);
adminRoutes.patch("/status", admincontroller.unblockUser);
adminRoutes.post("/products", admincontroller.addProduct);
adminRoutes.get("/products", admincontroller.getProducts);
adminRoutes.put("/products/:productId", admincontroller.editProducts);
adminRoutes.delete("/products/:productId", admincontroller.deleteProduct);


module.exports = adminRoutes;
