const express = require('express');

const admincontroller = require('../controllers/adminController');


const adminRoutes = express.Router();

adminRoutes.post('/login',admincontroller.adminLogin);
adminRoutes.get('/users',admincontroller.users)
adminRoutes.patch('/status',admincontroller.blockUser)
adminRoutes.patch('/status',admincontroller.unblockUser)


module.exports = adminRoutes;