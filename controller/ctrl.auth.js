const { validationResult } = require('express-validator');
const helperFunc = require('../helper/helper');
const UserModel = require('../models/User');

// Registration Controller
exports.postRegister = async (req, res, next) => {
    // Check for Form field errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return res.status(422).json({ errors: errors.array() })
        return res.render('pages/register');
    }
    // Code needs to be changed
    if(req.cookies.token) {        
        return res.json({error : 'Cannot do that!'});
    }

    // Check if email exists
    UserModel.findOne({ email: req.body.email })
        .then(user => {
                if(user === null) {
                    // Hash password
                    req.body.password = helperFunc.hashPassword(req.body.password);
                    // Create a new user
                    helperFunc.createUser(req, res);
                }
                else {
                    // res.status(409).json({ message: 'Account already exists!' });
                    res.render('pages/login');
                }
        })
        .catch(err => {
            console.log(err);
            // res.status(500).json({ message: 'Server Error..' });
            res.render('pages/register');
        });
};

// Login Controller
exports.postLogin = (req, res, next) => {

    // Check for Form field errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return res.status(422).json({ errors: errors.array() });
        return res.redirect('/auth/login');
    }

    // Code needs to be changed
    if(req.cookies.token) {        
        return res.json({error : 'Cannot do that!'});
    }

    UserModel.findOne({ email: req.body.email })
        .then(user => {
            if(user !== null) {
                // Compare password
                const result = helperFunc.comparePassword(user, req.body.password);
                if(result) {
                    // res.json({ message: 'You have successfully logged in!' });
                    helperFunc.generateToken(res, user._id, user.firstname);

                } else {
                    // res.json({ message: 'Password is incorrect.' });
                    res.redirect('/auth/login');
                }
            } else {
                // res.json({ message: 'You do not have an account yet. Please register.' });
                res.redirect('/auth/register');
            }
        })
        .catch(err => {
            console.log(err);
            // res.status(500).json({ message: 'Server Error..' });
            res.redirect('/auth/login');
        });
} 