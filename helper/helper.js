const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Model
const UserModel = require('../models/User');

exports.hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString('base64');
    const hash = crypto.createHmac(process.env.HASH_ALGO, salt).update(password).digest("base64");
    return salt+'$'+hash;
};

exports.createUser = async (req, res) => {
    const user = new UserModel(req.body);
    try {
      const savedUser = await user.save();
      // res.status(200).json({ message: 'Account successfully created..'});
      res.render('pages/home');
    } catch(err) {
      // res.status(500).json({ message: 'Server Error..' });
      res.redirect('/auth/register');
      console.log(err);
    }
};

exports.comparePassword = (user, password) => {
    const userPwdFields = user.password.split('$');
    const salt = userPwdFields[0];
    const hash = crypto.createHmac(process.env.HASH_ALGO, salt).update(password).digest("base64");
    if (hash === userPwdFields[1]) return true;
    else return false;
};


exports.generateToken = (res, id, firstname) => {
  const expiration =  1000;
  const token = jwt.sign({ id, firstname }, process.env.JWT_SECRET, {
    expiresIn: '6s'
  });
  res.cookie('token', token, {
    expires: new Date(Date.now() + expiration),
    secure: false, // set to true if your using https
    httpOnly: true,
  });
  res.redirect('/auth/list');
};


exports.verifyToken = async (req, res, next) => {
  const token = req.cookies.token || '';
  try {
    if (!token) {
      return res.status(401).json('You need to Login')
    }
    const decrypt = await jwt.verify(token, process.env.JWT_SECRET);
    console.log(decrypt);
    req.user = {
      id: decrypt.id,
      firstname: decrypt.firstname,
    };
    next();
  } catch (err) {
    if(err.message.includes('malformed') || err.message.includes('expired')) {
      res.clearCookie('token');
      return res.redirect('/auth/login');
    }
    return res.status(500).json(err.toString());
  }
};
