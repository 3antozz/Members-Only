const passport = require('passport');
const db = require('../db/queries');
const LocalStrategy = require('passport-local');
const bcrypt = require("bcryptjs");
const { Router } = require('express');
const asyncHandler = require('express-async-handler');
const {body, validationResult} = require('express-validator');

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

const validateSignUp = [
    body("first_name").trim().notEmpty().withMessage("First Name must not be empty").isAlpha().withMessage("First Name must only contain alphabet and no spaces"),
    body("last_name").trim().notEmpty().withMessage("Last Name must not be empty").isAlpha().withMessage("First Name must only contain alphabet and no spaces"),
    body("username").trim().notEmpty().withMessage("Username must not be empty").isAlphanumeric().withMessage("First Name must only contain alphabet and numbers and no spaces"),
    body("password").trim().notEmpty().withMessage("Password must not be empty").isLength({min: 6}).withMessage("Password must be atleast 6 characters long"),
    body('confirm_password').custom((value, { req }) => {
        return value === req.body.password;
      }).withMessage("Passwords don't match")
];

const validateLogin = [
    body("username").trim().notEmpty().withMessage("Username must not be empty").isAlphanumeric().withMessage("Incorrect username")
]

authRouter.get('/sign-up', asyncHandler((req, res) => {
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
        await db.AddUser(first_name, last_name, username, hashedPassword);
        res.redirect('/');
    })
}))

authRouter.get('/login', asyncHandler((req, res) => {
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

module.exports = authRouter;

