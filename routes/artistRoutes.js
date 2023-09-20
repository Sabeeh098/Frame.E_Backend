const express = require('express');
const artistcontroller = require('../controllers/artistController');

const artistRoutes = express.Router();

artistRoutes.post('/artist/signup',artistcontroller.artistRegister);
artistRoutes.post('/artist/login',artistcontroller.artistLogin);

module.exports = artistRoutes;