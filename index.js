// External Imports
const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors');

// File Imports
const connectDB = require('./config/db');

// Route Imports
const authRoute = require('./routes/auth');
const cookieParser = require('cookie-parser');

const app = express();

// Setting default view engine
app.set("view engine", "ejs");

// Initializing config environment
dotenv.config({ path: './config/config.env' });

// For reading data off forms
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Using cookie parser to read data from cookies
app.use(cookieParser());

// using cors to make sure request come from one place
app.use(
    cors({
      credentials: true
    })
);

// Initialising Database
connectDB();

// Logging: Console and File
if(process.env.ENV == 'dev') {
    app.use(morgan('tiny'));
}

// Home Route
app.get('/', (req, res) => {
    res.status(200).render('pages/home');
})

// Authenticated Routes
app.use('/auth', authRoute);

// 404
app.use('/', (req, res) => {
    res.send('404, Page Not Found!');
})

// Server listening
app.listen(process.env.PORT || 3000, () => console.log('Server connected!'));