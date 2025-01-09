const { Router } = require('express');
const bcrypt = require("bcryptjs");
const db = require('../db/queries');
const passport = require('passport');
const asyncHandler = require('express-async-handler');

const indexRouter = Router();

indexRouter.get('/', asyncHandler((req, res) => {
    res.render('index', {title: "Home"});
}))

indexRouter.get('/sign-up', asyncHandler((req, res) => {
    res.render('sign-up', {title: 'Sign Up'})
}))

indexRouter.post('/sign-up', asyncHandler(async (req, res, next) => {
    const {first_name, last_name, username, password} = req.body;
    bcrypt.hash(password, 10, async(error, hashedPassword) => {
        if(error) {
            return next(error);
        }
        await db.AddUser(first_name, last_name, username, hashedPassword);
        res.redirect('/');
    })
}))

indexRouter.get('/login', asyncHandler((req, res) => {
    res.render('login', {title: 'Login'})
}))

indexRouter.post('/login', passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login'}));

indexRouter.get('/logout', function(req, res, next) {
    req.logout((err) => {
      if (err) { 
        return next(err); 
    }
      res.redirect('/');
    });
  });


module.exports = indexRouter;