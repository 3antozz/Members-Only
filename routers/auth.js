const passport = require('passport');
const db = require('../db/queries');
const LocalStrategy = require('passport-local');
const bcrypt = require("bcryptjs");
const { Router } = require('express');
const asyncHandler = require('express-async-handler');
const {body, validationResult} = require('express-validator');
require("dotenv").config();

const authRouter = Router ();


passport.use(new LocalStrategy(async function verify(username, password, done) {
    try {
        const user = await db.getUserByUsername(username);
        if (!user) { return done(null, false, {message: "Incorrect username"})}
        const match = await bcrypt.compare(password, user.password);
        if (!match) { return done(null, false, {message: "Incorrect password"})}
        return done (null, user);
    } catch (error) {
        return done(error);
    }
}))

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await db.getUserByID(id);
        done(null, user);
    } catch(error) {
        done(error)
    }
})

const checkAuth = asyncHandler((req, res, next) => {
    if(req.isAuthenticated()) {
        next();
    } else {
        const error = new Error('You need to login to access this page');
        error.status = 401;
        next(error); 
    }
})

const checkUnauth = asyncHandler((req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/')
    }
})

const isAlreadyMember = asyncHandler((req, res, next) => {
    if(!['member', 'admin'].includes(req.user.membership)) {
        next();
    } else {
        res.redirect('/');
    }
})

const validateSignUp = [
    body("first_name").trim().notEmpty().withMessage("First Name must not be empty").isAlpha().withMessage("First Name must only contain alphabet and no spaces").isLength({min: 2, max: 20}).withMessage("Password must be between 2 and 20 characters"),
    body("last_name").trim().notEmpty().withMessage("Last Name must not be empty").isAlpha().withMessage("First Name must only contain alphabet and no spaces").isLength({min: 2, max: 20}).withMessage("Password must be between 2 and 20 characters"),
    body("username").trim().notEmpty().withMessage("Username must not be empty").isAlphanumeric().withMessage("First Name must only contain alphabet and numbers and no spaces").isLength({min: 3, max: 20}).withMessage("Password must be between 3 and 20 characters"),
    body("password").trim().notEmpty().withMessage("Password must not be empty").isLength({min: 6}).withMessage("Password must be atleast 6 characters long"),
    body('confirm_password').custom((value, { req }) => {
        return value === req.body.password;
      }).withMessage("Passwords don't match")
];

const validateLogin = [
    body("username").trim().notEmpty().withMessage("Username must not be empty").isAlphanumeric().withMessage("Incorrect username").isLength({min: 3, max: 20}).withMessage("Incorrect username")
];

const validateMembership = [
    body("secret_code").trim().notEmpty().withMessage("Code must not be empty").equals(process.env.MEMBERSHIP_CODE).withMessage("Incorrect Code")
];



authRouter.get('/sign-up', checkUnauth, asyncHandler((req, res) => {
    res.render('sign-up', {title: 'Sign Up'})
}))

authRouter.post('/sign-up', validateSignUp, asyncHandler(async (req, res, next) => {
    const result = validationResult(req);
    if(!result.isEmpty()) {
        return res.render('sign-up', {title: 'Sign Up', errors: result.errors})
    }
    const {first_name, last_name, username, password} = req.body;
    bcrypt.hash(password, 10, async(error, hashedPassword) => {
        if(error) {
            return next(error);
        }
        try {
            await db.AddUser(first_name, last_name, username, hashedPassword);
        } catch(error) {
            console.log(error);
            return res.render('sign-up', {title: 'Sign Up', errors: [{msg: "An unexpcted error has occured, please try again later."}]})
        }
        res.redirect('/');
    })
}))

authRouter.get('/login', checkUnauth, asyncHandler((req, res) => {
    res.render('login', {title: 'Login'})
}))

authRouter.post('/login', validateLogin, (req, res, next) => {
    const result = validationResult(req);
    if(!result.isEmpty()) {
        return res.render('login', {title: 'Login', errors: result.errors})
    }
    next();
}, passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login', failureMessage: true}));

authRouter.get('/logout', function(req, res, next) {
    req.logout((err) => {
      if (err) { 
        return next(err); 
    }
      res.redirect('/');
    });
});

authRouter.get('/member', checkAuth, isAlreadyMember, asyncHandler((req, res) => {
    res.render('member', {title: "Become a member"});
}))

authRouter.post('/member', checkAuth, validateMembership, asyncHandler(async (req, res) => {
    const result = validationResult(req);
    if(!result.isEmpty()) {
        return res.render('member', {title: 'Become a member', errors: result.errors})
    }
    let {is_admin} = req.body;
    if(!is_admin) {
        is_admin = 'member';
    }
    const id = req.user.id;
    try {
        await db.updateMembership(id, is_admin);
    } catch(error) {
        console.log(error);
        return res.render('member', {title: 'Become a member', errors: [{msg: "An unexpcted error has occured, please try again later."}]})
    }
    res.redirect('/');
}))

module.exports = authRouter;

