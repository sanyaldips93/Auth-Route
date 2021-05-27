const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Model
const UserModel = require('../models/User');

// hashPassword -> helps in hashing password recevied from form.
exports.hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString('base64');
    const hash = crypto.createHmac(process.env.HASH_ALGO, salt).update(password).digest("base64");
    return salt+'$'+hash;
};

// createUser -> helps in creating user profile in the database.
exports.createUser = async (req, res) => {
    const user = new UserModel(req.body);
    try {
      const savedUser = await user.save();
      res.redirect('/auth/login');
    } catch(err) {
      res.redirect('/auth/register');
      console.log(err);
    }
};

// comparePassword -> helps in comparing passwords from the reg form.
exports.comparePassword = (user, password) => {
    const userPwdFields = user.password.split('$');
    const salt = userPwdFields[0];
    const hash = crypto.createHmac(process.env.HASH_ALGO, salt).update(password).digest("base64");
    if (hash === userPwdFields[1]) return true;
    else return false;
};

// generateToken -> helps in generating jwt token
exports.generateToken = (res, id, firstname) => {
  const expiration =  1000;
  const token = jwt.sign({ id, firstname }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
  res.cookie('token', token, {
    expires: new Date(Date.now() + expiration),
    secure: false, // set to true if your using https
    httpOnly: true,
  });
  res.redirect('/auth/list');
};

// verifyToken -> helps in verifying the jwt token.
exports.verifyToken = async (req, res, next) => {
  const token = req.cookies.token || '';
  try {
    if (!token) {
      return res.status(401).json('You need to Login')
    }
    const decrypt = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decrypt.id,
      firstname: decrypt.firstname,
    };
    if(req.url == '/') return res.render('pages/home', {isLoggedIn: true});
    next();
  } catch (err) {
    if(err.message.includes('malformed') || err.message.includes('expired')) {
      res.clearCookie('token');
      if(req.url == '/') return res.render('pages/home', {isLoggedIn: false});
      return res.redirect('/auth/login');
    }
    if(req.url == '/') return res.render('pages/home', {isLoggedIn: false});
    return res.status(500).json(err.toString());
  }
};
