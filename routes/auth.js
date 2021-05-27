// Imports
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { postRegister, postLogin } = require('../controller/ctrl.auth');
const { verifyToken } = require('../helper/helper');

// GET ROUTES
//LOGIN
router.get('/login', (req, res) => {

  if(req.cookies.token) {    
    verifyToken();    
    return res.redirect('/auth/list');
  }
  res.render('pages/login', {isLoggedIn: false});

});

// REGISTER
router.get('/register', (req, res) => {

  if(req.cookies.token) {
    verifyToken();
    return res.redirect('/auth/list');
  }
  res.render('pages/register', {isLoggedIn: false});

});

// GET LIST OF USERS
router.get('/list', verifyToken, (req, res) => {

  res.cookie('token', req.cookies.token);
  res.render('pages/list', {isLoggedIn: true});

});

// LOGOUT 
// has to be changes to post/delete
router.get('/logout', verifyToken, (req, res) => {

  // comment the next line and see the fun --> For Saptarshi
  res.clearCookie('token');
  res.redirect('/auth/login');

});


// POST Routes
// REGISTER
router.post('/register', [
  body('firstname')
      .isLength({min: 5})
      .withMessage('Please enter full name!'),
  body('email')
      .isEmail()
      .withMessage('Please enter valid email!'),
  body('password')
      .isLength({min: 6})
      .withMessage('Please enter password of length more than 6!'),
  body('cpassword')
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords have to match!');
      }
      return true;
    }),
  body('organisation')
    .notEmpty()
  ],
  postRegister
);

// LOGIN
router.post('/login', [
  body('email')
  .isEmail()
  .withMessage('Please enter valid email!'),
  body('password')
    .isLength({min: 6})
    .withMessage('Please enter valid password')
  ],
  postLogin
);


module.exports = router;