const express = require('express')
const usercontroller = require('../controllers/userController');

const userRoute = express.Router();


userRoute.post('/signup',usercontroller.userRegister);
userRoute.post('/login',usercontroller.login);

module.exports = userRoute;