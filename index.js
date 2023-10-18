const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const connectToDatabase = require('./database/database');
const userRoute = require('./routes/userRoutes');
const artistRoutes = require('./routes/artistRoutes');
const adminRoutes = require('./routes/adminRoutes');
require('dotenv').config();

const app = express();

app.use(cors());


app.use(express.json({limit:'100mb',extended:true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

connectToDatabase();

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use('/',userRoute)
app.use('/artist',artistRoutes)
app.use('/admin',adminRoutes)

const PORT = process.env.PORT || 4000; // Use process.env.PORT or fallback to 4000

const server = app.listen(PORT, () => {
    console.log(`Server started at ${PORT}`);
});
